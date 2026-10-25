-- 2026-10-26 SP-011 귀농닥터 — 2026년 접수 조기 마감 반영
--
-- 근거: 그린대로 공지사항 '[귀농닥터] 2026년 현장밀착형 귀농닥터 서비스 마감 알림' (귀농닥터담당자, 2026-10-22)
--       https://www.greendaero.go.kr/svc/rfph/guide/front/news/notice.do (2026-10-26 한국 회선 브라우저로 목록 확인)
-- 화면은 DB 우선(mapProgramRow: application_cycle·description 은 DB 값)이라 정적 programs.ts 만 고치면 안 바뀐다.
-- 정적 SP-011 과 같은 문구로 맞춘다. 날짜 칸(9999 페어 = 연례 창구)은 그대로 — 다음 회차(2027년 1월~) 안내가 남는다.
-- 가드: 현재 값이 10/6 동기화 값일 때만 바꾼다(D6 — 적용 전 SELECT 로 확인, 적용 뒤 다시 읽기).

-- 적용 전 확인
SELECT slug, application_cycle, right(description, 60) AS desc_tail
FROM support_programs WHERE slug = 'SP-011';
-- 기대: '매년 1~11월 그린대로 접수 (예산 소진 시 조기 마감)' · '…예산이 소진되면 일찍 마감될 수 있어요.'

UPDATE support_programs SET
  application_cycle = '매년 1~11월 그린대로 접수 (예산 소진 시 조기 마감 — 2026년은 10월 22일 마감)',
  description = description || ' 2026년 신청은 10월 22일에 마감됐어요.',
  updated_at = now()
WHERE slug = 'SP-011'
  AND application_cycle IS NOT DISTINCT FROM '매년 1~11월 그린대로 접수 (예산 소진 시 조기 마감)'
  AND description LIKE '%예산이 소진되면 일찍 마감될 수 있어요.';

-- 적용 뒤 확인 (1행 · 새 문구)
SELECT slug, application_cycle, right(description, 60) AS desc_tail
FROM support_programs WHERE slug = 'SP-011';
