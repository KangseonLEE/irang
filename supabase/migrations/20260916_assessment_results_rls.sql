-- 진단 결과 anon 전체 조회 차단 (2026-09-16 보안 점검)
--
-- 문제: anon 키(모든 페이지 JS 에 포함된 공개 키)로 `assessment_results` 45행이
--       필터 없이 전부 조회됐다. 노출 컬럼에 answers(가족 구성·자본 규모·영농 형태),
--       user_agent, referrer, age_group 이 포함된다. 이름·이메일·IP 는 없어 직접
--       식별 정보는 아니지만, 사용자가 입력한 개인 상황 데이터가 대량 수집 가능했다.
--
-- 원인: 공유 링크(/assess/result/[id])를 위해 "Public Read" 정책을 뒀는데,
--       RLS 로는 "id 로 한 건만" 을 강제할 수 없어 사실상 전체 공개가 됐다.
--
-- 해결: 읽기 경로를 이미 존재하는 서버 라우트(/api/assess/[id], service_role)로
--       옮기고 anon 읽기 정책을 제거한다. 공유 링크 기능은 그대로 동작한다.
--       (라우트 변경은 같은 날 코드 커밋에 포함 — 이 마이그레이션보다 먼저 배포된다.)

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- 기존 공개 읽기 정책 제거 (이름이 다를 수 있어 알려진 후보를 모두 시도)
DROP POLICY IF EXISTS "Public read" ON assessment_results;
DROP POLICY IF EXISTS "public_read" ON assessment_results;
DROP POLICY IF EXISTS "assessment_results_public_read" ON assessment_results;
DROP POLICY IF EXISTS "Enable read access for all users" ON assessment_results;
DROP POLICY IF EXISTS "anon_read" ON assessment_results;

-- service_role 만 전권 (앱은 /api/assess 계열 서버 라우트로만 접근)
DROP POLICY IF EXISTS "assessment_results_service_all" ON assessment_results;
CREATE POLICY "assessment_results_service_all" ON assessment_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 적용 후 검증 (anon 키로):
--   curl "$URL/rest/v1/assessment_results?select=id&limit=1" -H "apikey: $ANON" → []
--   라이브 공유 링크 /assess/result/<id> 정상 표시
