-- 2026-10-16 데이터 정합성 1·2차 QA — 큐레이션 지원사업 DB 우선 병합 행 정정 (한 파일로 묶음).
-- 회장 Supabase SQL Editor 적용용. 적용 뒤 Vercel 최신 Production 배포 **Redeploy 필요**
--   (지원사업 상세는 generateStaticParams 로 빌드 때 HTML 이 굳는다 — CLAUDE.md 빌드·배포 절차).
-- **같은 날 운영 배포와 한 묶음으로** 적용한다 — 정정 이력(10/16 3건)이 이 값을 고쳤다고 공지한다(2차 QA 🟡-②).
-- 정적 값(src/lib/data/programs.ts)은 같은 커밋에서 이미 바뀌었고, 아래 SET 값은 그 정적 값과 같은 문자열이다.
-- 스냅샷 가드: 바꾸는 칸의 지금 값이 10/16 anon 조회 값과 같을 때만 바꾼다(그 사이 손으로 고친 행은 건너뜀).
--
-- (1) 연령 하한 18 → 0 (1차 QA 🔴-2): 원문에 하한이 없는 6행 × eligibility_age_min 1칸 = 6칸.
--     SP-005 함평(원문 '만 65세 이하'만)·SP-008·SP-011·SP-024 고성('65세 이하'만)·SP-025·SP-026.
--     제외(원문에 하한 있음 — 그대로 18): SP-001(군산 공고 '최저연령 만 18세 이상')·002·003·021·022·023.
-- (2) SP-021 예산 임대형 스마트팜 (2차 QA 🔴-1): 1행 × 9칸.
--     모집은 2025년(예산군농업기술센터 공고 제2025-41호, 2025.8.29 게시, 접수 2025.9.1~9.26 — 첨부 공고문 hwp),
--     연령 운영 지침 '만18세 이상 ~ 만44세 이하', 대부기간 '기본 1년, 최대 3년(1년 단위 최대 2회 연장)'.
--     2026년 재모집 공고는 군청 통합검색(10/16)에서 없음. 출처 기사 → 군 고시·공고 원문.
-- (3) 접수 시작일 (2차 QA 🟡-⑤): 원문에 시작일이 없어 지어낸 값 → 원문이 모집 중임을 알린 게시일. 2행 × 1칸.
--     SP-005 2026-01-10 → 2026-01-19 (아시아에이 237422), SP-024 2026-05-01 → 2026-05-12 (GNN뉴스 168675).
--     (SP-006·007·009 는 DB 행이 없어 정적만.)
-- 기대 영향: 행 기준 SP-005·008·011·021·024·025·026 = 7행(칸 6 + 9 + 2 = 17칸).

BEGIN;

-- (1) 연령 하한
UPDATE support_programs SET
  eligibility_age_min = 0,
  updated_at = now()
WHERE slug IN ('SP-005', 'SP-008', 'SP-011', 'SP-024', 'SP-025', 'SP-026')
  AND eligibility_age_min IS NOT DISTINCT FROM 18;

-- (2) SP-021
UPDATE support_programs SET
  summary = '충남 예산군이 2026년 하반기 준공 예정 임대형 스마트팜 2개소(역리 6팀·신양 4팀, 총 10팀) 입주 청년농업인을 2025년 9월 1일부터 26일까지 모집했어요.',
  description = '예산군농업기술센터가 충청남도 공모사업으로 조성 중인 임대형 스마트팜 2개소(삽교읍 역리지구 6팀, 신양면 신양지구 4팀, 총 10팀)에 입주할 청년농업인을 모집했어요. 역리지구는 2~3인, 신양지구는 3인이 한 팀이에요. 공고 연도 기준 만 18세 이상 만 44세 이하이고 본인 명의 스마트팜 시설이 없으며 병역을 마친(또는 면제된) 사람이 신청할 수 있어요(타 시·도 거주자는 선정 후 계약 전까지 예산군 전입). 접수는 2025년 9월 1일부터 26일까지 이메일 또는 농업기술센터 스마트농업과 방문으로 받았어요. 사용 기간은 1년 단위 계약으로 최대 3년(2026년 8월~2029년 7월 예정, 온실 조성에 따라 늦어질 수 있음)이에요.',
  support_amount = '임대형 스마트팜 시설 임대 (2개소 총 10팀, 1년 단위 계약·최대 3년)',
  eligibility_age_max = 44,
  eligibility_detail = '공고 연도 기준 만 18세 이상 만 44세 이하 청년농업인(1981~2007년생). 본인 명의 스마트팜 시설 영농기반이 없고 병역필 또는 면제. 예산군 실거주(타 시·도 거주자는 선정 후 계약 전 전입). 역리지구 2~3인·신양지구 3인 1팀. 이메일 또는 농업기술센터 스마트농업과 방문 접수.',
  application_start = '2025-09-01',
  application_end = '2025-09-26',
  source_url = 'https://www.yesan.go.kr/prog/saeolGosi/GOSI/kor/sub04_02_01/view.do?notAncmtMgtNo=43827',
  year = 2025,
  updated_at = now()
WHERE slug = 'SP-021'
  AND summary IS NOT DISTINCT FROM '충남 예산군이 2026년 하반기 준공 예정 임대형 스마트팜 2개소(역리 6팀·신양 4팀, 총 10팀)에 청년농 입주자를 9월 한 달간 모집해요.'
  AND description IS NOT DISTINCT FROM '예산군농업기술센터가 2023년 충청남도 공모사업으로 선정·조성한 임대형 스마트팜 2개소(삽교읍 역리지구 6팀, 신양지구 4팀, 총 10팀) 입주 청년농을 모집해요. 팀별 2~3인으로 구성하며 만 18세 이상 40세 미만 청년농업인이 대상이에요. 신청은 2026년 9월 1일부터 9월 26일까지 4주간 진행되고, 신청서와 증빙자료를 농업기술센터 스마트농업과에 방문 제출하면 돼요. 임대 기간은 기본 3년이며 성과에 따라 최대 3년 더 연장 가능해요. 충남 권역 청년농 진입 장벽을 크게 낮춰 주는 사업이에요.'
  AND support_amount IS NOT DISTINCT FROM '임대형 스마트팜 시설 임대 (2개소 총 10팀, 기본 3년 최대 6년)'
  AND eligibility_age_max IS NOT DISTINCT FROM 39
  AND eligibility_detail IS NOT DISTINCT FROM '만 18세 이상 40세 미만 청년농업인. 팀별 2~3인 구성. 신청서·증빙자료 농업기술센터 스마트농업과 방문 제출.'
  AND application_start IS NOT DISTINCT FROM '2026-09-01'
  AND application_end IS NOT DISTINCT FROM '2026-09-26'
  AND source_url IS NOT DISTINCT FROM 'https://www.dominilbo.com/news/articleView.html?idxno=245110'
  AND year IS NOT DISTINCT FROM 2026;

-- (3) 접수 시작일
UPDATE support_programs SET
  application_start = '2026-01-19',
  updated_at = now()
WHERE slug = 'SP-005'
  AND application_start IS NOT DISTINCT FROM '2026-01-10';

UPDATE support_programs SET
  application_start = '2026-05-12',
  updated_at = now()
WHERE slug = 'SP-024'
  AND application_start IS NOT DISTINCT FROM '2026-05-01';

-- 확인: SP-001 은 18 그대로, 6행 하한 0, SP-021 2025-09-01~09-26·만 18~44세, SP-005 1/19·SP-024 5/12 시작
SELECT slug, eligibility_age_min, eligibility_age_max, application_start, application_end, year, source_url
FROM support_programs
WHERE slug IN ('SP-001', 'SP-005', 'SP-008', 'SP-011', 'SP-021', 'SP-024', 'SP-025', 'SP-026')
ORDER BY slug;

COMMIT;
