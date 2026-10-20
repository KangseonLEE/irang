-- 진단 결과에 첫 방문 유입 꼬리표 (2026-10-20)
--
-- 왜: 카카오톡·메일 앱으로 연 링크는 유입 주소(referrer)가 비어 '직접'으로 잡힌다. 공유 버튼이 만드는
--     링크에 utm 을 붙였고(lib/share-tag), 세션 첫 방문의 utm_source·utm_medium 을 결과와 함께 남긴다.
--     예전엔 매칭만 utm_source 를 referrer 칸에 넣었다 — 이제 referrer 는 바깥 주소, utm 은 이 컬럼.
--
-- 둘 다 선택값이라 NULL 허용. 기존 행은 NULL(소급 불가).
-- 적용 전에도 /api/assess 는 utm_* 를 빼고 다시 저장한다(api_fallback_log migration-pending).
-- 공유 조회(/api/assess/[id])는 PUBLIC_RESULT_COLUMNS 명시 목록이라 노출되지 않는다.
-- mode-check-ok: 새 컬럼 둘 다 NULL 허용 선택값이고 기존 NOT NULL 컬럼의 의미는 바뀌지 않는다

ALTER TABLE assessment_results
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT;

ALTER TABLE assessment_results
  DROP CONSTRAINT IF EXISTS assessment_results_utm_format;
ALTER TABLE assessment_results
  ADD CONSTRAINT assessment_results_utm_format
  CHECK (
    (utm_source IS NULL OR utm_source ~ '^[A-Za-z0-9_.-]{1,40}$')
    AND (utm_medium IS NULL OR utm_medium ~ '^[A-Za-z0-9_.-]{1,40}$')
  );

COMMENT ON COLUMN assessment_results.utm_source IS
  '세션 첫 방문 utm_source (kakao·copy_link·share_sheet·naver_blog 등). 2026-10-20 추가';
COMMENT ON COLUMN assessment_results.utm_medium IS
  '세션 첫 방문 utm_medium (share·blog·email 등). 2026-10-20 추가';
