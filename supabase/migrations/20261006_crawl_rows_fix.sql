-- 2026-10-06 수집(crawl) 행 정정 — ① agrix 지원사업 30행 원문 주소를 농업e지로 ② 행사로 잘못 들어간 그린대로 비대면 강의 1행 정리
--   ③ 그린대로 교육 목록 행의 '교육 대상'(target)에 들어간 교육 구분 값 비우기
--   (QA 1차 링크 전수 점검·판단 조사 후속, data-engineer)
--
-- 문제:
--   crawl-agrix-programs-* 30행의 원문 주소 https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=… 가 전부 무응답이다
--   (10/6 한국 회선 curl 25초×2·120초, Chromium 45초 모두 0바이트 / 같은 서버 목록 페이지는 0.15초 200).
--   agrix 포털의 "농식품사업 시행지침서" 메뉴가 농업e지(nongupez.go.kr)로 이관됐다. 30행 모두 접수 마감이라 목록엔 없지만
--   상세 페이지(예: /programs/crawl-agrix-programs-5964100f)는 색인 허용 상태로 살아 있고 "원문 공고 보러가기"가 죽은 주소다.
--
-- 값의 출처:
--   농업e지 전체사업(/nsm/bizAply/wholeBiz/wholeBizMain) → 사업상세 GET 딥링크 wholeBizDtls?afbzCd=…&bizYr=2025.
--   우리 행은 2025년 사업(year 2025)이라 bizYr=2025. 매핑은 QA 링크 점검(사업명 검색 + 신청기간 대조)이 만들고,
--   data-engineer 가 2026-10-06 Chromium 렌더로 28건 전부 재확인했다: HTTP 200 · 제목 '사업상세' · 본문에 사업명 · '사업년도 2025'.
--   (상세는 JS 렌더라 curl 본문엔 사업명이 없다 — 링크 검사 스크립트는 제목 '사업상세'만 본다)
--   대응 사업이 없는 2행(대규모 스마트팜 창업단지·농업자금이차보전)은 주소를 지어내지 않고 link_status = 'broken'
--   → 상세는 "원문 페이지가 현재 연결되지 않아요" + site: 검색 폴백, 목록(filterProgramsAsync)은 숨김.
--
-- 멱등·안전장치: WHERE slug + 옛 agrix 주소 일치(교체 28행) / + link_status 가 아직 broken 이 아닐 때(2행). 다시 실행하면 0행.
--
-- ⚠ 순서: **sync-crawl 재배포(같은 날 코드: agrix 타깃 중단 + 그린대로 비대면 분류) 다음에 apply.**
--   ① 옛 함수로 refresh=true 실행이 돌면 mapAgrixItem 이 이 주소들을 옛 lawFullView 주소로 되돌린다(평소 실행은 is_verified 행을 건너뛰어 무해).
--   ② 옛 함수가 돌면 지운 비대면 강의를 다시 행사로 적재한다(접수 마감 10/30 전까지).
-- ⚠ apply 는 회장 결재 후 수동 (Supabase Dashboard SQL Editor).
--
-- ② 그린대로 비대면 강의 1행 (farm_events crawl-greendaero-education-2ca872c9):
--   "유형특화과정-예비귀촌인 · [비대면] 10/31 … 농촌융복합 6차산업과 농촌체험관광"(팜러닝, 원천 eduOperSeNm '비대면교육')이
--   체험 키워드 '농촌체험'에 걸려 행사·'일일체험'·'서울특별시 서초구'(교육기관 본사)로 들어가 /events 에 노출됐다.
--   수집기는 고쳤지만(순수 비대면은 체험형 제외 — supabase/functions/_shared/greendaero.ts) 이미 적재된 행은 지우지 않는다.
--   재배포 후 첫 수집에서 같은 slug 가 education_courses(온라인·전국)로 들어온다(접수 마감 10/30 전이면).
--
-- ③ 그린대로 교육 목록(getEdcList) 행의 target:
--   수집기가 교육 구분(eduSeNm)을 대상·자격 칸(capacity)에 넣고, 그 값이 target(상세의 "교육 대상")으로 저장됐다
--   → "교육 대상: 귀농귀촌아카데미" 같은 오표시. 목록 응답엔 대상 필드가 아예 없다(142개 키 전수). 수집기는 고쳤고
--   (capacity 비움 → '상세 공고 참조', 화면은 수집 행의 채움값을 숨김) 이미 적재된 행만 여기서 같은 값으로 맞춘다.
--   대상(2026-10-06 anon 실측): education_courses 147행(귀농귀촌아카데미 70·지자체 귀농귀촌교육 35·귀농귀촌 맞춤형교육 15·
--   농업일자리체험 14·농업일자리탐색(4h) 13) + 같은 목록에서 체험형으로 분기된 farm_events 10행(지자체 귀농귀촌교육 9·
--   귀농귀촌아카데미 1 — 1행은 ②에서 삭제되므로 실제 갱신 9행). 가드: 교육 구분 어휘(원천 6종)와 일치할 때만.
--   살아보기(crawl-greendaero-live-*) 22행의 target "농촌에서 살아보기 귀농형/귀촌형"은 유형 표시라 이 파일 범위 밖(판단 사항).
--
-- 이 파일이 하지 않는 것 (판단 사항으로 보고):
--   · 기관 예산성 3행 정리 — 농업인이 신청하는 사업이 아님: 153f68e9 '농업정책보험금융원 기관운영비 지원',
--     86b9d77c '농업기계 신고관리시스템 구축·운영', 3f6bb132 '농지관리기능강화구축사업'
--   · 접수일이 수집일 채움값(2026-09-30~2026-09-30)으로 남은 4행(14f949ef·3f6bb132·86b9d77c·887a5594) — 10/4 결정대로 그대로
--
-- 적용 후 확인 (읽기 전용):
--   SELECT count(*) FROM support_programs WHERE slug LIKE 'crawl-agrix-%' AND source_url LIKE 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do%';
--   -- 기대: 2 (broken 2행만 옛 주소 유지)
--   SELECT link_status, count(*) FROM support_programs WHERE slug LIKE 'crawl-agrix-%' GROUP BY 1;
--   -- 기대: active 28, broken 2
--   curl -s https://irangfarm.com/programs/crawl-agrix-programs-5964100f | grep -o 'afbzCd=AB000001&amp;bizYr=2025'

BEGIN;

-- ── 1. 농업e지 2025 사업상세로 교체 28행 (2026-10-06 Chromium 렌더 재확인: 200·제목 '사업상세'·사업명 본문·사업년도 2025) ──
-- crawl-agrix-programs-0775bf8b 농지은행교육지원사업 → afbzCd=AB000034 '농지은행교육지원' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000034&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-0775bf8b' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14992';
-- crawl-agrix-programs-10e70df9 농업 근로자 기숙사 건립지원 → afbzCd=AB000041 '농업 근로자 기숙사 건립지원' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000041&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-10e70df9' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14794';
-- crawl-agrix-programs-11118730 농기계임대 → afbzCd=AB000030 '농기계임대' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000030&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-11118730' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14914';
-- crawl-agrix-programs-12801621 경관보전직불 → afbzCd=AB000053 '경관보전직불' (농업e지 신청기간 2025.1.1~2025.4.30)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000053&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-12801621' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14980';
-- crawl-agrix-programs-14f949ef 노후 농업기계 미세먼지 저감대책 지원사업  → afbzCd=AB000572 '노후 농업기계 미세먼지 저감대책 지원사업' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000572&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-14f949ef' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14933';
-- crawl-agrix-programs-153f68e9 농업정책보험금융원 기관운영비 지원 → afbzCd=AB000023 '농업정책보험금융원기관운영비지원' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000023&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-153f68e9' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14986';
-- crawl-agrix-programs-1a802559 경영회생 농지매입 사업 → afbzCd=AB000040 '경영회생지원농지매입' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000040&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-1a802559' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14791';
-- crawl-agrix-programs-337828e2 토양개량제 지원사업 → afbzCd=AB000524 '토양개량제 지원' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000524&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-337828e2' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14790';
-- crawl-agrix-programs-3502ffd5 가축재해보험 보험료 지원 사업 → afbzCd=AB000012 '가축재해보험' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000012&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-3502ffd5' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14985';
-- crawl-agrix-programs-36556849 농작물재해보험 → afbzCd=AB000017 '농작물재해보험 보험료 지원' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000017&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-36556849' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14987';
-- crawl-agrix-programs-379a1fd9 수입안정보험 → afbzCd=AB000014 '농업수입안정보험' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000014&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-379a1fd9' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14988';
-- crawl-agrix-programs-388def8f 결혼이민여성 농업교육 → afbzCd=AB000146 '여성농업인 역량강화교육(결혼이민여성 농업교육)' (농업e지 신청기간 2025.3.1~2025.7.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000146&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-388def8f' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14978';
-- crawl-agrix-programs-3f6bb132 농지관리기능강화구축사업 → afbzCd=AB000033 '농지관리기능강화구축' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000033&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-3f6bb132' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14990';
-- crawl-agrix-programs-4ec8d7d2 농지이양은퇴직불 → afbzCd=AB000004 '농지이양 은퇴직불' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000004&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-4ec8d7d2' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14981';
-- crawl-agrix-programs-5964100f 기본형공익직불 → afbzCd=AB000001 '기본형공익직불' (농업e지 신청기간 2025.2.1~2025.4.30)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000001&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-5964100f' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14975';
-- crawl-agrix-programs-62e238ff 농기계 등화장치 부착지원 → afbzCd=AB000024 '농기계등화장치 부착지원' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000024&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-62e238ff' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14788';
-- crawl-agrix-programs-674c4fc4 농지연금(융자) → afbzCd=AB000025 '농지연금(융자)' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000025&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-674c4fc4' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14991';
-- crawl-agrix-programs-6dd6a915 FTA분야 교육･홍보 → afbzCd=AB000021 'FTA분야 교육·홍보 사업' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000021&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-6dd6a915' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14984';
-- crawl-agrix-programs-6fc642b6 전략작물직불 → afbzCd=AB000006 '전략작물직불' (농업e지 신청기간 2025.2.1~2025.5.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000006&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-6fc642b6' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14972';
-- crawl-agrix-programs-7a7e58e5 안전재해보험 → afbzCd=AB000015 '농업인안전재해보험(농업인안전보험)' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000015&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-7a7e58e5' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14785';
-- crawl-agrix-programs-86b9d77c 농업기계 신고관리시스템 구축·운영 → afbzCd=AB000031 '농업기계 신고관리시스템 구축' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000031&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-86b9d77c' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14989';
-- crawl-agrix-programs-887a5594 피해보전직불 → afbzCd=AB000011 '피해보전직불' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000011&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-887a5594' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14983';
-- crawl-agrix-programs-8ba626ca 농촌인력중개센터 → afbzCd=AB000043 '농촌인력중개센터(농촌형)' (농업e지 신청기간 2024.10.1~2024.11.30)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000043&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-8ba626ca' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14795';
-- crawl-agrix-programs-9362a492 친환경축산직접직불제 → afbzCd=AB000010 '친환경축산직불' (농업e지 신청기간 표기 없음)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000010&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-9362a492' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14982';
-- crawl-agrix-programs-b0b2c278 맞춤형농지지원사업 → afbzCd=AB000039 '맞춤형농지지원' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000039&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-b0b2c278' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14793';
-- crawl-agrix-programs-df9c14cd 친환경농업직불제 → afbzCd=AB000009 '친환경농업직불' (농업e지 신청기간 2025.3.1~2025.4.30)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000009&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-df9c14cd' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14974';
-- crawl-agrix-programs-f25ea425 훼손농지복구 → afbzCd=AB000593 '훼손농지복구' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000593&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-f25ea425' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14994';
-- crawl-agrix-programs-f376d4a7 농촌형교통모델(자율) → afbzCd=AB000057 '농촌형교통모델' (농업e지 신청기간 2025.1.1~2025.12.31)
UPDATE support_programs SET source_url = 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=AB000057&bizYr=2025', link_status = 'active', updated_at = now()
WHERE slug = 'crawl-agrix-programs-f376d4a7' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14798';

-- ── 2. 농업e지에 대응 사업이 없는 2행 → link_status 'broken' (상세: '원문 페이지가 현재 연결되지 않아요' + site: 검색 폴백, 목록: 숨김) ──
-- crawl-agrix-programs-763df745 대규모 스마트팜 창업단지 (농업e지 전체사업 2026·2025 검색 0건)
UPDATE support_programs SET link_status = 'broken', updated_at = now()
WHERE slug = 'crawl-agrix-programs-763df745' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14993' AND link_status IS DISTINCT FROM 'broken';
-- crawl-agrix-programs-7f4576f3 농업자금이차보전 (농업e지 전체사업 2026·2025 검색 0건)
UPDATE support_programs SET link_status = 'broken', updated_at = now()
WHERE slug = 'crawl-agrix-programs-7f4576f3' AND source_url = 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=14935' AND link_status IS DISTINCT FROM 'broken';

-- ── 3. 그린대로 비대면 강의가 행사로 들어간 1행 삭제 (재배포 후 수집기가 교육으로 다시 적재) ──
DELETE FROM farm_events
WHERE slug = 'crawl-greendaero-education-2ca872c9'
  AND type = '일일체험'
  AND title LIKE '%[비대면]%농촌체험관광%';

-- ── 4. 그린대로 교육 목록 행의 target 에 들어간 교육 구분(eduSeNm) 값 → '상세 공고 참조' (수집기 빈 값과 같은 채움값) ──
UPDATE education_courses SET target = '상세 공고 참조', updated_at = now()
WHERE slug LIKE 'crawl-greendaero-education-%'
  AND target IN ('귀농귀촌아카데미', '지자체 귀농귀촌교육', '귀농귀촌 맞춤형교육', '농업일자리체험', '농업일자리탐색(4h)', '청년귀농장기교육');

UPDATE farm_events SET target = '상세 공고 참조', updated_at = now()
WHERE slug LIKE 'crawl-greendaero-education-%'
  AND target IN ('귀농귀촌아카데미', '지자체 귀농귀촌교육', '귀농귀촌 맞춤형교육', '농업일자리체험', '농업일자리탐색(4h)', '청년귀농장기교육');

-- ── 검증 ──
SELECT link_status, count(*) AS n,
       count(*) FILTER (WHERE source_url LIKE 'https://www.nongupez.go.kr/nsm/bizAply/wholeBiz/wholeBizDtls?afbzCd=%&bizYr=2025') AS nongupez,
       count(*) FILTER (WHERE source_url LIKE 'https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do%') AS old_agrix
FROM support_programs WHERE slug LIKE 'crawl-agrix-%' GROUP BY link_status ORDER BY link_status;
-- 기대: active 28 (nongupez 28, old_agrix 0) / broken 2 (nongupez 0, old_agrix 2)
SELECT count(*) AS online_course_in_events FROM farm_events
WHERE slug LIKE 'crawl-greendaero-education-%' AND title LIKE '%[비대면]%';
-- 기대: 0
SELECT 'education_courses' AS t, count(*) AS edu_type_in_target FROM education_courses
WHERE slug LIKE 'crawl-greendaero-education-%'
  AND target IN ('귀농귀촌아카데미', '지자체 귀농귀촌교육', '귀농귀촌 맞춤형교육', '농업일자리체험', '농업일자리탐색(4h)', '청년귀농장기교육')
UNION ALL
SELECT 'farm_events', count(*) FROM farm_events
WHERE slug LIKE 'crawl-greendaero-education-%'
  AND target IN ('귀농귀촌아카데미', '지자체 귀농귀촌교육', '귀농귀촌 맞춤형교육', '농업일자리체험', '농업일자리탐색(4h)', '청년귀농장기교육');
-- 기대: 0 / 0

COMMIT;
