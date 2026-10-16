-- 2026-10-17 보안 — community_notes 공개(anon) 읽기 정책 제거.
-- 회장 Supabase SQL Editor 적용용. Redeploy 불필요.
--
-- 배경: 20260902_community_notes.sql:139 `community_notes_anon_read_approved` 가 anon 에
--   SELECT … USING (status = 'approved') 를 **행 전체**로 열어, 공개 anon 키로 REST 를 부르면
--   승인된 글의 ip_hash·user_agent 까지 읽힌다(10/16 개인정보 처리방침 작성 중 발견).
--   10/16 기준 승인된 글 0건이라 실제 노출은 0.
-- 앱은 이 표를 전부 service_role(getSupabaseAdmin)로 읽고 쓴다
--   — src/lib/community/queries.ts 69·104·135·147행, src/lib/admin/notifications.ts — anon 경로 0.
-- 그래서 정책을 지워도 화면 동작은 그대로다(RLS 는 켜진 채라 anon 은 0행).

BEGIN;

DROP POLICY IF EXISTS community_notes_anon_read_approved ON community_notes;

-- 확인: 남은 정책 목록 (anon SELECT 정책이 없어야 한다)
SELECT policyname, roles, cmd FROM pg_policies WHERE tablename = 'community_notes' ORDER BY policyname;

COMMIT;
