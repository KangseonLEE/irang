-- ============================================================
-- 상세 페이지 정보 확장: description(지원사업) + 접수일자(행사)
-- ============================================================
--
-- mode-check-ok: 5/26 자동화 사후 검토 (check-migration-not-null). 신규 컬럼 자체에
--   DEFAULT '' 또는 nullable 부여 — 기존 row·신규 INSERT 모두 통과. 신규 INSERT 모드를
--   추가하지 않아 5/26-style silent fail 위험 없음. 추가 sprint 안건 아님.

-- 1) 지원사업에 상세 설명 컬럼 추가
ALTER TABLE support_programs
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- 2) 행사에 접수 시작/종료일 컬럼 추가
ALTER TABLE farm_events
  ADD COLUMN IF NOT EXISTS application_start DATE,
  ADD COLUMN IF NOT EXISTS application_end DATE;

-- 접수일 인덱스
CREATE INDEX IF NOT EXISTS idx_events_app_dates
  ON farm_events(application_start, application_end);
