-- assessment_results.farm_type_id legacy ID 정규화 (2026-05-17)
--
-- 5/17 /admin/assessments 진단 결과 페이지 점검에서 발견:
-- 4/15·4/16 row 4건이 구 ID "weekend"로 저장되어 있음.
-- 5/17 commit 46f8602으로 표시 단계에서는 migrateFarmTypeId()로 신 ID 변환 적용.
-- 본 마이그레이션은 DB raw 값까지 통일해 정합성 확보.
--
-- LEGACY → 신 ID 매핑 (src/lib/data/match-questions.ts:429-434):
--   weekend            → guichon       (귀촌형)
--   rural-life         → guinong       (귀농형)
--   young-entrepreneur → cheongnyeon   (청년농형)
--   smartfarm          → smartfarm     (동일, 매핑 불필요)
--
-- 사전 진단 (5/17 read-only):
--   weekend: 4건, guinong: 2건. rural-life/young-entrepreneur: 0건.
--
-- 회장 결재: 5/17 — 표시는 이미 정상, raw DB 통일 후속 청소 승인.
-- data-engineer 가드: 마이그 파일만 생성, apply는 회장 수동 (SQL Editor).

-- ─────────────────────────────────────────
-- 1. 정규화 UPDATE 3종 (영향 row 사전 확인 가능)
-- ─────────────────────────────────────────

UPDATE assessment_results SET farm_type_id = 'guichon'
  WHERE farm_type_id = 'weekend';

UPDATE assessment_results SET farm_type_id = 'guinong'
  WHERE farm_type_id = 'rural-life';

UPDATE assessment_results SET farm_type_id = 'cheongnyeon'
  WHERE farm_type_id = 'young-entrepreneur';

-- ─────────────────────────────────────────
-- 검증 쿼리 (apply 후 수동 실행)
-- ─────────────────────────────────────────
-- 1. legacy row 잔존 0건 확인 (5/11 가드 #5)
--    SELECT farm_type_id, COUNT(*) FROM assessment_results
--      WHERE farm_type_id IN ('weekend', 'rural-life', 'young-entrepreneur')
--      GROUP BY farm_type_id;
--    → 빈 결과여야 정상 ✅
--
-- 2. 전체 분포 (5종 신 ID만 보여야 함)
--    SELECT farm_type_id, COUNT(*) FROM assessment_results
--      GROUP BY farm_type_id ORDER BY COUNT(*) DESC;
--    → guinong/guichon/guisanchon/smartfarm/cheongnyeon 중 일부만
--
-- 3. /admin/assessments 라이브 확인
--    - "최근 진단" 결과 유형 칸에 "weekend" 없음
--    - 4/15·4/16 4건 "귀촌형" 파랑 배지로 표시
