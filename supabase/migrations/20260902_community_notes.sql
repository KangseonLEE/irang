-- ═══════════════════════════════════════════════════════════════
--  community_notes — 커뮤니티 1단계 "한 줄 의견" (사전 승인제)
--
--  배경 (2026-09-02 회장 결재):
--   - 지역·작물·지원사업 상세 페이지 하단에 로그인 없는 한 줄 의견 + 공감
--   - 현재 트래픽에서 자유 게시판은 유령 게시판 위험 → 사전 승인(pre-moderation)
--   - 스팸·광고는 5층 필터(봇 차단 → 룰 → LLM 분류 → 승인 큐 → 신고)로 차단
--   - 볼륨이 쌓여 수요가 확인되면 회원제 커뮤니티(3단계)에서 재사용
--
--  스키마:
--   - target_type/target_id — 'region' + 'gyeongbuk' | 'gyeongbuk/yeongju',
--                              'crop' + 작물 id, 'program' + 'SP-…'
--   - body — 5~300자 (서버 검증과 동일 범위를 CHECK로 이중 방어)
--   - nickname — 선택, 20자 이하
--   - status — pending(승인 대기) · approved(노출) · rejected(필터/관리자 반려)
--              · hidden(노출 후 신고 누적 자동 숨김)
--   - filter_flags — 룰 필터가 걸린 항목 배열(jsonb), llm_verdict — LLM 판정 원문
--   - ip_hash — sha256(ip + salt). 원 IP는 저장하지 않음(개인정보 처리방침 명시)
--   - like_count / report_count — 함수로만 증가(멱등: ip_hash 유니크)
--   - is_e2e — e2e UA·헤더 적재 분리(8/31 진단 DB 오염 교훈)
--
--  RLS:
--   - anon: approved 행 SELECT만 허용(API 우회 직접 조회 대비 안전망)
--   - 쓰기 전부 service_role 경유(API route)
--
--  Down:
--   DROP FUNCTION IF EXISTS community_note_like(BIGINT, TEXT);
--   DROP FUNCTION IF EXISTS community_note_report(BIGINT, TEXT, TEXT);
--   DROP TABLE IF EXISTS community_note_reports, community_note_likes, community_notes CASCADE;
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS community_notes (
  id BIGSERIAL PRIMARY KEY,
  target_type TEXT NOT NULL CHECK (target_type IN ('region', 'crop', 'program')),
  target_id TEXT NOT NULL CHECK (char_length(target_id) BETWEEN 1 AND 80),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 5 AND 300),
  nickname TEXT CHECK (nickname IS NULL OR char_length(nickname) <= 20),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
  reject_reason TEXT,
  filter_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  llm_verdict JSONB,
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  like_count INT NOT NULL DEFAULT 0,
  report_count INT NOT NULL DEFAULT 0,
  is_e2e BOOLEAN NOT NULL DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 대상별 노출 조회 / 승인 큐 조회
CREATE INDEX IF NOT EXISTS community_notes_target_idx
  ON community_notes (target_type, target_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS community_notes_status_created_idx
  ON community_notes (status, created_at DESC);

-- 같은 IP의 연속 제출 감시(rate limit 보조)
CREATE INDEX IF NOT EXISTS community_notes_ip_created_idx
  ON community_notes (ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS community_note_likes (
  note_id BIGINT NOT NULL REFERENCES community_notes (id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (note_id, ip_hash)
);

CREATE TABLE IF NOT EXISTS community_note_reports (
  note_id BIGINT NOT NULL REFERENCES community_notes (id) ON DELETE CASCADE,
  ip_hash TEXT NOT NULL,
  reason TEXT CHECK (reason IS NULL OR char_length(reason) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (note_id, ip_hash)
);

-- 공감: 같은 ip_hash 1회 — 이미 눌렀으면 카운트 변화 없이 현재값 반환
CREATE OR REPLACE FUNCTION community_note_like(p_note_id BIGINT, p_ip_hash TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  inserted INT;
  current_count INT;
BEGIN
  INSERT INTO community_note_likes (note_id, ip_hash)
  VALUES (p_note_id, p_ip_hash)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted = ROW_COUNT;

  IF inserted > 0 THEN
    UPDATE community_notes
      SET like_count = like_count + 1
      WHERE id = p_note_id AND status = 'approved'
      RETURNING like_count INTO current_count;
  ELSE
    SELECT like_count INTO current_count FROM community_notes WHERE id = p_note_id;
  END IF;

  RETURN COALESCE(current_count, 0);
END;
$$;

-- 신고: 같은 ip_hash 1회, 3건 누적 시 approved → hidden 자동 전환(관리자 재검토)
CREATE OR REPLACE FUNCTION community_note_report(p_note_id BIGINT, p_ip_hash TEXT, p_reason TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  inserted INT;
  current_count INT;
BEGIN
  INSERT INTO community_note_reports (note_id, ip_hash, reason)
  VALUES (p_note_id, p_ip_hash, p_reason)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted = ROW_COUNT;

  IF inserted > 0 THEN
    UPDATE community_notes
      SET report_count = report_count + 1,
          status = CASE WHEN report_count + 1 >= 3 AND status = 'approved' THEN 'hidden' ELSE status END
      WHERE id = p_note_id
      RETURNING report_count INTO current_count;
  ELSE
    SELECT report_count INTO current_count FROM community_notes WHERE id = p_note_id;
  END IF;

  RETURN COALESCE(current_count, 0);
END;
$$;

-- RLS
ALTER TABLE community_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_note_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_note_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_notes_anon_read_approved" ON community_notes;
CREATE POLICY "community_notes_anon_read_approved"
  ON community_notes FOR SELECT TO anon USING (status = 'approved');

-- likes / reports: anon 정책 없음 = anon 완전 차단, service_role만 접근
