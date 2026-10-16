-- 2026-10-16 데이터 정합성 1차 QA 🟡-2 — farm_events 저장 status 를 앱 판정 규칙과 같게.
-- 회장 Supabase SQL Editor 적용용(CREATE OR REPLACE + UPDATE, 재실행 안전). 화면은 날짜로 다시 계산하므로 Redeploy 불필요.
--
-- 배경: auto_update_program_status()(20260829_program_status_kst.sql)는 체험·행사를 **운영일**(date_end, 없으면 date_start)로
--       마감하고, '접수예정 → 접수중'도 운영 시작 30일 전부터 바꿨다. 앱(src/lib/program-status.ts deriveEventStatus)은
--       **접수 기간**으로 판정한다:
--         접수 시작일이 오늘보다 뒤      → '접수예정'
--         접수 마감일(없으면 운영 종료일)이 오늘보다 앞 → '마감'
--         그 밖                         → '접수중'
--       그래서 접수는 끝났지만 운영 중인 살아보기·교육형 행사 29행이 DB 에 '접수중'으로 남았다(10/16 anon 조회 —
--       예: crawl-greendaero-live-cc63cf3e 접수 9/18~9/29, 운영 10/1~11/30). 화면 노출은 0(앱이 다시 계산)이지만
--       DB status 를 읽는 쪽(관리자 화면·쿼리 필터)이 생기면 그대로 틀린다.
--
-- 바꾸는 것:
--   1) 함수의 farm_events 두 UPDATE → 앱과 같은 규칙의 한 UPDATE(CASE). 지원사업·교육 부분은 20260829 그대로.
--   2) 지금 어긋난 farm_events 행 재계산 — 10/16 기준 29행(전부 '접수중' → '마감'). 적용일에 따라 늘 수 있다.
--      가드: 앱 규칙으로 계산한 값과 지금 값이 다른 행만(IS DISTINCT FROM) — 같은 행은 건드리지 않는다.
-- 확인(적용 뒤 0행이어야 한다):
--   SELECT slug, status, application_start, application_end, date_end FROM farm_events
--    WHERE status IS DISTINCT FROM (CASE … 아래와 같은 식 …);

BEGIN;

CREATE OR REPLACE FUNCTION auto_update_program_status()
RETURNS void AS $$
DECLARE
  -- 2026-08-29: CURRENT_DATE는 DB 세션 타임존(UTC) 기준이라 KST 00~09시에 어제 날짜 → KST 오늘로 고정.
  kst_today date := (now() AT TIME ZONE 'Asia/Seoul')::date;
BEGIN
  -- 지원사업: 마감일 지난 건 → 마감
  UPDATE support_programs
  SET status = '마감'
  WHERE status != '마감'
    AND application_end < kst_today;

  -- 지원사업: 모집시작일 도래 + 마감일 전 → 모집중
  UPDATE support_programs
  SET status = '모집중'
  WHERE status = '모집예정'
    AND application_start <= kst_today
    AND application_end >= kst_today;

  -- 교육과정: 동일 로직
  UPDATE education_courses
  SET status = '마감'
  WHERE status != '마감'
    AND application_end < kst_today;

  UPDATE education_courses
  SET status = '모집중'
  WHERE status = '모집예정'
    AND application_start <= kst_today
    AND application_end >= kst_today;

  -- 행사: 접수 기간 기준 — 앱 deriveEventStatus 와 같은 규칙 (2026-10-16)
  UPDATE farm_events
  SET status = CASE
      WHEN application_start IS NOT NULL AND kst_today < application_start THEN '접수예정'
      WHEN COALESCE(application_end, date_end) IS NOT NULL AND kst_today > COALESCE(application_end, date_end) THEN '마감'
      ELSE '접수중'
    END
  WHERE status IS DISTINCT FROM (CASE
      WHEN application_start IS NOT NULL AND kst_today < application_start THEN '접수예정'
      WHEN COALESCE(application_end, date_end) IS NOT NULL AND kst_today > COALESCE(application_end, date_end) THEN '마감'
      ELSE '접수중'
    END);
END;
$$ LANGUAGE plpgsql;

-- 지금 어긋난 행 재계산 (함수와 같은 식 — 지원사업·교육은 건드리지 않는다)
UPDATE farm_events
SET status = CASE
    WHEN application_start IS NOT NULL AND (now() AT TIME ZONE 'Asia/Seoul')::date < application_start THEN '접수예정'
    WHEN COALESCE(application_end, date_end) IS NOT NULL
         AND (now() AT TIME ZONE 'Asia/Seoul')::date > COALESCE(application_end, date_end) THEN '마감'
    ELSE '접수중'
  END,
  updated_at = now()
WHERE status IS DISTINCT FROM (CASE
    WHEN application_start IS NOT NULL AND (now() AT TIME ZONE 'Asia/Seoul')::date < application_start THEN '접수예정'
    WHEN COALESCE(application_end, date_end) IS NOT NULL
         AND (now() AT TIME ZONE 'Asia/Seoul')::date > COALESCE(application_end, date_end) THEN '마감'
    ELSE '접수중'
  END);

-- 확인: 0 이어야 한다
SELECT count(*) AS mismatched_after
FROM farm_events
WHERE status IS DISTINCT FROM (CASE
    WHEN application_start IS NOT NULL AND (now() AT TIME ZONE 'Asia/Seoul')::date < application_start THEN '접수예정'
    WHEN COALESCE(application_end, date_end) IS NOT NULL
         AND (now() AT TIME ZONE 'Asia/Seoul')::date > COALESCE(application_end, date_end) THEN '마감'
    ELSE '접수중'
  END);

COMMIT;
