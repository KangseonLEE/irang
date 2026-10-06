-- 2026-10-06 DB 우선 큐레이션 행 ↔ 정적·원문 동기화 (QA 1차 Q1-W2 후속, data-engineer)
--
-- 문제:
--   loadPrograms()·loadEducation()·loadEvents() 는 DB 행이 있으면 DB 값을 서빙한다(DB 우선 병합).
--   큐레이션 행 일부가 옛 텍스트로 남아 운영에 '~합니다' 문체·'만원' 붙여쓰기·내부 메모가 그대로 나가고 있었다
--   (예: /programs/SP-005 "가능합니다·있습니다", /education 목록 "운영합니다"). 정적 소스는 고쳐져 있었지만
--   7/9 동기화 파일(20260709_support_programs_static_sync.sql)은 **적용된 적이 없다** — 그 파일은 이제 내용이 낡아
--   9/28 정정(SP-001 '교육 100시간 자격' 오표기·SP-002 '연간 약 2,000명' 근거 없음)을 되돌리므로 적용하면 안 된다.
--   이 파일이 그 역할을 대신한다.
--
-- 범위 (2026-10-06 운영 DB anon 스냅샷과 정적 값을 필드 단위로 대조 → 원문 재대조 후 확정한 것만):
--   support_programs  9행: SP-001·002·003·005·008·011·022·024·026
--   education_courses 3행: ED-001·002·008
--   farm_events       3행: evt-001·002·003
--   이 파일에 없는 판단 사항(회장 결재): ED-006 기관 정체성(농진청 HRD ↔ 농정원 귀농귀촌종합센터), SP-025 연도(원문 2025),
--   SP-022 사업 성격(원문은 경기도 시·군 보조사업). 정적이 원문과 달라 DB 값을 유지한 필드: SP-001 summary,
--   SP-005·024 eligibility_detail ('귀농 희망' 원문 그대로) — 정적 쪽 되돌리기 diff 별도.
--
-- 원문 대조 (2026-10-06 한국 회선 GET, 본문 키워드 확인):
--   SP-003 youth.chungnam.go.kr/web/main/bbs/cnyouth_notice/497 — 이론1·실습2·현장3개월, 훈련비 월 최대 100만원, 18~44세, 접수 2025-12-29~2026-01-02
--          ※ '딸기·토마토·파프리카 등' 작물 예시는 원문에 없어 설명에서 뺐다(관련 작물 태그는 9/26 작물군 규칙대로 유지)
--   SP-005 asiaa.co.kr 237422 (2026-01-19) — 21세대, 만 65세 이하, 3~11월 9개월 거주, '예비 귀농인'. '무상' 표현 없음 → 삭제
--   SP-008 post24.kr/319532 (2026-04-01) — '월 80만 원 한도 내'·'월 40만 원 한도 내', 6~10월 약 5개월
--   SP-011 greendaero.go.kr/svc/rfph/edc/doctor/front/index.do (운영 기관 농정원 페이지) — 신청 1~11월(예산 소진 시 조기 마감),
--          대상 '농촌거주 만 6년 미만(전입일 기준) 귀농귀촌인 또는 영농정착지원사업 선정자', 1인당 연 최대 8회(교육비 무료), 회차당 2시간 이상
--          ※ 옛 출처 rda.go.kr/young/content/content76.do 는 '1년 미만'으로 낡아 있어 출처를 운영 기관 페이지로 바꾼다
--   SP-024 gnnnews.kr/168675 (2026-05-12) — '65세 이하의 귀농을 희망하는 도시민', 6개월~최대 1년
--   SP-026 koreatimenews 1064324 (등록 2026-02-05) + 제주농업기술센터 공지 seq=59363 첨부 '2026년 신규농업인 현장실습 교육 추진 계획'
--          — '신청기간: 2026. 2. 5.(목) 09:00 ~ 2. 25.(수) 18:00' (우리 값 5/5~5/25 는 달을 잘못 읽은 것)
--   ED-001 agro.seoul.go.kr/archives/55475 — 모집기간 '2026-02-10 11:00 ~ 2026-04-16 15:00', 1기/40명, 선착순, 6시간/1일
--   ED-002 agro.seoul.go.kr/archives/55870 — '4. 21.(화) … 4. 23.(목)', 온실 구축 및 운영 기초가이드
--   ED-008 ttlnews.com 3085607 (2026-03-04) — 제11기 입교 25세대(정원 30), '현재 5세대를 추가 모집 중' → 날짜를 박은 과거형으로
--   evt-001~003 — 행사 종료 후 누리집이 다음 회차로 바뀌어 세부 문구 재확인 불가. 문체·문법('박람회이에요'→'박람회예요')만 바꾸고
--          서술 내용은 정적(큐레이션 당시 값) 그대로
--
-- 멱등·안전장치:
--   · 행마다 바꾸는 필드의 **현재 값 전부를 가드**(IS NOT DISTINCT FROM 스냅샷 값)로 건다 — 다시 실행하거나, 그 사이 누가
--     값을 바꿨으면 그 행은 건너뛴다(0행 갱신). 아래 검증 SELECT 로 남은 드리프트를 본다.
--   · 한 트랜잭션. 컬럼 추가 없음(NOT NULL 점검 대상 아님). 생성 스크립트는 일회성(값은 이 파일이 원본).
--   · SP-011 은 9999 페어 → status '모집예정' 고정(auto_update_program_status 는 9999 를 건드리지 않는다, 9/28 파일 참고)
--
-- 정적 소스 동반 수정 (frontend 소유 파일 — CoS 가 diff 적용): programs.ts SP-001·003·005·008·011·024·025·026·027·031,
--   education.ts ED-001·002·006·008, events.ts evt-001~003. 둘 중 하나만 바뀌면 QA 드리프트 점검이 다시 잡는다.
--
-- ⚠ apply 는 회장 결재 후 수동 (Supabase Dashboard SQL Editor). 프론트 배포와 순서 무관.
-- 적용 후 라이브 확인:
--   curl -s https://irangfarm.com/programs/SP-005 | grep -c "합니다"            # 0
--   curl -s https://irangfarm.com/programs/SP-011 | grep -o "매년 1~11월 그린대로 접수"
--   curl -s https://irangfarm.com/programs/SP-026 | grep -o "2월 5일 오전 9시"
--   curl -s https://irangfarm.com/education/ED-002 | grep -o "4.21(화)"

BEGIN;

-- SP-001: 지원 금액 표기 '7,500만원' → '7,500만 원' (정적 동일). summary 는 DB 값('귀농인의…')이 원문 대상(귀농인)과 맞아 그대로 둔다 — 정적을 되돌리는 diff 별도
UPDATE support_programs SET
  support_amount = '농업창업 최대 3억원 / 주택구입 최대 7,500만 원 (5년 거치 10년 상환)',
  updated_at = now()
WHERE slug = 'SP-001'
  AND support_amount IS NOT DISTINCT FROM '농업창업 최대 3억원 / 주택구입 최대 7,500만원 (5년 거치 10년 상환)';

-- SP-002: 지원 금액 표기 '110만원' → '110만 원' (정적 동일, 금액은 9/28 원문 대조 끝)
UPDATE support_programs SET
  support_amount = '독립경영 1년차 월 110만 원, 2년차 월 100만 원, 3년차 월 90만 원',
  updated_at = now()
WHERE slug = 'SP-002'
  AND support_amount IS NOT DISTINCT FROM '독립경영 1년차 월 110만원, 2년차 월 100만원, 3년차 월 90만원';

-- SP-003: '~합니다' 문체·'100만원' 표기. 원문(충남청년포털 공지 497)에 없는 '딸기·토마토·파프리카 등' 작물 예시는 빼고 원문 단계(이론 1·실습 2·현장 3개월)로. 관련 작물에 방울토마토(9/26 규칙, 정적 동일)
UPDATE support_programs SET
  description = '스마트팜 기본역량 이론(1개월), 활용능력 실습(2개월), 선도농가와 짝을 이룬 현장실습(3개월)으로 이어지는 6개월 과정이에요. 수강료는 전액 지원되고, 현장실습 교육 기간에는 훈련비가 월 최대 100만 원까지 지급돼요. 충남에 살거나 충남으로 전입할 예정인 만 18~44세 청년이 신청할 수 있어요.',
  support_amount = '교육 수강료 전액 지원 + 현장실습 훈련비 월 최대 100만 원',
  related_crops = ARRAY['딸기', '토마토', '방울토마토', '파프리카']::text[],
  updated_at = now()
WHERE slug = 'SP-003'
  AND description IS NOT DISTINCT FROM '6개월 과정으로 이론교육, 시설 실습, 선도농가 현장실습을 체계적으로 이수합니다. 수강료 전액 지원에 현장실습 훈련비 월 최대 100만원까지 지급됩니다. 딸기·토마토·파프리카 등 시설원예 중심의 스마트팜 기술을 익힐 수 있으며, 충남 거주 또는 전입 예정 만 18~44세 청년이 대상입니다.'
  AND support_amount IS NOT DISTINCT FROM '교육 수강료 전액 지원 + 현장실습 훈련비 월 최대 100만원'
  AND related_crops IS NOT DISTINCT FROM ARRAY['딸기', '토마토', '파프리카']::text[];

-- SP-005: '~합니다' 문체. 원문(아시아에이 2026-01-19)에 없는 '무상으로 이용' 삭제, 원문의 '3~11월 9개월 거주'·자격(예비 귀농인)으로. eligibility_detail 은 DB 값('예비귀농인')이 원문과 맞아 그대로
UPDATE support_programs SET
  summary = '함평군에서 농촌 정착 희망자에게 주거공간·공동실습농지·시설하우스를 제공하는 체류형 교육.',
  description = '함평군 귀농어귀촌 체류형 지원센터의 제6기 입교생 21세대를 모집하는 사업이에요. 선발되면 3~11월 9개월간 센터에 머물며 공동 실습 농지·시설하우스·작업장을 활용해 귀농·귀촌 교육을 받아요. 만 65세 이하로 도시에서 1년 이상 살다가 함평군에 전입한 지 6개월이 안 된 분이나, 이주를 희망하는 예비 귀농인이 신청할 수 있어요.',
  updated_at = now()
WHERE slug = 'SP-005'
  AND summary IS NOT DISTINCT FROM '함평군에서 귀농 희망자에게 주거공간·공동실습농지·시설하우스를 제공하는 체류형 교육.'
  AND description IS NOT DISTINCT FROM '21세대 규모의 체류형 주거공간과 공동실습농지, 시설하우스, 작업장을 무상으로 이용할 수 있습니다. 도시에서 1년 이상 거주한 만 65세 이하 귀농 희망자가 대상이며, 함평군 전입 6개월 이내이거나 이주 예정인 예비귀농인도 신청 가능합니다. 실제 농촌에서 생활하며 영농기술을 익힐 수 있는 체류형 프로그램입니다.';

-- SP-008: '~합니다' 문체·'만원' 표기. 원문(포스트24 2026-04-01) '월 80만 원 한도 내'·'월 40만 원 한도 내' → '월 최대'. 교육기간 6~10월 원문 확인
UPDATE support_programs SET
  summary = '연천군 귀농귀촌인 대상 선도농가 현장실습 교육으로 월 최대 80만 원 교육훈련비를 지급.',
  description = '연수생에게 월 최대 80만 원 교육훈련비, 선도농가에게 월 최대 40만 원 교수수당을 지급하는 실습형 교육이에요. 최근 5년 이내 연천군으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년이 대상이며, 교육기간은 2026년 6~10월이에요. 숙련 농가에서 직접 기술을 전수받는 현장 중심 교육으로 실전 역량을 키울 수 있어요.',
  support_amount = '연수생 월 최대 80만 원 교육훈련비 + 선도농가 월 최대 40만 원 교수수당',
  eligibility_detail = '최근 5년 이내 해당 지역 농촌으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년. 교육기간 2026.6~10월.',
  updated_at = now()
WHERE slug = 'SP-008'
  AND summary IS NOT DISTINCT FROM '연천군 귀농귀촌인 대상 선도농가 현장실습 교육으로 월 80만원 교육훈련비를 지급.'
  AND description IS NOT DISTINCT FROM '연수생에게 월 80만원 교육훈련비, 선도농가에게 월 40만원 교수수당을 지급하는 실습형 교육입니다. 최근 5년 이내 연천군으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년이 대상이며, 교육기간은 2026년 6~10월입니다. 숙련 농가에서 직접 기술을 전수받는 현장 중심 교육으로 실전 역량을 키울 수 있습니다.'
  AND support_amount IS NOT DISTINCT FROM '연수생 월 80만원 교육훈련비 + 선도농가 월 40만원 교수수당'
  AND eligibility_detail IS NOT DISTINCT FROM '최근 5년 이내 해당 지역 농촌으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년.';

-- SP-011: 운영 기관 원문(그린대로 귀농닥터, 2026-10-06 확인)과 대조: 신청 1~11월(예산 소진 시 조기 마감)·대상 농촌 거주 만 6년 미만·연 최대 8회 무료·운영 농정원. DB 2026-12-31 도 정적 '상시·연중'도 원문과 달랐음 → 9/27 연례 창구 규칙(9999 페어 + 접수 시기 문구). 옛 '1년 미만'·'농촌진흥청'·'선도농가 현장실습'·'상시' 정정, 연령 상한 없음(99)
UPDATE support_programs SET
  title = '귀농닥터 멘토링 (1:1 현장 컨설팅)',
  summary = '귀농귀촌 희망 도시민과 농촌 전입 6년 미만 귀농귀촌인에게 분야별 전문가·귀농 선배가 1:1 현장 멘토링을 연 최대 8회 무료로 해 주는 사업.',
  description = '귀농귀촌을 준비하는 도시민이나 농촌에 전입한 지 만 6년이 안 된 귀농귀촌인(영농정착지원사업 선정자 포함)이 귀농닥터(분야별 전문가·귀농 선배)와 1:1로 연결돼 현장 멘토링을 받는 사업이에요. 한 사람당 한 해 최대 8회까지 교육비 없이 받을 수 있고, 멘토링은 멘토나 멘티의 농장에서 회차당 2시간 이상 진행돼요. 신청은 매년 1~11월 그린대로에서 받지만, 예산이 소진되면 일찍 마감될 수 있어요.',
  organization = '농림수산식품교육문화정보원 귀농귀촌종합센터',
  support_amount = '1:1 현장 멘토링 연 최대 8회 (교육비 무료)',
  eligibility_age_max = 99,
  eligibility_detail = '귀농귀촌을 희망하는 도시민, 농촌 거주 만 6년 미만(전입일 기준) 귀농귀촌인 또는 영농정착지원사업 선정자. 멘토(귀농닥터)의 가족(배우자·직계존속·형제자매)은 제외. 그린대로(greendaero.go.kr)에서 신청.',
  application_start = '9999-12-31'::date,
  application_end = '9999-12-31'::date,
  application_cycle = '매년 1~11월 그린대로 접수 (예산 소진 시 조기 마감)',
  status = '모집예정',
  source_url = 'https://www.greendaero.go.kr/svc/rfph/edc/doctor/front/index.do',
  link_status = 'active',
  updated_at = now()
WHERE slug = 'SP-011'
  AND title IS NOT DISTINCT FROM '귀농닥터 멘토링 (선도농가 현장실습 교육 지원)'
  AND summary IS NOT DISTINCT FROM '귀농귀촌 희망자에게 무료 1:1 현장 컨설팅과 선도농가 기술 전수를 제공하는 상시 프로그램.'
  AND description IS NOT DISTINCT FROM '귀농귀촌 희망자 또는 농촌 거주 1년 미만인 분이 무료로 1:1 현장 컨설팅을 받을 수 있는 상시 프로그램입니다. 각 지역 농업기술센터나 그린대로 플랫폼을 통해 수시로 신청하며, 경험 많은 선도농가가 직접 기술을 전수합니다. 별도의 모집기간 없이 연중 이용 가능하여 귀농 초기 시행착오를 줄이는 데 효과적입니다.'
  AND organization IS NOT DISTINCT FROM '농촌진흥청 / 각 시군 농업기술센터'
  AND support_amount IS NOT DISTINCT FROM '무료 1:1 현장 컨설팅 + 선도농가 기술 전수'
  AND eligibility_age_max IS NOT DISTINCT FROM 65
  AND eligibility_detail IS NOT DISTINCT FROM '귀농귀촌 희망자 및 농촌 거주 1년 미만. 각 지역 농업기술센터 또는 그린대로에서 신청.'
  AND application_start IS NOT DISTINCT FROM '2026-01-01'::date
  AND application_end IS NOT DISTINCT FROM '2026-12-31'::date
  AND application_cycle IS NOT DISTINCT FROM NULL
  AND status IS NOT DISTINCT FROM '모집중'
  AND source_url IS NOT DISTINCT FROM 'https://www.rda.go.kr/young/content/content76.do'
  AND link_status IS NOT DISTINCT FROM 'unverified';

-- SP-022: application_cycle NULL → '공고 발표 예정'으로 보이던 것 (정적 동일). 사업 성격·주관 기관은 원문과 어긋나 판단 사항으로 별도 보고
UPDATE support_programs SET
  application_cycle = '시·도별 별도 공고',
  updated_at = now()
WHERE slug = 'SP-022'
  AND application_cycle IS NOT DISTINCT FROM NULL;

-- SP-024: 사용자 설명에 섞인 내부 메모('페르소나에 적합'·'경남 권역에 추가된 첫 케이스') 삭제. eligibility_detail 은 DB 값('귀농 희망 도시민')이 원문(GNN 2026-05-12 '귀농을 희망하는 도시민')과 맞아 그대로
UPDATE support_programs SET
  description = '경상남도 고성군농업기술센터가 운영하는 귀농인의 집 3개소(7월 입주 2개소·8월 입주 1개소)에 입주자를 모집해요. 신청은 5월 22일까지 받고, 입주 기간은 6개월부터 최대 1년까지 거주하며 지역을 직접 탐색하고 정착을 준비할 수 있어요. 임시 주거지에 살면서 본격적으로 귀농하기 전에 지역·작물·이웃을 미리 살펴볼 수 있어요.',
  updated_at = now()
WHERE slug = 'SP-024'
  AND description IS NOT DISTINCT FROM '경상남도 고성군농업기술센터가 운영하는 귀농인의 집 3개소(7월 입주 2개소·8월 입주 1개소)에 입주자를 모집해요. 신청은 5월 22일까지 받고, 입주 기간은 6개월부터 최대 1년까지 거주하며 지역을 직접 탐색하고 정착을 준비할 수 있어요. 가족 단위 정착 또는 노년 귀촌 페르소나에 적합한 체류형 사업이에요. 임시 주거지를 제공받아 본격 귀농 전 지역·작물·이웃을 충분히 파악할 수 있어 시행착오를 줄여줘요. 경남 권역에 추가된 첫 케이스로, 그동안 부족했던 경남 정보 보강에 큰 도움이 돼요.';

-- SP-026: 접수 기간 5/5~5/25 → 2/5~2/25 (제주농업기술센터 '2026년 신규농업인 현장실습교육 추진 계획' 첨부 PDF '신청기간: 2026. 2. 5.(목) 09:00 ~ 2. 25.(수) 18:00', 원문 기사 등록 2026-02-05). 내부 메모('제주 권역에 추가된 첫 케이스…페르소나') 삭제, '만원' 표기. status 는 어느 쪽이든 '마감'이라 그대로
UPDATE support_programs SET
  summary = '제주농업기술센터가 신규농업인 3명·선도농가 3명을 매칭해 1:1 현장실습. 연수생 월 최대 80만 원·선도농가 월 최대 40만 원 지원. 2월 25일까지 신청.',
  description = '제주특별자치도 농업기술원이 신규·청년농업인의 안정적인 영농 정착을 위해 운영하는 현장실습 매칭 사업이에요. 영농 경험이 부족한 신규농업인 3명과 선도농가 3명을 1:1로 연결해 재배기술·품질관리·경영·창업 단계까지 실습 중심으로 교육해요. 연수생에게 월 최대 80만 원, 선도농가에게 월 최대 40만 원의 교육비가 지원돼요. 신청은 2월 5일 오전 9시부터 25일 오후 6시까지 제주농업기술센터(제주시 애월읍 상귀리 173, 2층) 방문 접수로 받아요. 서류심사와 현지심사를 거쳐 최종 선정해요.',
  support_amount = '연수생 월 최대 80만 원 + 선도농가 월 최대 40만 원 (1:1 매칭 현장실습)',
  eligibility_detail = '신규농업인 3명·선도농가 3명. 신청 2월 5일~25일 (방문 접수). 제주농업기술센터(제주시 애월읍 상귀리 173, 2층).',
  application_start = '2026-02-05'::date,
  application_end = '2026-02-25'::date,
  updated_at = now()
WHERE slug = 'SP-026'
  AND summary IS NOT DISTINCT FROM '제주농업기술센터가 신규농업인 3명·선도농가 3명을 매칭해 1:1 현장실습. 연수생 월 80만원·선도농가 월 40만원 지원. 5월 25일까지 신청.'
  AND description IS NOT DISTINCT FROM '제주특별자치도 농업기술원이 신규·청년농업인의 안정적인 영농 정착을 위해 운영하는 현장실습 매칭 사업이에요. 영농 경험이 부족한 신규농업인 3명과 선도농가 3명을 1:1로 연결해 재배기술·품질관리·경영·창업 단계까지 실습 중심으로 교육해요. 연수생에게 월 최대 80만원, 선도농가에게 월 최대 40만원의 교육비가 지원돼요. 신청은 5월 5일 오전 9시부터 25일 오후 6시까지 제주농업기술센터(제주시 애월읍 상귀리 173, 2층) 방문 접수로 받아요. 제주 권역에 추가된 첫 케이스로, 청년·균형형 페르소나 양쪽에 적합해요. 서류심사와 현지심사를 거쳐 최종 선정해요.'
  AND support_amount IS NOT DISTINCT FROM '연수생 월 최대 80만원 + 선도농가 월 최대 40만원 (1:1 매칭 현장실습)'
  AND eligibility_detail IS NOT DISTINCT FROM '신규농업인 3명·선도농가 3명. 신청 5월 5일~25일 (방문 접수). 제주농업기술센터(제주시 애월읍 상귀리 173, 2층).'
  AND application_start IS NOT DISTINCT FROM '2026-05-05'::date
  AND application_end IS NOT DISTINCT FROM '2026-05-25'::date;

-- ED-001: '~합니다' 문체 + 일정·모집 방식(원문 '1기/40명'·'선착순'·'6시간/1일') 정적 동일. 마감 2026-04-17 → 원문 모집기간 '~ 2026-04-16 15:00'
UPDATE education_courses SET
  schedule = '1기 3.23~27 / 2기 4.6~10 / 3기 4.20~24 (각 5일, 6시간/일)',
  description = '전원생활 준비 및 성공사례, 채소·과수·화훼 기초영농기술, 농기계 안전사용법을 배우는 서울시 공식 귀촌 준비 교육 과정이에요. 기별 40명 선착순 모집.',
  application_end = '2026-04-16'::date,
  updated_at = now()
WHERE slug = 'ED-001'
  AND schedule IS NOT DISTINCT FROM '1기 3.23~27 / 2기 4.6~10 / 3기 4.20~24'
  AND description IS NOT DISTINCT FROM '전원생활 준비 및 성공사례, 채소·과수·화훼 기초영농기술, 농기계 안전사용법을 배우는 서울시 공식 귀촌 준비 교육 과정입니다.'
  AND application_end IS NOT DISTINCT FROM '2026-04-17'::date;

-- ED-002: '~합니다' 문체(정적 동일, '온실 구축 및 운영 기초가이드' 원문 확인). 일정 요일 (월)~(수) → 원문 4.21(화)·4.23(목)
UPDATE education_courses SET
  schedule = '2026.4.21(화) ~ 4.23(목)',
  description = '식물공장과 아쿠아포닉스, 디지털농업 동향 및 사례, 강남농협 현장견학, 스마트팜 원예작물 재배생리, 온실 구축 및 운영 기초가이드를 배우는 실용 교육이에요.',
  updated_at = now()
WHERE slug = 'ED-002'
  AND schedule IS NOT DISTINCT FROM '2026.4.21(월) ~ 4.23(수)'
  AND description IS NOT DISTINCT FROM '식물공장과 아쿠아포닉스, 디지털농업 동향 및 사례, 강남농협 현장견학, 스마트팜 원예작물 재배생리를 배우는 실용 교육입니다.';

-- ED-008: '~합니다' 문체. 정적의 '현재 5세대 추가 모집 중'은 원문(퍼블릭뉴스통신 2026-03-04) 시점 사실이라 날짜를 박은 과거형으로
UPDATE education_courses SET
  target = '농촌 정착 희망자 (영주 지역 체류 가능자)',
  description = '영주 소백산 인근 귀농드림타운에서 체류하며 농업을 학습하고 현장실습을 병행하는 체류형 교육 프로그램이에요. 2026년 3월 제11기 입교식 때 정원 30세대 중 25세대가 입교했고, 남은 5세대는 정원이 찰 때까지 수시로 신청을 받았어요.',
  updated_at = now()
WHERE slug = 'ED-008'
  AND target IS NOT DISTINCT FROM '귀농 희망자 (영주 지역 체류 가능자)'
  AND description IS NOT DISTINCT FROM '영주 소백산 인근 귀농드림타운에서 체류하며 농업을 학습하고 현장실습을 병행하는 체류형 교육 프로그램입니다.';

-- evt-001: '~합니다' 문체(정적 동일). 정적의 '박람회이에요'는 받침 없는 말 뒤 '예요'로 교정
UPDATE farm_events SET
  description = '기업·기관 전시부스, 일반인 참관등록, 비즈니스 매칭, 특별 체험(그림대회, 생막걸리 만들기) 등이 진행되는 귀농귀촌·지역살리기 전문 박람회예요.',
  updated_at = now()
WHERE slug = 'evt-001'
  AND description IS NOT DISTINCT FROM '기업·기관 전시부스, 일반인 참관등록, 비즈니스 매칭, 특별 체험 등이 진행되는 귀농귀촌·지역살리기 전문 박람회입니다.';

-- evt-002: '~합니다' 문체 + 대상(정적 동일). '박람회이에요' → '박람회예요'
UPDATE farm_events SET
  description = '120개사 400부스 규모의 스마트농업·귀농귀촌 박람회예요. 스마트팜 기술 전시, 심포지엄·세미나가 진행되며 경남국제축산박람회(GILEX)가 동시 개최돼요.',
  target = '스마트팜 도입 희망 농업인, 농촌 정착 예정자, 농업 기업',
  updated_at = now()
WHERE slug = 'evt-002'
  AND description IS NOT DISTINCT FROM '120개사 400부스 규모의 스마트농업·귀농귀촌 박람회입니다. 경남국제축산박람회(GILEX) 동시 개최.'
  AND target IS NOT DISTINCT FROM '스마트팜 도입 희망 농업인, 귀농 예정자';

-- evt-003: '~합니다' 문체(정적 동일, '무료입장 예약 바이어/참관객' 원문 메뉴 확인). '박람회이에요' → '박람회예요'
UPDATE farm_events SET
  description = 'AgTech 기획관, 도시농업관, 귀농귀촌 정보 등 농업·축산·귀농 분야 종합 박람회예요. 바이어 및 참관객 무료 입장으로 사전등록 후 참여할 수 있어요.',
  updated_at = now()
WHERE slug = 'evt-003'
  AND description IS NOT DISTINCT FROM 'AgTech 기획관, 도시농업관, 귀농귀촌 정보 등 농업·축산·귀농 분야 종합 박람회입니다.';

-- ── 검증 (모두 기대값이면 동기화 완료) ─────────────────────────────
-- 1) 문체·표기·내부 메모 잔존 0 — 큐레이션 행(crawl-* 제외) 사용자 노출 텍스트
SELECT 'support_programs' AS t, slug FROM support_programs
WHERE slug NOT LIKE 'crawl-%'
  AND slug <> 'SP-025' -- 판단 사항(연도) 파일 대기
  AND (concat_ws(' ', title, summary, description, support_amount, eligibility_detail) ~ '(합니다|입니다|[0-9]만원|페르소나|케이스로)')
UNION ALL
SELECT 'education_courses', slug FROM education_courses
WHERE slug NOT LIKE 'crawl-%'
  AND slug <> 'ED-006' -- 판단 사항(기관 정체성) 파일 대기
  AND (concat_ws(' ', title, schedule, target, cost, description) ~ '(합니다|입니다|[0-9]만원)')
UNION ALL
SELECT 'farm_events', slug FROM farm_events
WHERE slug NOT LIKE 'crawl-%'
  AND (concat_ws(' ', title, target, cost, description) ~ '(합니다|입니다|[0-9]만원|박람회이에요)');
-- 기대: 0행

-- 2) 정정 값 확인
SELECT slug, application_start, application_end, application_cycle, status, source_url
FROM support_programs WHERE slug IN ('SP-011', 'SP-022', 'SP-026') ORDER BY slug;
-- 기대: SP-011 9999-12-31·9999-12-31·'매년 1~11월 그린대로 접수 (예산 소진 시 조기 마감)'·모집예정·greendaero 귀농닥터
--       SP-022 cycle '시·도별 별도 공고' / SP-026 2026-02-05·2026-02-25·마감
SELECT slug, related_crops FROM support_programs WHERE slug = 'SP-003';
-- 기대: {딸기,토마토,방울토마토,파프리카}
SELECT slug, schedule, application_end FROM education_courses WHERE slug IN ('ED-001', 'ED-002') ORDER BY slug;
-- 기대: ED-001 마감 2026-04-16 / ED-002 '2026.4.21(화) ~ 4.23(목)'

COMMIT;
