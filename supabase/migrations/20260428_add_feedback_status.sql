-- 요청(정보 추가 요청) 처리 상태 관리용 컬럼 추가
-- status: pending(대기) / done(완료) / rejected(반려)
ALTER TABLE quick_feedback
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- 요청 항목만 빠르게 조회하기 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_quick_feedback_message_request
  ON quick_feedback ((message LIKE '[%요청%'));

-- 상태별 필터 인덱스
CREATE INDEX IF NOT EXISTS idx_quick_feedback_status
  ON quick_feedback (status);
