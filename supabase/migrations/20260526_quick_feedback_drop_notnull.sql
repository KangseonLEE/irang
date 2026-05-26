-- 5/15·5/16 마이그레이션에서 rating·message NOT NULL DROP 누락 → 33일째 INSERT 0건
-- thumbs-only / request-only 모드도 적재 가능하도록 제약 완화 + 안전망 CHECK 추가
--
-- 배경 (2026-05-26 진단 a1b7eeff753b3f72e):
--   - 5/15 request_kind 컬럼 추가 + 5/16 thumbs 컬럼 추가 시 기존 rating·message NOT NULL 그대로
--   - thumbs-only POST(rating=NULL, message=NULL) → 23502 not-null violation
--   - /api/quick-feedback이 silent 202(skipped:"migration-pending") 반환 → 33일째 INSERT 0건
--
-- 적용 순서: 회장 결재 후 Supabase Dashboard SQL Editor 또는 supabase CLI 수동 apply (CLAUDE.md §0-1)
-- data-engineer 가드: 마이그레이션 파일만 생성, apply는 회장 명령으로 (5/11 §1 read-only 우선)
--
-- apply 후 검증 (다음 task):
--   1) 라이브 thumbs POST → 200
--   2) SELECT * FROM quick_feedback WHERE thumbs IS NOT NULL ORDER BY created_at DESC LIMIT 1
--   3) cleanup (진단 row 제거)
--   4) 잔존 진단 row 0건 ✅ (5/11 §5 CoS 보고 게이트)

-- ─────────────────────────────────────────
-- 1. rating NOT NULL DROP
--    기존: NOT NULL (5/15 이전 응답 row는 rating 필수였음)
--    이후: nullable (thumbs-only / request-only 모드 지원)
-- ─────────────────────────────────────────
ALTER TABLE quick_feedback ALTER COLUMN rating DROP NOT NULL;

-- ─────────────────────────────────────────
-- 2. message NOT NULL DROP
--    기존: NOT NULL
--    이후: nullable (thumbs-only / request-only 모드 지원)
-- ─────────────────────────────────────────
ALTER TABLE quick_feedback ALTER COLUMN message DROP NOT NULL;

-- ─────────────────────────────────────────
-- 3. 안전망 CHECK: 최소 하나는 NOT NULL
--    rating · thumbs · request_kind 중 하나라도 있어야 의미 있는 row
--    전부 NULL인 빈 row 삽입 방지
-- ─────────────────────────────────────────
ALTER TABLE quick_feedback ADD CONSTRAINT quick_feedback_mode_check
  CHECK (rating IS NOT NULL OR thumbs IS NOT NULL OR request_kind IS NOT NULL);

-- ─────────────────────────────────────────
-- 검증 쿼리 (apply 후 수동 실행 권장)
-- ─────────────────────────────────────────
-- 1. 컬럼 nullable 상태 확인
--    SELECT column_name, is_nullable FROM information_schema.columns
--    WHERE table_name = 'quick_feedback' AND column_name IN ('rating', 'message');
--    → 모두 is_nullable = 'YES'
--
-- 2. CHECK 제약 작동 확인 (의도적 실패 케이스)
--    INSERT INTO quick_feedback (page) VALUES ('/test-empty');
--    → 23514 check_violation 발생해야 정상 (전부 NULL 차단)
--
-- 3. thumbs-only 정상 INSERT (의도적 성공 케이스)
--    INSERT INTO quick_feedback (page, thumbs, recommendation_id, persona)
--    VALUES ('/test', 'up', '__diag_20260526_test', 'balanced');
--    → 성공해야 정상
--    cleanup: DELETE FROM quick_feedback WHERE recommendation_id LIKE '__diag_%';
--    잔존 row 0건 SELECT 결과: 0건 ✅ (5/11 가드 #5)
