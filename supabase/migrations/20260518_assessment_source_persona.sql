-- ═══════════════════════════════════════════════════════════════
--  assessment_results — source + persona 컬럼 추가
--
--  배경 (2026-05-18):
--   - GA4 funnel 측정 결과 4/24 이후 24일째 INSERT 0건
--   - frontend-engineer 진단: wizard 결함 아님, Quick Wizard 게이트웨이
--     로 사용자가 분기돼 적재 없는 path만 흐름 (5/15 commit c873f28)
--   - 회장 결재 A안: Quick Wizard도 가벼운 row 적재 → 데이터 회복
--
--  변경:
--   - source TEXT NOT NULL DEFAULT 'full' (CHECK in 'full'|'quick')
--     · 'full' = 기존 14문항 매치 위저드
--     · 'quick' = 4문항 빠른 점검 (Phase 2c 5/15 신설)
--   - persona TEXT (nullable) — Quick은 farm_type_id 대신 persona를 사용
--     · 5종: family·farmYouth·elderRural·commuter·balanced
--
--  Down: ALTER TABLE drop column 가능. 단 source='quick' row 손실
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'full';

-- CHECK 제약은 별도 ADD (NOT VALID로 기존 row 영향 차단)
ALTER TABLE assessment_results
  DROP CONSTRAINT IF EXISTS assessment_results_source_check;

ALTER TABLE assessment_results
  ADD CONSTRAINT assessment_results_source_check
  CHECK (source IN ('full', 'quick'));

ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS persona TEXT;

-- source 컬럼 인덱스 (admin 페이지 필터용)
CREATE INDEX IF NOT EXISTS idx_assessment_results_source
  ON assessment_results(source);

-- persona 컬럼 인덱스 (Phase 6 학습 데이터 집계용)
CREATE INDEX IF NOT EXISTS idx_assessment_results_persona
  ON assessment_results(persona) WHERE persona IS NOT NULL;

COMMENT ON COLUMN assessment_results.source IS
  'full=14문항 정식 진단 / quick=4문항 빠른 점검 (5/15 c873f28). 2026-05-18 추가';
COMMENT ON COLUMN assessment_results.persona IS
  '5종 페르소나 ID (family·farmYouth·elderRural·commuter·balanced). Quick wizard는 farm_type_id 대신 이 컬럼 채움';
