-- ═══════════════════════════════════════════
-- Migration: search_logs RLS 강화
-- Date: 2026-04-09
-- Description:
--   anon key의 직접 INSERT를 차단하고,
--   서비스 롤(Route Handler)만 읽기/쓰기 허용.
--   클라이언트는 /api/search-log 를 통해 서버 사이드 INSERT.
-- ═══════════════════════════════════════════

-- 기존 정책 제거
DROP POLICY IF EXISTS "SearchLogs: public insert" ON search_logs;
DROP POLICY IF EXISTS "SearchLogs: service read" ON search_logs;

-- 새 정책: 서비스 롤만 모든 작업 허용
CREATE POLICY "SearchLogs: service all" ON search_logs
  FOR ALL USING (auth.role() = 'service_role');
