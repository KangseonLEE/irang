-- 진단 결과에 사이트 안 진입 기록 (2026-10-20)
--
-- 왜: 남은 병목이 '진단 진입'인데, 어느 지면이 진단 완료까지 이어지는지 DB 에서 셀 수 없었다.
--     referrer 는 document.referrer(바깥 유입 주소)라 사이트 안 이동이 안 보이고,
--     GA 의 assess_entry_click 은 클릭 수만 있어 완료와 이어지지 않는다.
--
-- entry_from: 진단 진입 버튼 라벨(data-assess-entry 값, 예: crop_detail_top). 버튼 없이 들어오면 NULL
-- entry_path: 진단 화면 직전에 본 사이트 경로(쿼리 없이). 첫 화면이 진단이면 NULL
--
-- 둘 다 선택값이라 NULL 허용. 기존 행은 NULL 로 남는다(소급 불가).
-- 적용 전에도 /api/assess 는 entry_* 를 빼고 다시 저장하므로 순서 제약 없음(api_fallback_log 에 migration-pending).
-- 공유 조회(/api/assess/[id])는 PUBLIC_RESULT_COLUMNS 명시 목록이라 이 컬럼은 노출되지 않는다.
-- mode-check-ok: 새 컬럼 둘 다 NULL 허용 선택값이고 기존 NOT NULL 컬럼의 의미는 바뀌지 않는다

ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS entry_from TEXT,
  ADD COLUMN IF NOT EXISTS entry_path TEXT;

ALTER TABLE assessment_results
  DROP CONSTRAINT IF EXISTS assessment_results_entry_from_format;
ALTER TABLE assessment_results
  ADD CONSTRAINT assessment_results_entry_from_format
  CHECK (entry_from IS NULL OR entry_from ~ '^[a-z0-9_]{1,40}$');

ALTER TABLE assessment_results
  DROP CONSTRAINT IF EXISTS assessment_results_entry_path_format;
ALTER TABLE assessment_results
  ADD CONSTRAINT assessment_results_entry_path_format
  CHECK (entry_path IS NULL OR (length(entry_path) <= 200 AND entry_path LIKE '/%'));

COMMENT ON COLUMN assessment_results.entry_from IS
  '진단 진입 버튼 라벨(data-assess-entry). 버튼 클릭 뒤 1시간 안에 끝낸 진단만. 2026-10-20 추가';
COMMENT ON COLUMN assessment_results.entry_path IS
  '진단 화면 직전 사이트 경로(쿼리 없이). 2026-10-20 추가';
