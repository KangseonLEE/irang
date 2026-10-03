-- 2026-09-30: 농촌에서 살아보기(그린대로) 마을 카드용 필드 4종
-- 배경: 회장 지시 — 교육·체험 목록/상세를 그린대로 살아보기처럼 "사진 카드"로, 랜딩에 살아보기 캐러셀.
-- 원본 JSON 에 thumb_file_id·mvn_psblty_ymd·vlg_rcrt_hshld_cnt·vlg_type_cd 가 있어 그대로 옮긴다.
-- 적재: supabase/functions/sync-crawl (greendaero-live 타겟). 사진은 그린대로 원본 URL 을 저장하고
--       화면에서 next/image 최적화로만 소비한다(원본 5472px·7MB — 직접 <img> 금지).
--
-- mode-check-ok: 10/2 dev QA 사후 검토 (check-migration-not-null 이 9/29부터 main CI 를 막고 있었음).
--   4컬럼 모두 nullable — 그린대로 살아보기 행만 채우고 나머지 행·다른 수집 타깃은 NULL. sync-crawl 의
--   farm_events 행 조립(supabase/functions/sync-crawl/index.ts §4)이 기존 NOT NULL 컬럼(slug·title·region·
--   organization·type·date_start)을 전부 채우고 나머지는 DEFAULT 가 있다. 9/30 refresh 백필·10/1~2 정기 실행 성공.
ALTER TABLE farm_events
  ADD COLUMN IF NOT EXISTS image_url    TEXT,   -- 마을 대표 사진 (그린대로 /svc/common/board/img/<id>.do)
  ADD COLUMN IF NOT EXISTS move_in_date DATE,   -- 입주 가능일
  ADD COLUMN IF NOT EXISTS households   INT,    -- 모집 가구 수 (capacity 는 인원)
  ADD COLUMN IF NOT EXISTS village_type TEXT;   -- 귀농형 / 귀촌형 / 프로젝트형
