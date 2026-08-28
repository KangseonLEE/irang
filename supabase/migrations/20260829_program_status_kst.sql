-- auto_update_program_status — 상태 전환 기준일을 UTC CURRENT_DATE → KST 오늘로 정정
--
-- 배경 (2026-08-29, 회장 결재):
--   - sync-rda Edge Function이 매일 06:00 KST(= 21:00 UTC 전일)에 이 RPC를 호출한다.
--   - 함수 안의 CURRENT_DATE는 DB 세션 타임존(UTC) 기준이라 호출 시점엔 "어제" 날짜.
--     → application_end = 8/28 인 공고가 8/29 06:00 KST 실행에서 `8/28 < 8/28` false로 남고
--       8/30 실행에서야 마감 전환. 실측: "2026 청년농업인 농지확보 지원사업 2차"(마감 8/28)가
--       8/29 오전 DB status '모집중' 잔존 (화면은 deriveStatus KST 재계산이라 정상 노출 제외).
--   - 5/15 toISOString().slice UTC 함정(commit 863e350)의 DB 버전. 같은 원칙으로 KST 고정.
--
-- 적용: Supabase Dashboard → SQL Editor에서 이 파일 전체 실행 (CREATE OR REPLACE라 재실행 안전).
-- 검증: SELECT auto_update_program_status();
--       SELECT title, status, application_end FROM support_programs
--        WHERE status <> '마감' AND application_end < (now() AT TIME ZONE 'Asia/Seoul')::date;
--       → 0 rows 여야 한다.

CREATE OR REPLACE FUNCTION auto_update_program_status()
RETURNS void AS $$
DECLARE
  -- 2026-08-29: CURRENT_DATE는 DB 세션 타임존(UTC) 기준이라 KST 00~09시에 어제 날짜.
  -- sync-data.yml이 06:00 KST(21:00 UTC 전일)에 호출하므로 8/28 마감 건이 8/30 실행에서야
  -- 마감 전환되는 최대 2일 지연이 있었다(5/15 toISOString UTC 함정의 DB 버전). KST 오늘로 고정.
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

  -- 행사: date_start 기준
  UPDATE farm_events
  SET status = '마감'
  WHERE status != '마감'
    AND COALESCE(date_end, date_start) < kst_today;

  UPDATE farm_events
  SET status = '접수중'
  WHERE status = '접수예정'
    AND date_start <= kst_today + INTERVAL '30 days'
    AND COALESCE(date_end, date_start) >= kst_today;
END;
$$ LANGUAGE plpgsql;
