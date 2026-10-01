-- 2026-09-30: farm_events.type 에 '살아보기' 추가 + 그린대로 살아보기 행 재분류
-- 배경: 회장 "체험·행사의 살아보기가 유형 분류에서 뭘로 들어가나" → '팜스테이' 로 들어가 있었다.
--       팜스테이(1~2박 농가 체험)와 살아보기(수 주 거주 정부 프로그램)는 다른 것이라 유형을 분리한다.
-- 순서: 이 마이그레이션 apply → sync-crawl 재배포(eventType '살아보기') → refresh 수집. apply 전에 함수를
--       먼저 배포하면 CHECK 위반으로 upsert 가 통째로 실패한다.
ALTER TABLE farm_events DROP CONSTRAINT IF EXISTS farm_events_type_check;
ALTER TABLE farm_events
  ADD CONSTRAINT farm_events_type_check
  CHECK (type IN ('살아보기','일일체험','팜스테이','박람회','설명회','멘토링','축제'));

UPDATE farm_events
   SET type = '살아보기'
 WHERE slug LIKE 'crawl-greendaero-live-%'
    OR (type = '팜스테이' AND title LIKE '%살아보기%');
