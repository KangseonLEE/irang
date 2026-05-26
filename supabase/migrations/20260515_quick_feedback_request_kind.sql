-- Phase 3: 관리자 요청 폼 강화 (2026-05-15)
--
-- 사용자가 RequestModal에서 "항목" / "기능" 중 선택할 수 있도록 컬럼 2종 추가.
-- 기존 quick_feedback row 호환성 유지 — 신규 컬럼은 모두 nullable.
--
-- mode-check-ok: 5/26 quick_feedback 33일 silent fail 사고의 시작점. 본 마이그레이션이
--   rating·message NOT NULL DROP을 누락 → 5/26 20260526_quick_feedback_drop_notnull.sql로 해소.
--   `npm run check-migration-not-null` (5/26 자동화)이 동일 패턴 재발을 build-time에 차단.
--   상세: CLAUDE.md Lessons Learned (2026-05-26).
--
-- 적용 순서: 회장 결재 후 supabase CLI 또는 SQL 에디터에서 수동 apply (CLAUDE.md §0-1).
-- data-engineer 가드: read-only 우선 + 마이그레이션 파일만 생성, apply는 회장 명령으로.

-- 요청 종류: 'item'(항목 추가) | 'feature'(기능 추가) | NULL(기존 row + rating 응답)
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS request_kind TEXT;

-- 항목 카테고리: 'crop'·'glossary'·'program'·'region'·'education'·'event'·'interview'·'etc' | NULL
-- request_kind='feature' 또는 NULL일 때는 무조건 NULL.
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS item_category TEXT;

-- 통계 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_quick_feedback_request_kind
  ON quick_feedback (request_kind);

CREATE INDEX IF NOT EXISTS idx_quick_feedback_item_category
  ON quick_feedback (item_category);

-- 검증 쿼리 (apply 후 수동 실행 권장):
-- SELECT COUNT(*) FROM quick_feedback WHERE request_kind IS NULL;        -- 기존 row
-- SELECT COUNT(*) FROM quick_feedback WHERE request_kind = 'item';       -- 신규 항목 요청
-- SELECT COUNT(*) FROM quick_feedback WHERE request_kind = 'feature';    -- 신규 기능 요청
-- SELECT item_category, COUNT(*) FROM quick_feedback
--   WHERE item_category IS NOT NULL GROUP BY item_category ORDER BY 2 DESC;
