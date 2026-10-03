-- 2026-09-29 지역명 SSOT 정규화 (C안 ①)
--
-- 문제:
--   `supabase/functions/_shared/mapping.ts` 의 `mapAreaName` 이
--   "도"·"시"가 들어 있으면 원문을 그대로 통과시켜, 크롤러가 넘긴
--   "경기 양평"·"전남 해남"·"강원특별자치도" 류가 그대로 적재됐다.
--   `/programs` 지역 필터는 `program.region !== filters.region` 정확 일치라
--   PROVINCES.name(구표기) SSOT 밖 값은 어떤 시·도를 골라도 목록에서 사라진다.
--
-- 영향 (2026-09-29 실측):
--   support_programs   distinct 48종 중 40종 / 55행  (전체 102행)
--   education_courses  distinct 53종 중 48종 / 87행  (전체  96행)
--   farm_events        distinct  3종 중  0종 /  0행  (이미 정상)
--   합계 142행 UPDATE
--
-- 조치:
--   1) `sigungu` 컬럼 신설 — region 을 시·도로 정규화하면서 잘려 나가는
--      시·군 정보를 보존한다 ("전북 진안" → region 전라북도 / sigungu 진안).
--   2) 아래 UPDATE 문으로 기존 행 정정. 값은 `src/lib/region-normalize.ts`
--      `normalizeRegion()` 실행 결과를 그대로 옮긴 것이며,
--      `scripts/_diag/_c-gen-region-migration.ts` 가 생성했다.
--
-- 재발 차단:
--   · 수집 경로(Edge Function)는 `_shared/region.ts` 를 통과하도록 교체됨
--   · `src/__tests__/region-normalize.test.ts` 가 DB 실측 78종 전수 + Deno 미러 패리티 검증
--
-- ⚠ apply 는 회장 수동 (Supabase Dashboard SQL Editor).
--
-- mode-check-ok: 10/2 dev QA 사후 검토 (check-migration-not-null 이 9/29부터 main CI 를 막고 있었음).
--   sigungu 3컬럼 모두 nullable — 기존 행은 NULL 이거나 아래 UPDATE 로 채우고, 신규 INSERT 는 sync-crawl 이
--   normalizeRegion() 결과로 region·sigungu 를 함께 넣는다. 같은 행 조립(supabase/functions/sync-crawl/index.ts §4)이
--   세 테이블의 기존 NOT NULL 컬럼을 전부 채우고(region 은 원문이 없으면 "전국"), upsert 오류는 errors 로 올라가
--   sync-data 워크플로를 실패시킨다(9/30 08:27 실측) — silent fail 경로 없음.

BEGIN;

-- ── 1. sigungu 컬럼 ──────────────────────────────────────────────
ALTER TABLE support_programs  ADD COLUMN IF NOT EXISTS sigungu text;
ALTER TABLE education_courses ADD COLUMN IF NOT EXISTS sigungu text;
ALTER TABLE farm_events       ADD COLUMN IF NOT EXISTS sigungu text;

COMMENT ON COLUMN support_programs.sigungu  IS '시·군·구 (수집 원문). region 은 PROVINCES.name 17종 SSOT';
COMMENT ON COLUMN education_courses.sigungu IS '시·군·구 (수집 원문). region 은 PROVINCES.name 17종 SSOT';
COMMENT ON COLUMN farm_events.sigungu       IS '시·군·구 (수집 원문). region 은 PROVINCES.name 17종 SSOT';

-- ── 2. 기존 행 정정 ──────────────────────────────────────────────
-- support_programs: distinct 48종 중 40종 / 55행 정정
UPDATE support_programs SET region = '강원도', sigungu = '인제' WHERE region = '강원 인제';  -- 1행
UPDATE support_programs SET region = '강원도', sigungu = '태백' WHERE region = '강원 태백';  -- 1행
UPDATE support_programs SET region = '경기도', sigungu = '김포' WHERE region = '경기 김포';  -- 1행
UPDATE support_programs SET region = '경기도', sigungu = '안성' WHERE region = '경기 안성';  -- 1행
UPDATE support_programs SET region = '경기도', sigungu = '양평' WHERE region = '경기 양평';  -- 1행
UPDATE support_programs SET region = '경기도', sigungu = '파주' WHERE region = '경기 파주';  -- 2행
UPDATE support_programs SET region = '경상남도', sigungu = '거제' WHERE region = '경남 거제';  -- 1행
UPDATE support_programs SET region = '경상남도', sigungu = '고성' WHERE region = '경남 고성';  -- 2행
UPDATE support_programs SET region = '경상남도', sigungu = '김해' WHERE region = '경남 김해';  -- 1행
UPDATE support_programs SET region = '경상남도', sigungu = '합천' WHERE region = '경남 합천';  -- 2행
UPDATE support_programs SET region = '경상북도', sigungu = '경산' WHERE region = '경북 경산';  -- 1행
UPDATE support_programs SET region = '경상북도', sigungu = '고령' WHERE region = '경북 고령';  -- 1행
UPDATE support_programs SET region = '경상북도', sigungu = '봉화' WHERE region = '경북 봉화';  -- 2행
UPDATE support_programs SET region = '경상북도', sigungu = '안동' WHERE region = '경북 안동';  -- 1행
UPDATE support_programs SET region = '경상북도', sigungu = '청도' WHERE region = '경북 청도';  -- 1행
UPDATE support_programs SET region = '경상북도', sigungu = '포항' WHERE region = '경북 포항';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '강진' WHERE region = '전남 강진';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '곡성' WHERE region = '전남 곡성';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '구례' WHERE region = '전남 구례';  -- 2행
UPDATE support_programs SET region = '전라남도', sigungu = '무안' WHERE region = '전남 무안';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '순천' WHERE region = '전남 순천';  -- 2행
UPDATE support_programs SET region = '전라남도', sigungu = '여수' WHERE region = '전남 여수';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '영암' WHERE region = '전남 영암';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '진도' WHERE region = '전남 진도';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '함평' WHERE region = '전남 함평';  -- 1행
UPDATE support_programs SET region = '전라남도', sigungu = '해남' WHERE region = '전남 해남';  -- 3행
UPDATE support_programs SET region = '전라북도', sigungu = '고창' WHERE region = '전북 고창';  -- 3행
UPDATE support_programs SET region = '전라북도', sigungu = '남원' WHERE region = '전북 남원';  -- 1행
UPDATE support_programs SET region = '전라북도', sigungu = '무주' WHERE region = '전북 무주';  -- 1행
UPDATE support_programs SET region = '전라북도', sigungu = '장수' WHERE region = '전북 장수';  -- 2행
UPDATE support_programs SET region = '전라북도', sigungu = '정읍' WHERE region = '전북 정읍';  -- 1행
UPDATE support_programs SET region = '전라북도', sigungu = '진안' WHERE region = '전북 진안';  -- 4행
UPDATE support_programs SET region = '충청남도', sigungu = '공주' WHERE region = '충남 공주';  -- 1행
UPDATE support_programs SET region = '충청남도', sigungu = '금산' WHERE region = '충남 금산';  -- 1행
UPDATE support_programs SET region = '충청남도', sigungu = '부여' WHERE region = '충남 부여';  -- 2행
UPDATE support_programs SET region = '충청남도', sigungu = '서산' WHERE region = '충남 서산';  -- 1행
UPDATE support_programs SET region = '충청남도', sigungu = '예산' WHERE region = '충남 예산';  -- 1행
UPDATE support_programs SET region = '충청북도', sigungu = '괴산' WHERE region = '충북 괴산';  -- 1행
UPDATE support_programs SET region = '충청북도', sigungu = '옥천' WHERE region = '충북 옥천';  -- 1행
UPDATE support_programs SET region = '충청북도', sigungu = '충주' WHERE region = '충북 충주';  -- 1행

-- education_courses: distinct 53종 중 48종 / 87행 정정
UPDATE education_courses SET region = '강원도', sigungu = '양구' WHERE region = '강원 양구';  -- 1행
UPDATE education_courses SET region = '강원도', sigungu = '양양' WHERE region = '강원 양양';  -- 1행
UPDATE education_courses SET region = '강원도', sigungu = '인제' WHERE region = '강원 인제';  -- 1행
UPDATE education_courses SET region = '강원도', sigungu = '평창' WHERE region = '강원 평창';  -- 1행
UPDATE education_courses SET region = '경기도', sigungu = '고양' WHERE region = '경기 고양';  -- 1행
UPDATE education_courses SET region = '경기도', sigungu = '김포' WHERE region = '경기 김포';  -- 1행
UPDATE education_courses SET region = '경기도', sigungu = '안성' WHERE region = '경기 안성';  -- 2행
UPDATE education_courses SET region = '경상남도', sigungu = '거제' WHERE region = '경남 거제';  -- 2행
UPDATE education_courses SET region = '경상남도', sigungu = '고성' WHERE region = '경남 고성';  -- 1행
UPDATE education_courses SET region = '경상남도', sigungu = '김해' WHERE region = '경남 김해';  -- 1행
UPDATE education_courses SET region = '경상남도', sigungu = '남해' WHERE region = '경남 남해';  -- 1행
UPDATE education_courses SET region = '경상남도', sigungu = '의령' WHERE region = '경남 의령';  -- 3행
UPDATE education_courses SET region = '경상남도', sigungu = '진주' WHERE region = '경남 진주';  -- 3행
UPDATE education_courses SET region = '경상남도', sigungu = '창원' WHERE region = '경남 창원';  -- 1행
UPDATE education_courses SET region = '경상남도', sigungu = '함안' WHERE region = '경남 함안';  -- 2행
UPDATE education_courses SET region = '경상북도', sigungu = '경산' WHERE region = '경북 경산';  -- 1행
UPDATE education_courses SET region = '경상북도', sigungu = '상주' WHERE region = '경북 상주';  -- 1행
UPDATE education_courses SET region = '경상북도', sigungu = '성주' WHERE region = '경북 성주';  -- 2행
UPDATE education_courses SET region = '경상북도', sigungu = '영덕' WHERE region = '경북 영덕';  -- 5행
UPDATE education_courses SET region = '경상북도', sigungu = '청도' WHERE region = '경북 청도';  -- 1행
UPDATE education_courses SET region = '경상북도', sigungu = '칠곡' WHERE region = '경북 칠곡';  -- 1행
UPDATE education_courses SET region = '경상북도', sigungu = '포항' WHERE region = '경북 포항';  -- 1행
UPDATE education_courses SET region = '전라남도', sigungu = '강진' WHERE region = '전남 강진';  -- 1행
UPDATE education_courses SET region = '전라남도', sigungu = '곡성' WHERE region = '전남 곡성';  -- 1행
UPDATE education_courses SET region = '전라남도', sigungu = '보성' WHERE region = '전남 보성';  -- 4행
UPDATE education_courses SET region = '전라남도', sigungu = '영암' WHERE region = '전남 영암';  -- 2행
UPDATE education_courses SET region = '전라남도', sigungu = '진도' WHERE region = '전남 진도';  -- 1행
UPDATE education_courses SET region = '전라남도', sigungu = '해남' WHERE region = '전남 해남';  -- 3행
UPDATE education_courses SET region = '전라북도', sigungu = '군산' WHERE region = '전북 군산';  -- 2행
UPDATE education_courses SET region = '전라북도', sigungu = '김제' WHERE region = '전북 김제';  -- 1행
UPDATE education_courses SET region = '전라북도', sigungu = '남원' WHERE region = '전북 남원';  -- 1행
UPDATE education_courses SET region = '전라북도', sigungu = '완주' WHERE region = '전북 완주';  -- 2행
UPDATE education_courses SET region = '전라북도', sigungu = '익산' WHERE region = '전북 익산';  -- 1행
UPDATE education_courses SET region = '충청남도', sigungu = '계룡' WHERE region = '충남 계룡';  -- 1행
UPDATE education_courses SET region = '충청남도', sigungu = '공주' WHERE region = '충남 공주';  -- 1행
UPDATE education_courses SET region = '충청남도', sigungu = '금산' WHERE region = '충남 금산';  -- 1행
UPDATE education_courses SET region = '충청남도', sigungu = '부여' WHERE region = '충남 부여';  -- 1행
UPDATE education_courses SET region = '충청남도', sigungu = '서산' WHERE region = '충남 서산';  -- 2행
UPDATE education_courses SET region = '충청남도', sigungu = '천안' WHERE region = '충남 천안';  -- 5행
UPDATE education_courses SET region = '충청북도', sigungu = '괴산' WHERE region = '충북 괴산';  -- 9행
UPDATE education_courses SET region = '충청북도', sigungu = '영동' WHERE region = '충북 영동';  -- 2행
UPDATE education_courses SET region = '충청북도', sigungu = '옥천' WHERE region = '충북 옥천';  -- 1행
UPDATE education_courses SET region = '충청북도', sigungu = '음성' WHERE region = '충북 음성';  -- 1행
UPDATE education_courses SET region = '충청북도', sigungu = '제천' WHERE region = '충북 제천';  -- 1행
UPDATE education_courses SET region = '충청북도', sigungu = '증평' WHERE region = '충북 증평';  -- 1행
UPDATE education_courses SET region = '충청북도', sigungu = '진천' WHERE region = '충북 진천';  -- 1행
UPDATE education_courses SET region = '충청북도', sigungu = '청주' WHERE region = '충북 청주';  -- 2행
UPDATE education_courses SET region = '충청북도', sigungu = '충주' WHERE region = '충북 충주';  -- 5행

-- farm_events: distinct 3종 중 0종 / 0행 정정

-- ── 3. 검증 (apply 후 0행이어야 함) ──────────────────────────────
-- SELECT 'support_programs' AS t, region, count(*) FROM support_programs
--   WHERE region NOT IN ('전국','서울특별시','인천광역시','경기도','강원도','충청북도',
--     '세종특별자치시','대전광역시','충청남도','전라북도','광주광역시','전라남도',
--     '부산광역시','대구광역시','울산광역시','경상북도','경상남도','제주특별자치도')
--   GROUP BY region
-- UNION ALL SELECT 'education_courses', region, count(*) FROM education_courses
--   WHERE region NOT IN ('전국','서울특별시','인천광역시','경기도','강원도','충청북도',
--     '세종특별자치시','대전광역시','충청남도','전라북도','광주광역시','전라남도',
--     '부산광역시','대구광역시','울산광역시','경상북도','경상남도','제주특별자치도')
--   GROUP BY region
-- UNION ALL SELECT 'farm_events', region, count(*) FROM farm_events
--   WHERE region NOT IN ('전국','서울특별시','인천광역시','경기도','강원도','충청북도',
--     '세종특별자치시','대전광역시','충청남도','전라북도','광주광역시','전라남도',
--     '부산광역시','대구광역시','울산광역시','경상북도','경상남도','제주특별자치도')
--   GROUP BY region;

COMMIT;
