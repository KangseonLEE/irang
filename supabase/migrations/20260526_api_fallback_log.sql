-- ═══════════════════════════════════════════════════════════════
--  api_fallback_log — API route fallback 응답 적재 테이블
--
--  배경 (2026-05-26):
--   - 5/15·5/16 quick_feedback 마이그레이션 누락 → thumbs-only POST가
--     silent 202 (`{"ok":true,"skipped":"migration-pending"}`) 응답
--   - 클라이언트는 성공 인지 → 33일 INSERT 0건 (회장 라이브 발견)
--   - root cause: API route fallback 분기가 silent skip 위험을 가짐
--
--  목적:
--   - 모든 fallback 응답(202·503·`skipped:`·`fallback:true`)을 적재
--   - watchman이 24h 비율 monitoring → 50% 🟡 / 90% 🔴 threshold
--   - CLAUDE.md Lessons Learned 교훈 #3 자동화
--
--  스키마:
--   - endpoint TEXT NOT NULL — '/api/quick-feedback' 등
--   - status_code INT NOT NULL — 202·503 등 fallback HTTP code
--   - fallback_reason TEXT NOT NULL — 'migration-pending'·'no-supabase' 등
--   - user_agent TEXT — 디버깅용
--   - page TEXT — 요청 소스 페이지
--   - request_meta JSONB — endpoint별 임의 metadata
--   - created_at TIMESTAMPTZ — 적재 시각 (KST 환산은 조회 시점)
--
--  RLS:
--   - service_role insert·select only
--   - anon·authenticated 완전 차단
--
--  Down: DROP TABLE api_fallback_log CASCADE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS api_fallback_log (
  id BIGSERIAL PRIMARY KEY,
  endpoint TEXT NOT NULL,
  status_code INT NOT NULL,
  fallback_reason TEXT NOT NULL,
  user_agent TEXT,
  page TEXT,
  request_meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 3종
--  · endpoint+created_at: endpoint별 최근 N건 조회 (watchman 24h 추이)
--  · reason: fallback_reason 그룹 집계 (migration-pending 분포 등)
--  · created_at: 전 endpoint 통합 시계열 조회 (admin 대시보드)
CREATE INDEX IF NOT EXISTS api_fallback_log_endpoint_created_idx
  ON api_fallback_log (endpoint, created_at DESC);

CREATE INDEX IF NOT EXISTS api_fallback_log_reason_idx
  ON api_fallback_log (fallback_reason);

CREATE INDEX IF NOT EXISTS api_fallback_log_created_idx
  ON api_fallback_log (created_at DESC);

-- RLS: service_role only
ALTER TABLE api_fallback_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_fallback_log_service_role_insert" ON api_fallback_log;
CREATE POLICY "api_fallback_log_service_role_insert"
  ON api_fallback_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "api_fallback_log_service_role_select" ON api_fallback_log;
CREATE POLICY "api_fallback_log_service_role_select"
  ON api_fallback_log FOR SELECT TO service_role USING (true);

COMMENT ON TABLE api_fallback_log IS
  '5/26 silent 202 사고 영구 차단 자동화. API route fallback 분기 발생 시 적재. watchman 24h 비율 50% 🟡 / 90% 🔴 threshold. CLAUDE.md Lessons Learned 교훈 #3 자동화.';

COMMENT ON COLUMN api_fallback_log.endpoint IS
  '/api/quick-feedback / /api/assess / /api/assess/[id] 등 fallback 응답을 낸 route handler 경로';

COMMENT ON COLUMN api_fallback_log.fallback_reason IS
  'migration-pending (마이그레이션 미적용) / no-supabase (Supabase env 미설정) / not-configured (503) / 기타 fallback 코드. status_code와 1:N 관계';

COMMENT ON COLUMN api_fallback_log.request_meta IS
  'endpoint별 임의 metadata. 예: quick-feedback={thumbs:bool, request_kind}, assess={source, persona}. 디버깅·운영 통계용';
