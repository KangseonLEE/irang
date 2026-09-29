-- ═══════════════════════════════════════════════════════════════
--  promo_popups — 랜딩 홍보 팝업 (admin 에서 노출 기간·내용 제어)
--
--  배경 (2026-09-29 회장 지시):
--   - 외부 기관 홍보 요청을 랜딩 팝업으로 한 번 알린다. 지금은 정적 배열
--     (src/lib/data/promo-popup.ts) 이라 건마다 코드 수정·배포가 필요했다.
--   - 이 테이블이 SSOT, 정적 배열은 **폴백**(테이블 미적용·Supabase 미설정·조회 오류).
--     5/26 quick_feedback silent 202 사고 교훈대로 폴백은 조용히 넘어가지 않고
--     서버 로그 한 줄(`[promo] fallback: <reason>`)을 남긴다.
--
--  스키마:
--   - id            슬러그(텍스트 PK). 화면 저장소 키("오늘 하루 보지 않기")라 바꾸면 초기화된다
--   - image_url     `/promo/...`(public 정적 파일) 또는 Storage 공개 URL(https://)
--   - facts         [{ label, value, href? }] — 포스터·원문 값을 그대로. 추정 금지
--   - starts_at     노출 시작(KST, 포함). NULL = 즉시 노출
--   - until         노출 종료(KST, 포함). 지나면 코드 변경 없이 자동으로 내려간다
--   - active        관리자 수동 on/off(기간과 무관한 즉시 차단용)
--   - sort_order    같은 날 여러 건이 겹칠 때 팝업 안에서 넘겨 보는 순서(오름차순)
--
--  RLS:
--   - anon 정책 0건 = anon 완전 차단. 읽기·쓰기 전부 service_role(서버) 경유.
--     팝업은 공개 콘텐츠지만 "미공개 예약 건"이 anon 에게 먼저 보이면 안 된다.
--
--  Storage:
--   - 버킷 `promo` (공개 읽기 / 쓰기는 service_role). 관리자 업로드 포스터 보관.
--
--  Down:
--   DROP TRIGGER IF EXISTS promo_popups_set_updated_at ON promo_popups;
--   DROP FUNCTION IF EXISTS promo_popups_touch_updated_at();
--   DROP TABLE IF EXISTS promo_popups;
--   DELETE FROM storage.buckets WHERE id = 'promo';
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS promo_popups (
  id TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9-]{1,63}$'),
  org TEXT NOT NULL CHECK (char_length(org) BETWEEN 1 AND 80),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  tagline TEXT NOT NULL DEFAULT '' CHECK (char_length(tagline) <= 200),
  image_url TEXT NOT NULL CHECK (image_url ~ '^(/|https://)'),
  image_width INT NOT NULL CHECK (image_width BETWEEN 1 AND 4000),
  image_height INT NOT NULL CHECK (image_height BETWEEN 1 AND 6000),
  alt TEXT NOT NULL DEFAULT '' CHECK (char_length(alt) <= 300),
  facts JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(facts) = 'array'),
  recruit_closed BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  href TEXT NOT NULL CHECK (href ~ '^https://'),
  starts_at DATE,
  until DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 노출 기간 역전 금지 (API 검증과 이중 방어)
  CONSTRAINT promo_popups_period_check CHECK (starts_at IS NULL OR starts_at <= until)
);

-- 랜딩 조회: active + 오늘이 기간 안 → sort_order 순
CREATE INDEX IF NOT EXISTS promo_popups_active_window_idx
  ON promo_popups (active, until, sort_order);

-- updated_at 자동 갱신 (admin 목록의 "마지막 수정" 표시 근거)
CREATE OR REPLACE FUNCTION promo_popups_touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promo_popups_set_updated_at ON promo_popups;
CREATE TRIGGER promo_popups_set_updated_at
  BEFORE UPDATE ON promo_popups
  FOR EACH ROW EXECUTE FUNCTION promo_popups_touch_updated_at();

-- RLS: anon 정책 0건 = anon 완전 차단. service_role 만 접근.
ALTER TABLE promo_popups ENABLE ROW LEVEL SECURITY;

-- ── Storage 버킷 `promo` (공개 읽기 / 쓰기는 service_role) ──
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promo',
  'promo',
  TRUE,
  5242880, -- 5MB
  ARRAY['image/webp', 'image/png', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 공개 읽기(포스터는 랜딩에서 누구나 본다). 쓰기 정책 없음 = service_role 전용.
DROP POLICY IF EXISTS "promo_bucket_public_read" ON storage.objects;
CREATE POLICY "promo_bucket_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'promo');

-- ── seed: 현재 정적 1건 (이미지는 기존 public 경로 그대로) ──
INSERT INTO promo_popups (
  id, org, title, tagline,
  image_url, image_width, image_height, alt,
  facts, recruit_closed, note, href,
  starts_at, until, active, sort_order
)
VALUES (
  'gafi-masil-2026',
  '경기도 귀농귀촌지원센터',
  '재능으로 잇는 마실짝꿍',
  '도시민의 재능 × 주민의 삶, 그리고 오래 이어지는 관계',
  '/promo/gafi-masil-2026.webp',
  600,
  851,
  '경기도 귀농귀촌지원센터 관계인구 형성 프로그램 ''재능으로 잇는 마실짝꿍'' 포스터 — 카메라를 든 손과 새싹, 모집 안내',
  '[
    {"label": "모집 기간", "value": "9. 28.(일) 18:00 마감"},
    {"label": "활동 기간", "value": "2026. 10. 17.(토) ~ 11. 15.(일) · 총 5회"},
    {"label": "활동 지역", "value": "연천군 군남면 옥계2리"},
    {"label": "모집 인원", "value": "15명 내외"},
    {"label": "참여 대상", "value": "재능을 나누고 싶은 도시민(평가 선발)"},
    {"label": "주최", "value": "경기도 · 경기도농수산진흥원(경기도귀농귀촌지원센터)"},
    {"label": "문의", "value": "1800-8114 (내선 1)", "href": "tel:18008114"}
  ]'::jsonb,
  TRUE,
  E'이번 모집은 9. 28.(일) 18:00에 끝났어요.\n다음 기수나 비슷한 프로그램은 센터에 문의해 보세요.',
  'https://www.refarmgg.or.kr/cop/bbs/selectBoardArticle.do?bbsId=BBSMSTR_000000000082&nttId=2051&menuNo=60101000',
  NULL,
  '2026-11-15',
  TRUE,
  0
)
ON CONFLICT (id) DO NOTHING;
