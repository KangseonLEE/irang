-- Phase 3: D-day 알림 + 사용자 설정 테이블
-- 작성: 2026-05-07
-- spec: ~/David_agit/specs/PHASE3_NOTIFICATION_BOOKMARK_SPEC.md
-- apply 시점: 5/13 Pro vs Hobby 결정 후 + Resend 도메인 인증 완료 후
--
-- ⚠️ APPLY 절차:
--   1. supabase 콘솔 → SQL Editor → 이 파일 내용 복사 → 실행
--   2. 또는: supabase db push --linked (linked project)
--   3. 적용 후 RLS 동작 검증 필수

-- ─────────────────────────────────────────────────────────────────
-- 1. user_notifications: 사용자 알림 설정
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  email_enabled boolean DEFAULT true,
  -- D-day 알림 발송 임계 (기본 30/7/3/1 일 전)
  d_day_thresholds int[] DEFAULT ARRAY[30, 7, 3, 1],
  last_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_email_enabled
  ON user_notifications (email_enabled)
  WHERE email_enabled = true;

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- 본인의 설정만 read/update 가능
CREATE POLICY "Users can read own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON user_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────
-- 2. notification_log: 알림 발송 이력 (중복 방지)
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  program_id text NOT NULL,
  d_day int NOT NULL,            -- 30, 7, 3, 1
  sent_at timestamptz DEFAULT now(),
  email_message_id text,         -- Resend 응답 ID (성공 시), null (실패 시)
  -- CRITICAL: UNIQUE 제약으로 같은 user × program × d_day 중복 발송 절대 차단
  UNIQUE (user_id, program_id, d_day)
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user_program
  ON notification_log (user_id, program_id);

CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at
  ON notification_log (sent_at DESC);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- 본인 발송 이력만 read 가능 (insert는 service role만)
CREATE POLICY "Users can read own notification log"
  ON notification_log FOR SELECT
  USING (auth.uid() = user_id);

-- service_role(cron handler)만 insert/update 가능 (RLS bypass)
-- 명시적 INSERT policy 없음 → service_role 외엔 차단

-- ─────────────────────────────────────────────────────────────────
-- 3. updated_at 자동 갱신 트리거 (user_notifications)
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS user_notifications_updated_at ON user_notifications;
CREATE TRIGGER user_notifications_updated_at
  BEFORE UPDATE ON user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────────────────────────────
-- 검증 query (apply 후 실행)
-- ─────────────────────────────────────────────────────────────────
-- SELECT count(*) FROM user_notifications;  -- 0 (정상)
-- SELECT count(*) FROM notification_log;     -- 0 (정상)
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('user_notifications', 'notification_log');
--   -- 두 행 모두 relrowsecurity = true 여야 함
