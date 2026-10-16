-- 2026-10-16 데이터 정합성 1차 QA 🔴-2 — 큐레이션 지원사업 대상 연령 하한 18 → 0(하한 없음).
-- 회장 Supabase SQL Editor 적용용. 적용 뒤 Vercel 최신 Production 배포 Redeploy 필요
--   (지원사업 상세는 generateStaticParams 로 빌드 때 HTML 이 굳는다 — CLAUDE.md 빌드·배포 절차).
--
-- 배경: eligibility_age_min 은 INT NOT NULL DEFAULT 18 이라 원문에 하한이 없는 사업도 18 이 채워졌고,
--       화면 '대상 연령: 만 18세 이상'·JSON-LD suggestedMinAge 18 으로 나갔다. 앱은 0 = 하한 없음으로 읽는다
--       (src/lib/format.ts formatAgeRange · src/lib/data/programs.ts eligibilityAgeMin 주석 · programs-age-evidence.test.ts).
--
-- 대상: DB 우선 병합 큐레이션 행 중 원문에 하한이 없는 6행 × 1칸(eligibility_age_min) = 6칸.
--   SP-005 함평 귀농인의 집(원문 '만 65세 이하'만)      18 → 0  (상한 65 유지)
--   SP-008 귀농귀촌인·만 40세 미만 중 하나              18 → 0  (상한 99)
--   SP-011 귀농닥터 멘토링                              18 → 0  (상한 99)
--   SP-024 고성 귀농인의 집(원문 '65세 이하'만)         18 → 0  (상한 65 유지)
--   SP-025 논산 귀농인의 집                             18 → 0  (상한 99)
--   SP-026 제주 귀농인·신규농·만 40세 미만 중 하나      18 → 0  (상한 99)
-- 제외(원문에 하한 있음 — 그대로 18): SP-001(군산 공고 '최저연령 만 18세 이상'), SP-002·003·021·022·023.
-- 정적 값(src/lib/data/programs.ts)은 같은 커밋에서 이미 0. 원문 대조: 2026-10-16 curl(SP-005·024·026 기사, 나머지 QA 부록 A).
--
-- 스냅샷 가드: 지금 값이 18 일 때만 바꾼다(그 사이 손으로 고친 행은 건너뜀). 기대 영향 6행.

BEGIN;

UPDATE support_programs SET
  eligibility_age_min = 0,
  updated_at = now()
WHERE slug IN ('SP-005', 'SP-008', 'SP-011', 'SP-024', 'SP-025', 'SP-026')
  AND eligibility_age_min IS NOT DISTINCT FROM 18;

-- 확인: 6행 모두 0 이어야 한다. SP-001 은 18 그대로.
SELECT slug, eligibility_age_min, eligibility_age_max
FROM support_programs
WHERE slug IN ('SP-001', 'SP-005', 'SP-008', 'SP-011', 'SP-024', 'SP-025', 'SP-026')
ORDER BY slug;

COMMIT;
