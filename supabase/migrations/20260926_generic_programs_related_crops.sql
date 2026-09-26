-- support_programs — 작물 범용 사업 related_crops 동기화 + SP-001 과수 용도 문구 (2026-09-26)
--
-- 배경: 9/25 사용자 요청 "[지원사업 요청] 사과" — /programs?q=사과 0건, /crops/apple 추천 지원사업 0건.
--   정적·DB 어디에도 사과·과수 사업이 없었고, 창업자금·농지은행·청년농·후계농·귀농닥터처럼
--   특정 작물을 가리지 않는 사업도 related_crops 가 비어 있어 작물명 검색·작물 상세 추천에서 전부 빠졌다.
--   정적 정의(src/lib/data/programs.ts)는 ALL_CROP_NAMES(CROPS 55종)로 갱신했으나,
--   loadPrograms()는 DB 우선 병합이라 DB 에 상주하는 SP-001·002·011·023 은 이 파일로 동기화해야 라이브에 반영된다.
--   (SP-018·SP-020·신규 SP-050~053 은 DB 에 없어 정적 값이 그대로 서빙됨)
--   SP-001 description 은 과수(과원 조성·묘목 구입) 용도와 2026년 5천만 원 합산 한도를 시행지침 기준으로 보강 — byte-exact.
--
-- 원칙: related_crops(4건)·description(SP-001 1건)만 UPDATE. 다른 필드는 건드리지 않는다.
-- 적용: 회장 결재 후 Supabase Dashboard SQL Editor 수동 apply. 적용 후 라이브 검증:
--   curl -s "https://irangfarm.com/programs?q=%EC%82%AC%EA%B3%BC" 검색 결과 ≥ 5 (SP-011·018·020·050·051 예상).
-- 생성: scripts/_diag/_gen-generic-crops-sql.ts (PROGRAMS 값 byte-exact)

BEGIN;

UPDATE support_programs
SET related_crops = ARRAY['쌀','콩','고구마','감자','옥수수','고추','배추','마늘','양파','상추','사과','배','포도','감귤','딸기','인삼','참깨','루꼴라','망고','무','토마토','오이','호박','대파','시금치','깻잎','수박','복숭아','자두','감','블루베리','체리','참외','샤인머스캣','표고버섯','느타리버섯','생강','들깨','도라지','방울토마토','가지','아스파라거스','브로콜리','파프리카','당근','새송이버섯','매실','더덕','메밀','오미자','밤','호두','장미','국화','백합']::text[]
WHERE slug IN ('SP-001', 'SP-002', 'SP-011', 'SP-023');

UPDATE support_programs
SET description = '농업창업자금 최대 3억원, 주택구입자금 최대 7,500만 원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주로서 영농교육 100시간 이상 이수가 필요해요. 신청은 시군의 귀농귀촌 담당 부서(농업기술센터나 시청 부서)에서 받고, 접수 시기는 시군마다 달라 상·하반기 두 번 받는 곳도 있어요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요. 사과 같은 과수도 과원 조성·묘목 구입·관수시설·저온저장고까지 창업자금 용도로 인정돼요. 다만 2026년 선정부터 묘목·농기계·농업용 화물차 구입비는 합산 5천만 원까지예요.'
WHERE slug = 'SP-001';

-- 검증: 4건 각 55종, SP-001 description 에 '과원 조성' 포함
SELECT slug, array_length(related_crops, 1) AS crops, position('과원 조성' in description) > 0 AS has_orchard
FROM support_programs
WHERE slug IN ('SP-001', 'SP-002', 'SP-011', 'SP-023')
ORDER BY slug;

COMMIT;
