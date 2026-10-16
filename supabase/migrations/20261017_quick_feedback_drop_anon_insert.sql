-- 2026-10-17 보안 — quick_feedback 공개(anon) 쓰기 정책 제거.
-- 회장 Supabase SQL Editor 적용용. Redeploy 불필요.
--
-- 배경: 정책 "Anyone can insert feedback"(대시보드에서 만든 것으로 보임 — 리포 마이그레이션에 없음)이
--   anon·authenticated 에 INSERT WITH CHECK (true) 를 열어 둔다. 공개 anon 키(브라우저 번들에 있음)로
--   REST 를 직접 부르면 /api/quick-feedback 의 입력 검증·내부 트래픽 제외·JSON 강제를 모두 건너뛰고
--   관리자 화면 '정보 요청·의견'에 행을 넣을 수 있다(10/17 pg_policies 점검에서 발견).
-- 앱은 이 표를 service_role(getSupabaseAdmin)로만 쓴다 — src/app/api/quick-feedback/route.ts:187·219·263,
--   읽기도 관리자 화면(service_role) 뿐. anon 경로 0 → 정책을 지워도 동작은 그대로(service_role 은 RLS 를 우회).

BEGIN;

DROP POLICY IF EXISTS "Anyone can insert feedback" ON quick_feedback;

-- 확인: quick_feedback 에 남은 정책이 없어야 한다(RLS 는 켜진 채 → anon 은 읽기·쓰기 모두 불가)
SELECT policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quick_feedback';

COMMIT;
