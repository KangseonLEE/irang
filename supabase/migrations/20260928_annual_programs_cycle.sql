-- support_programs — 연례 창구형 국비 4건을 9999 페어 + application_cycle 로 전환 (2026-09-28)
--
-- 배경 (회장 결재): SP-001(귀농 농업창업·주택구입)·SP-002(청년농업인 영농정착)·SP-023(후계농업경영인 선발)은
--   매년 돌아가는 농식품부 국비 사업인데, 한 시·군/한 해의 접수창을 확정 날짜로 박아 두어 창이 지나면
--   deriveStatus 가 '마감'을 내고 /programs 기본 필터·통합검색(마감 제외)에서 사라졌다.
--   9/28 실측: 3건 전부 DB status '마감' (SP-001 2026-01-12~02-13 = 군산시 한 해 창, SP-002 2025-11-05~12-11,
--   SP-023 2026-01-12~02-11 — 원문은 1/5~2/11 이라 start 값 자체도 어긋나 있었다).
--   9/27 규칙대로 application_start·end = '9999-12-31' 페어 + 접수 시기 문구(application_cycle) →
--   programStatusLabel 이 '정기 접수'(src/lib/program-status.ts SSOT).
--   SP-013(우수후계농)은 DB 에 없어 정적 값이 그대로 서빙된다 — 이 파일 대상 아님.
--
-- 원문 대조 (2026-09-28 curl, 본문 키워드 확인):
--   SP-001 https://www.gunsan.go.kr/farm/m2435/view/8495763
--          "신청 기간 : 2026. 1. 12.(월) ~ 2026. 2. 13.(금)" / "교육실적 : 영농 관련 교육을 8시간 이상 이수한 자
--          ※ 다만, 100시간 미만인 경우 평가항목에서 최저 등급(D등급) 부여"
--          → description·eligibility_detail 의 "교육 100시간 이상 이수가 필요" 를 8/29 gov-roadmap 정정과 동일한
--            표현(8시간 자격 + 100시간 미만 D등급)으로 교정. 같은 오표기가 DB 에만 남아 있었다.
--   SP-002 https://agro.seoul.go.kr/archives/54938
--          "신청기간 : 2025년 11월 5일(수) ~ 2025년 12월 11일(목)" / "접수처 : 농림사업정보시스템(Agrix)
--          온라인 신청(uni.agrix.go.kr)" / "오프라인 접수는 불가함"
--          → 근거 없는 "연간 약 2,000명 선발"(8/29 청년창업농 '5,000명' 삭제와 같은 유형 — 2026년부터 지자체별
--            자체 수립) 삭제, 접수 창구(Agrix 온라인 전용) 명시.
--   SP-023 https://agro.seoul.go.kr/archives/55168
--          "기간 : ~ 2026년 2월 11일(수)" · 포스터 "2026. 1. 5.(월) ~ 2026. 2. 11.(수)" /
--          "접수처 : 차세대농림사업정보시스템(농업e지) 온라인 신청(nongupez.go.kr)" / "오프라인 접수는 불가함"
--          → 잘못된 도메인 "농업e지(www.agriedu.net)"(= 농업교육포털) 을 nongupez.go.kr 로, "시·군 농업기술센터에서
--            접수" 를 온라인 전용 + 심사는 주소지 시·군으로 교정.
--
-- 원칙: application_start·end·cycle·status + 사실 정정이 들린 description·eligibility_detail 만 UPDATE.
--   값은 정적 SSOT(src/lib/data/programs.ts)에서 스크립트로 추출한 byte-exact 문자열이다.
--   summary·organization·related_crops 등 다른 필드는 건드리지 않는다.
--
-- ⚠️ 코드 선행 필요: ProgramRow(src/lib/supabase.ts)와 loadPrograms()·getProgramByIdAsync()
--   (src/lib/data/programs.ts) 매핑에 application_cycle 이 아직 없다. 이 파일만 apply 하면 DB 우선 병합 3건은
--   9999 페어까지만 반영되어 라벨이 '정기 접수' 대신 '공고 발표 예정'으로 보인다(목록·검색 노출 자체는 복구됨).
--   → 매핑 3줄(타입 1 + 매핑 2)과 함께 배포할 것. 컬럼 추가는 재실행 안전(IF NOT EXISTS)이라 선 apply 도 무해.
--
-- 적용: 회장 결재 후 Supabase Dashboard SQL Editor 에서 이 파일 전체 실행.
-- 적용 후 라이브 검증:
--   curl -s "https://irangfarm.com/programs" | grep -c "정기 접수"            # 배지 노출(코드 매핑 배포 후)
--   curl -s "https://irangfarm.com/programs/SP-001" | grep -o "매년 초 시·군 접수"
--   curl -s "https://irangfarm.com/search?q=%EA%B7%80%EB%86%8D%20%EB%86%8D%EC%97%85%EC%B0%BD%EC%97%85" | grep -c "SP-001"
-- 생성: scratchpad 일회성 스크립트(PROGRAMS 값 추출) — 잔존 파일 없음.
--
-- mode-check-ok: 10/2 dev QA 사후 검토 (check-migration-not-null 이 9/29부터 main CI 를 막고 있었음).
--   application_cycle 은 nullable 표시용 문구 컬럼 — 기존 행은 NULL, 값은 아래 UPDATE 3건(SP-001·002·023)만
--   채운다. INSERT 경로(sync-crawl 의 support_programs 행 조립, supabase/functions/sync-crawl/index.ts §4)는
--   이 컬럼을 쓰지 않고 기존 NOT NULL 컬럼(slug·title·summary·region·organization·support_type·support_amount·
--   application_start·application_end)을 전부 채운다. 신규 INSERT 모드 없음 → 5/26-style silent fail 위험 없음.

BEGIN;

-- 연례 창구형 접수 시기 문구 컬럼 (9/27 규칙, 정적 SupportProgram.applicationCycle 대응)
ALTER TABLE support_programs
  ADD COLUMN IF NOT EXISTS application_cycle text;

COMMENT ON COLUMN support_programs.application_cycle IS
  '연례 창구형 사업의 접수 시기 문구. application_start·end 가 9999-12-31 페어일 때 "공고 발표 예정" 대신 표시 (2026-09-27).';

-- status '모집예정' 고정: auto_update_program_status() 는 application_end < KST today 일 때만 '마감'으로,
-- application_start <= KST today 일 때만 '모집중'으로 바꾸므로 9999 페어는 두 조건 모두 미충족 = 그대로 유지된다.
UPDATE support_programs
SET application_start  = '9999-12-31',
    application_end    = '9999-12-31',
    application_cycle  = '매년 초 시·군 접수 (상·하반기 두 번 받는 곳도 있어요)',
    status             = '모집예정',
    description        = '농업창업자금 최대 3억원, 주택구입자금 최대 7,500만 원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주여야 하고, 영농 관련 교육은 8시간 이상이 자격 요건이지만 100시간 미만이면 심사에서 최저 등급(D)을 받아 사실상 100시간 이상이 필요해요. 신청은 시군의 귀농귀촌 담당 부서(농업기술센터나 시청 부서)에서 받고, 접수 시기는 시군마다 달라 상·하반기 두 번 받는 곳도 있어요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요. 사과 같은 과수도 과원 조성·묘목 구입·관수시설·저온저장고까지 창업자금 용도로 인정돼요. 다만 2026년 선정부터 묘목·농기계·농업용 화물차 구입비는 합산 5천만 원까지예요.',
    eligibility_detail = '농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 8시간 이상 이수(100시간 미만은 심사 최저 등급 D). 접수 기간은 시군별로 달라요(예: 군산 1/12~2/13, 서귀포 상반기 1/14~2/11·하반기 6/12~7/3) — 우리 시군 일정은 담당 부서에 확인하세요.'
WHERE slug = 'SP-001';

UPDATE support_programs
SET application_start  = '9999-12-31',
    application_end    = '9999-12-31',
    application_cycle  = '다음 해 대상자 1차 선발 — 전년 11~12월 Agrix 접수',
    status             = '모집예정',
    description        = '독립경영 1년차 월 110만 원부터 3년차 월 90만 원까지 최대 3년간 정착지원금을 받을 수 있어요. 만 18~39세 청년으로 영농경력 3년 이하이며 해당 지자체에 실거주해야 해요. 다음 해 대상자를 전년 11~12월에 1차 선발하고(2026년 대상자는 2025년 11월 5일~12월 11일 접수), 신청은 농림사업정보시스템(Agrix, uni.agrix.go.kr) 온라인으로만 받아요. 청년 정착자의 초기 생활 안정에 실질적으로 도움이 되는 핵심 사업이에요.',
    eligibility_detail = '만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록(사업장·거주지 동일 시·군). 신청은 Agrix(uni.agrix.go.kr) 온라인 전용 — 오프라인 접수 불가.'
WHERE slug = 'SP-002';

UPDATE support_programs
SET application_start  = '9999-12-31',
    application_end    = '9999-12-31',
    application_cycle  = '1~2월 농업e지 온라인 접수 (2026년은 1/5~2/11)',
    status             = '모집예정',
    description        = '농림축산식품부의 후계농업경영인 사업은 만 18세 이상 49세 이하, 영농 종사 경력 10년 미만의 후계농을 대상으로 농지·시설 등 영농기반 마련 자금을 세대당 최대 5억원, 연 1.5% 저금리로 융자해 주는 핵심 양성사업이에요. 5년 거치 20년 분할 상환 조건으로 초기 자본 부담이 매우 낮아요. 차세대농림사업정보시스템(농업e지, nongupez.go.kr)으로만 신청할 수 있고 오프라인 접수는 안 되며, 심사는 주소지 시·군에서 진행해요. 우수후계농(SP-013) 대상이 되기 전 단계의 일반 후계농 선발 사업으로, 가족 정착·청년 본업 농가의 핵심 진입로예요. 2026년 선발은 1월 5일부터 2월 11일까지 접수했고, 다음 회차 일정은 시·군 공고를 확인하면 돼요.',
    eligibility_detail = '만 18세 이상 49세 이하, 영농 종사 경력 10년 미만. 농업e지(nongupez.go.kr) 온라인 전용 신청 — 오프라인 접수 불가. 2026년 접수는 1/5~2/11, 다음 회차는 시·군 공고 확인.'
WHERE slug = 'SP-023';

-- 검증: 3건 모두 9999 페어 + 접수 시기 문구 존재 + status '모집예정' + 오표기 잔존 0
SELECT slug,
       application_start,
       application_end,
       application_cycle,
       status,
       position('agriedu.net' in description) = 0 AS no_stale_agriedu,
       position('100시간 이상 이수가 필요' in description) = 0 AS no_stale_100h,
       position('2,000명' in description) = 0 AS no_unverified_quota
FROM support_programs
WHERE slug IN ('SP-001', 'SP-002', 'SP-023')
ORDER BY slug;

-- 마감 잔존 점검: 4건 중 DB 상주 3건이 '마감'에서 빠져나왔는지
SELECT count(*) AS still_closed
FROM support_programs
WHERE slug IN ('SP-001', 'SP-002', 'SP-023') AND status = '마감';
-- 기대: still_closed = 0

COMMIT;
