-- Phase 6 B4: 추천 카드 thumbs up/down 피드백 (2026-05-16)
--
-- 회장 결재 4건 (2026-05-16):
--   1) Sprint 0 자체 완결 + B4 D1 진입
--   2) 옵션 A (thumbs up/down)
--   3) 주배치 (실시간 X)
--   4) quick_feedback 컬럼 확장 (별 테이블 X) — 본 마이그레이션
--
-- 5/15 마이그레이션(20260515_quick_feedback_request_kind)과 동일 fallback 패턴:
--   - API Route(/api/quick-feedback)에서 1차 INSERT 실패 시 PGRST204/42703 감지 → legacy insert로 fallback
--   - 마이그레이션 미적용 환경에서도 silent fail 없이 동작
--
-- 적용 순서: 회장 결재 후 supabase CLI 또는 SQL 에디터에서 수동 apply (CLAUDE.md §0-1).
-- data-engineer 가드: 마이그레이션 파일만 생성, apply는 회장 명령으로.
--
-- 폐기: supabase/migrations/_draft_recommend_feedback.sql (별 테이블 안)
--   본 sprint 결재로 컬럼 확장 채택 → draft 파일은 archive(파일 삭제로 처리).

-- ─────────────────────────────────────────
-- 1. thumbs: 'up' | 'down' | NULL
--    NULL = 기존 rating(good/neutral/bad) 응답 row 또는 신규 요청 row
-- ─────────────────────────────────────────
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS thumbs TEXT
  CHECK (thumbs IS NULL OR thumbs IN ('up', 'down'));

-- ─────────────────────────────────────────
-- 2. recommendation_id: 추천 대상 식별자
--    crop ID(예: 'apple') / program ID(예: 'SP-021') / region code(예: '46150')
-- ─────────────────────────────────────────
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS recommendation_id TEXT;

-- ─────────────────────────────────────────
-- 3. persona: 5종(family/farmYouth/elderRural/commuter/balanced)
--    페르소나별 thumbs ratio 분석용
-- ─────────────────────────────────────────
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS persona TEXT;

-- ─────────────────────────────────────────
-- 인덱스 2종
-- ─────────────────────────────────────────

-- 주배치 학습 조회용 (thumbs partial — NULL 제외해 인덱스 크기 절감)
CREATE INDEX IF NOT EXISTS idx_quick_feedback_thumbs_partial
  ON quick_feedback (thumbs, created_at DESC)
  WHERE thumbs IS NOT NULL;

-- 페르소나별 recommendation_id 분석용
CREATE INDEX IF NOT EXISTS idx_quick_feedback_recommend_persona
  ON quick_feedback (recommendation_id, persona)
  WHERE recommendation_id IS NOT NULL;

-- ─────────────────────────────────────────
-- 검증 쿼리 (apply 후 수동 실행 권장)
-- ─────────────────────────────────────────
-- 1. 기존 row 호환성 (모두 thumbs IS NULL이어야 함)
--    SELECT COUNT(*) FROM quick_feedback WHERE thumbs IS NULL;        -- 기존 전체 row
--
-- 2. thumbs CHECK 제약 작동 확인 (의도적 실패 케이스)
--    INSERT INTO quick_feedback (rating, page, thumbs) VALUES ('good', '/test', 'invalid');
--    → 23514 check_violation 발생해야 정상
--    이후 cleanup: DELETE FROM quick_feedback WHERE page = '/test';
--    잔존 row 0건 SELECT 결과: 0건 ✅ (5/11 가드 #5)
--
-- 3. 인덱스 생성 확인
--    SELECT indexname FROM pg_indexes WHERE tablename = 'quick_feedback';
--    → idx_quick_feedback_thumbs_partial, idx_quick_feedback_recommend_persona 포함
--
-- 4. thumbs 분포 (B4 주배치 50건 미만 guard 기준)
--    SELECT thumbs, COUNT(*) FROM quick_feedback
--    WHERE thumbs IS NOT NULL GROUP BY thumbs;
--
-- 5. 페르소나별 thumbs ratio
--    SELECT persona,
--           SUM(CASE WHEN thumbs = 'up' THEN 1 ELSE 0 END) AS up_count,
--           SUM(CASE WHEN thumbs = 'down' THEN 1 ELSE 0 END) AS down_count
--    FROM quick_feedback
--    WHERE thumbs IS NOT NULL AND persona IS NOT NULL
--    GROUP BY persona;
