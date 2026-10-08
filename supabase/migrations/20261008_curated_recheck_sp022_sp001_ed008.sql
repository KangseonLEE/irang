-- 2026-10-08 원문 재대조 정정 — 회장 Supabase SQL Editor 적용용. 적용 뒤 Vercel 최신 Production 배포 Redeploy(상세는 빌드 때 HTML 이 굳는다).
-- CoS 원문 대조 완료(그린대로 교육 소개·소백산귀농드림타운 공지·RDA 청년농 sId 46904/46915/46928·논산 2026-05-18 공고·정부24 154300000011).
-- 2026-10-08 data-engineer · 스냅샷 가드(바꾸는 칸의 지금 값 IS NOT DISTINCT FROM) — 그 사이 바뀐 행은 건너뛴다.
-- 정적 값(src/lib/data/programs.ts·education.ts)도 같은 문자열로 맞춰야 드리프트가 안 생긴다.


-- 파일 2/2: SP-022(경기도 연례 공모로 재큐레이션) + SP-001(상·하반기 원칙) + ED-008(공식 모집 공고 기준)

BEGIN;

-- SP-022: 원문은 경기도 시·군 공모 — 2026년 사업 파주(sId=46438, 2025.6.19~7.17), 2027년 사업 파주·김포·양평(sId=46904·46915·46928, 2026.6.22~7.24), 개소당 1억 원(도비30·시군비50·자부담20), 18~39세. 농촌진흥청·전국·R&D·컨설팅은 원문과 다름. 내부 ID(SP-020) 문구 삭제. 9999 페어 유지 + 접수 시기
UPDATE support_programs SET
  title = '청년농업인 아이디어 사업화 공모사업 (경기도)',
  summary = '경기도 시·군이 해마다 6~7월에 다음 해 청년농업인 아이디어 사업화 공모를 받아 개소당 사업비 1억 원(보조 80%·자부담 20%)을 지원. 만 18~39세, 최근 3년 이상 영농 종사.',
  description = '경기도 시·군 농업기술센터가 청년농업인의 아이디어를 사업으로 키우도록 돕는 공모사업이에요. 개소당 사업비 1억 원 중 80%를 도비·시군비로 보조하고(자부담 20%), 단체·법인은 최대 2억 원까지 받을 수 있어요(김포시 공고 기준). 아이디어 사업화에 필요한 장비·기계·시설, 신기술을 적용한 생산비 절감과 국내 육성 품종 확대, 소포장 상품·브랜드 개발(사업비의 20% 이내)을 지원하고, 단순 소모품·인건비는 지원하지 않아요. 해마다 6~7월에 다음 해 사업을 모집해요 — 2027년 사업은 2026년 6월 하순부터 7월 24일까지 파주·김포·양평 등에서 접수했어요. 시·군마다 선정 규모와 거주 요건이 다르니 거주지 농업기술센터 공고를 확인하세요.',
  region = '경기도',
  organization = '경기도 시·군 농업기술센터',
  support_type = '보조금',
  support_amount = '개소당 사업비 1억 원 (보조 80%: 도비 30·시군비 50 / 자부담 20%), 단체·법인 최대 2억 원',
  eligibility_detail = '사업 시행연도 기준 만 18~39세 청년농업인으로 최근 3년 이상 영농에 종사하고 병역을 마쳤거나 면제된 사람(후계농업경영인 산업기능요원 복무자 가능). 최근 3년간 국·도비 민간자본보조사업을 받은 사람은 제외. 시·군에 따라 실제 거주 요건이 있어요(예: 김포시). 거주지 시·군 농업기술센터 공고에 따라 신청.',
  application_cycle = '매년 6~7월 경기 시·군 접수 (2027년 사업은 2026년 6월 하순~7월 24일)',
  source_url = 'https://www.rda.go.kr/young/custom/policy/view.do?sId=46904',
  updated_at = now()
WHERE slug = 'SP-022'
  AND title IS NOT DISTINCT FROM '2026년 청년농업인 아이디어 사업화 공모사업'
  AND summary IS NOT DISTINCT FROM '농촌진흥청이 청년농의 창의적 아이디어를 R&D 융복합으로 사업화하는 도단위 자율 공모. 시·도별 별도 공고로 진행돼요.'
  AND description IS NOT DISTINCT FROM '농촌진흥청이 청년농업인의 창의적 아이디어를 농산물 고부가가치화로 연결하는 도단위 자율 공모사업이에요. 신기술과 청년 창업 아이디어를 융복합해 사업화하는 R&D 기반 지원이에요. 시·도별로 별도 공고가 진행되므로 본인이 거주하는 도(道) 농업기술원의 별도 공고를 확인해야 해요. 영농정착자금(SP-020)과는 명확히 다른 사업으로, 자금 지원이 아닌 R&D·창업 기반 매칭형 사업이에요. 정확한 모집 일자와 자금 규모는 시·도별 공고 발표 시 확정돼요.'
  AND region IS NOT DISTINCT FROM '전국'
  AND organization IS NOT DISTINCT FROM '농촌진흥청'
  AND support_type IS NOT DISTINCT FROM '컨설팅'
  AND support_amount IS NOT DISTINCT FROM '도단위 자율 공모 (R&D 사업화 기반, 자금 규모 시·도 공고 시 확정)'
  AND eligibility_detail IS NOT DISTINCT FROM '청년농업인 (도단위 별도 자격 적용). 시·도 농업기술원 공고 확인 필수.'
  AND application_cycle IS NOT DISTINCT FROM '시·도별 별도 공고'
  AND source_url IS NOT DISTINCT FROM 'https://www.rda.go.kr/young/custom/policy/view.do?sId=46438';

-- SP-001: 정부24 서비스(154300000011, 최종수정 2026-08-14) 신청기한 "(상반기) 1월 1일~2월 10일, (하반기) 6월 1일~7월 10일 원칙" + 2026 시행지침 "상·하반기 2회 원칙"
UPDATE support_programs SET
  description = '농업창업자금 최대 3억원, 주택구입자금 최대 7,500만 원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주여야 하고, 영농 관련 교육은 8시간 이상이 자격 요건이지만 100시간 미만이면 심사에서 최저 등급(D)을 받아 사실상 100시간 이상이 필요해요. 신청은 시군의 귀농귀촌 담당 부서(농업기술센터나 시청 부서)에서 상반기·하반기 두 번 받는 게 원칙이에요(상반기 1월 1일~2월 10일, 하반기 6월 1일~7월 10일). 실제 접수 기간은 시군마다 조금씩 달라요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요. 사과 같은 과수도 과원 조성·묘목 구입·관수시설·저온저장고까지 창업자금 용도로 인정돼요. 다만 2026년 선정부터 묘목·농기계·농업용 화물차 구입비는 합산 5천만 원까지예요.',
  application_cycle = '상·하반기 시·군 접수 (원칙 1/1~2/10, 6/1~7/10)',
  eligibility_detail = '농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 8시간 이상 이수(100시간 미만은 심사 최저 등급 D). 접수는 상·하반기 2회가 원칙(1/1~2/10, 6/1~7/10)이고 실제 기간은 시군별로 달라요(예: 군산 1/12~2/13, 서귀포 상반기 1/14~2/11·하반기 6/12~7/3) — 우리 시군 일정은 담당 부서에 확인하세요.',
  updated_at = now()
WHERE slug = 'SP-001'
  AND description IS NOT DISTINCT FROM '농업창업자금 최대 3억원, 주택구입자금 최대 7,500만 원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주여야 하고, 영농 관련 교육은 8시간 이상이 자격 요건이지만 100시간 미만이면 심사에서 최저 등급(D)을 받아 사실상 100시간 이상이 필요해요. 신청은 시군의 귀농귀촌 담당 부서(농업기술센터나 시청 부서)에서 받고, 접수 시기는 시군마다 달라 상·하반기 두 번 받는 곳도 있어요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요. 사과 같은 과수도 과원 조성·묘목 구입·관수시설·저온저장고까지 창업자금 용도로 인정돼요. 다만 2026년 선정부터 묘목·농기계·농업용 화물차 구입비는 합산 5천만 원까지예요.'
  AND application_cycle IS NOT DISTINCT FROM '매년 초 시·군 접수 (상·하반기 두 번 받는 곳도 있어요)'
  AND eligibility_detail IS NOT DISTINCT FROM '농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 8시간 이상 이수(100시간 미만은 심사 최저 등급 D). 접수 기간은 시군별로 달라요(예: 군산 1/12~2/13, 서귀포 상반기 1/14~2/11·하반기 6/12~7/3) — 우리 시군 일정은 담당 부서에 확인하세요.';

-- ED-008: 소백산귀농드림타운 공식 공지(sbdream.kr wr_id=125·128·130) + 2026 모집 계획 PDF — 모집 2025.12.1~12.31, 추가 1.1~1.16·2.25~3.3, 30세대, 교육비 선납 120만/240만 원, 보증금 30만/60만 원, 만 65세 이하
UPDATE education_courses SET
  duration = '10개월 (3~12월, 총 280시간 · 체류형)',
  schedule = '제11기 2026년 3~12월 (모집 2025.12.1~12.31 · 추가 모집 2026.3.3까지)',
  target = '영주로 이주해 귀농·귀촌하려는 도시민 (도시 지역 1년 이상 거주, 2026년 기준 만 65세 이하)',
  cost = '교육비 선납 원룸형 120만 원·투룸형 240만 원 + 보증금 30만·60만 원 (관리비 별도)',
  description = '영주시 소백산귀농드림타운(체류형 농업창업지원센터)에서 10개월(3~12월) 동안 살며 과수·양봉·버섯재배·농기계 사용법 같은 영농 교육(총 280시간)과 현장 실습을 받는 체류형 교육이에요. 원룸형 18세대와 투룸형 12세대(가족 2인 이상 우선) 등 30세대를 뽑아요. 2026년 제11기는 2025년 12월 1일부터 31일까지 모집한 뒤 2026년 3월 3일까지 추가 모집했고, 3월 입교식 때 25세대가 입교했으며 남은 자리는 정원이 찰 때까지 수시로 받았어요. 영주시는 해마다 12월에 다음 해 교육생을 모집해 왔으니(2023~2025년) 제12기 모집은 소백산귀농드림타운 공지사항을 확인하세요.',
  capacity = NULL,
  application_start = '2025-12-01'::date,
  application_end = '2026-03-03'::date,
  url = 'http://www.sbdream.kr/home/bbs/board.php?bo_table=basic&wr_id=125',
  updated_at = now()
WHERE slug = 'ED-008'
  AND duration IS NOT DISTINCT FROM '수개월 (체류형)'
  AND schedule IS NOT DISTINCT FROM '수시 접수 (제11기 운영 중)'
  AND target IS NOT DISTINCT FROM '귀농 희망자 (영주 지역 체류 가능자)'
  AND cost IS NOT DISTINCT FROM '입교비 소정 (확인 필요)'
  AND description IS NOT DISTINCT FROM '영주 소백산 인근 귀농드림타운에서 체류하며 농업을 학습하고 현장실습을 병행하는 체류형 교육 프로그램이에요. 2026년 3월 제11기 입교식 때 정원 30세대 중 25세대가 입교했고, 남은 5세대는 정원이 찰 때까지 수시로 신청을 받았어요.'
  AND capacity IS NOT DISTINCT FROM 5
  AND application_start IS NOT DISTINCT FROM '2026-01-01'::date
  AND application_end IS NOT DISTINCT FROM '2026-12-31'::date
  AND url IS NOT DISTINCT FROM 'http://www.ttlnews.com/news/articleView.html?idxno=3085607';

SELECT slug, title, region, organization, support_type, application_start, application_end, application_cycle FROM support_programs WHERE slug IN ('SP-001','SP-022') ORDER BY slug;

SELECT slug, schedule, cost, capacity, application_start, application_end, url FROM education_courses WHERE slug = 'ED-008';

COMMIT;
