-- 요청(정보 추가 요청) 처리 상태 관리용 컬럼 추가
-- status: pending(대기) / done(완료) / rejected(반려)
--
-- mode-check-ok: 5/26 자동화 사후 검토 (check-migration-not-null). status `NOT NULL
--   DEFAULT 'pending'` — 기존 row·신규 INSERT 모두 DEFAULT로 채워져 통과. 5/15·5/16과
--   달리 INSERT 신규 모드를 만들지 않음. silent fail 위험 없음.
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- 요청 항목만 빠르게 조회하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_quick_feedback_message_request
  ON quick_feedback ((message LIKE '[%요청%'));

-- 상태별 필터 인덱스
CREATE INDEX IF NOT EXISTS idx_quick_feedback_status
  ON quick_feedback (status);
