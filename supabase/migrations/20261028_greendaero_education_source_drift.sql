-- 2026-10-28 그린대로 수집 교육 3건 — 원천과 어긋난 값 정정 (watchman #186 §20)
--
-- 근거: 그린대로 교육 공개 JSON 목록 전수(2,777건, 2026-10-27 한국 회선)
--   https://www.greendaero.go.kr/svc/rfph/edc/offline/getEdcList.do
-- 수집 행은 한 번 검증되면 sync-crawl 이 다시 쓰지 않아(is_verified 건너뜀) 원천 변경이 따라오지 않는다.
--
-- 1) 541f897a [대면] 전남광주 귀농산어촌 입문 교육 (11/7) — 원천 목록에서 과정(EDUCRSE_000000006030) 회차가 0건.
--    언제 닫혔는지 모르므로 마감일을 지어 넣지 않고(T10) link_status = 'broken' → 목록 숨김·상세는 대체 안내.
-- 2) 원천이 접수 마감을 교육 전날 → 교육 당일(10/29)로 늘린 2건 (둘 다 10/7 수집 값 2026-10-28):
--    b69ceddf [비대면 실시간] 전남광주 귀농산어촌 아카데미 (완도 10/29) — EDUDCRSE_00000013783
--    b24d1db7 농업일자리 탐색교육(4h) (대면) 한국농수산대 1기 (10/29)   — EDUDCRSE_00000013620
--    (30b5b2d3 탐색교육 106기는 원천에서 사라졌지만 10/27 마감이라 이미 날짜로 마감 — 손대지 않음)
-- 가드: 현재 값일 때만 바꾼다(D6 — 적용 전 SELECT, 적용 뒤 다시 읽기).

-- 적용 전 확인 — 기대: 541f897a 2026-11-06·active / b69ceddf·b24d1db7 2026-10-28
SELECT slug, application_end, link_status FROM education_courses
WHERE slug IN ('crawl-greendaero-education-541f897a', 'crawl-greendaero-education-b69ceddf', 'crawl-greendaero-education-b24d1db7');

UPDATE education_courses SET link_status = 'broken', updated_at = now()
WHERE slug = 'crawl-greendaero-education-541f897a'
  AND application_end = '2026-11-06' AND link_status IS NOT DISTINCT FROM 'active';

UPDATE education_courses SET application_end = '2026-10-29', updated_at = now()
WHERE slug IN ('crawl-greendaero-education-b69ceddf', 'crawl-greendaero-education-b24d1db7')
  AND application_end = '2026-10-28';

-- 적용 뒤 확인 — 541f897a broken / b69ceddf·b24d1db7 2026-10-29 (UPDATE 1행 + 2행)
SELECT slug, application_end, link_status FROM education_courses
WHERE slug IN ('crawl-greendaero-education-541f897a', 'crawl-greendaero-education-b69ceddf', 'crawl-greendaero-education-b24d1db7');
