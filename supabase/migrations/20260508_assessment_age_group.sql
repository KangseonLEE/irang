-- Phase 6 A안 고도화 옵션 A: assessment_results 에 age_group 컬럼 추가
-- 작성: 2026-05-08
-- 목적: /assess/result/[id] 공유 랜딩 페이지에서 페르소나 추천 노출 가능하도록
--       위저드 응답 ageGroup 을 DB 에 영속화한다.
--
-- ⚠️ APPLY 절차 (회장 결재 필요):
--   1. supabase 콘솔 → SQL Editor → 이 파일 내용 복사 → 실행
--   2. 또는: supabase db push --linked
--   3. 적용 후 검증 query (하단) 실행
--
-- Backward compatibility:
--   - NULL 허용 (기존 행은 NULL 로 유지 → 페르소나 섹션 미노출)
--   - INSERT 시 age_group 누락해도 정상 (기본값 NULL)
--   - 기존 RLS 정책 그대로 유지 (anon SELECT, service_role INSERT)

-- ─────────────────────────────────────────────────────────────────
-- 1. age_group 컬럼 추가 (NULL 허용)
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS age_group text;

-- 값 도메인: 'youth' | '30s' | '40s' | '50s' | '60plus' | NULL
-- (src/lib/data/personas.ts mapDemographicToPersona 참조)
COMMENT ON COLUMN assessment_results.age_group IS
  '연령대 (위저드 demoAnswers.ageGroup). 페르소나 추천 매핑에 사용. NULL 가능 (legacy 행).';

-- ─────────────────────────────────────────────────────────────────
-- 검증 query (apply 후 실행)
-- ─────────────────────────────────────────────────────────────────
-- 컬럼 존재 확인:
--   SELECT column_name, data_type, is_nullable
--   FROM information_schema.columns
--   WHERE table_name = 'assessment_results' AND column_name = 'age_group';
--   -- 결과: age_group | text | YES
--
-- legacy 행 영향 없음 확인:
--   SELECT count(*) FROM assessment_results WHERE age_group IS NULL;
--   -- apply 직후: 전체 행 수와 동일 (모두 NULL)
