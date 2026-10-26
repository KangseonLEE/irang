@AGENTS.md

# 이랑 프로젝트 개발 규칙

> 이 파일은 Claude가 세션마다 자동 로드하는 규칙이다.
> **하네스 계층**: 에이전트·스킬·hook은 `.claude/` 하위에 분리. 이 파일(CLAUDE.md)은 기존 코드 컨벤션·디자인 원칙을 보존하고, 하네스 진입점만 §0에 추가.

---

## 0. 하네스 진입점 (2026-04-15 추가)

> **🧊 신규 기능 동결 (2026-09-08 회장 결재 → 2026-10-07 M7 판정 Pivot 확정으로 11월 초 재판정까지 연장)** — 허용: (a) 진단 진입(랜딩 CTA·퀵메뉴·검색→진단·/assess 노출) (b) 재방문(진단 결과 저장/재열람·업데이트 소식) (c) 버그·데이터 정정·보안 (d) 계측(assess_start·external_click 등). **금지: 그 외 신규 화면·섹션·기능·리디자인.** 허용 밖 요청이 오면 착수 전에 이 배너를 인용해 회장 확인. M7 판정 기준: Go = 월 활성 ≥ 600 & 진단 완료/방문자 ≥ 5% & 재방문 ≥ 10% / Pivot(진단 진입·재방문 UX 집중) = 완료 < 5% 또는 재방문 < 10% / 유입 우선 = 활성 < 300. **기준선 #2 (10/5 스냅샷 #161, 28일·운영 호스트만)**: 활성 473·재방문 11.4%(기준 통과)·진단 도달 3.6%·진단 완료 1.1%(미달) → **Pivot 확정(10/7 회장)**. 남은 병목은 진단 진입 하나. 다음 판정 = 11/1 GA4 스냅샷(기준선 #3).

### 0-1. 디스패치 테이블

| 트리거 | 대상 | 비고 |
|--------|------|------|
| "이랑 작업", "코드 작업", "배포 준비", "개발 진행상황" | `chief-of-staff` 에이전트 | 회장 대리, 분배·종합 |
| "페이지 만들어줘", "컴포넌트 추가", "UI 수정", "CSS 조정" | `frontend-engineer` 에이전트 | Next.js 16 + CSS Modules 구현 |
| "API 연동", "데이터 갱신", "Supabase", "DB 스키마", "공공데이터" | `data-engineer` 에이전트 | 8 API · 폴백 · 마이그레이션 |
| "QA 해줘", "배포 전 점검", "Lighthouse", "린트 체크" | `qa-reviewer` 에이전트 | 배포 전 게이트 |
| "놓친 거 확인", "상시 점검", "stale 체크", "Vercel 한도 점검", "Cloudflare 차단 점검" | `reminder-watchman` 에이전트 | uncommit·타입·빌드·API·Vercel/CF 한도(주 2회) 상시 |
| "커밋 전 체크", "체크리스트 확인" | `.claude/skills/pre-commit-check/SKILL.md` | A~I 자동 검증 |
| "정책 스냅샷", "지원사업 갱신" | `.claude/skills/policy-snapshot-sync/SKILL.md` | drift 감지 |
| "API 확인", "환경변수 점검" | `.claude/skills/api-health-check/SKILL.md` | 8 API + env + Sentry |
| "배포 전 점검", "deploy preflight" | `.claude/skills/deploy-preflight/SKILL.md` | 전수 게이트 |

### 0-2. 회장 모드 (Chairman Mode)

**David = 회장**. 중간 조율·분배·에스컬레이션 1차 대응은 **chief-of-staff가 자체 완결**. David에게 올라가는 건:

1. **방향성 변경** — Phase 정의·스코프·기술 스택 근본 재정의
2. **되돌릴 수 없는 결정** — 배포, 도메인 구매, 외부 API 계약, DB 마이그레이션 적용
3. **파트 합의 불가** — CoS가 조율 실패 시 옵션 + 권고
4. **완료 보고** — Sprint 종료·Phase 완료
5. **위험 신호** — 빌드 실패 지속, 데이터 무결성 붕괴, 번아웃 패턴

그 외 전부 CoS 선에서 완결. David에게 "어떻게 할까요?" 대신 "이렇게 처리했습니다" 또는 "A/B/C 중 B 추천, 결재 부탁드립니다"로 변환.

**예외**: David가 명시적으로 특정 에이전트·작업을 직접 지시하면 CoS 경유 없이 진행.

### 0-3. 세션 시작 자동 체크

- `.reminder-flag.md` 존재 시 reminder-watchman 자동 호출 → 결과 출력 후 flag 삭제
- **열린 자동 감시 이슈 확인** (2026-08-29 추가): `gh issue list --state open` — 자동 이슈 라벨 8종(watchman·policy-check·cert-expiry·link-check·api-health·data-freshness·community-pending·region-integrity). CI 취합기(`report.sh`·`check-policy-sources.ts`)는 **열린 이슈가 있으면 새 이슈를 만들지 않으므로**, 해소된 이슈를 닫지 않으면 이후 finding이 로그에만 남는다(8/17 #115가 11일간 그랬음). 해소 확인 → 닫기 → 남은 항목만 보고

### 0-4. David_agit(기획 볼트) 연동 — 역할 분리 (2026-09-07 개정)

| 층 | 위치 | 담는 것 | 갱신 주체 |
|---|---|---|---|
| **전략층** | `/Users/igangseon/Desktop/David_agit/10.projects/이랑/` (허브 `이랑.md` + PRD·리서치·데이터소스·블로그초안 5개) | Phase 정의·Go/No-Go·Key Decisions·월 단위 Progress·리스크 | 볼트 CoS (월 1회 또는 Phase 전환 시) |
| **실행층** | 이 리포 (`CLAUDE.md` 규칙·`docs/harness-history.md` 작업 이력·`docs/`·`worklog/`·`.policy-snapshots/`) | 스프린트·ADR·데이터 정정·Lessons·QA | 리포 CoS (매 세션) |

- 볼트의 실행 문서 25건은 `_archive/`로 이관 (2026-09-07). 리포에서 볼트 실행 문서를 참조하지 말 것 — 리포가 SSOT
- **Phase 전환·Kill/Go 판단·성격 재정의**(토이→운영 등)가 발생하면 리포 CoS가 볼트 허브 `이랑.md` **§현황 스냅샷·§Key Decisions** 갱신을 제안. 그 외 코드 변경은 볼트에 반영하지 않음
- 기획 변경이 코드에 영향 → David_agit-CoS로부터 위임 요청 수신

### 0-5. 하네스 교훈 — 주제별 규칙

> 2026-05~10 변경 이력(경과·수치·원문)은 `docs/harness-history.md`. 여기엔 행동을 바꾸는 규칙만 둔다. 다른 섹션·`.claude/rules`·`.claude/agents`에 있는 규칙은 뺐다. 새 교훈은 이력에 행 추가, 규칙이면 여기에 한 줄.

**배포·릴리스**
- D1 release 병합 전 release 트리 = 지난 배포인지, 새 환경변수·인프라 파일(next.config·middleware·vercel.json·Worker)·마이그레이션 차이를 본다.
- D2 배포 뒤 CI(release)·E2E smoke·cf-purge 초록 + 운영 실측(주요 경로 200·h1 1·BAILOUT 수 배포 전과 동일). CLI 배포는 cf-purge·smoke 수동 dispatch.
- D3 초록 CI 는 배포 증거가 아니다 — 운영 커밋 해시로 확인(9/17 Git 연동 13시간 정지). 세션 시작 때 `gh run list --workflow=CI -L 3` 도 본다(main CI 실패 4일 방치).
- D4 Vercel 명령 칸은 길이에 막힌다 — 로직은 스크립트로, 배포 규칙을 바꾸면 그 경로를 미리보기에서 실제로 태운다.
- D5 Edge Function 은 리포 수정 ≠ 배포. `--no-verify-jwt` 배포 후 verify_jwt=false 확인. 순서: 마이그레이션 apply → 함수 배포 → push → dispatch 실측.
- D6 SQL 은 apply 전 현재 DB 값을 읽어 가드와 대조, apply 뒤 SET 값을 다시 읽는다.
- D7 시크릿은 파이프(`printf '%s'`)로만 옮기고 대화·CI 로그에 찍지 않는다. 등록 직후 실사용 경로로 실측(빈 값도 Success). 다시 볼 수 없는 시크릿은 용도별(CI 전용) 키로 나눈다.
- D8 CI 도구는 전부 devDependency(`npx <미설치>` 6분+). CI 지연·취소는 성공 run 과 스텝별 소요표를 나란히 본다.
- D9 QA GO·이전 작업의 허가는 배포 허가가 아니다 — 그 작업에 '배포' 지시가 있을 때만 release, 잘못 나가면 즉시 `vercel rollback` 후 보고(9/29).

**QA·실측**
- Q1 데이터 배포 완료 기준에 기능 QA(전체 E2E·안내 창 실측·axe·독립 qa-reviewer)를 넣는다 — 숫자 대조는 기능을 안 본다.
- Q2 QA 는 동결된 트리로: mtime·`BUILD_ID` 로 검증 대상을 확정, 검토 중 트리가 바뀌면 무효 → 동결·빌드 1회·재QA. 브리프 전제(건수·HEAD)도 검증한다.
- Q3 수정은 회귀를 만든다 — 1차 수정 뒤 독립 2차 QA, 브리프에 '코퍼스 밖 적대 입력 자체 생성'·반대 방향 검증.
- Q4 수치 게이트는 캡처와 한 번 대조. 등장 애니메이션·부드러운 스크롤이 끝난 뒤 잰다.
- Q5 히어로·헤더·랜딩 상시 항목: h1 elementFromPoint, 배경 밴드 평균 rgb 라이브 대조(z-index), 좌측 x 일치·열 높이 차, 간격 px 분해, 대비는 글자 영역의 최악 배경 픽셀.
- Q6 시각 결정은 라이브 DOM 에 CSS 만 입힌 시안(px 병기) 이미지로 회장 결재. 실기기 캡처가 뷰포트 실측을 이긴다. 레퍼런스는 '가져올 것/안 가져올 것'을 원칙에 대조(랜딩 준거 = 공공 포털).
- Q7 리다이렉트는 `curl -sIL` 로 최종 도착·홉 수·Location 까지. 새 쿼리 키·값은 `src/lib/search-params/normalize.ts` 를 같이 고치고 curl 실측(308 strip, 4회 재발).
- Q8 CSS 삭제·리팩토링 게이트는 computed style 지문 전/후 diff 뿐 — 같은 빌드 두 번 떠 노이즈 대조군.
- Q9 테스트는 실제 호출 경로를 import 하고, 알려진 버그 형태로 실패하는지 자기 검증한다. 검사기 범위 = 잡는 버그 범위.
- Q10 운영 측정엔 `page.route` 가로채기 금지, 무한 스크롤은 '늘 때까지 대기'. 모바일은 대상이 고정 바 뒤인지 먼저.
- Q11 로컬 검증 서버는 고유 포트 + `lsof` cwd, 대문자 URL 금지(ISR 캐시 오염), dev :3000 은 미들웨어 미동작 → 운영 빌드로 판정.
- Q12 상태형 방어(레이트리밋)·관측 도구는 라이브에서 걸리는지·대시보드 도착으로 검증(인메모리 카운터는 서버리스에서 무효).

**데이터 정합성·원문 대조**
- T1 같은 사실은 단일 출처(`policy-facts` 등) + 하드코딩 계약 테스트. 화면은 SSOT 하나만 읽는다.
- T2 정정은 `grep` 전수로 전 지면(가이드·비용·용어·SEO·JSON-LD·검색)에 전파 + 정정 이력(미전파 5회 재발).
- T3 '무엇의 숫자인지'까지 원문 대조. 출처 줄 ≠ 근거. 시계열은 단위 혼합(가구·명)부터, 비교 표는 양쪽 출처 있는 칸만, 정정 공지 숫자도 계산한다. 원문 grep 0건이면 HTML 엔티티 디코드 후 판정(정부24).
- T4 원천 집계 기준(총조사 = 주소지, 생산조사 = 경작지)을 먼저 본다. 분류는 통계·정부 기준, 엇갈리면 상위 기관 대표 통계 → 법령 → 통상.
- T5 정적 자료(순위 점수)도 원천 대조 — 수집 스크립트는 화면과 같은 lib 함수를 쓴다. 생성 파일은 손으로 고치지 않는다(템플릿 + 재현성 게이트).
- T6 대조 기준값은 캐시를 거치지 않는다. 전수 대조는 예열 후 낮은 동시성(대체값 캐시 오염). 새 대조 항목은 틀린 화면에 돌려 자기 검증. 보고는 '전체 N칸 중 대조 M칸'.
- T7 허용 오차는 '무엇의 오차인가'로 — 결정적 판정은 0 허용. 두 단위(구·시)가 섞인 표는 단위를 골라 평균·합계. 상위 값을 하위 화면에 보일 땐 범위를 이름으로('용인시 귀농').
- T8 외부 목록 API 는 최대 반환 건수부터(NEIS 1,000). 이름 매칭은 낱말 일치. 신설 구는 주소에 구 이름이 없다 → 법정 구역 판정 + 좌표 변환 기준값.
- T9 같은 연도·시점은 SSOT 하나 — 대체값은 원본과 같은 시점이어야 연도 표기 없이 쓴다.
- T10 캐시·타임아웃·폴백을 걷을 땐 가려져 있던 데이터를 먼저 원천 대조(작물 차트 16종). 모르는 값은 지어내지 않는다('뉴스'·미표시 > 주소 조각).
- T11 새 노출면(날짜·포스터·작물 연결)을 올릴 땐 원문 대조를 같이 한다.
- T12 같은 판정이 두 지면에 있으면 판정기를 공유. 기본값을 숨길 땐 점수·건수·필터·JSON-LD 까지. 표시 규칙은 필요한 데이터(수집 행)에만. 첫 쪽과 다음 쪽(서버 액션)은 같은 정렬 함수 + 동점 보조키.
- T13 데이터를 넓히면 그것을 나열하는 UI 가 무엇을 밀어내는지 본다(relatedCrops 55 → 원문 링크 4,051px).
- T14 '안 걸린다·0건'의 1차 분기: 데이터 부재 vs 메타데이터 부재 vs 상태 필터(마감).
- T15 연례 국비 사업에 한 시·군 한 해 창을 확정 일자로 넣지 않는다 → 9999 + `applicationCycle`. '상시'는 원문에 연중·수시가 있을 때만. '국비에 없다'는 시행지침서 목차 전수로.
- T16 다작물 통계표는 항목 ID 로 읽고, 연 1회 공표 숫자는 수집 때 대조해 정적 고정.
- T17 합산·추이·수집 산출은 하나라도 실패하면 결과를 내지 않는다(null·쓰기 중단, 0 기록 금지), 부분 결과는 짧게만 캐시 — 덜 센 합은 0건보다 늦게 발견된다(10/7~10/12 반복).
- T18 행정구역 개편은 원천 코드부터 바뀐다 — 코드는 응답 지역명으로 확인, 행정동 묶음은 '생기는 쪽을 나머지로' 정의, 원천 미반영 경계 조정은 '있으면만' 옮기고 꺼지면 대조가 경보.

**수집기·외부 API**
- C1 '성공·0건'은 실패 — 원천 총건수와 대조, 원천 실패·2xx 외는 ok:false.
- C2 날짜는 KST 하나로(06:00 KST 스케줄 = UTC 전날). 날짜 모르는 수집 행은 지어내지도 9999 로 보류하지도 말고 미적재(큐레이션 행의 9999 페어와 별개).
- C3 배치 upsert 전 배치 내 중복 키 dedupe.
- C4 수집기를 만들기 전 통합 소스(국가 플랫폼 JSON)부터 찾고, 새 소스 전 기존 값 정규화 버그부터.
- C5 진단은 오류 코드 대조군을 로컬에서 먼저(키 오류·파라미터 vs 위장 차단). 확정자는 서버 로그 본문, 로그 없음 ≠ 미실행.
- C6 헬스체크는 본문까지 — 오류를 200 으로 주는 API(KOSIS), 4xx 를 '생존'으로 통과시키면 키 부패를 못 본다. GH 시크릿 ↔ 로컬 키 갈라짐도 본다.
- C7 느린 upstream 은 사용자 경로에서 빼고(예열·전역 캐시) 캐시만 읽게. '느리다'는 탭·조합별 curl 매트릭스부터.
- C8 무료 한도는 초과 시 동작까지 설계 — 캐시 쓰기는 best-effort, 예열·대조 빈도는 한도 여유 안.

**감시(watchman·CI)**
- W1 워크플로·감시 스크립트를 만들거나 고치면 그날 `workflow_dispatch` 1회(또는 로컬 스모크) — 따옴표 경계 실수는 `bash -n` 도 통과한다.
- W2 감시 규칙을 자기 출력(이슈 열림/닫힘)에 묶지 않는다 — 실행 스텝 같은 규칙 밖 사실에 묶는다(3회 진동).
- W3 0건 경보는 GA 이벤트와 DB 적재를 같은 날짜 축에 놓아 '끊김/미사용'을 가른다. 판정은 최신 실행 기준, 플래핑만 🟡.
- W4 헬스 실패는 '미국 러너에서만인가'부터(지역·밤 시간대). 만성 지역 실패는 URL 단위 경고, 한국에서도 실패만 실패. job 한도 실패는 시간 예산으로 부분 결과.
- W5 운영 브랜치·배포 구조를 바꾸면 그것을 보는 감시도 옮긴다.
- W6 셸·YAML: `bash -e` 외부 호출 대입은 `|| true`, 다중행 목록은 히어독, `run:` 다중행 문자열은 printf, 사람용 인용은 ‘ ’, 이슈 본문은 `--body-file`.
- W7 concurrency 그룹 값이 실제로 무엇인지 본다(deployment_status `github.ref` 는 빈 값). 워크플로 concurrency 는 job `if` 보다 먼저 적용된다.
- W8 해소된 경보는 실패 0건이면 자동 종료하게 만든다. 푸시 검증은 회귀를 실제로 잡아 온 것만(CI 도 인프라 한도를 먹는다).

**인프라(CF·Vercel)**
- I1 같은 정책이 두 계층(미들웨어·CF Worker)에 있으면 예외는 쌍으로, 목록은 계약 테스트로 묶는다.
- I2 '어느 계층이 응답했나'부터 — CF origin status 0 = 오리진 미도달, vercel.app 401 = Vercel Auth. 권한 진단은 같은 토큰 다른 쿼리로 확정.
- I3 해외 허용 변경의 증거는 한국 출발 전/후(미국 러너는 WAF 가 먼저 막는다). CF 룰은 추가·수정 뒤 매칭을 실측한다.
- I4 엣지가 끼워 넣는 것은 리포 검색으로 안 보인다 — 운영 HTML 을 브라우저 헤더로 받아 본다.

**검색**
- S1 매칭 규칙(어간·접두 분리·키워드 역포함)은 최소 2자. 작물·지역 이름은 조사 제거·분리 금지. 행정구역 이름은 지역·센터 항목에서만 낱말 첫머리(구 별칭·광역시/특례시 등 종류어 예외, FAQ 는 포함 일치), 일상어 구 이름 줄기는 문맥어 명시 목록으로.
- S2 검색 규칙 변경은 HEAD 워크트리와 질의 전체(이름·FAQ·적대 코퍼스·실제 로그) 전/후 diff.
- S3 정당·적대 양방향 코퍼스로 고정, 판정 사전은 명시 목록(열린 '아는 말' 판정 금지). 새 오탐은 `search-adversarial-corpus.ts` 에.
- S4 자동 대체는 폐쇄 허용목록(품종 수식어·지역명 접두)만. 대안 하나면 바로 보여주고 한 줄 안내, 로그는 원 검색어로.
- S5 특정어가 있으면 일반어만 맞은 항목은 뺀다. 관련도 하한선은 정확 일치가 있을 때만. 섹션 순서는 첫 등장 순.
- S6 '무관한 결과'는 결과마다 매칭 필드를 찍어 진단한다. 0건 검색어는 오타 / 없는 작물 / 붙여 쓰기로 갈라 처리하고, '제안이 안 뜬다'는 서버 함수가 아니라 화면(클라이언트 자모 보정 포함)으로 판단한다.

**프론트엔드**
- F1 `"use client"` 모듈은 컴포넌트만 export(상수·CSS 객체는 서버에서 프록시 → undefined). SSR 실측에 'class 없는 `<a>` 0건'.
- F2 숨긴 탭 패널도 렌더하고 `hidden` 으로만(SSR 링크 보존). URL 상태는 서버 prop 으로.
- F3 sticky 단위는 뷰포트 안 크기로, 첫 형제가 sticky 면 뒤 형제가 파고든다. 게이트: 700·900 뷰포트 전수 스크롤.
- F4 grid/flex 자식 스크롤은 부모 `min-width:0`, 고정 높이 flex 의 절대 크기 요소는 `flex-shrink:0`, 래퍼는 부모 gap 을 끊는다, `min-height` 로는 자식 100% 가 안 풀린다, '중앙'은 시각 묶음 중심.
- F5 재사용 컴포넌트에 원 페이지 전용 폭·정렬이 따라오는지 본다. 좁은 열엔 container query.
- F6 공유 선택자 CSS 를 정규식으로 지우지 않는다. 청크 순서로 특이성이 뒤집히면 `:where()`.
- F7 클라이언트 렌더 중 `new Date()` 금지 → `useKstToday(asOf)`, 포맷은 `ko-KR` 명시.
- F8 활성 탭 판정에 `intersectionRatio` 금지 → `scroll-margin-top` 뺀 위치.
- F9 WebKit: 상시 tabindex 금지(클릭 포커스가 조상으로), stretch+margin aspect-ratio 상자는 폭 직접 지정. 포커스·비율 변경은 WebKit 데스크탑+아이폰으로. 로컬 http WebKit 은 문서 응답의 upgrade-insecure-requests 를 빼야 CSS·JS 가 로드된다(bypassCSP 로 안 풀림).
- F10 문서 키 핸들러는 수식키·모달·다른 핸들러 가드 + capture. 상태 변경 컨트롤은 '고름'에 반응, hover 정지는 타이머까지.
- F11 구분이 필요해도 브랜드 밖 hue 금지(밀도 + 텍스트). 시각 이슈는 데이터에 그 차원이 있는지부터.
- F12 한 서비스는 한 이름 — 개명 시 GNB·타일·title·breadcrumb·업데이트 소식까지 grep 전수.
- F13 외부 링크는 `noopener` + `referrerPolicy="origin"`(noreferrer 금지), href 는 http(s) 가드.
- F14 CSP 위반은 CSP 를 넓혀 풀지 않는다 — https 승격(upgrade-insecure-requests)·주입 스크립트 제거로. 외부 이미지 remotePatterns 는 파일 단위·쿼리 금지.
- F15 서버 코드에서 fs 로 public/ 을 읽지 않는다(함수 번들에 추적, 20MB) — 자산 실존은 CI 검사(H-1·H-2)로.
- F16 링크는 `@/components/ui/app-link`(미리 받기 기본 끔) — `next/link` 직접 import 는 린트가 막는다. 열람 1회에 미리 받기 17~34건이 동적 화면 함수를 돌려 CPU 의 2/3 였다(10/26). 꼭 미리 받을 링크만 `prefetch` 명시.

**계측·SEO·판단**
- M1 리다이렉트 전용 페이지를 퍼널 분모로 쓰지 않는다 — 0 이면 그 URL 에 사람이 머무는지부터.
- M2 새 이벤트는 호출처 확인(죽은 이벤트). 클릭 계측은 `data-track` 위임, 라벨 유지로 전/후 비교.
- M3 섹션 존치는 도달→클릭 표로. 저트래픽 IA 는 회장 판단 + 사실 대조. 되돌림·판정 기준은 착수 때 정하고 판정일에 숫자·기준·추천을 한 번에 올린다.
- M4 검색 결과 문구는 사람들이 치는 말로, 약속한 내용·공공 출처 숫자만. 판독은 배포 4주 뒤.

**협업·git**
- K1 병렬 sub-agent: 파일 경계 명시, 빌드는 CoS 1회, dev 서버 공유·포트 지정 종료(`pkill` 광역 금지), `git stash` 금지(워크트리), 자산 '삭제 금지' 명시, 임시 파일은 `_`-prefix 만 삭제.
- K2 조사 sub-agent 는 수정 금지로 받고 CoS 가 원문 대조 후 일괄 적용, 보고는 grep 검증. 생성 막힘·10분 무진행은 SendMessage 로 짧게 재개.
- K3 커밋은 add 뒤 `&&` 로만, 전에 `git diff --stat`. 긴 편집은 파일로 쓰고 실행(heredoc 따옴표).
- K4 재현이 안 되면 회장에게 정확한 경로·입력을 묻는다(배추→고구마).
- K5 zsh: 변수 뒤 콜론은 `${VAR}:`, 함수 안 `path` 변수명 금지(PATH 덮음), `$VAR` 는 단어 분리 안 됨 → `--pathspec-from-file`.

---

## 기존 프로젝트 개발 규칙 (이하 원본 유지)


## 프로젝트 개요

- **서비스명**: 이랑 (irang) — 귀농 정보 큐레이션 포탈
- **브랜드**: 밭고랑(농업 본질) + "함께 이랑" 중의적 의미
- **타겟**: 귀농을 고려하는 3040 도시 직장인
- **기술 스택**: Next.js 16 (App Router) + TypeScript + CSS Modules + lucide-react
- **배포**: Vercel (`irangfarm.com`)
- **코드 저장소**: `~/Workspace/irang/`
- **볼트 문서**: `/Users/igangseon/Desktop/David_agit/10.projects/이랑/` — 허브 `이랑.md`(전략층: Phase 판단·Go/No-Go·회고)만 활성. 실행 문서(스프린트·ADR·QA·데이터)는 이 리포가 SSOT

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── page.tsx            # 랜딩 페이지 (ISR 1h)
│   ├── regions/            # 지역 정보 (시도 → 시군구)
│   ├── crops/              # 작물 정보 + 비교
│   ├── education/          # 귀농 교육
│   ├── events/             # 체험 행사
│   ├── programs/           # 지원사업 + 로드맵
│   ├── interviews/         # 귀농인 인터뷰
│   ├── stats/              # 통계 (인구·청년·만족도)
│   ├── costs/              # 비용 가이드
│   ├── assess/             # 유형 진단
│   ├── match/              # 매칭 결과
│   ├── search/             # 통합 검색
│   ├── glossary/           # 용어 사전
│   └── api/                # Route Handlers (프록시)
├── components/
│   ├── ui/                 # 공통 UI (PageHeader, Badge, Modal …)
│   ├── filter/             # FilterBar 계열
│   ├── landing/            # 랜딩 전용 (CostSection, NewsTabs …)
│   ├── charts/             # Recharts 래퍼
│   ├── map/                # SVG 지도
│   └── layout/             # Header, Footer, Nav
├── lib/
│   ├── api/                # 외부 API 연동 (8개)
│   ├── data/               # 정적 데이터 (폴백 포함)
│   ├── og/                 # OG 이미지 공용 모듈
│   └── hooks/              # 커스텀 훅
└── types/                  # 공유 타입 정의
scripts/                    # 유틸리티 스크립트
supabase/                   # Supabase 마이그레이션
```

---

## 데이터 조회 원칙

- 공공데이터 API 호출 시 **항상 당해년도 기준**으로 조회한다.
- 연도를 하드코딩하지 않고 `new Date().getFullYear()`로 동적 산출한다.
- 예시: 2026년에 실행하면 startDt=20260101, endDt=20261231

### 행정구역명 SSOT (2026-05-22)

- **PROVINCES.name (`src/lib/data/regions.ts`) = 행정구역명 SSOT**. 17개 시·도 명칭을 다른 데이터 파일에서 인용할 때 1byte도 다르면 안 된다.
- **구표기 유지**: "강원도" / "전라북도" (신표기 "강원특별자치도" / "전북특별자치도" 사용 금지). 신표기로 검색·매칭 시 join key 불일치 → 작물 추천·지원사업 region 필터·인터뷰 region link 통째 누락.
- **적용 대상**: `crops.ts`의 `CROP_DETAILS.majorRegions`, `programs.ts`의 `region`, `sigungus.ts`의 sido 참조, 인터뷰 정의 등 PROVINCES.name 인용처 전부.
- **자동 검증**: CI에서 `npx tsx scripts/check-cross-reference.ts` 실행 → A-1 fail 시 build 차단.
- **사고 사례**: 5/22 D1 진단 — 강원 6건·전북 2건 신표기로 작성 → 강원·전북 36개 시군구 페이지에서 무·토마토·대파·체리·표고·복분자·인삼·메밀 작물 추천 누락 (D2 정규화 완료).

## 환경변수 & 외부 API

API 키는 `.env.local`에서 관리한다. Vercel 환경변수에도 동일하게 설정.

| 환경변수 | 용도 | API 파일 | 폴백 |
|---------|------|----------|------|
| `DATA_GO_KR_API_KEY` | data.go.kr 공통 (기상청·심평원·교육부) | `weather.ts`, `hira.ts`, `education.ts` | 정적 데이터 |
| `DATA_GO_KR_PROXY_URL` / `DATA_GO_KR_PROXY_SECRET` | data.go.kr 프록시(CF Worker `workers/datagokr-proxy`, 8/30) — 있으면 기상청·심평원 호출을 Worker로 우회. 로컬은 미설정(직접 호출) | `_datagokr.ts` | 미설정 시 직접 호출 |
| `KOSIS_API_KEY` | 통계청 KOSIS (인구·귀농 통계) | `kosis.ts` | `POPULATION_FALLBACK` |
| `NAVER_CLIENT_ID` / `SECRET` | 네이버 뉴스 검색 | `news.ts` | `landing.ts` 정적 뉴스 |
| `NEIS_API_KEY` | 교육부 NEIS (학교 목록) | Route Handler | 빈 리스트 |
| `RDA_API_KEY` | 농진청 (작물 상세) | `rda.ts` | `crops.ts` 정적 |
| `SGIS_KEY` / `SECRET` | 통계청 SGIS (인구 밀도) | `sgis.ts` | `population.ts` 정적 |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Supabase (북마크·진단) | `supabase.ts` | 로컬 스토리지 |

---

## 코드 컨벤션

### CSS / 스타일링

- **CSS Modules 전용** (`.module.css`). Tailwind 클래스 직접 사용 금지.
- CSS 변수 체계: `--primary (#1B6B5A)`, `--foreground`, `--muted-foreground`, `--border`, `--card`, `--muted` 등
- 다크모드 미지원 (의도적 제거 완료). 다크모드 관련 코드 추가 금지.
- 모바일 퍼스트 반응형: `640px → 768px → 1024px → 1280px`
- hover 스타일은 `@media (hover: hover)` 래핑 필수
- `focus-visible` outline 필수 (키보드 접근성)
- 컬러 믹싱: `color-mix(in srgb, var(--primary) N%, transparent)` 패턴 사용
- **sticky 오프셋**: `position: sticky` 요소의 `top`은 `var(--sticky-top)`(헤더 보임 56px / 숨김 0, `html[data-header-hidden]` 연동) 기준으로만. **모바일(<768)은 헤더·SectionNav 가 한 덩어리로 움직인다** — 아래로 스크롤 시 둘 다 숨고(`html[data-header-hidden]` → 탭 `translateY(-100%)`, `--sticky-extra` 0), 위로 스크롤 시 둘 다 복귀. 그리고 **스냅-투-탑**(header.tsx): 위로 향한 스크롤이 y<120 에서 멈추면 0 으로 붙인다. 9/2 회장 iOS Chrome 3연속 리포트의 본질: iOS Chrome 은 위로 올릴 때 주소창을 펴며 그 높이(≈헤더+탭 101px)만큼 스크롤을 흡수해 "최상단처럼 보이지만 101px 남은" 지점에 멈춘다 — 그 지점에선 sticky 바는 제목을 덮고, 바를 흐름에 두면 바가 안 보인다(둘 다 겪음). 스냅으로 0 에 붙여야 바와 제목이 모두 보인다. **겹치면 안 되는 인접 요소는 같은 방식으로 움직여야 한다**(헤더만 sticky·탭만 흐름 → y 0~56 에서 헤더가 탭을 덮는 2차 사고). 데스크탑은 스냅 없음. 포커스·앵커 스크롤용 `scroll-margin-top` 은 `--sticky-top` 이 아니라 **`--h-header` 상수** 기준 — 위로 스크롤되는 순간 헤더가 다시 나타나 스택이 커진다. SectionNav 아래 콘텐츠는 레이아웃이 `--sticky-extra`(= `--h-section-nav` 44px)를 얹으므로 `calc(var(--sticky-top) + var(--sticky-extra, 0px) + 여백)`. `top: 56px`/`60px` 하드코딩 금지 — 8/30 헤더가 스크롤 업으로 돌아올 때 탭바가 가려진 사고
- **한국어 줄바꿈**: `word-break: keep-all` 글로벌 적용 (globals.css). 문장 중간 끊김 방지. 개별 컴포넌트에서 `word-break: break-all` 사용 금지.
- **제목 줄바꿈**: h1~h6에 `text-wrap: balance` 글로벌 적용. 좌우 균등 줄바꿈.

### 컴포넌트

- Server Component 기본. 인터랙션 필요 시에만 `"use client"` 사용.
- SSR 안전: 클라이언트 컴포넌트에서 `useState` + `useEffect` 패턴으로 `mounted` 플래그 사용 (localStorage 등)
- 아이콘: lucide-react 전용. 크기는 `size` prop 사용 (14~20px 범위).
- 장식 요소에는 `aria-hidden="true"` + `pointer-events: none` 필수.

### 코드 배치 규칙 — 레이어 경계 (2026-09-04, FSD 단방향 의존 차용)

```
app (라우트·page·layout)  →  components (도메인 UI · ui 공용)  →  lib · hooks · types
```

- **의존은 위 화살표 방향으로만.** 역방향 import 는 `eslint.config.mjs` `no-restricted-imports` 가 error 로 차단 (components→app, lib/hooks/types→components·app, components/ui→components/<domain>).
- **"어디까지 재사용되는가"로 위치를 정한다** (카카오페이 FSD 사례의 bottom-up 기준):
  | 재사용 범위 | 위치 |
  |---|---|
  | 한 라우트에서만 | `src/app/<route>/` 에 colocate (Next 관례) |
  | 2개 이상 라우트 | `src/components/<도메인>/` — 도메인 디렉토리는 **복수형 단일 이름**(`crops`·`region`·`stats`…). `crop`/`crops` 같은 단·복수 병존 금지 |
  | 도메인 무관 UI | `src/components/ui/` |
  | UI 무관 로직·데이터·아이콘 | `src/lib/` (`lib/data`·`lib/api`·`lib/icons`…) |
- 라우트 밑 파일이 다른 라우트나 `components/` 에서 import 되기 시작하면 **그 순간 `components/` 또는 `lib/` 로 승격**한다. 승격 없이 `@/app/...` 을 import 하면 lint 가 막는다.
- `lib/data` 는 아이콘 컴포넌트 참조를 가질 수 있지만(lucide 와 동형) `components/` 에서 가져오면 안 된다 — 브랜드 아이콘은 `lib/icons/`.
- FSD 전면 전환(pages/widgets/features/entities 레이어)은 **비채택** — 1인+에이전트 팀·Next App Router `pages` 충돌·521파일 이동 비용 대비 효익 없음. 위 3계층 + lint 게이트가 실질 가치의 대부분.

### 실측·테스트 트래픽 격리 — 우리 활동은 집계에 남지 않는다 (2026-09-19)

> 9/17 GA4 활성 86명 중 70명이 세션 Playwright 실측(localhost)이었다. 5/10 검색 로그, 8/31 진단 결과 73%, 9/14 검색 48건에 이어 **네 번째** 자기 오염. 이번엔 사람 규칙이 아니라 게이트·계약 테스트·감시 3층으로 닫는다.

**판정 SSOT 2곳** — 새 규칙은 여기에만 추가한다.
- 클라이언트(GA): `src/lib/analytics-gate.ts` `irangGaGate` — `navigator.webdriver`(자동화) · UA `irang-e2e` · 호스트 ≠ `irangfarm.com`/`www` (로컬 `next start`·미리보기 alias) · `/admin` 경로 · localStorage/쿠키 `irang-internal=1` 이면 gtag 로드 자체를 생략
- 서버(DB): `src/lib/internal-traffic.ts` `internalSkipReason` — e2e(UA·`x-irang-e2e`) / internal(쿠키·`x-irang-internal`) / dev(NODE_ENV) → INSERT 건너뛰고 성공 응답

**write 호출처 규칙 (계약 테스트가 강제)**
- 브라우저에서 `/api/*` 에 POST 하는 모든 fetch 는 `headers: { …, ...internalRequestHeaders() }` — 자동화면 `x-irang-e2e`, 운영자 플래그면 `x-irang-internal` 이 실린다. 빠지면 `src/__tests__/internal-traffic-callsites.test.ts` 가 실패한다(호출처 자동 스캔).
- 새 write 엔드포인트는 첫 줄에서 `internalSkipReason(req)`(또는 재열람이 필요한 경로는 `isE2eRequest`)로 판정하고, skip 시 `{ ok: true, skipped: "<reason>" }` 로 **성공처럼** 응답한다. 호출처 UI 가 skipped 를 실패로 보이지 않게 한다(`request-modal` 패턴).

**실측 스크립트 규칙**
- Playwright 컨텍스트는 `scripts/diag-browser.mjs` `openContext()` 로 연다 — localStorage·쿠키·헤더 3중 표식 + 실제 Chrome UA. 로컬 `next start` 도 프로덕션 GA 를 로드하므로(NODE_ENV=production) **로컬 실측도 예외가 아니다**.
- 헬퍼를 안 써도 `navigator.webdriver`·호스트 게이트가 막지만, 그건 안전망이지 허가가 아니다.

**감시**: watchman-ci §17 `check-ga4-anomaly.mjs` — 판정일(2일 전) 사이트 외 호스트 활성 ≥ 1 → 🟡, 사이트 활성이 직전 7일 중앙값의 3배(+20명↑) → 🟡 + 해상도·도시·브라우저 서명. M7 판정용 `ga4-snapshot.mjs` 는 `hostName = irangfarm.com` 만 센다(과거 오염분은 GA 에서 못 지운다). 의심되면 `gh workflow run ga4-snapshot.yml -f diag=true -f days=N` 으로 일자×호스트×해상도를 바로 뽑는다.

### 공통 컴포넌트 (반드시 재사용)

> 아래 컴포넌트가 이미 존재한다. 새 페이지/기능 추가 시 반드시 이것을 사용하고, 절대 페이지별로 중복 구현하지 않는다.

#### FilterBar (`@/components/filter/filter-bar`)

- 리스트형 페이지의 필터 UI 공통 컴포넌트 (교육, 체험행사, 작물정보, 지원사업)
- 구성: `FilterBar` → `FilterRow` → `FilterGroup` / `FilterDivider` / `FilterActions`
- `FilterGroup`: Link 기반 pill 필터 (Server Component, JS 없이 동작)
- `FilterActions`: 검색 폼 + 토글(마감 포함 등) + 초기화 링크
- `buildFilterUrl()`: 필터 URL 빌더 헬퍼 (같은 모듈에서 export)
- **새 필터 추가 시**: `FilterGroup`에 `options` 배열과 `paramKey`만 전달

#### StatusBadge (`@/components/ui/status-badge`)

- 상태칩 공통 컴포넌트 (모집중/접수중 → 초록, 모집예정/접수예정 → 앰버, 마감 → 회색)
- 색상: 초록 `#059669`, 앰버 `#d97706`, 회색 `var(--muted-foreground)`
- CSS Modules `composes` 패턴 사용 (badge 기본 + 색상 변형)
- **모든 상태 표시에 이 컴포넌트 사용**. 인라인 상태 표시(dot+text 등) 금지.

#### DifficultyBadge (`@/components/ui/difficulty-badge`)

- 작물 재배 난이도 배지 공통 컴포넌트 (쉬움 → 초록, 보통 → 앰버, 어려움 → 레드)
- Props: `level`, `prefix?`("난이도 · " 접두어), `size?`("md" pill 기본 / "sm" 컴팩트 태그), `className?`
- 사용처: `/crops` 카드(CropPageCard), 재배 캘린더 확장 패널, `/costs` 비용 비교 표
- **난이도 색·크기 정의는 `difficulty-badge.module.css` 한 곳뿐**. 페이지별 `.difficultyBadge` 재정의·cross-file `composes` 금지.

#### PageHeader (`@/components/ui/page-header`)

- 리스트형 페이지 상단 헤더 공통 컴포넌트
- Props: `icon`, `label`, `title`, `description`, `count?`, `periodLabel?`
- 건수(`count`)와 기준월(`periodLabel`)은 선택 — 필요 시만 전달
- **페이지마다 `.pageHeader`, `.headerTop`, `.headerTitle` 등을 새로 정의하지 않는다**

#### EmptyState (`@/components/ui/empty-state`)

- 빈 상태(결과 없음) UI 공통 컴포넌트
- Props: `icon`, `message`, `linkHref?`, `linkText?`
- **페이지마다 `.emptyState`, `.emptyStateIcon`, `.emptyStateText` 등을 새로 정의하지 않는다**

#### CardGrid (`@/components/ui/card-grid`)

- 반응형 카드 그리드 공통 컴포넌트: 1열(모바일) → 2열(640px) → 3열(1024px)
- Props: `children`, `className?` (추가 스타일 오버라이드 시)
- **페이지마다 `.grid` + 동일 미디어쿼리 3단계를 새로 정의하지 않는다**

#### ClimateSection (`@/components/stats/climate-section`)

- 기후 정보 섹션 공용 컴포넌트 (시/도, 시군구 상세 페이지에서 공유)
- 3단 카드 그리드 (기온, 강수량, 일조시간) + farming tip
- Props: `climate: ClimateInfo`, `provinceShortName`, `notice?` (하단 안내 문구)
- `ClimateInfo` 인터페이스도 이 파일에서 export — 다른 곳에서 중복 정의 금지
- **기후 관련 UI를 새로 만들지 않고 이 컴포넌트 사용**

#### Modal (`@/components/ui/modal`)

- 공용 모달 컴포넌트 (Portal 렌더링, ESC 닫기, 포커스 트랩, 스크롤 잠금)
- Props: `open`, `onClose`, `title`, `children`, `bodyVariant?`(flush), `mobileHeight?`(tall), `size?`("wide" → max-width min(1040px, 96vw), 8/30 재배 캘린더 12열용)
- z-index: 200, max-width: 640px(기본), max-height: 80vh
- **모달이 필요하면 반드시 이 컴포넌트 사용. 페이지별 모달 재구현 금지**

#### ConfirmDialog / useDialog (`@/components/ui/confirm-dialog`)

- 확인·알림 다이얼로그 공용 (2026-09-29 회장 결재 — "브라우저 팝업 대신 자체 alert, 모든 alert 은 공통으로"). 루트 layout 의 Provider 1회, 호출은 `const { confirm, alert } = useDialog()` → `await confirm({ title, description?, confirmLabel?, cancelLabel?, tone? })`(boolean) / `await alert({ title, description?, okLabel? })`.
- `window.confirm`·`window.alert`·`prompt` 는 **금지** — `eslint.config.mjs` `no-restricted-globals` 가 error 로 막는다(테스트 파일 예외). 공용 `Modal` 위에 얹어 포털·ESC·포커스 트랩·스크롤 잠금을 공유하고, 검색 모달 같은 다른 Modal 위에서도 열린다(z 상위).
- 관례: 열릴 때 **취소 버튼에 포커스**(파괴적 확인), Enter = **포커스된 버튼**(취소에 포커스면 취소, 9/29 QA) · Esc/백드롭 = 취소, 닫힌 뒤 트리거로 포커스 복귀(`preventScroll`). 카피는 "~할까요?" / "~예요"(copywriting.md). 사용처: 검색바 최근 검색어 삭제, 현장 이야기 신고.
- 다이얼로그는 `document.body` 포털(z 210)이라 DOM 상 항상 "바깥"이다 — `mousedown` 바깥 클릭으로 닫는 UI(검색바 드롭다운 등)는 `[data-irang-dialog]` 안 클릭을 건너뛴다(9/29 실측: 취소를 누르면 드롭다운이 통째로 닫히던 버그).

#### SelectCombobox (`@/components/ui/select-combobox`)

- 검색형 셀렉트 공통 컴포넌트 (2026-08-30). native `<select>` 사용 금지 — OS 기본 팝업이 떠 브랜드와 어긋나고 검색 불가.
- Props: `value`, `onChange`, `options[{ value, label, hint?, group?, disabled? }]`, `ariaLabel`, `placeholder?`, `searchable?: boolean | "auto"`(기본 auto = 옵션 ≥ 8), `size?: "sm" | "md"`, `matchKeys?`(검색 대상 추가 문자열)
- 항상 `document.body` 포털(카드 overflow·Modal z-index 200 위 300) + 트리거 좌표 기준 fixed 배치·플립·뷰포트 clamp. 키보드 ↑↓ Enter Esc Home/End, `role=combobox/listbox/option`, 모바일(hover:none)은 자동 포커스 안 함.
- 사용처: 지역 비교 시·군·구, 비용 시뮬레이터 작물, 요청 모달 카테고리. **새 선택 UI는 반드시 이 컴포넌트.**

#### RegionSearch (`@/components/region/region-search`)

- 지역 탐색 검색창 (2026-09-02). 빈 입력 = 좌 시·도 / 우 시·군·구 2단 트리(탭·hover 펼침, 이동은 "OO 전체 보기"·시·군·구 항목), 입력 시 시·도+시·군·구 평면 검색 → `/regions/{시도}[/{시군구}]` push.
- 키보드 ↑↓ · →/← 패널 전환 · Enter · Esc. `useSearchParams` 미사용. 지역 선택이 필요한 다른 화면에서 재사용(다중 선택은 compare의 `RegionCardsSelector`).

#### CommunityNotes (`@/components/community/community-notes`)

- 커뮤니티 1단계 "한 줄 의견" + 공감 (2026-09-02). Props: `targetType`("region"|"crop"|"program"), `targetId`(시군구는 `"시도/시군구"`), `targetLabel`(표시·LLM 분류용).
- 승인된 글만 노출(사전 승인제). GET 503(테이블 미적용·Supabase 미설정)이면 섹션을 렌더하지 않음. 사용자 생성 텍스트라 AutoGlossary 미적용.
- 서버: `src/lib/community/{filter,queries,types,ip-hash}.ts`, API `/api/community/notes[/id/like|report]`, admin `/admin/community`.

#### 메뉴 SSOT (`@/lib/data/navigation.ts`)

- GNB·모바일 하단 탭 '전체'(/more)·푸터 라벨의 **단일 메뉴 정의** (2026-09-06). `NAV_GROUPS`(5그룹: 탐색 → 비교·진단 → 준비 → 신청 → 참고자료, 21항목) + 파생 `NAV_ITEMS`·`deriveMorePaths`·`resolveActiveGroupId`(최장 basePath 1개만 활성)·`isNavItemActive`.
- 아이콘은 `iconName` 문자열만 두고 lucide 매핑은 `/more` 페이지 로컬 — lib이 components를 import하면 레이어 lint에 걸리고 헤더 번들에 아이콘이 유입된다.
- **메뉴 항목을 추가·이동·개명할 때 header.tsx·mobile-nav.tsx·more/page.tsx·footer.tsx를 각각 고치지 않는다.** 이 파일 하나만 바꾸고 `src/__tests__/navigation.test.ts`(20 href 전수·중복 0·라우트 실존·활성 배타성)를 통과시킨다. 모바일 하단 5탭 구성은 `mobile-nav.tsx`의 `tabs`가 별도(회장 결재 사항).

#### 드롭다운 공용 스타일 (`@/components/ui/dropdown.module.css`)

- 검색형 드롭다운의 시각 언어 SSOT (2026-09-04). 클래스: `searchWrap`·`searchIcon`·`searchInput`·`searchClearBtn`·`panel`·`hint`·`item`·`itemActive`·`itemIcon`·`itemLabel`·`itemType`·`empty`.
- 사용처: RegionSearch, `/regions/compare` 지역 카드·작물 적합도 셀렉터, `/crops/compare` 작물 셀렉터. 각 모듈은 `composes: item from "…/ui/dropdown.module.css"` **1단만** 쓰고(Turbopack composes 2단 한계), 크기(max-height·padding·gap)·`scroll-margin-top` 같은 페이지 맥락 값만 로컬에 둔다.
- 공용 파일 안에서는 서로 compose 하지 않는다. `SelectCombobox`(포털·토큰 체계)와 헤더 `SearchBar`(히어로 확장 모드)는 별개 체계라 통합 대상이 아니다.
- **새 드롭다운 UI는 이 파일을 compose 한다.** 패널·옵션 행·빈 상태를 페이지 CSS에 다시 쓰지 않는다.

#### useActiveOptionScroll (`@/lib/hooks/use-active-option-scroll`)

- 키보드로 listbox 하이라이트를 옮길 때 `[role="option"][aria-selected="true"]`를 스크롤 시야 안으로(첫 옵션은 컨테이너 최상단 → 힌트 노출). 커스텀 드롭다운에 키보드 내비를 넣으면 반드시 함께 쓴다 (SelectCombobox는 자체 구현).

#### formatPopulation / seoulAreaCompare (`@/lib/format`)

- `formatPopulation(pop)`: 인구수 → "123,456명" 정확한 숫자 포맷
- `seoulAreaCompare(area)`: 서울(605㎢)과 면적 비교 — 크면 "서울의 약 1.2배", 작으면 "서울 면적의 약 21%"(10/7: 작은 구가 '0.0배'로 보이던 것)
- **인구 포맷이나 서울 비교 로직을 인라인으로 재작성하지 않는다**

#### TermTooltip / GlossaryTerm / AutoGlossary (`@/components/ui/term-tooltip`, `auto-glossary`)

- **AutoGlossary**: 텍스트 내 107개 용어를 자동 감지하여 첫 등장 시 툴팁 변환 (서버 컴포넌트)
  - 용법: `<AutoGlossary text={person.story} />` — 텍스트를 넘기면 자동 스캔
  - `maxHighlights` prop으로 한 블록 내 최대 툴팁 수 제한 (기본 3)
  - 긴 용어 우선 매칭 (greedy), aliases 자동 감지, contextRequired 문맥 검사
- `GlossaryTerm`: 단일 용어 수동 툴팁 (`<GlossaryTerm term="ha" />`)
- `TermTooltip`: 커스텀 용어-설명 직접 전달
- 용어 데이터: `src/lib/data/glossary.ts` (107개 용어, 7개 카테고리)
- **⚠️ 필수 적용 규칙**: 아래 조건에 해당하는 텍스트에는 반드시 `<AutoGlossary>`를 적용한다:
  - 사용자가 읽는 본문 텍스트 (설명, 이야기, 조언, 후기 등)
  - 프로그램/교육 상세 설명
  - 작물 재배 정보, 지역 농업 설명
  - 인터뷰 story, motivation, challenge, advice 필드
- **적용 불필요**: 짧은 라벨, 버튼 텍스트, 숫자 위주 통계, 제목/헤딩
- **새 페이지 추가 시**: 농업 전문 용어가 포함될 수 있는 텍스트 블록이 있으면 `AutoGlossary`로 감싸는 것을 체크리스트에 포함한다

### 페이지 레이아웃 표준 (교육 페이지 기준)

> 리스트형 페이지(교육, 체험행사, 작물정보, 지원사업)는 아래 구조를 따른다.

```
<div className={s.page}>
  <PageHeader />       ← 공통 PageHeader 컴포넌트
  <FilterBar />        ← 공통 FilterBar 컴포넌트
  <div className={s.grid}>  ← 1열(모바일) → 2열(640px) → 3열(1024px)
    <Card /> ...
    {empty && <EmptyState />}  ← 공통 EmptyState 컴포넌트
  </div>
</div>
```

- 기준 페이지: `/education/page.tsx` — 새 리스트 페이지 추가 시 이 파일을 참조
- 카드 border-radius: `16~20px`, hover 시 `border-color` 변화 + 미세 `box-shadow`

### 데이터 아키텍처

- 정적 데이터: `src/lib/data/*.ts` (빌드 타임 소비)
- API 연동: `src/lib/api/*.ts` (런타임 + 정적 폴백)
- API 실패 시 반드시 정적 폴백 데이터로 전환 (`.catch(() => FALLBACK_DATA)`)
- **외부 API fetch 타임아웃 필수**: 모든 외부 API 호출에 `signal: AbortSignal.timeout(10_000)` 추가. 타임아웃 없으면 API 장애 시 Vercel 빌드 60초 제한 초과 → 배포 실패.
- **데이터 소스 병합 원칙**: Supabase/API에서 데이터를 가져올 때, 정적 데이터(`src/lib/data/*.ts`)에만 있는 항목도 병합해야 한다. DB에 없다고 프로덕션에서 누락되면 안 됨. `loadPrograms()` 패턴 참조.
- 데이터 수치(PROVINCES.length 등) 하드코딩 금지 → 배열 길이에서 동적 계산

---

## 카피라이팅 원칙

> 상세 규칙은 `.claude/rules/copywriting.md` 참조

**핵심 3줄 요약**: "~합니다" 금지 → "~세요/~예요" 사용. 서비스 주어 금지. 섹션 제목 10자 이내.

---

## 디자인 원칙

### 브랜드

- 메인 컬러: `#1B6B5A` (그린)
- 딥 그린 텍스트: `#0D2E27` (히어로 등 강조 영역)
- 폰트: Pretendard (weight 500~800)
- border-radius: 카드 20px, 버튼/인풋 12~16px, 칩/뱃지 20px (pill)

### 히어로 섹션

- 장식 요소(도트 패턴, 원형, 잎, 웨이브) 금지 — 타이포그래피로 승부
- 배경: earthy green 그래디언트 (`#EDF5F3 → white`)
- 검색바에 `drop-shadow`로 시각적 부각
- 인기 지역 바로가기 칩 + 데이터 신뢰 지표 스트립 배치

### 지도

- SVG 라벨 위치는 path centroid 기반 계산 (수동 보정 포함)
- 지도 옆 빈 공간에는 Quick Stats + 인기 키워드로 밀도 확보
- **인구밀도 Choropleth**: `densityMap` prop으로 밀도 데이터 전달 → CSS 변수 `--density-fill`로 색상 적용
  - 색상: primary 12%(연함) ~ 65%(진함), 로그 스케일 (`Math.log1p`)
  - 호버: `filter: brightness(0.88) saturate(1.3)` — 밀도 색상을 유지하면서 인터랙션 표시
  - 유틸리티: `@/lib/map-utils.ts` (`getDensityColor`, `getDensityRange`)
  - KoreaMap: 시/도 밀도 (POPULATION_FALLBACK + PROVINCES.area, API 불필요)
  - ProvinceMap: 시군구 밀도 (`fetchSubRegionPopulations` 1회 호출)

### 지역 상세 페이지 아키텍처

> 시/도(`RegionStats`)와 시군구(`SigunguStats`)는 동일한 패턴을 따른다.

```
[Server Component: page.tsx]
  ↓ API 병렬 호출 (Promise.allSettled)
  ↓ 결과를 props로 직렬화
[Client Component: *-stats.tsx]
  ↓ 클릭 가능한 Stat Cards (면적/인구/의료/학교)
  ↓ ClimateSection (공용 컴포넌트)
  ↓ 모달 (AreaModal, PopulationModal, MedicalModal, SchoolModal)
```

- **서버/클라이언트 경계**: 서버가 데이터 페칭, 클라이언트가 인터랙션(모달 상태) 담당
- **모달 데이터 레이지 로딩**: 모달 내 리스트(의료기관, 학교)는 모달 오픈 시 `/api/*` Route Handler 호출
- **API 프록시 패턴**: `/api/medical-list`, `/api/school-list`, `/api/population-trend` — 외부 API 키 보호 + 캐싱
- **시군구 폴백**: Phase 1(시군구 수준) 실패 → Phase 2(시/도 수준) 자동 전환
- **의료기관 정렬**: `TYPE_PRIORITY` (상급종합 → 보건진료소) 크기순 기본 정렬

---

## OG 이미지 컨벤션

### 디자인 방향

- 토스/네이버 스타일: 밝은 크림 배경 + 심볼 SVG + 나눔명조 워드마크
- 장식 요소(그래디언트, 아이콘 클러스터, 패턴 등) 금지 — 극도로 미니멀하게

### 파일 위치

- 각 라우트의 `opengraph-image.tsx` (Next.js 파일 컨벤션)
- 공통 모듈: `src/lib/og/constants.ts` (사이즈 상수), `src/lib/og/fonts.ts` (폰트 로딩)

### 폰트

- **나눔명조 ExtraBold (weight 800)** — `layout.tsx`의 `--font-logo`와 동일 폰트
- 로딩 방식: Google Fonts CSS API → woff URL 파싱 → `ArrayBuffer` 변환
- 서브셋: "이랑" 2글자 (`text=이랑`)

### Satori 제약 사항

| 제약 | 내용 |
|------|------|
| 지원 폰트 포맷 | woff만 지원 — woff2 미지원 |
| 레이아웃 | Flexbox만 지원 — CSS Grid 사용 불가 |
| `display` 필수 | 모든 `div`에 `display: "flex"` 명시 필수 |
| Pretendard 사용 불가 | COLR 테이블 포함으로 Satori에서 렌더링 실패 |

### 새 OG 이미지 추가 시

1. 기존 `opengraph-image.tsx` 4개 중 하나를 복사하여 시작한다.
2. 공통 심볼 SVG + 워드마크 레이아웃 구조를 유지한다.
3. `src/lib/og/fonts.ts`의 폰트 로딩 함수를 재사용한다 — 중복 구현 금지.

---

## David의 작업 철학 — 에이전트가 반드시 따를 것

> 아래는 David가 반복적으로 중시하는 판단 기준이다. 코드 변경, 디자인 결정, 데이터 처리 시 이 원칙을 우선 적용한다.

### 1. 데이터에는 반드시 근거가 있어야 한다

- 통계 수치를 표시할 때 **"왜 이런 결과인가"**에 대한 원인 분석을 함께 제공한다.
- 출처가 불분명한 데이터는 사용하지 않는다. 공식 보고서, 논문, 정부 통계만 인용한다.
- 데이터를 보여줄 때 단순 나열이 아닌 **유의미한 포인트를 시각적으로 강조**한다 (색상 차별화, 참조선, 인사이트 배지 등).
- **데이터를 바꾸는 배포는 운영 화면을 원천과 전수 대조해야 끝난다** (2026-10-07 회장 "정확한 데이터인지 항상 정합성을 체크 — 신뢰도가 생명"). 기준값은 우리 코드를 거치지 않고 원천 API에서 직접 만든다 — 같은 코드로 만든 기준은 같은 실수를 정답으로 삼는다. 코드 매핑(심평원·통계청·교육청 코드)은 '순서가 같을 것'으로 붙이지 않고 원천이 돌려주는 지역명으로 확인하고, 상위 합계 = 하위 합으로 교차 확인한다. 표본이 아니라 전수, 결과는 일치 / 캐시 시점 차이 / 불일치 / 대체값으로 나눠 보고한다. 지역 통계는 `npx tsx scripts/check-region-stats-integrity.ts`(한국 회선).

### 2. 차트/시각화는 다양하고 인터랙티브하게

- 같은 유형의 차트를 반복하지 않는다. 데이터 성격에 맞는 차트를 선택한다:
  - 시계열 추이 → Area/Line
  - 비율 비교 → Bar + 추세선 혼합
  - 분포 → 도넛/파이
  - 요인 순위 → 수평 Bar (상위 N개 강조)
- **유의미 데이터 강조**: 평균 이상은 진한 색, 미만은 `opacity` 낮춤. 핵심 연도/포인트에 glow, 큰 dot 등 시각적 차별.
- 호버 툴팁, 마운트 애니메이션 등 인터랙션은 기본 포함.

### 3. 모바일은 "축소판"이 아니라 "다른 레이아웃"

- 데스크탑 레이아웃을 단순 축소하면 깨진다. 모바일은 별도의 레이아웃으로 설계한다.
- 테이블 → 모바일에서 Stacked Card 전환 (`@media (max-width)` + `grid-template-areas`).
- **모바일 스타일은 `@media (max-width)` 블록 안에 격리**한다. 기본값(데스크탑)을 건드리지 않아야 데스크탑이 깨지지 않는다.
- `::before` pseudo-element로 모바일 전용 라벨 주입 시, 데스크탑에서는 `display: none` 필수.

### 4. 변경 전에 반드시 기존 구현 확인

- 코드를 추가/변경하기 전에 해당 기능이 **이미 구현되어 있는지** 먼저 확인한다.
- 중복 구현을 방지하고, 기존 코드와 일관성을 유지한다.
- CSS 변경 시 `composes` 관계, 미디어쿼리 중첩, CSS 변수 참조를 반드시 파악한 후 수정한다.

### 5. 에이전트 협업 활용

- 디자인 결정이 필요하면 **UX 에이전트 + 프론트엔드 에이전트를 함께 호출**하여 다각도 검토 후 최선안을 선택한다.
- 대안을 3가지 이상 비교한 뒤 장단점 테이블로 정리, PM(David)이 판단할 수 있도록 한다.
- 결정 후에는 즉시 실행. 단계적 접근(hotfix 먼저 → 정식 구현)을 선호한다.

### 6. 외부 라이브러리는 신중하게, 쓸 때는 제대로

- 의존성 추가 전 프로젝트 기존 의존성 수를 확인한다 (현재 매우 적은 편).
- 라이브러리를 도입하면 **래퍼 컴포넌트로 감싸서** 브랜드 스타일과 통합한다 (예: Recharts → 커스텀 툴팁, 브랜드 컬러).
- 라이브러리의 React/Next.js 버전 호환성을 반드시 확인한다.

### 7. 빌드는 매 변경마다 검증

- 코드 변경 후 반드시 `npm run build`로 검증한다. 0 에러가 확인되어야 완료.
- TypeScript 타입 에러, CSS Module 참조 누락, 미사용 import를 빌드로 잡는다.

### 8. 외부 URL 검증은 삼중 체크 필수

- `sourceUrl`, `url` 등 외부 링크를 데이터에 추가/변경할 때 반드시 **삼중 검증**한다:
  1. **HTTP 상태코드 확인**: `curl -sL -o /dev/null -w "%{http_code}" URL`
  2. **페이지 타이틀 확인**: `curl -sL URL | sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p'`
  3. **비정상 타이틀 탐지**: 아래 키워드가 타이틀에 포함되면 비정상 URL로 판정
- **비정상 타이틀 키워드**:
  - 소프트 404: `찾을 수 없`, `not found`, `404`, `에러`, `존재하지`, `서비스를 찾`, `오류`, `접근할 수 없`
  - 도메인 파킹/판매: `GoDaddy`, `for sale`, `domain`, `buy this`, `Sedo`, `Afternic`, `파킹`, `판매 중`
  - 차단/점검: `접근이 제한`, `차단`, `점검 중`, `maintenance`
- **도메인 파킹 패턴**: 만료된 도메인은 GoDaddy/Sedo 등의 "도메인 판매" 페이지로 전환되며, **HTTP 200을 정상 반환**한다. `returnfarm.com` 실제 사례 참조. 상태코드만으로 절대 판단 금지.
- **소프트 404 패턴**: 한국 정부/공공 사이트(gov.kr, go.kr 등)는 페이지가 삭제되어도 HTTP 200을 반환하면서 실제 화면에 "서비스를 찾을 수 없습니다" 등을 표시하는 경우가 흔하다.
- **한국 뉴스 사이트 주의**: HEAD 요청 시 404/403/405를 반환하지만, GET 요청으로는 정상 콘텐츠를 서빙하는 경우가 많다. 반드시 GET으로 검증한다.
- **도메인 변경 감지**: 리다이렉트(`curl -sL -w "%{url_effective}"`)로 최종 도메인이 바뀌면 canonical URL로 교체한다.
- **LLM 생성 URL은 무조건 검증**: AI가 생성한 외부 URL은 학습 시점 기준이므로 현재 유효하지 않을 가능성이 높다. 특히 한국 정부/공공기관은 도메인 통합 이전이 잦다.
- 데이터 일괄 교체 시에는 전체 URL 전수조사를 실시한다.

### 9. 반복 문제 방지 — 코드 작성 전 체크리스트

> 상세 체크리스트(A~I)는 `.claude/rules/checklist.md` 참조

**핵심 3줄 요약**: 공통 컴포넌트 재사용 필수. 인라인 스타일·CSS 복붙 금지. Server↔Client 경계 준수.

### 10. 검증 가능한 성공 기준 (Goal-Driven Execution)

> Andrej Karpathy의 LLM 코딩 함정 가이드(110K stars)에서 차용. 우리 프로젝트에 부족했던 부분.

**원칙**: "고치다/추가하다" 같은 모호한 목표를 **검증 가능한 verify check**로 변환하고 그 체크가 통과할 때까지 루프한다.

#### 변환 예시

| ❌ 모호한 목표 | ✅ 검증 가능한 목표 |
|--------------|------------------|
| "버그 수정" | "버그를 재현하는 테스트 작성 → 그 테스트가 통과하면 완료" |
| "검색 빠르게" | "응답 시간 500ms → 100ms 이하 측정 → 달성하면 완료" |
| "비용 페이지 정정" | "삭제된 항목이 list에 안 보임 + 새 deep URL 클릭 시 정확한 페이지" |
| "모달 잘림 fix" | "iPhone Safari로 페이지 스크롤 후 모달 열기 → 헤더 안 잘림" |
| "추천 페르소나 추가" | "youth 답변 → /regions/ranking?persona=farmYouth deep link 작동" |

#### 다단계 작업 plan 형식

작업이 3단계 이상이면 plan을 **step + verify** 쌍으로 작성:

```
Phase A: 모바일 UX fix
  1. 모달 vh → dvh 변경 → verify: 페이지 스크롤 후 모달 열기 (iOS Safari) — 안 잘림
  2. lint 에러 fix     → verify: npx eslint <file> exit 0
  3. 다른 모달 사용처   → verify: 동일 컴포넌트 재사용이라 자동 적용됨 (코드 수정 0)
```

#### 강한 verify check의 조건

1. **객관적**: 사람이 보지 않아도 자동/즉각 확인 가능 (lint exit code, 빌드 에러 0, curl 200)
2. **재현 가능**: 같은 환경에서 같은 결과
3. **goal과 일치**: "동작한다"가 아닌 "이 시나리오에서 이 결과"

#### 약한 plan은 끝없는 clarification을 부르고, 강한 plan은 자체 완결을 가능케 한다.

---

## 빌드 & 배포

### 빌드 검증 SOP (반드시 준수)

1. **`npm run build` 1회만 실행**. 마지막 출력 라인이 prerendered/SSG/Dynamic 마커이면 빌드 성공이다. 재실행 금지.
2. **빌드 결과 파싱은 `tail -3`로 끝**. `grep error`, `tail -50` 등 추가 파싱은 빌드 실패가 명확할 때만.
3. **runtime API timeout 경고는 빌드 에러 아님** (정적 폴백 정상 동작). 무시.

### 배포 검증 SOP

`git push` 후 한 번의 명령으로 배포 상태 확인:

```bash
DEP_ID=$(gh api repos/KangseonLEE/irang/deployments --jq '.[0].id'); \
gh api repos/KangseonLEE/irang/deployments/$DEP_ID/statuses --jq '.[0] | "\(.state) | \(.description)"'
```

- **leading sleep 사용 금지** — harness가 차단함. 첫 호출이 `pending`이면 `until` 루프 또는 `run_in_background`로 우회.
- 결과를 ✅/❌ 이모지와 함께 1줄로 보고하고 즉시 다음 단계로 이동.
- **stuck 신호**: 빌드/배포 검증에 5분 초과 → 즉시 다음 단계로 진행하고 사용자에게 진행 상황만 보고.

### 기타

- SGIS API 관련 경고는 정상 (Dynamic route fallback)
- 커밋 후 `git push origin main` → 미리보기 배포만 된다. 운영은 회장이 그 작업에 "배포"를 지시한 뒤 `release` 브랜치로 옮긴다(9/29 분리, `git commit-tree "origin/main^{tree}" -p origin/release -p origin/main` 병합 — 트리 = main, 강제 푸시 없음)
- **DB 큐레이션 행(SP·ED·evt)을 SQL 로 고친 뒤에는 재빌드한다** — 지원사업·교육·행사 상세는 `generateStaticParams` 로 빌드 때 HTML 을 만들어 두므로 SQL 만으로는 화면이 안 바뀐다(지원사업은 하루 뒤, 교육·행사는 다음 배포까지 예전 값). Vercel 대시보드 → 최신 Production 배포 → **Redeploy**(또는 다음 운영 배포). 같은 커밋 재배포는 빌드 생략 규칙(`scripts/vercel-ignore-build.sh`, vercel.json ignoreCommand 가 호출)의 예외라 빌드된다(10/7). **빌드 명령이 데이터 캐시(`.next/cache/fetch-cache`)를 먼저 지운다**(10/8) — Vercel 은 직전 빌드 캐시를 복원하는데 그 안에 옛 Supabase 응답이 있어 새 빌드도 옛 값으로 굳었다. 'Use existing Build Cache' 는 그대로 둬도 된다. 확인은 배포 로그의 `rm -rf .next/cache/fetch-cache` 줄 + 상세 본문, 지원사업 상세는 다음 날(24시간 ISR) 한 번 더. 수집 행(crawl-*)은 동적 렌더라 바로 반영
- 커밋 메시지 접두사: `feat:`, `fix:`, `style:`, `copy:`, `redesign:`, `refactor:`

### Scripts

| 명령 | 스크립트 | 설명 |
|------|---------|------|
| `npm run check-links` | `scripts/check-links.sh` | 전체 외부 URL 유효성 검사 (HTTP 상태코드 + 타이틀) |
| `npm run check-policy` | `scripts/check-policy-sources.ts` | 지원사업 출처 URL 검증 (스냅샷 비교 모드 포함) |
| `npm run check-integrity` | `scripts/check-regions-stations-integrity.ts` | regions ↔ stations 양방향 sync (CI 자동, 5/12 세종/울산 누락 사고 재발 방지) |
| — | `npx tsx scripts/check-region-stats-integrity.ts [--only=gwangju,…]` | 지역 상세 의료기관·학교·인구 카드 ↔ 공공데이터 원천 전수 대조 (심평원 코드 ↔ 응답 지역명, 시·도 합계 = 시·군·구 합, 학교 포착률). 한국 회선에서 실행, 불일치면 exit 1 (2026-10-07) |
| `npm run knip` | `knip.json` | 미사용 파일·export·타입 검출 (2026-09-04 도입, 기준 0건 유지). scripts·province/district-maps·테스트는 entry, workers·supabase functions·루트 일회성 mjs는 ignore |
| — | `scripts/generate-province-maps.ts` | 시도별 SVG 지도 데이터 생성 (statgarten 옛 경계 — 인천·대구는 건너뜀) |
| — | `npx tsx scripts/generate-province-map-sgis.ts <incheon\|daegu>` | 행정구역 개편 시·도 지도를 통계청 SGIS 경계로 생성 — 신설 구는 `region-composites.ts` 행정동 묶음, 경계 면적(km²) 대조 출력 (2026-10-07) |
| — | `.github/workflows/region-integrity.yml` | 지역 통계 전수 대조 주 1회(월 10:10 KST) — 불일치·대조 실패 시 `region-integrity` 이슈. 미국 러너라 심평원은 프록시 Worker 의 CI 전용 키(GitHub `DATAGOKR_PROXY_CI_KEY` = Worker `PROXY_SECRET_CI`), 운영 페이지는 E2E_SECRET 필요 (2026-10-07) |
| — | `.github/workflows/deploy-datagokr-proxy.yml` | data.go.kr 프록시 Worker 배포(dispatch) — 예열 목록을 `gen-hira-warm-list.ts` 로 다시 만들어 커밋본과 대조한 뒤 `CF_API_TOKEN` 으로 wrangler deploy, CI 전용 키(`DATAGOKR_PROXY_CI_KEY` → Worker `PROXY_SECRET_CI`) 동기화, 키 없음 401·CI 키 통과·CI 키 예열 403 확인(시크릿 전파 최대 2분 대기). 로컬 wrangler 로그인 불필요 (2026-10-07) |

---

## Lessons Learned (삽질 기록)

> 실제 개발 중 발생한 문제와 해결 패턴. 같은 실수를 반복하지 않기 위한 기록.

### Vercel 공유 IP에서 네이버 API 레이트 리밋

- **증상**: 로컬에서는 정상, Vercel 배포 후 뉴스 카테고리 빈 배열 반환
- **원인**: Vercel 서버리스 함수가 공유 IP를 사용 → 네이버 API가 429/빈 응답
- **해결**: `next: { revalidate: 3600 }` + 카테고리별 정적 폴백 데이터 (`landing.ts`)
- **교훈**: 외부 API 의존 데이터는 **반드시** 의미 있는 폴백 데이터를 준비할 것. 빈 `[]`은 폴백이 아님.

### Server → Client Component 함수 전달 불가

- **증상**: `Functions cannot be passed directly to Client Components`
- **원인**: Render prop 패턴으로 Server → Client에 함수를 전달
- **해결**: Client Component를 자체 완결형으로 리팩터링 (JSX 내부 포함)
- **교훈**: Server↔Client 경계에서는 **직렬화 가능한 값(props)만** 전달 가능

### `cache: "no-store"` + ISR 충돌

- **증상**: `DYNAMIC_SERVER_USAGE` 빌드 에러
- **원인**: `cache: "no-store"` fetch와 `export const revalidate = 3600` 공존 불가
- **해결**: `cache: "no-store"` → `next: { revalidate: N }` 으로 교체
- **교훈**: ISR 페이지 내 모든 fetch는 `next: { revalidate }` 사용

### CSS transition vs rAF 직접 제어 충돌

- **증상**: 애니메이션이 끊기거나 이상하게 점프
- **원인**: CSS transition과 rAF로 같은 속성을 동시 제어 시 충돌
- **해결**: rAF로 직접 제어하는 속성에는 CSS transition 제거
- **교훈**: 애니메이션 제어 방식은 하나만 선택 (CSS transition OR JS rAF)

### 외부 API 타임아웃 미설정 → 빌드 실패

- **증상**: Vercel 배포 실패 — `Failed to build /page: / after 3 attempts` (60초 타임아웃 초과)
- **원인**: RDA API(농진청)가 ECONNRESET을 반환하는 동안 fetch에 타임아웃이 없어 무기한 대기 → Vercel 빌드 워커 60초 제한 초과
- **해결**: 모든 외부 API fetch에 `signal: AbortSignal.timeout(10_000)` 추가
- **교훈**: 외부 API fetch에는 반드시 타임아웃을 설정. API 장애는 언제든 발생할 수 있으며, 타임아웃 없으면 빌드 실패 → 배포 불가.

### Supabase에 없는 정적 데이터 프로덕션 누락

- **증상**: 정적 데이터(`programs.ts`)에 추가한 SP-012가 통합검색에는 보이지만 지원사업 목록에서 안 보임
- **원인**: `loadPrograms()`가 Supabase 성공 시 정적 데이터를 완전 무시. SP-012는 Supabase에 없으므로 프로덕션에서 누락
- **해결**: Supabase 결과에 정적 데이터 중 DB에 없는 항목(`dbIds`에 없는 ID)을 병합
- **교훈**: 데이터 소스가 여럿(Supabase, API, 정적)일 때, 상위 소스가 성공하더라도 정적 데이터의 고유 항목은 병합해야 한다. "DB에 있으면 DB 우선, 없으면 정적 보충" 패턴.

### 빌드/배포 검증 단계 머무름 (2026-05-08)

- **증상**: 사용자가 답답해함. 한 번의 commit에 빌드 검증 + 배포 확인이 5분+ 소요
- **원인**:
  - `npm run build` 2회 실행 (runtime API timeout 메시지를 빌드 에러로 오해)
  - `sleep 30 && gh api...` harness 차단됨 → 우회 시도
  - 빌드 출력을 `tail -50`, `grep error`, `tail -10` 등 3회 파싱
- **해결**: 빌드 검증 SOP를 위 "빌드 & 배포" 섹션에 명문화. 1회 실행 + tail -3 + 단일 배포 검증 명령
- **교훈**: 빌드/배포 검증은 "성공 마커 1회 확인" 원칙. 의심되어 재실행하면 5분 낭비. 첫 결과 신뢰.

### dynamic SSR 페이지 + `export const revalidate` 충돌 (2026-05-11)

- **증상**: `/programs`에 `export const revalidate = 300` 추가 → 빌드는 성공하지만 `.next/prerender-manifest.json`에 `/programs` **NOT FOUND** + 라이브에서 site-wide 308 무한 redirect
- **원인**: `searchParams` 의존 페이지는 Next.js가 자동 dynamic SSR로 분류. ISR(`revalidate`)과 dynamic SSR이 충돌하면 빌드 산출물이 308 응답으로 생성됨 (Next.js 16 PPR 영향 가능)
- **해결**: `export const revalidate` 제거. CDN cache는 `next.config.ts` headers의 `s-maxage`로만 조정
- **교훈**: searchParams 사용 페이지(/programs, /events, /costs, /crops, /education, /regions, /stats, /interviews)에는 절대 `export const revalidate` 추가 금지. ISR 강화가 필요하면 next.config.ts headers 또는 Cloudflare Cache Rule만 사용.

### Middleware 308 응답이 CF cache에 hold되어 site-wide 무한 redirect (2026-05-11)

- **증상**: 봇이 `?cb=garbage` 요청 → middleware 308 → CF cache가 path-only key로 그 308 응답 캐시 → 일반 사용자 `/programs` 요청에도 CF HIT → 308 받아 redirect 따라감 → 또 CF HIT → 무한 루프 (영향: /events·/programs·/costs·/crops·/education·/regions·/stats 7개 페이지)
- **원인**: middleware의 `NextResponse.redirect()`가 `Cache-Control` 헤더 없이 308 응답. CF가 그 308을 일반 응답처럼 cache. CF cache key가 path-only라 어떤 query라도 같은 cache hit.
- **해결**: 모든 normalize 308 응답에 `Cache-Control: private, no-store, max-age=0` 강제 → CF가 `cf-cache-status: BYPASS`로 영구 안 캐시
- **교훈**: redirect 응답은 절대 캐시되면 안 됨. middleware/Server Component에서 `NextResponse.redirect()` 호출 시 반드시 `response.headers.set("Cache-Control", "private, no-store, max-age=0")` 동반.

### Supabase에 없는 정적 데이터 프로덕션 누락 (2026-05-10) — **2026-05-11 재발**

- **증상 (재발)**: SP-019, SP-020을 정적 데이터 추가했는데 라이브 `/programs` 목록에서 누락
- **원인**: `loadPrograms()`가 Supabase 성공 시 정적 데이터 무시 — 5/10 fix됐어야 했으나 어떤 시점에 patch가 빠짐
- **해결**: 0708d92로 정적 병합 fix 재적용. CLAUDE.md 명시만으로 부족 → 회귀 테스트 필요
- **교훈**: Lessons Learned 명시만으로는 코드 보장 안 됨. **critical-path 동작은 회귀 테스트 필수**. 다음 sprint 권고: `loadPrograms` Supabase 성공 + 정적 dedup 병합 회귀 테스트 작성.

### 정적 데이터 중복 추가 (2026-05-11) — 데이터 정합성은 양방향

- **증상**: SP-019(스마트팜 청년창업 보육센터 9기)를 D2에서 신규 큐레이션해 추가했는데, 같은 사업이 SP-012로 이미 있었음 → `/programs` 목록에서 두 번 노출 (회장 라이브 직접 발견)
- **원인 (Five Whys)**:
  1. D2 큐레이션에서 기존 programs.ts 중복 grep 안 함
  2. data-engineer 가이드에 "신규 추가 전 중복 검색" 명시 없었음 (외부 URL 검증 위주)
  3. 5/10 lessons "Supabase 없는 데이터 누락"의 **반대 방향 (중복)** 패턴 인식 안 됨
  4. 무의식적 가정: "외부에서 새로 찾은 사업이니 우리에게 없을 것" — 사실 외부 사업 발견·내부 사업 추가는 시기만 다를 뿐 같은 사업일 수 있음
- **해결**: SP-019 row + persona-fit override + Supabase row 모두 제거 (134ccd2). 영구 차단으로 `scripts/check-program-dup.ts` 자동화 + data-engineer 가드 #2 추가
- **교훈**: **데이터 정합성은 양방향** — 누락 방향(Supabase 없는 정적 데이터)뿐 아니라 중복 방향(외부 신규 = 내부 기존)도 의심. 신규 정적 데이터 추가 시 `npx tsx scripts/check-program-dup.ts <title> <organization> [sourceUrl]` 자동 검증 필수. CI 통합 권고.

### Vercel Sensitive 변환 시 환경변수 손상 가능 (2026-05-22)

- **증상**: `/api/search-errata` 신규 endpoint 첫 호출에서 401 인증 실패 (네이버 errata `NID AUTH Result Invalid`). 같은 키가 `.env.local`로 로컬에서는 정상 작동.
- **원인 (라이브 디버그 모드 진단)**:
  · Vercel production `NAVER_CLIENT_ID` 끝에 `\n"` (newline + 쌍따옴표) 잘못 인코딩
  · Vercel production `NAVER_CLIENT_SECRET` **빈 문자열** (`""`)
  · 추정 시점: 2026-05-04 paused 사고 대응 중 sensitive 변환 단계에서 손상. 같은 키 쓰는 landing 뉴스 API는 정적 폴백으로 자동 전환되어 사고 미발견 — 22일+ 잠복.
- **해결**: `vercel env rm` 후 `printf '%s' "$VAR" | vercel env add ... --sensitive` 로 정확히 재등록. cleanup commit(0b76868)으로 라이브 errata + landing 뉴스 동시 복구. landing HTML에서 naver/nongmin 도메인 시그너처 확인으로 라이브 데이터 노출 검증 완료.
- **교훈**:
  1. **Sensitive 변환 직후 즉시 라이브 검증 필수**. `vercel env pull` 로 마스킹 안 풀리니 라이브 API 한 번 호출해 200·정상 응답 확인.
  2. **폴백 데이터가 사고를 가려준다** — 외부 API 실패 시 정적 폴백으로 graceful degradation하는 패턴은 안정성에 좋지만, 환경변수 사고 같은 silent fail을 가린다. 정기 점검(주 2회 화·금)에 `8개 외부 API 샘플 호출`을 추가 권고.
  3. **CLI에서 env 추가 시 stdin 인코딩 주의** — `echo "$VAR" | vercel env add` 는 trailing newline 포함. `printf '%s' "$VAR" | ...` 로 명시.
  4. 디버그가 필요할 때는 임시 `_debug=1` query param 모드 + commit→cleanup 사이클이 가장 빠른 라이브 진단법.

### CROPS ↔ CROP_DETAILS 1:1 매핑 깨짐 (2026-05-22) — sprint 중간 산출물 미완

- **증상**: 통합검색에서 방울토마토 카드 클릭 → `/crops/cherry-tomato` 404. eggplant·asparagus·broccoli·paprika·carrot·king-oyster-mushroom·maesil·deodeok·buckwheat 동일 (총 10건). 회장 라이브 직접 발견.
- **잘못된 1차 진단**: "CROP_DETAILS 누락" → minimal fallback 페이지로 우회(d6fa20a). 회장이 "방울토마토 정보 존재하는데 왜 데이터 없다고 판단하는지 제대로 파악해라" 지적.
- **올바른 root cause**: 2026-05-21 Phase 7 B D4 sprint(작물 다양성 보강 39→49종)에서 **CROPS 배열만 갱신하고 CROP_DETAILS는 그대로 둠**. CROPS 추가 시 description·emoji 같은 표시용 필드는 작성됐지만 detail 구조(cultivation/income/majorRegions/...) 미작성. **sprint 중간 산출물이 미완인 채 release**.
- **해결**: data-engineer 위임으로 CROP_DETAILS 10건 정식 작성(c763631, +530 lines). RDA 농업소득자료집 2024 + KOSIS + KATI + 산림청 출처. 영구 차단으로 `scripts/check-cross-reference.ts` F-1 검증 추가 — `CROPS ↔ CROP_DETAILS` 1:1 매핑 깨지면 CI build fail.
- **교훈**: **`A.length === B.length` 같은 단순 길이 검증만 있어도 9시간 사고는 차단됐을 것**. 양방향 1:1 매핑 관계의 데이터 셋(CROPS↔CROP_DETAILS, PROVINCES↔stations, interviews↔cropLinks 등)은 신규 추가 sprint마다 길이 + 양방향 id 매칭 검증을 CI에서 강제. 단순 fallback으로 우회 ≠ root cause fix — 회장 직접 지적이 없었다면 dead code 안전망으로 끝났을 사고.

### Vercel preview alias SEO leak — 54일 잠복 (2026-05-27)

- **증상**: Google 검색결과에 `https://irang-wheat.vercel.app`가 별도 결과로 노출됨. 사이트명 "Vercel" + 콘텐츠는 우리 거(duplicate content + brand leak). 회장 라이브 발견.
- **root cause**: 4/4 deployment 시점에 Vercel이 자동 생성한 alias 5종(`irang-wheat.vercel.app`·`irang-kangseonlees-projects.vercel.app`·`irang-git-main-kangseonlees-projects.vercel.app`·`irang-kangseonlee-...vercel.app`·`irang-5eshegt1j-...vercel.app`). 54일 전 시점에 200 응답으로 색인됐고 이후 307 redirect 추가됐지만 GSC 색인 잔존.
- **5/18 fix(be6fd66) 미적용 사유**: `VERCEL_ENV !== "production"`이면 robots disallow + meta noindex 분기. 그러나 `<project>.vercel.app`는 production deployment alias라 `VERCEL_ENV="production"`으로 응답 → robots/meta 차단 미적용.
- **해결**: `vercel alias rm` 4종 실행(commit 무관, Vercel CLI 직접). 5번째 alias는 이미 제거 상태. 제거 후 4종 모두 404 응답 확인 + prod `irangfarm.com`·`www.irangfarm.com` 200 정상 유지. Google이 404 받으면 자연 색인 해제.
- **B안 GSC URL 제거 도구 사용 불가**: `vercel.app` 도메인 소유권 없어 GSC property 검증 토큰 업로드 불가. A안(alias rm)만으로 자연 해소.
- **교훈**:
  1. **5/18 dev.irangfarm.com 사고는 dev 환경만 차단했고 Vercel 자동 alias는 production env로 응답해 차단 우회**. canonical host 강제는 `VERCEL_ENV` 분기로 부족 — `host` header 기반 redirect/noindex 추가 필요
  2. **git push 시 Vercel이 자동 생성하는 alias(`<project>-git-<branch>-<team>.vercel.app`)는 재생성 위험**. push 후 `vercel alias ls`로 추가 alias 확인 + 즉시 제거 watchman 항목 권고
  3. **Vercel alias rm은 prod 도메인(irangfarm.com·www.irangfarm.com)에 영향 없음** — 별도 alias라 안전. 그러나 deployment ID 자동 alias(`<project>-<hash>-<team>.vercel.app`)는 보존 필수
  4. **검색결과 brand leak는 SEO penalty + UX 신뢰도 down**. 사용자가 검색결과에서 "Vercel" 사이트명 보면 우리 사이트로 인식 못 함. fix 우선순위 🟡 (즉시 fix하지 않으면 신뢰도 누적 손실)

### 신규 컬럼 추가 마이그레이션 시 기존 NOT NULL 제약 누락 (2026-05-26) — 33일 silent 202 잠복

- **증상**: `quick_feedback` 테이블이 2026-04-13 이후 33일째 INSERT 0건. 같은 기간 `assessment_results` 10건·`search_logs` 38건은 정상 적재. 5/16 commit 7630b3b(D1 thumbs UI)·1e2d748(service_role Route) 이후도 0건. 5/18 박제 메모리에는 "Sprint 0 D0 silent fail 종결"로 기록.
- **잘못된 1차 진단**: qa-reviewer가 클라이언트 funnel 가설(`RecommendationThumbs` 3중 조건 funnel) + 환경변수 손상 가설(5/22 NAVER 키 사건 동형) 유력하게 봄. 모두 빗나감.
- **올바른 root cause**: 5/15 `request_kind`·5/16 `thumbs` 컬럼 추가 마이그레이션이 ADD COLUMN만 하고 기존 `rating`·`message` NOT NULL DROP 누락. thumbs-only POST(rating=null·message=null) → `23502 not-null violation` → `src/app/api/quick-feedback/route.ts:198`이 error.message에 "column" 포함 보고 `isMissingColumn=true`로 오판 → silent 202(`{"ok":true,"skipped":"migration-pending"}`) → 클라이언트가 성공으로 인지.
- **해결**: 신규 마이그레이션 `supabase/migrations/20260526_quick_feedback_drop_notnull.sql` 작성 + 회장 Supabase Dashboard 수동 apply. `ALTER COLUMN rating/message DROP NOT NULL` + 안전망 CHECK `quick_feedback_mode_check (rating IS NOT NULL OR thumbs IS NOT NULL OR request_kind IS NOT NULL)` 추가. 라이브 thumbs POST → 200 + Supabase row 정상 적재 + cleanup 잔존 0건 ✅.
- **교훈**:
  1. **신규 모드(컬럼) 추가 마이그레이션 체크리스트**: "기존 NOT NULL 컬럼이 신규 모드에서 NULL이어도 되는가?" 항목 강제. 답이 Yes면 같은 마이그레이션에 `DROP NOT NULL` + CHECK 안전망 동반.
  2. **silent fail 진단의 1차 분기점은 "다른 write endpoint 비교"**. `assessment_results`/`search_logs` 정상 적재 + `quick_feedback`만 0건이면 traffic 가설 즉시 기각·schema 가설 즉시 채택 가능했어야 했음. watchman §11 주간 write endpoint 활성도에 quick_feedback도 항상 함께 측정.
  3. **API route fallback 분기(`isMissingColumn`·`migration-pending`)는 silent skip 위험**. fallback 응답 코드(202·503 등) 비율을 production 메트릭에 노출 + 일정 threshold 초과 시 watchman 🔴.
  4. **박제 메모리가 사실 검증 없이 "종결" 표기되면 8일·30일 잠복 위험**. silent fail 종결 박제는 라이브 INSERT 추세 7일 이상 정상 확인 후에만 기록. "fix commit 머지" ≠ "라이브 정상 적재".

### useSearchParams Suspense 누락 → 페이지 전체 SSR bailout → SEO 콘텐츠 누락 (2026-06-01)

- **증상**: 네이버 색인이 sitemap 373 URL 중 19개(5%)에서 정체. SEO 권고(H1·Alt)는 이미 해결됐는데도 안 늘어남. 홈 `/` 라이브 HTML 110KB·**h1 0개**·히어로 헤드라인 SSR 누락. 사용자(JS 실행)는 정상이라 발견 지연.
- **root cause**: 홈 히어로의 검색창 `SearchBar`(`useSearchParams` 사용) → `HeroSearch` → 이를 감싼 **Suspense 경계 부재**. Next.js에서 `useSearchParams`를 Suspense 없이 쓰면 `BAILOUT_TO_CLIENT_SIDE_RENDERING`이 **페이지 루트까지 전파**되어 히어로 h1·헤드라인 등 본문 전체가 SSR HTML에서 누락되고 RSC payload(script)에만 남음. JS 미실행 크롤러(네이버 Yeti)는 빈 껍데기만 봄 → 색인 불가.
- **해결**: `<HeroSearch />`만 `<Suspense>`로 감싸 bailout을 검색창 자리에 격리 (commit `0be5c21`). 라이브 verify(Yeti UA): 110KB→195KB / h1 0→1개 / 헤드라인·subtitle·인터뷰 본문 SSR 노출 / BAILOUT 마커는 검색창 영역에만 잔존(정상 fallback).
- **교훈**:
  1. **`useSearchParams`·`usePathname`·`useSearchParams` 등 dynamic client hook은 반드시 그 컴포넌트만 `<Suspense>`로 감싼다.** 안 감싸면 bailout이 부모 트리 전체로 전파 → 페이지 본문 SSR 통째 누락.
  2. **SEO 검증은 반드시 JS 미실행(crawler) UA로 라이브 HTML을 본다.** 브라우저(사용자)는 CSR로 정상 보여 문제를 가린다. `curl -A "Yeti/1.1" | grep "<h1"` + 본문 핵심 텍스트 SSR 노출 여부 + `BAILOUT_TO_CLIENT_SIDE_RENDERING` 마커 위치 점검.
  3. **`<h1>` 0개 / SSR HTML 크기가 비교 페이지보다 현저히 작음 = bailout 신호.** searchParams를 쓰는 다른 페이지(검색바·필터가 히어로/상단에 있는 경우)도 동일 위험 — 점검 필요.

### Vercel ISR 배포 검증 함정 — GitHub deployments API "success" ≠ 내 push 반영 (2026-06-01)

- **증상**: push 직후 `gh api .../deployments` 최상단 status가 "success"로 떠 반영 완료로 오인. 실제로는 **직전 배포의 status**였고, 내 push의 새 빌드는 별개로 5~7분 Building 중. ISR HIT 페이지(`/`·`/guide`·`/sitemap`)는 새 빌드가 promote되기 전까지 **옛 버전 서빙**. CF는 이 페이지들을 DYNAMIC으로 처리하므로 cf-purge도 무효.
- **교훈**:
  1. **배포 검증은 `gh api deployments[0].sha`가 내 push 커밋과 일치하는지 먼저 확인** 후 그 deployment의 status를 polling. (이미 [[memory]] 박제된 "push 직후 deployments[0]은 직전 커밋일 수 있음"의 ISR 버전.)
  2. **ISR 페이지 라이브 반영 확인은 `x-vercel-cache: PRERENDER` + `age: 0`(fresh) 헤더로**, 또는 `vercel ls --prod`로 새 빌드가 Ready/promoted인지 확인. 콘텐츠 변경이 라이브에 보일 때까지 새 빌드 promote가 선행.

### GSC "실시간 테스트(Google-InspectionTool)" 5xx ≠ 실제 색인 실패 (2026-06-05) — 1.5h 헛디버깅

- **증상**: GSC URL 검사에서 `crops/grape`·`strawberry`가 "페이지 색인을 생성할 수 없음: 서버 오류(5xx)". 수동 "색인 생성 요청"도 "실시간 테스트 중 색인 문제 감지"로 거부됨.
- **헛다리 1.5시간**: CF Bot Fight Mode OFF·Browser Integrity Check OFF·ASN 396982 제거·CF cache purge·middleware `Google-InspectionTool` verified 추가(commit 08fa26c) — **전부 5xx 안 풀림**. 일반 UA·Googlebot UA 라이브는 항상 200. Vercel Live 로그에 InspectionTool 요청 **아예 안 찍힘**(미도달).
- **root cause = 오진단**: 5xx의 주체는 **GSC "실시간 테스트 도구"(Google-InspectionTool/1.0)** 뿐. CF Events엔 InspectionTool=Skip(통과)인데 Vercel origin엔 미도달 → CF↔Google 실시간 테스트 인프라 사이 문제. Hobby 플랜으론 그 레이어 제어 불가.
- **결정적 구분**: GSC URL 검사의 **"실시간 테스트" 탭 ≠ "GOOGLE 색인" 탭**. **"GOOGLE 색인" 탭**(일반 Googlebot 마지막 크롤)을 보면 grape·strawberry 모두 **"URL이 Google에 등록되어 있음" ✅**. 즉 **실제 색인은 처음부터 정상**, 막힌 건 실시간 테스트 "도구"뿐.
- **교훈**:
  1. **GSC 5xx를 보면 먼저 "GOOGLE 색인" 탭으로 실제 색인 상태를 확인**한다. "실시간 테스트" 탭 5xx는 도구(InspectionTool) 인프라 이슈일 수 있고 실제 색인과 무관하다. 도구 5xx에 매달려 CF·middleware를 헤집지 말 것.
  2. **수동 "색인 생성 요청"이 실시간 테스트를 거쳐 거부돼도, 일반 Googlebot의 자연 재크롤은 막히지 않는다** — 색인·JSON-LD 반영은 자연 크롤로 진행됨(며칠~2주).
  3. **차단 진단 순서**: 라이브 일반/Googlebot UA 200 + Vercel 로그에 그 봇 요청 미존재 = origin 미도달 = 우리 코드(middleware) 아님. CF Events Action(Skip/Block) 확인이 1차 분기점.
  4. middleware InspectionTool verified 추가(08fa26c)는 그 자체로 옳은 보강이라 유지. 단 이번 5xx의 해결책은 아니었음.

### CF KR 외 차단 룰이 Let's Encrypt 갱신까지 차단 → apex 인증서 만료 526 전면 다운 (2026-07-24)

- **증상**: `irangfarm.com`(apex)이 CF 526(Invalid SSL certificate)으로 전면 다운. www는 정상 200. `vercel certs ls`에서 apex 인증서 엔트리 자체가 소멸 (www만 잔존). 회장 라이브 직접 발견.
- **root cause**: 4/22 발급 apex 인증서(만료 7/21)의 자동 갱신 시점에, 5/14 배포한 CF Custom Rule Order 4(KR 외 catch-all Block)가 Let's Encrypt HTTP-01 검증 서버(해외발·verified bot 아님)를 차단 → 갱신 silent fail → 만료일까지 한 달 잠복 후 폭발. www는 룰 배포 전(5/6) 갱신이라 생존했으나 같은 경로로 8/4 만료 예정이었음.
- **해결**: ① `vercel certs issue irangfarm.com --challenge-only`로 DNS-01 챌린지 TXT 획득 → CF DNS에 `_acme-challenge` TXT 수동 추가 → `vercel certs issue irangfarm.com` 재실행 → 90일 인증서 발급, 라이브 200 복구. ② 재발 방지로 CF Custom Rule **Order First**에 `starts_with(http.request.uri.path, "/.well-known/acme-challenge/")` → Skip(All remaining custom rules) 룰 추가. 해외 IP 실측 검증: ACME 경로 404(origin 도달=통과) + 일반 경로 403(봇 차단 유지) 동시 확인.
- **교훈**:
  1. **IP/국가 기반 광역 차단 룰은 인증서 갱신 같은 인프라 검증 트래픽까지 죽인다.** CF 차단 룰 추가/변경 시 ACME(`/.well-known/acme-challenge/`)·webhook 등 화이트리스트 필요 경로를 사전 점검 목록에 포함할 것.
  2. **인증서 만료는 발급 +90일 시한폭탄 — silent fail 후 만료일에 폭발.** watchman 화·금 점검에 `vercel certs ls` 만료 D-14 체크 추가 (D-14 미만 + renew 실패 흔적 시 🔴).
  3. **Skip 룰의 실질 검증은 다음 자동 갱신 성공.** 8/4 만료 www 인증서가 7/28~8/4 사이 자동 갱신되는지 확인해야 종결 (`vercel certs ls`).
  4. 복구 절차 박제: 526 + apex cert 소멸 → `--challenge-only`로 TXT 획득 → CF DNS 추가 → issue 재실행 → `openssl s_client`로 새 notAfter 확인. TXT는 1회용이라 발급 후 삭제 가능.

### 인증서 만료는 자기잠금(self-locking) — 한 번 놓치면 자동 복구가 영구 불가 (2026-08-17)

- **증상**: 8/17 전반 점검에서 `www.irangfarm.com`이 **HTTP 526**. 8/4 만료 예정이던 www origin 인증서가 자동 갱신에 실패했고, **13일간 아무도 몰랐다**. apex는 정상 200. `vercel certs ls`에 www 엔트리 자체가 소멸(apex 1건만 잔존).
- **root cause — 자기잠금 구조**: origin 인증서 만료 → CF가 HTTPS 요청에 526 → **ACME HTTP-01 검증 트래픽도 함께 526** → Let's Encrypt가 검증 불가 → 자동 갱신 영구 실패. 즉 **만료 전에 잡지 못하면 자동 복구 경로가 스스로 닫힌다.** 7/24에 추가한 CF ACME Skip 룰은 정상 작동 중이었음(HTTP :80의 `/.well-known/acme-challenge/`는 404 = origin 도달 확인, `X-Vercel-Acme-Ips` 헤더 응답). Skip 룰이 있어도 **TLS 계층에서 죽으면 무의미**.
- **왜 13일간 안 보였나**: 7/24에 신설한 watchman §14(인증서 D-14 점검)는 **화·금 watchman 세션 실행에 의존**. 8/2 이후 세션이 없어 감시 항목이 존재해도 실행되지 않았다.
- **해결**: `scripts/check-cert-expiry.sh` + `.github/workflows/cert-expiry.yml`(매일 KST 09:10)로 **세션과 무관한 CI 감시로 승격**. 526 판정을 1순위 신호로 삼음.
- **교훈**:
  1. **감시 항목을 정의하는 것과 감시가 실제로 돌아가는 것은 다른 문제다.** 실행 주체가 사람(세션)이면 공백이 생긴다. 만료·한도처럼 시한이 걸린 항목은 반드시 스케줄러(CI)에 올릴 것.
  2. **526은 "사이트 느림"이 아니라 "origin 인증서 사망" 신호다.** CF 프록시 뒤에서는 `openssl s_client`로 CF 엣지 인증서만 보이므로 origin 만료를 밖에서 직접 볼 수 없다. **526 자체가 유일한 외부 관측 신호**이고, origin 만료일 확인은 `npx vercel certs ls`(인증 필요)뿐.
  3. **apex가 멀쩡해도 서브도메인은 별개 인증서다.** 한쪽 복구 시 다른 쪽도 같은 만료 시한을 밟는지 반드시 함께 점검. 7/24에 apex만 수동 발급하고 www는 "자동 갱신되겠지"로 넘긴 것이 이번 사고의 직접 원인.
  4. **구조적 대안**: www에 고유 콘텐츠가 없고 canonical이 apex라면(현재 코드에 `www.irangfarm` 참조 0건), CF Redirect Rule로 엣지에서 www→apex 301 처리하면 origin 인증서 의존 자체가 사라져 이 실패 모드가 영구 제거된다.

### e2e 간헐 403 — 기록과 실제 인프라 불일치 3중 잠복 + Bot Fight Mode 정체 (2026-07-25~26)

- **증상**: 신규 core-journeys e2e가 CI에서만 간헐 403/타임아웃 (라이브 KR은 200 정상). 기존 e2e도 7/9부터 간헐 실패 이력.
- **3중 잠복 (전부 기록≠실제)**:
  1. **CF E2E Skip 룰 실체 ≠ 기록**: 5/16 기록·middleware 주석은 "UA + Secret 이중 검증"인데, 실제 룰은 `(ip.src in $github_actions_ips) and (UA contains irang-e2e/1.0)` — **secret 조건이 아예 없었음**. GH Actions(Azure) IP 대역 rotate로 정적 IP 리스트가 부패하며 매칭 실패 증가.
  2. **`E2E_SECRET`이 GitHub Secrets에 미등록**: Playwright는 secret 헤더를 보냈지만 값이 빈 문자열. CF가 검사 안 하니 2달+ 아무도 몰랐음.
  3. **Bot Fight Mode ON**: 6/5 OFF 기록 후 재활성화된 상태. BFM은 custom rule보다 먼저 평가 + **Free 플랜에서 어떤 custom rule Skip으로도 우회 불가** → e2e는 Skip 룰이 아니라 Playwright의 챌린지 풀기로 연명 (curl 진단은 100% 403).
- **진단 결정타**: CF GraphQL `firewallEventsAdaptive`의 `source` 필드 — `"source":"botFight","ruleId":"bot_fight_mode"`로 주체 확정. cf-mitigated: challenge 헤더만으로는 custom rule(Managed Challenge)과 구분 불가.
- **해결**: ① CF 룰을 UA + 64자 secret 헤더 검증으로 교체(IP 리스트 제거) ② `E2E_SECRET` GH 등록(`--body "$(cat file)"` — trailing newline 함정 회피) ③ BFM OFF (회장 결재). 검증 매트릭스: e2eUA+secret=200(Vercel 도달) / e2eUA만=403 / 일반UA(US)=403 / AI크롤러=403 / KR사용자=200 / E2E CI GREEN.
- **교훈**:
  1. **인프라 사고 진단에서 기록(메모리·주석)은 가설이지 사실이 아니다.** 실제 룰 expression·secret 목록·토글 상태를 눈으로 확인(스크린샷·API)하기 전에 수정안을 내지 말 것. 이번에 기록만 믿은 1차 권고(CIDR 제거)는 회장의 "꼼꼼히 재체크" 지시가 없었다면 무효한 수정이 될 뻔했음.
  2. **정적 IP 리스트(GH Actions CIDR 등)는 rotate 함정** — 위조 불가능한 secret 헤더 검증이 정답. IP 조건은 공격자도 GH Actions를 쓰면 무력.
  3. **secret 도입·회전 시 발급처(CF)와 소비처(GH Secrets) 양쪽 등록을 즉시 검증** — 5/22 Vercel env 사고와 동형. "헤더를 보낸다" ≠ "검사된다".
  4. **CF 403/challenge 진단 1순위는 Events의 `source` 필드** (GraphQL firewallEventsAdaptive, cf-purge용 CF_API_TOKEN으로 조회 가능). botFight면 custom rule 수정은 헛수고.
  5. **BFM은 주력 방어가 아니다** — 5/4 폭격 때 못 막았고(custom rule 4종이 막음, 5/14 실측), headless 통과 + cache HIT 미적용 + Free에서 예외 불가로 e2e만 부순다. 현 방어망: CF custom rule(ASN·KR외·피싱) + middleware(AI크롤러 403·non-KR 503) 이중, 엣지 차단이라 Vercel 함수 호출 0.

---

### `notFound()`가 200을 돌려주는 이유 — loading.tsx Suspense 스트리밍 (2026-09-04)

- **증상**: `/regions/nowhere`·`/programs/NOPE` 등 7개 상세 라우트가 없는 slug에 HTTP 200 + not-found UI(소프트 404). 페이지 코드는 전부 `notFound()`를 정상 호출 중이었고 `<meta name="robots" content="noindex">`도 붙어 있었다.
- **원인**: 라우트 트리 위에 `loading.tsx`(루트 `src/app/loading.tsx` 포함)가 있으면 Suspense fallback이 렌더되는 순간 헤더가 200으로 나가고 본문이 스트리밍된다. 그 뒤 `notFound()`는 UI만 바꾸고 상태코드는 못 바꾼다. A/B 실측: 경로 위 loading.tsx를 **전부** 제거해야만 404가 됐다.
- **해결**: 정적 id 전집합인 `/regions/[id]`는 `dynamicParams = false`로 라우터 단계에서 404. `generateMetadata`의 미존재 분기도 `notFound()`로 통일해 "지원사업 상세 | 이랑" 같은 빈 제목 제거. 시·군·구 하위(on-demand ISR, 빌드 시 230건 API 호출 회피)와 programs/education/events(Supabase 전용 행 존재)는 상태코드 전환 불가로 확정 — noindex가 있어 SEO 영향은 없음.
- **교훈**: 소프트 404 진단의 1차 분기점은 "`notFound()`를 부르나"가 아니라 **"경로 위에 loading.tsx가 있나"**. 진짜 404가 필요하면 `dynamicParams=false`(전집합 정적일 때) 또는 middleware 사전 판정(정적 id set)만 답이고, loading.tsx 제거는 전역 UX 희생이라 비추천.

### 모바일 검색창이 스크롤 시작만으로 열림 — pointerdown 트리거 (2026-09-07)

- **증상**: 모바일에서 히어로 검색창을 잡고 위로 스크롤하려 하면, 손가락을 떼지 않았는데 전역 검색 오버레이가 떠 버린다.
- **원인**: `hero-search.tsx`·`search-page-search-bar.tsx`가 `onPointerDown`에서 `openOverlay()`를 호출. 터치 시작 = 열기라서 스크롤 제스처와 구분이 없었다.
- **해결**: `useTapGesture` 훅 — pointerdown 좌표·scrollY 기록, pointerup에서 이동 10px 미만·스크롤 없음일 때만 열기, pointercancel 무시. 키보드(Enter/Space)·`role=button` 동반.
- **교훈**: 터치 대상은 항상 "눌렀다 뗌"(click/pointerup + 이동 판정)에 반응시킨다. pointerdown/touchstart 트리거는 드래그·스크롤 컨테이너 안에서 반드시 오작동한다. 검증은 모바일 프로필에서 ① 드래그 후 뗌 ② 누른 채 스크롤 ③ 탭, 세 시나리오를 실측.

### 한글 IME 조합 중 Enter — "배추" 입력 후 Enter에 고구마가 선택됨 (2026-09-07)

- **증상**: 지역 비교 → 작물 적합도에서 "배추"를 치고 Enter를 누르면 고구마(또는 쌀)가 선택. 회장 라이브 발견, 크리티컬.
- **원인 3중**: ① 한글 IME는 마지막 글자 조합 중 Enter를 "조합 확정"으로 먼저 보내고(`isComposing`/keyCode 229), 그 시점 React 검색어는 부분 문자열("배") ② 셀렉터가 이름뿐 아니라 **설명문까지** 검색해 "재배"가 든 작물 30건(쌀·콩·고구마…)이 매칭 ③ Enter는 `flatOrder[highlightIdx]`를 확정하는데 highlightIdx는 검색어가 바뀌어도 리셋되지 않아 직전에 손이 스친 항목(고구마=idx 2)이 남음. 데스크탑 `fill()` 재현으론 안 잡혔고, **부분 입력 "배"+Enter** 재현에서 쌀이 선택되며 확정.
- **해결**: `src/lib/ime.ts` — `isComposingEvent`(조합 중 Enter 무시), `rankByName`(이름 완전 일치 > 앞부분 > 포함 > 보조 텍스트), `pickOnEnter`(완전 일치 있으면 그것, 결과 1건이면 그것, 아니면 하이라이트). 커스텀 리스트박스 4종(작물 적합도·작물 비교·지역 검색·SelectCombobox)과 통합 검색 폼에 적용, 검색어 변경 시 하이라이트 0 리셋, 검색 중엔 드롭다운도 랭킹 순.
- **교훈**: 한글 입력 UI의 Enter 확정은 **반드시 `isComposing` 가드**. 검색 매칭은 이름 우선 랭킹 없이 설명문까지 섞으면 부분 입력에서 엉뚱한 것이 1위가 된다. 재현은 완성 문자열 `fill()`이 아니라 **부분 문자열 + Enter**로.

## 차트 컴포넌트 가이드

- 위치: `src/components/charts/`
- 라이브러리: Recharts 3.x (`"use client"` 필수)
- 공용 스타일: `chart-styles.module.css` (툴팁, 범례, 인사이트 배지)
- 브랜드 색상 상수: 각 차트 파일 상단에 `COLOR_PRIMARY = "#1B6B5A"` 등 정의
- 유의미 데이터 판별: 평균값 기준, 특정 연도 Set, 상위 N개 등 데이터 성격에 맞게
- 원인 분석: `CauseAnalysis` 인터페이스 (`stats.ts`), `CauseAnalysisSection` 아코디언 컴포넌트
