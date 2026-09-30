-- 2026-09-30: 농촌에서 살아보기(그린대로) 마을 카드용 필드 4종
-- 배경: 회장 지시 — 교육·체험 목록/상세를 그린대로 살아보기처럼 "사진 카드"로, 랜딩에 살아보기 캐러셀.
-- 원본 JSON 에 thumb_file_id·mvn_psblty_ymd·vlg_rcrt_hshld_cnt·vlg_type_cd 가 있어 그대로 옮긴다.
-- 적재: supabase/functions/sync-crawl (greendaero-live 타겟). 사진은 그린대로 원본 URL 을 저장하고
--       화면에서 next/image 최적화로만 소비한다(원본 5472px·7MB — 직접 <img> 금지).
ALTER TABLE farm_events
  ADD COLUMN IF NOT EXISTS image_url    TEXT,   -- 마을 대표 사진 (그린대로 /svc/common/board/img/<id>.do)
  ADD COLUMN IF NOT EXISTS move_in_date DATE,   -- 입주 가능일
  ADD COLUMN IF NOT EXISTS households   INT,    -- 모집 가구 수 (capacity 는 인원)
  ADD COLUMN IF NOT EXISTS village_type TEXT;   -- 귀농형 / 귀촌형 / 프로젝트형
