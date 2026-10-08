-- 2026-10-08 원문 재대조 정정 — 회장 Supabase SQL Editor 적용용. 적용 뒤 Vercel 최신 Production 배포 Redeploy(상세는 빌드 때 HTML 이 굳는다).
-- CoS 원문 대조 완료(그린대로 교육 소개·소백산귀농드림타운 공지·RDA 청년농 sId 46904/46915/46928·논산 2026-05-18 공고·정부24 154300000011).
-- 2026-10-08 data-engineer · 스냅샷 가드(바꾸는 칸의 지금 값 IS NOT DISTINCT FROM) — 그 사이 바뀐 행은 건너뛴다.
-- 정적 값(src/lib/data/programs.ts·education.ts)도 같은 문자열로 맞춰야 드리프트가 안 생긴다.


-- 파일 1/2: ED-006(기관 정정, 10/6 초안 개정) + SP-025(2026년 실제 공고로)

BEGIN;

-- ED-006: 391개 과정(RDA HRD 계획 총계) 삭제, 운영 기관을 농정원 귀농귀촌종합센터로 — 그린대로 아카데미·맞춤형·청년귀농 장기교육 소개 페이지 대조(2026-10-08). 링크는 세 과정이 다 보이는 그린대로 교육홈(agriedu.net 첫 화면엔 귀농귀촌 교육 키워드가 없음)
UPDATE education_courses SET
  title = '귀농귀촌종합센터 귀농·귀촌 교육',
  organization = '농림수산식품교육문화정보원 귀농귀촌종합센터',
  duration = '과정별 상이 (아카데미 기본공통과정 13시간 · 청년귀농 장기교육 300~1,000시간)',
  schedule = '연중 과정별 모집 (아카데미 ~11월 · 맞춤형교육 ~10월)',
  target = '귀농·귀촌 희망자 (과정별 자격 상이)',
  cost = '과정별 상이 (맞춤형교육 70% · 청년귀농 장기교육 90% 국고 지원)',
  description = '농림수산식품교육문화정보원(농정원) 귀농귀촌종합센터가 귀농·귀촌 단계별 교육을 대면·비대면으로 운영해요. 귀농귀촌 아카데미는 입문자를 위한 기초 교육(기본공통과정 13시간)이고, 귀농귀촌 맞춤형교육은 교육비의 70%를, 만 40세 미만 귀농 희망 청년이 교육기관에서 300~1,000시간 실습 중심으로 배우는 청년귀농 장기교육은 90%를 국고로 지원해요. 과정은 그린대로에서 찾아보고 과정별 안내에 따라 신청해요(공통교과목·청년귀농 장기교육은 농업교육포털 agriedu.net). 공통교과목 3과목은 청년귀농 장기교육은 신청 전에, 맞춤형교육은 올해는 수료 전까지 마쳐야 하고 2027년부터는 맞춤형교육도 신청 전에 마쳐야 해요.',
  url = 'https://www.greendaero.go.kr/svc/rfph/edc/home/front/educationNewHome.do',
  updated_at = now()
WHERE slug = 'ED-006'
  AND title IS NOT DISTINCT FROM '농촌진흥청 농촌인적자원개발센터 교육 (연간 391개 과정)'
  AND organization IS NOT DISTINCT FROM '농촌진흥청 농촌인적자원개발센터'
  AND duration IS NOT DISTINCT FROM '과정별 상이 (연간 391개 과정)'
  AND schedule IS NOT DISTINCT FROM '상시 운영'
  AND target IS NOT DISTINCT FROM '귀농귀촌 희망자 및 농업인 누구나'
  AND cost IS NOT DISTINCT FROM '국비 70~90% 지원 (개인 부담 최소)'
  AND description IS NOT DISTINCT FROM '귀농귀촌 아카데미, 맞춤형교육, 농산업 창업교육, 청년귀촌장기교육 등 연간 391개 과정을 운영합니다.'
  AND url IS NOT DISTINCT FROM 'https://agriedu.net/';

-- SP-025: 2026-07-18~08-01(근거 없음) → 논산시농업기술센터 센터소식 2026-05-18 공고(석종리 1세대, 5/18~5/28, 월세 10만 원), 만 65세 상한(공고에 없음) 해제, 내부 메모 삭제
UPDATE support_programs SET
  title = '논산시 귀농인의 집 입주자 모집 (상월면 석종리)',
  summary = '충남 논산시가 상월면 석종리 귀농인의 집 입주자 1세대를 2026년 5월 18일부터 28일까지 모집. 보증금 100만 원 + 월세 10만 원, 1년 거주.',
  description = '충청남도 논산시 농업기술센터가 상월면 석종리 빈집을 고친 귀농인의 집(55.1㎡)에 살 1세대를 2026년 5월 18일부터 28일까지 모집했어요. 서류평가와 면접으로 뽑고, 입주하면 계약일로부터 1년간 보증금 100만 원·월세 10만 원으로 살 수 있어요(다음 이용자가 없으면 1년 더 머물 수 있고, 전기·수도 등 공과금은 따로 내요). 공고에는 모집 기간이 끝난 뒤에도 빈자리가 있으면 상시·선착순으로 받는다고 적혀 있으니, 남은 자리는 논산시 농업기술센터 귀농귀촌팀에 확인하세요.',
  support_amount = '임시 주거지 제공 (석종리 55.1㎡, 보증금 100만 원 + 월세 10만 원, 1년 거주)',
  eligibility_age_max = 99,
  eligibility_detail = '모집 공고일 현재 논산시 외 지역에서 1년 이상 살고, 농업 외 직업에 종사한 사람 중 논산시로 귀농을 희망하는 사람(직업군인은 농어촌 거주자도 가능). 고등학교·대학 재학생은 제외(방송통신대·야간대 등은 가능). 방문 또는 팩스(041-746-8319) 신청 — 팩스는 귀농귀촌팀(041-746-8347) 전화로 접수 확인 필수.',
  application_start = '2026-05-18'::date,
  application_end = '2026-05-28'::date,
  source_url = 'https://www.nonsan.go.kr/nongup/html/sub04/0401.html?mode=V&no=9393b35118645b7a00e9998c2f79d91e',
  updated_at = now()
WHERE slug = 'SP-025'
  AND title IS NOT DISTINCT FROM '논산시 귀농인의 집 입주자 모집 (상월면 상도리)'
  AND summary IS NOT DISTINCT FROM '충남 논산시가 상월면 상도리 리모델링 귀농인의 집 입주자를 7월 18일부터 8월 1일까지 모집. 보증금 100만원 + 월세 20만원 1년 거주.'
  AND description IS NOT DISTINCT FROM '충청남도 논산시 농업기술센터가 상월면 상도리에 리모델링한 귀농인의 집 입주자를 모집해요. 모집 기간은 2026년 7월 18일부터 8월 1일까지이며, 입주자는 계약일로부터 1년간 거주할 수 있어요. 보증금 100만원 + 월세 20만원의 부담 적은 조건으로, 도시민이 일정 기간 농촌에 체류하며 지역 환경을 직접 체험하고 정착을 준비하기에 좋아요. 충남 권역 가족·반귀농 페르소나에 적합한 체류형 사업이에요. 논산시청 공식 페이지 URL은 추후 확보 시 교체 예정이고, 현재는 굿모닝충청 공식 보도 기사를 출처로 명시해요.'
  AND support_amount IS NOT DISTINCT FROM '임시 주거지 제공 (보증금 100만원 + 월세 20만원, 1년 거주)'
  AND eligibility_age_max IS NOT DISTINCT FROM 65
  AND eligibility_detail IS NOT DISTINCT FROM '귀농 희망 도시민. 상월면 상도리 리모델링 주거지 1동. 논산시 농업기술센터 신청.'
  AND application_start IS NOT DISTINCT FROM '2026-07-18'::date
  AND application_end IS NOT DISTINCT FROM '2026-08-01'::date
  AND source_url IS NOT DISTINCT FROM 'https://www.goodmorningcc.com/news/articleView.html?idxno=426265';

SELECT slug, title, organization, schedule, cost, url FROM education_courses WHERE slug = 'ED-006';

SELECT slug, title, application_start, application_end, eligibility_age_max, source_url FROM support_programs WHERE slug = 'SP-025';

COMMIT;
