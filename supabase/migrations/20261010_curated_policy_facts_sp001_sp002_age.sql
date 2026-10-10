-- 2026-10-10 데이터 신뢰도 정정(트랙 C) — 회장 Supabase SQL Editor 적용용. 적용 뒤 Vercel 최신 Production 배포 Redeploy(상세는 빌드 때 HTML 이 굳는다).
-- 원문 대조: 보조금24 154300000011(귀농 창업·주택 2.0%·상/하반기 원칙·시·군 방문 접수, 최종수정 2026.08.14),
--            서울특별시농업기술센터 공고 제2025-63호(청년 영농정착 2026년 대상 1차 2025.11.5~12.11 Agrix),
--            RDA 똑똑청년농부 sId=46862(2026년 2차 6.1~7.10 '온라인 접수(농업e지) * 방문접수 아님'),
--            연천(post24 319532)·제주(koreatimenews 1064324) 기사 — 연령 상한 없음(귀농인·신규농·만 40세 미만 중 하나).
-- 바꾸는 것: SP-001·002 문장을 policy-facts.ts 단일 출처 문장으로(값 동일, 금리·상환 표기 보강, 청년 신청 경로 Agrix → 농업e지),
--            SP-008·026 연령 상한 65 → 99(원문 근거 없는 65 상한 해제).
-- 스냅샷 가드(바꾸는 칸의 지금 값 IS NOT DISTINCT FROM) — 그 사이 바뀐 행은 건너뛴다. 정적 값(src/lib/data/programs.ts)과 같은 문자열.

BEGIN;

-- SP-001: description, support_amount
UPDATE support_programs SET
  description = '농업창업자금 최대 3억 원, 주택구입자금 최대 7,500만 원을 연 2.0% 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주여야 하고, 영농 관련 교육은 8시간 이상이 자격 요건이지만 100시간 미만이면 심사에서 최저 등급(D)을 받아 사실상 100시간 이상이 필요해요. 신청은 시·군 귀농귀촌 담당 부서(농업기술센터나 시청 부서)에서 상반기·하반기 두 번 받는 게 원칙이에요(상반기 1월 1일~2월 10일, 하반기 6월 1일~7월 10일). 실제 접수 기간은 시군마다 조금씩 달라요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요. 사과 같은 과수도 과원 조성·묘목 구입·관수시설·저온저장고까지 창업자금 용도로 인정돼요. 다만 2026년 선정부터 묘목·농기계·농업용 화물차 구입비는 합산 5천만 원까지예요.',
  support_amount = '농업창업 최대 3억 원 / 주택구입 최대 7,500만 원 (연 2.0%, 5년 거치 10년 상환)',
  updated_at = now()
WHERE slug = 'SP-001'
  AND description IS NOT DISTINCT FROM '농업창업자금 최대 3억원, 주택구입자금 최대 7,500만 원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주여야 하고, 영농 관련 교육은 8시간 이상이 자격 요건이지만 100시간 미만이면 심사에서 최저 등급(D)을 받아 사실상 100시간 이상이 필요해요. 신청은 시군의 귀농귀촌 담당 부서(농업기술센터나 시청 부서)에서 상반기·하반기 두 번 받는 게 원칙이에요(상반기 1월 1일~2월 10일, 하반기 6월 1일~7월 10일). 실제 접수 기간은 시군마다 조금씩 달라요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요. 사과 같은 과수도 과원 조성·묘목 구입·관수시설·저온저장고까지 창업자금 용도로 인정돼요. 다만 2026년 선정부터 묘목·농기계·농업용 화물차 구입비는 합산 5천만 원까지예요.'
  AND support_amount IS NOT DISTINCT FROM '농업창업 최대 3억원 / 주택구입 최대 7,500만 원 (5년 거치 10년 상환)';

-- SP-002: description, support_amount, eligibility_detail, application_cycle
UPDATE support_programs SET
  description = '독립경영 1년차 월 110만 원·2년차 100만 원·3년차 90만 원으로 최대 3년간 정착지원금을 받을 수 있어요. 만 18~39세 청년으로 영농경력 3년 이하이며 해당 지자체에 실거주해야 해요. 다음 해 대상자를 전년 11~12월에 1차 선발하고(2026년 대상자는 2025년 11월 5일~12월 11일에 당시 시스템 Agrix로 접수), 2026년 6~7월 2차부터는 농업e지(nongupez.go.kr) 온라인 전용으로 받아요. 청년 정착자의 초기 생활 안정에 실질적으로 도움이 되는 핵심 사업이에요.',
  support_amount = '독립경영 1년차 월 110만 원·2년차 100만 원·3년차 90만 원',
  eligibility_detail = '만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록(사업장·거주지 동일 시·군). 신청은 농업e지(nongupez.go.kr) 온라인 전용 — 방문 접수 불가.',
  application_cycle = '다음 해 대상자 1차 선발 — 전년 11~12월 온라인 접수',
  updated_at = now()
WHERE slug = 'SP-002'
  AND description IS NOT DISTINCT FROM '독립경영 1년차 월 110만 원부터 3년차 월 90만 원까지 최대 3년간 정착지원금을 받을 수 있어요. 만 18~39세 청년으로 영농경력 3년 이하이며 해당 지자체에 실거주해야 해요. 다음 해 대상자를 전년 11~12월에 1차 선발하고(2026년 대상자는 2025년 11월 5일~12월 11일 접수), 신청은 농림사업정보시스템(Agrix, uni.agrix.go.kr) 온라인으로만 받아요. 청년 정착자의 초기 생활 안정에 실질적으로 도움이 되는 핵심 사업이에요.'
  AND support_amount IS NOT DISTINCT FROM '독립경영 1년차 월 110만 원, 2년차 월 100만 원, 3년차 월 90만 원'
  AND eligibility_detail IS NOT DISTINCT FROM '만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록(사업장·거주지 동일 시·군). 신청은 Agrix(uni.agrix.go.kr) 온라인 전용 — 오프라인 접수 불가.'
  AND application_cycle IS NOT DISTINCT FROM '다음 해 대상자 1차 선발 — 전년 11~12월 Agrix 접수';

-- SP-008: eligibility_age_max
UPDATE support_programs SET
  eligibility_age_max = 99,
  updated_at = now()
WHERE slug = 'SP-008'
  AND eligibility_age_max IS NOT DISTINCT FROM 65;

-- SP-026: eligibility_age_max
UPDATE support_programs SET
  eligibility_age_max = 99,
  updated_at = now()
WHERE slug = 'SP-026'
  AND eligibility_age_max IS NOT DISTINCT FROM 65;

SELECT slug, eligibility_age_max, support_amount, application_cycle FROM support_programs WHERE slug IN ('SP-001', 'SP-002', 'SP-008', 'SP-026') ORDER BY slug;

COMMIT;
