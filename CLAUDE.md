@AGENTS.md

# 이랑 프로젝트 개발 규칙

> 이 파일은 Claude가 세션마다 자동 로드하는 규칙이다.
> **하네스 계층**: 에이전트·스킬·hook은 `.claude/` 하위에 분리. 이 파일(CLAUDE.md)은 기존 코드 컨벤션·디자인 원칙을 보존하고, 하네스 진입점만 §0에 추가.

---

## 0. 하네스 진입점 (2026-04-15 추가)

> **🧊 신규 기능 동결 (2026-09-08 회장 결재, 10월 초 M7 판정까지)** — 허용: (a) 진단 진입(랜딩 CTA·퀵메뉴·검색→진단·/assess 노출) (b) 재방문(진단 결과 저장/재열람·업데이트 소식) (c) 버그·데이터 정정·보안 (d) 계측(assess_start·external_click 등). **금지: 그 외 신규 화면·섹션·기능·리디자인.** 허용 밖 요청이 오면 착수 전에 이 배너를 인용해 회장 확인. M7 판정 기준: Go = 월 활성 ≥ 600 & 진단 완료/방문자 ≥ 5% & 재방문 ≥ 10% / Pivot = 완료 < 5% 또는 재방문 < 10%(현재 위치) / 유입 우선 = 활성 < 300.

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
- **열린 자동 감시 이슈 확인** (2026-08-29 추가): `gh issue list --state open` — 자동 이슈 라벨 7종(watchman·policy-check·cert-expiry·link-check·api-health·data-freshness·community-pending). CI 취합기(`report.sh`·`check-policy-sources.ts`)는 **열린 이슈가 있으면 새 이슈를 만들지 않으므로**, 해소된 이슈를 닫지 않으면 이후 finding이 로그에만 남는다(8/17 #115가 11일간 그랬음). 해소 확인 → 닫기 → 남은 항목만 보고

### 0-4. David_agit(기획 볼트) 연동 — 역할 분리 (2026-09-07 개정)

| 층 | 위치 | 담는 것 | 갱신 주체 |
|---|---|---|---|
| **전략층** | `/Users/igangseon/Desktop/David_agit/10.projects/이랑/` (허브 `이랑.md` + PRD·리서치·데이터소스·블로그초안 5개) | Phase 정의·Go/No-Go·Key Decisions·월 단위 Progress·리스크 | 볼트 CoS (월 1회 또는 Phase 전환 시) |
| **실행층** | 이 리포 (`CLAUDE.md` 하네스 이력·`docs/`·`worklog/`·`.policy-snapshots/`) | 스프린트·ADR·데이터 정정·Lessons·QA | 리포 CoS (매 세션) |

- 볼트의 실행 문서 25건은 `_archive/`로 이관 (2026-09-07). 리포에서 볼트 실행 문서를 참조하지 말 것 — 리포가 SSOT
- **Phase 전환·Kill/Go 판단·성격 재정의**(토이→운영 등)가 발생하면 리포 CoS가 볼트 허브 `이랑.md` **§현황 스냅샷·§Key Decisions** 갱신을 제안. 그 외 코드 변경은 볼트에 반영하지 않음
- 기획 변경이 코드에 영향 → David_agit-CoS로부터 위임 요청 수신

### 0-5. 하네스 변경 이력

| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-06 | Vercel·Cloudflare 리소스 한도 감시 추가 (50/70/85% 임계, 주 2회 화·금) | agents/reminder-watchman.md | 1on1 — 5/3~5/4 Vercel paused 사건 watchman 누락 사례 |
| 2026-05-06 | 영역 누락 발견 시 fallback 프로토콜 추가 (5단계: 즉시 대응 → 영역 판정 → 알림 → 1on1 권고 → 이력화) | agents/chief-of-staff.md | 1on1 — Vercel 위기 직접 처리 후 watchman 영역 누락 미보강 |
| 2026-05-06 | 외부 API 신규 도입 시 사전 검증 4종 추가 (주기·만료일·Rate limit·역사 가용성) | agents/data-engineer.md | 1on1 — SGIS farmhousehold 5년 주기 함정 사례 |
| 2026-05-06 | 모바일 변경 시 사전 점검 5종 추가 (vh, sticky, hover, viewport meta, safe-area-inset) | agents/frontend-engineer.md | 1on1 — iOS Safari URL bar 모달 잘림 사후 발견 사례 |
| 2026-05-06 | Infra 변경(robots/middleware/headers) 검증 4종 추가 | agents/qa-reviewer.md | 1on1 — Vercel 위기 대응 infra 변경 검증 게이트 부재 |
| 2026-05-09 | 데이터 정정 이력 갱신 누락 점검 추가 (최근 7일 fix+data 파일 commit + /about/corrections 미갱신 시 🟡) | agents/reminder-watchman.md §9, skills/pre-commit-check STEP 8-2 | 5/9 인터뷰 본문 제거 commit 후 정정 이력 페이지 4월에서 멈춤 사례 |
| 2026-05-10 | 지원사업·박람회 모집 사이클 갱신 알림 추가 (6/15·12/15 + 활성 SP < 3건 시 🟡 / 모집 시즌 중 < 5건 시 🔴) | agents/reminder-watchman.md §10 | 5/10 /programs 14건 중 12건 마감 발견. 1~3월·7~9월 모집 집중 사이클 인식 |
| 2026-05-11 | 진단·검증 가드 5종 추가 (read-only 우선·prefix+try/finally·로컬 dev default·scripts/_diag 표준 위치·CoS 보고 게이트 잔존 0건 라인 필수) | agents/data-engineer.md | 1on1 — 5/10 `진단테스트20260510` row cleanup 누락 후 admin 인기 검색어 1위 노출 사례 |
| 2026-05-11 | 분야별 보고서 인수 체크리스트 8종 추가 (data 진단/API갱신/마이그레이션, frontend 모바일/모든변경, qa 배포/infra, watchman 이상보고) — 보고 수신 게이트로 작동 | agents/chief-of-staff.md | 1on1 — 5/10 진단 보고서 cleanup 검증 라인 부재를 CoS가 인지 못 하고 회장에 그대로 올린 사례. data-engineer 5종 가드와 양방향 일치 |
| 2026-05-11 | API endpoint 동작 검증 + 클라이언트 진입점 전수 grep + 출력 포맷 CoS 인수 라인 강제 추가 | agents/qa-reviewer.md | 1on1 — 5/10 logSearch가 /search 1곳에서만 호출되던 구조적 누락을 qa가 어떤 sprint에서도 못 잡은 사례. 데이터 흐름 end-to-end 검증 + CoS 인수 양방향 일치 |
| 2026-05-11 | §11 주간 write endpoint 활성도 모니터링 추가 (search_logs/quick_feedback/assessments 최근 7일 INSERT 0건 시 🟡, 배포 동반 시 🔴) — 화·금 사이클 1항목 추가 | agents/reminder-watchman.md | 1on1 — 5/10 search_logs 8일째 0건을 watch list에 "DB write 활성도" 부재로 발견 못 한 사례. qa↔watchman 자체 분담 결정으로 4중 차단망 완성 |
| 2026-05-11 | 정적 데이터 큐레이션 가드 3종 추가 (본문 키워드 무결성 / 기존 정적 데이터 중복 검색 / 신청 일자 미명시 9999 페어) | agents/data-engineer.md | 1on1 — 5/11 SP-015~020 큐레이션 사이클에서 9건 함정 발견. 회장 무결성 검증 + 라이브 직접 발견. D2 외부 검증만 했고 내부 정합성·중복 검증 누락 |
| 2026-05-11 | Lessons Learned 3건 추가 (dynamic SSR + revalidate 충돌 / middleware 308 CF cache hold / Supabase 정적 병합 5/10 재발) | CLAUDE.md §Lessons Learned | 5/11 sprint 사고 회고 — 메모리만으로 코드 보장 불가 입증, CLAUDE.md 명시 + 회귀 테스트 권고 |
| 2026-05-11 | 정적 데이터 중복 추가 사고 Five Whys 분석 + Lessons Learned 추가 + CoS 인수 체크리스트 #2 강화 (본문 무결성 + 중복 검색 라인 추가) | CLAUDE.md §Lessons Learned, agents/chief-of-staff.md | 회장 추가 회고 — 5/10 lessons의 양방향 인식(누락↔중복) 부재가 5/11 재발의 본질. data·CoS 양쪽 가드 보강 |
| 2026-06-03 | 주요 페이지 SSR/prerender 무결성 감시 §13 추가 (화·금, Yeti UA로 h1 0개·SSR 크기 급감·bailout 위치 점검) + Lessons 2건 추가 | agents/reminder-watchman.md §13, CLAUDE.md §Lessons Learned | 6/3 홈 useSearchParams Suspense 누락 → 페이지 전체 CSR bailout → 히어로 SSR 누락 → 네이버 색인 5% 정체 사고. crawler 전용 사각지대로 watchman 감시 부재였음 |
| 2026-07-24 | 하네스 전수조사 정리 — supanova-* 스킬 5종 repo 제거 (5/1 `git add -A` 실수 커밋 잔재, Tailwind 전제로 CSS Modules 컨벤션 충돌·supanova-research는 SKILL.md 없는 broken) + 유저 레벨 에이전트 4종 `~/.claude/agents/_archive/` 이동 (automation-engineer·technical-writer 미사용, chief-of-staff·data-engineer 3월 구식 중복 — 프로젝트 버전과 혼선 위험) | .claude/skills/supanova-*, ~/.claude/agents/ | 7/24 회장 지시 하네스 에이전트 전수조사. 프로젝트 5 에이전트 + 활성 스킬 4종 + CoS 전문가 풀 11종은 전부 실사용 확인 유지 |
| 2026-07-24 | SSL/TLS 인증서 만료 감시 §14 추가 (화·금, `vercel certs ls`로 D-14 🟡 / D-7 🔴 / renew=no 승격 + ACME 챌린지 경로 통과 동반 점검) | agents/reminder-watchman.md §14 | 7/24 apex SSL 만료로 CF 526 전면 다운. CF의 KR 외 차단 룰이 ACME 갱신 챌린지까지 막아 자동 갱신 실패. 인프라 사각지대로 watchman 감시 부재였음 |
| 2026-07-27 | cron/스케줄 워크플로 실패 감시 §15 추가 (화·금, `gh run list --event=schedule`로 8종 점검 — 연속 2회 실패 🟡 / 3회+ 또는 sync-data 실패 🔴) | agents/reminder-watchman.md §15 | 7/27 3관점 검토 ⚪ — 스케줄 워크플로는 실패해도 무알림이라 stale 데이터·깨진 링크가 조용히 방치되는 사각지대. 실제 7/26 check-links schedule 실행 failure 발생 |
| 2026-08-17 | **세션 의존 감시 항목의 CI 이관** — §6·§8-2·§9·§10·§11·§12·§13·§15 8종을 통합 `watchman-ci.yml`(매일 KST 09:20)로 승격. 검사 스크립트 5종(`scripts/watchman/check-*.sh\|ts`) + 취합기 `report.sh`(findings `등급\|항목\|근거` 취합 → **단일** 이슈 발행, 🔴만 exit 1). reminder-watchman.md에 §0 실행 주체 구분표 신설 — CI 이관 항목은 세션 재실행 금지(이중 실행 방지), 세션은 열린 `watchman` 이슈 확인만. 잔류 🧑: §1 git 워킹트리·§5-1 예약 안건·§7 Stop hook·§8-1 Vercel 한도(Usage API 없음)·§14 origin 만료일(`vercel certs ls` 로컬 인증). §5 Kill Criteria는 판정일 경과로 만료 표기 | .github/workflows/watchman-ci.yml, scripts/watchman/*, agents/reminder-watchman.md §0 | 8/4 www 인증서 갱신 실패가 **세션 부재로 13일 방치**(8/17 발견). 원인은 감시 항목 부재가 아니라 **실행 주체가 사람 세션이라 공백 발생** — 7/24에 §14를 추가했어도 화·금 세션이 열리지 않으면 아무도 보지 않았다. 8/17 인증서 감시(`cert-expiry.yml`) 선행 이관의 표준 패턴을 나머지 항목에 전수 적용. 첫 로컬 실행에서 §15가 check-links 3일 연속 실패(8/15~17)를 즉시 검출 |
| 2026-08-17 | **인증서 감시를 세션 의존 → 스케줄 워크플로로 승격** (`scripts/check-cert-expiry.sh` + `.github/workflows/cert-expiry.yml`, 매일 KST 09:10, 526 판정 + 엣지 D-21/D-10). §14는 보조 수단으로 유지 | scripts/, .github/workflows/, package.json | 8/17 전반 점검에서 www.irangfarm.com 526을 **13일 만에** 발견. §14(7/24 신설)는 화·금 watchman 세션 실행 의존인데 8/2 이후 세션이 없어 아무도 보지 않음. **감시 항목이 있어도 실행 주체가 사람이면 공백이 생긴다**는 것이 본질 — CI로 이관 |
| 2026-08-17 | check-links 타임아웃을 실패에서 경고로 강등 + 마지막 재시도 30s→60s | scripts/check-links.sh | 8/17 점검 — US 러너에서 한국 정부 사이트(go.kr) 상시 타임아웃으로 스케줄 5회+ 반복 실패, GitHub Issue 75건 누적. 실측 결과 타임아웃 전건이 한국에서 HTTP 200(실패 0건). **경보 피로로 진짜 깨진 링크를 가리는 역효과**가 실제 위험이었음 |
| 2026-08-18 | **watchman-ci 첫 실측 후속 3건** — ① Node 20→22 승격(supabase-js native WebSocket) + report.sh 이슈 생성 에러 가시화·재시도 ② §8-2 CF 조회를 `firewallEventsAdaptiveGroups`(집계)→`firewallEventsAdaptive`(raw)로 전환 — Free 플랜 zone은 Groups 데이터셋 authz 거부(토큰 스코프 문제 아님, `cf-analytics-diag.yml`도 6/5부터 같은 에러를 warning으로 삼키며 조용히 실패 중이었음) ③ **VERCEL_TOKEN(Full Account 스코프) GH secret 등록** → cert-expiry.sh가 Vercel certs API로 origin 인증서 D-N·autoRenew·엔트리 소멸을 직접 판정. 팀 스코프 토큰은 certs API forbidden — Full Account 필수 | .github/workflows/watchman-ci.yml·cert-expiry.yml, scripts/watchman/*, scripts/check-cert-expiry.sh | 8/18 회장 결재 3건 일괄 처리. CI 실전 실행이 로컬에서 안 보이던 결함을 즉시 드러냄 — 워크플로 신설 시 `workflow_dispatch` 1회 실측을 표준 절차로. **"권한 부족" 진단은 실물 API 응답으로 확인** — 8/18 CF 토큰 스코프 오진(회장 정정)은 같은 토큰의 다른 쿼리 성공 여부를 먼저 봤으면 피할 수 있었음 |
| 2026-08-29 | **경보 피로 2건 정리** — ① §11 quick_feedback 임계 조정: 테이블별 창(quick_feedback 30일)·0건 등급 ⚪(이슈 미발행)·🔴 승격 조건 "배포 동반"을 CI가 `git log --since=7.days -- relatedPaths`로 직접 판정 ② check-policy TIMEOUT을 실패→경고 강등(8/17 check-links 동일 패턴) + 열린 policy-check 이슈 존재 시 신규 발행 중단. 열린 이슈 12건(watchman #115 + policy-check 11건) 일괄 정리 ③ gov-roadmap 5건 출처 재검증·lastVerified 갱신 | scripts/watchman/check-write-activity.ts, scripts/check-policy-sources.ts, agents/reminder-watchman.md §11, src/lib/data/gov-roadmap.ts | 8/29 세션 — watchman #115가 8/17부터 열린 채 방치되어 report.sh가 11일간 새 이슈를 못 만들었고(열린 이슈 = 신규 발행 차단), 그 안의 🟡 quick_feedback는 테이블 전체 1건인 저트래픽 기능이라 7일 창으로는 영구 경보. policy-check는 US 러너 go.kr 타임아웃(한국 실측 전건 200)으로 6/1부터 매주 1건씩 11건 누적. **"열린 이슈가 신규 발행을 막는" 구조는 이슈를 닫는 세션이 있어야만 작동** — 만성 경보는 임계를 트래픽 수준에 맞추지 않으면 진짜 신호를 가린다 |
| 2026-08-29 | **check-policy 본문 검증 보강 + gov-roadmap 5개 사업 전수 재검증** — ① `check-policy-sources.ts`에 응답 5KB 하한·소프트 404/파킹 키워드(title 넓게·body 강한 문구만)·출처별 `mustContain` 키워드 검증 추가. HTTP 200이어도 메인·게시판·리다이렉트 스텁·소프트 404면 "내용 실패"로 집계 ② `PolicySource.mustContain?` 필드 신설, 출처 19건 전건 등록 ③ data-engineer 3명 병렬 조사(파일 수정 금지·근거만) → CoS가 원문 직접 대조 후 반영: 청년창업농 "소득 130%"(허위)→건강보험료 중위소득 140% 배제, "교육 100시간"(자격 아님)→배점, 5,000명 삭제, 온라인 전용 접수 / 귀산촌 "산촌진흥지역"(다른 개념)→산림기본법 산촌 468 읍·면, 신청처 산림조합 / 농지은행 "수수료 전면 폐지"→농업인만 면제, 7/1 환매요율 2.0% / 스마트팜 "보조 30~50%"→100% 융자, EPIS→KOAT. 깨진 출처 5건 교체·정정 이력 6건 등재 | scripts/check-policy-sources.ts, src/lib/data/gov-roadmap.ts, CLAUDE.md §0-3 | 회장 "스스로 꼼꼼히 체크하고 자체 보강" 지시. 1차 재검증(lastVerified 갱신 목적)이 드리프트 9건을 드러냈고, 2차 전수 조사에서 🔴 6건 추가. **HTTP 코드·title 검증은 메인/게시판/스텁 페이지를 못 거른다** — EPIS 55B를 ✅로 통과시킨 것이 상징. 출처는 반드시 고정 상세 URL + 본문 키워드. **sub-agent 보고는 조사 전용으로 받고 파일 수정은 CoS가 원문 대조 후 일괄 적용**하는 분업이 3건 병렬에서도 충돌 없이 작동 |
| 2026-08-30 | **큐레이션 게이트 2종 보강 + 랜딩 상시 탭** — ① `check-program-dup.ts` 시군 지명 추출(`extractLocalities`): 제목·주관의 "OO군/시"가 서로 다르면 DUPLICATE→SIMILAR 강등. "OO군 귀농인의 집 입주자 모집"처럼 유형명이 제목 대부분이라 시군만 다른 별개 공고가 막히던 오탐 해소(같은 시군·같은 제목은 여전히 DUPLICATE) ② `check-links.sh` programs 추출을 한 줄 정규식 → 엔트리(`id: "SP-…"`) 단위 perl 파싱으로 교체 — 긴 sourceUrl 줄바꿈 시 영구 미검증되던 silent 함정 제거 ③ 랜딩 `ProgramsSection` 탭 3개(진행·예정 / 마감 임박 / 상시·연중): `ALWAYS_OPEN` 또는 접수 150일+ 건을 분리, 상시 카드 기간 "○○부터 상시 모집", 모바일 479px 이하 격리 CSS | scripts/check-program-dup.ts, scripts/check-links.sh, src/app/page.tsx, src/components/landing/programs-section.tsx·module.css | 회장 8/30 "개편 방향 자체 처리 + 상시 공고 탭" 지시. 8/29 큐레이션에서 검증 완료 후보 9건이 dup 오탐 하나로 등재 불가였고, 하위 조사가 check-links 한 줄 정규식 함정을 실제로 밟음. 랜딩은 Playwright 360/375/1280 실측(탭 바 382px 넘침 → 324px) 후 확정 |
| 2026-08-30 | **랜딩 IA 계측 + 가설 B' 반영** — ① GA4 이벤트 3종 신설(`landing_section_view`·`landing_cta_click`·`programs_tab_switch`, category `landing`): `ScrollReveal trackId`(50% 노출 또는 뷰포트 절반 점유 시 1회 — 긴 섹션이 모바일에서 영영 안 찍히던 결함 실측 후 보강), `LandingClickTracker`(document 클릭 위임, 링크에 `data-track="section:target"`만 부착), 섹션 8종·앵커 20여 곳 ② `QuickStartSection` 신설(인터뷰 직후: 무료 진단 카드 → /match + 시·도 칩 17 + 비교·순위 링크) — 90일 진단 75건≈검색 103건인데 진단 CTA가 맨 아래, 검색 의도 1위 "지역"인데 지역 진입점 부재라는 두 가설. 계약 테스트 `landing-analytics.test.ts` | src/lib/analytics.ts, components/ui/scroll-reveal.tsx, components/analytics/landing-click-tracker.tsx, components/landing/quick-start-section.*, src/app/page.tsx | 회장 8/30 "사용자 패턴 분석해서 랜딩 구조 변경" → 하루 1~2건 규모 로그로는 IA 판단 불가 판정. **측정 먼저(A) → 4~8주 뒤 GA4 탐색으로 재편(B)**, 가설 2개만 소폭 선반영. GA4 탐색 축: `landing_section_view` 도달 퍼널 × `landing_cta_click` 전환 |
| 2026-08-30 | **data.go.kr 프록시 Worker(B안) + 감시 3종 정정** — ① `apis.data.go.kr`가 클라우드(AWS) 대역을 HTTP 400 `INVALID_REQUEST_PARAMETER`(code 10)로 위장 차단(실측 매트릭스: 로컬 200 / 잘못된 키 403 code 30 / 진짜 파라미터 오류 200 resultCode 02 / Vercel icn1·hnd1 400 code 10 / US 러너 403·타임아웃) → `workers/datagokr-proxy`(허용 경로 2종·시크릿 헤더·엣지 캐시 6h, workers.dev = 우리 존 WAF 밖) + `src/lib/api/_datagokr.ts` 스위치(`DATA_GO_KR_PROXY_URL`/`SECRET` 있으면 Worker, 없으면 직접). CF 엣지 IP는 data.go.kr가 통과시킴(ASOS·HIRA 200 실측) ② Vercel 함수 리전 iad1→icn1 ③ api-health `curl … \|\| echo "000"`→"000000" ✅ 오채점 수정 ④ check-links GEO 경고 강등 + job timeout 15→30분 ⑤ 비교 페이지 빈 상태 문구 정직화 | workers/datagokr-proxy/*, src/lib/api/_datagokr.ts·weather.ts·hira.ts, vercel.json, .github/workflows/api-health.yml·check-links.yml | 8/30 회장 "지역 비교 기상 정보 못 불러옴" 라이브 발견. 상세 페이지 폴백이 가려 **최소 8/16부터** 기상청·심평원 라이브 실패였고 api-health 오채점으로 2주간 ✅. 진단 교훈: **오류 코드 대조군을 로컬에서 먼저 만든다**(키 오류 30·빈 키 20·파라미터 02 vs 위장 10). 키 재등록(5/22 패턴 가설)은 오진 — `vercel logs`의 본문 로그가 확정자. 시크릿 등록 함정: `cd && VAR=$(…)` 체인에서 cd 실패 시 변수가 비어 **빈 시크릿이 "Success"로 등록**됨 — 절대 경로 + 등록 직후 실측 |
| 2026-08-30 | **지역 비교 인프라 탭 15~29초 → KV 전역 캐시 + HIRA 사전 예열** — 실측: 기후·적합도 탭 1.2s인데 인프라+시군구 15~29s(2회째도 15s). 원인 심평원 HIRA 시군구 조회 콜드 7~13s → 앱 12s 타임아웃 → 시도 폴백 재호출. 엣지 Cache API는 PoP별이라 첫 사용자마다 콜드 → Worker KV(전역)·`/warm` 40건 배치·cron 순환·`scripts/gen-hira-warm-list.ts`(268건, 앱 호출 조립 1:1) | workers/datagokr-proxy/*, scripts/gen-hira-warm-list.ts | 회장 8/30 "지역 변경 시 너무 오래 걸림". **"느리다"는 먼저 어느 탭·어느 조합인지 curl로 매트릭스를 만든다** — 지역 변경 자체는 3G에서도 0.5s였고 병목은 특정 탭의 특정 upstream이었음. 느린 upstream은 사용자 요청 경로에서 빼고(예열) 사용자는 캐시만 읽게 |
| 2026-08-30 | 재배 캘린더 행 아코디언 확장 (시기·난이도·소득·주요 재배지·상세/적합성 링크, GA `calendar_row_expand`) — 난이도 배지는 `crop-page-card.module.css` cross-file `composes` 재사용(저장소 첫 선례). 백로그: 난이도 배지 색 정의가 3곳(crop-page-card·costs·캘린더 composes)이라 공용 `DifficultyBadge` 추출 대상 | src/components/crops/farming-calendar.tsx | 8/30 회장 결재 — 모달 내 deep link(`/regions/compare?tab=suitability&crop=`)는 normalize 화이트리스트 대조 후 채택 |
| 2026-08-30 | **재배 캘린더 파종·재배·수확 실데이터 구분** — `growingSeason`은 단일 범위라 49/56건이 '재배' 단일 바였음. 55종 전부 있는 `cultivationSteps`(단계명·시기)에서 `src/lib/crops/calendar-ranges.ts`가 파종·정식/재배·관리/수확 도출(상대 표기는 앵커 월 산술 도출 + derived 툴팁, 년 단위·착과 후는 도출 안 함). 3색 분리(파랑/초록/앰버) + 패널 재배 단계 리스트 + 하단 버튼(`ui/action-button.module.css`). 백로그: 페이지별 `.ctaPrimary` 9곳 → action-button 통합, 대파 수확(확정 정식과 겹쳐 미표시)·수박/참외(착과 후 앵커) | src/lib/crops/calendar-ranges.ts, components/crops/farming-calendar.*, components/ui/action-button.module.css | 회장 8/30 "파종·재배·수확 구분 안 됨" — **색 문제로 보였지만 데이터에 구분이 없던 것**. 시각 이슈는 먼저 데이터 소스에 그 차원이 있는지 확인. sub-agent 55종 도출 결과를 CoS가 전수 대조해 생강 '식부' 누락 1건 발견·보강 (73b9f03) |
| 2026-08-31 | 캘린더 색 3종(파랑/앰버) → 브랜드 그린 밀도 3단계(22/45/88%) + 패널 현재 시기 배지(`describeCurrentPhase`) | src/components/crops/farming-calendar.*, src/lib/crops/calendar-ranges.ts | 회장 8/31 "색상이 너무 달라 톤앤매너 안 맞음, 밀도로 구분". **구분이 필요해도 브랜드 팔레트 밖 hue는 쓰지 않는다** — 밀도 + 텍스트 라벨 조합이 기본 (27db3e9) |
| 2026-08-31 | **백로그 3건 일괄** — ① CTA 버튼 7파일 → `ui/action-button`(on-dark 변형 신설, TSX 0 변경) ② `DifficultyBadge` 공용 추출(4곳 → 1곳, 표 뷰 회색 팔레트 흡수) ③ 수박·참외·대파 수확 월 병기(농사로 작업력 3건 실측). 함정 박제: **Turbopack CSS Modules `composes`는 2단계까지만** — 3단 체인이면 base 클래스가 조용히 유실(빌드·테스트 전부 통과). CSS 리팩토링은 전/후 computed style diff 실측이 유일한 게이트 | src/components/ui/action-button.module.css·difficulty-badge.*, 페이지 모듈 7, src/lib/data/crops.ts | 회장 8/31 "다음 거 그냥 다 진행". 3 sub-agent 병렬(파일 경계 명시) — dev 서버 `pkill -f "next dev"` 광역 종료가 타 에이전트 서버를 죽인 사례: **포트 지정 종료 필수** (1870588) |
| 2026-08-31 | **진단 DB e2e 오염 차단 + 유형 분류 가중치 재조정** — ① 회장 "결과가 대부분 귀농형" 점검 지시 → `assessment_results` 146건 중 **106건(73%)이 core-journeys e2e 적재**(7/24 도입 이후 매 push, 매 스텝 첫 옵션 클릭 → 전부 귀농형). `/api/assess`에 `irang-e2e` UA·헤더 skip 추가 + 라이브 skip 실측 후 106건 삭제(잔존 0, 사람 40건) ② 계산식 자체도 편향: guinong이 36개 선택지 중 24개에서 잔점수 → 균등 랜덤 60% 귀농형, 청년농형은 youth +6으로도 1/10,000 도달. guinong 동반 가산 제거·youth +8 재조정 → 랜덤 35%/청년 아키타입 정상 도출, 아키타입 5종 회귀 테스트 (53bcac5) | src/app/api/assess/route.ts, src/lib/match-scoring.ts, src/__tests__/match-scoring.test.ts | **e2e가 실 DB에 쓰는 여정(POST 동반 완주)은 도입 시점에 적재 차단을 함께 설계**해야 한다 — 7/24 e2e 신설 때 누락돼 5주간 통계 3배 오염. 진단·통계 이상 보고는 "봇/테스트 적재 분리"가 1차 분기점(UA 토큰이 식별자). IP는 스키마에 없어 동일 IP 판정 불가 — rate limit용으로만 사용 |
| 2026-09-02 | **지역 탐색 개편 4건** — ① `RegionSearch`(components/region) 검색창: 시·도 17 + 시·군·구 229 인덱스, 빈 입력은 좌 시·도/우 시·군·구 **2단 트리**(탭·hover = 펼침, 이동은 우측 "OO 전체 보기"로 통일 — hover 없는 터치와 데스크탑 동작 일치), 입력 시 평면 검색 ② `/regions` 찾기 섹션 승격 + **2단 레이아웃**(1024+: 좌 검색+지도 560px / 우 정보 카드·활성 지역, `grid-template-areas`로 모바일 순서 격리, 활성 지역 grid는 `@container` 1열 전환) ③ 통계 칩을 정보 카드 배지(55종·48건)로 흡수 + 링크 카드 ↗ 아이콘 ④ `useActiveOptionScroll` 공용 훅 — 키보드 하이라이트 스크롤 추종(4곳 누락), 첫 옵션은 scrollTop 0으로 상단 힌트까지 노출 | src/components/region/region-search.*, src/app/regions/page.*, src/lib/hooks/use-active-option-scroll.ts, active-regions-section.module.css | 회장 9/2 연속 지시. **모드 토글(검색/지도)은 같은 목적의 두 진입점에 선택을 강요해 비추천 → 한 구역에 겹쳐 두는 통합안 결재.** 좌우 높이 균형은 카드 stretch가 아니라 콘텐츠 밀도(활성 지역 이동)로 맞춘다. 뷰포트 기준 미디어쿼리 컴포넌트를 절반 컬럼에 넣을 땐 container query |
| 2026-09-02 | **업데이트 안내 + 커뮤니티 1단계** — ① `/about/updates`(사용자 언어 큐레이션 12건, `src/lib/data/updates.ts`) + 랜딩 `UpdatesBanner`(localStorage 1회, 모달 금지) ② 커뮤니티 "한 줄 의견": 지역·작물·지원사업 상세 하단 `CommunityNotes`, **사전 승인제**(pending → admin `/admin/community` 승인 후 노출), 4층 필터(허니팟·2초 / 룰: URL·전화·메신저ID·금지어(농업 맥락어 제외)·반복·비한글 / 관리자 승인 큐 / 신고 3건 자동 hidden). LLM 분류 층은 회장 결정으로 미채택(API 키 미발급) — SDK 제거, `llm_verdict` 컬럼만 3단계 대비 유지, ip_hash만 저장, e2e 적재 분리, 테이블 미적용은 503 명시(GET은 fallback 로그 제외), 약관 제6조 운영 원칙. 마이그레이션 회장 apply 완료(9/2) → 라이브 재검증 통과, **커뮤니티 활성** | src/lib/community/*, src/app/api/community/*, src/components/community/*, src/app/admin/community/*, supabase/migrations/20260902_community_notes.sql, src/app/terms/page.tsx | 회장 9/2 결재. 자유 게시판은 현 트래픽(검색 5건/일)에서 유령 게시판 위험 → 사전 승인 한 줄 의견으로 수요 검증 후 2단계(외부 커뮤니티 연결)·3단계(회원제) 판단. **DB 없이도 UI·API 계약은 route mock + curl로 전수 검증 가능** — 마이그레이션 apply 뒤 라이브 재검증만 남김 |
| 2026-09-02 | **전체 환경·코드 품질 감사 후속** — ① watchman §11 🔴 회귀 판정에 "배포 직전 7일 활동 > 0" 전제(#119·#120 이틀 연속 오탐) + §15 watchman-ci 자기 참조 skip ② 데드 코드 20파일·landing.ts 죽은 export 7종·loader.ts 중복 로더 삭제, **`loadPrograms.test.ts`가 죽은 loader.ts를 import해 5/11 병합 회귀 가드가 실경로를 보호하지 못하던 것** 교정 ③ og/fonts.ts 타임아웃, api-health.yml 샘플 URL 3종 실경로화(HIRA 400 통과 오류), Unsplash 전면 제거(7 API), 미사용 dep 제거·dotenv 명시, semver 패치 갱신(next 16.3.4) | scripts/watchman/*, src/lib/data/loader.ts, src/__tests__/loadPrograms.test.ts, .github/workflows/api-health.yml, package.json | 회장 "전체 리팩토링 및 환경 점검". 2 sub-agent read-only 병렬 감사 → CoS가 근거 확인 후 실행. **회귀 테스트는 실제 호출 경로를 import해야 가드다** — 동명 함수가 두 모듈에 있으면 테스트가 죽은 쪽을 볼 수 있다(knip이 잡음). 저트래픽 테이블의 "배포 동반 0건" 규칙은 배포 전 활동 전제 없이는 상시 오탐. 미결: `CRON_SECRET`(dead cron) 결정, 정적 데이터 4파일(scripts 참조) 정리, 브랜치 `feat/crop-ranking-redesign` 미push 커밋 |
| 2026-09-02 | **감사 미결 자체 처리(회장 위임)** — ① Vercel dead cron(`/api/cron/data-check` + `vercel.json` crons) 제거 — CRON_SECRET 미등록으로 도입 이후 매주 401, GH Actions 데이터 신선도가 동일 역할 ② 죽은 산출물 `settlement-score.ts`(4.4K줄)·`compute-settlement-score.ts` 삭제(importer 0), 재현성 검사 TARGETS 정리, 입력 3파일은 dimension-scores용 유지 ③ 브랜치 3종 origin 보존 후 로컬 삭제, Vercel 시크릿 2종·GH UNSPLASH 제거 ④ eslint-config-next 16.3.4 정합, actions/checkout·setup-node v5 ⑤ **api-health 잠복 버그** — `run:`은 bash -e라 curl 타임아웃(exit 28)이 `HTTP_CODE=$(curl …)` 대입을 실패시켜 결과 0줄로 전체 중단(8/30 `\|\| echo` 제거 후) → `\|\| true` + data.go.kr 타임아웃 ⚠️ 강등. 네이버(ID만 전송 → 항상 401 → Secret 헤더·URL 인코딩)·Supabase(루트 401 → anon 1건 읽기) 채점 정상화. **GH 시크릿 RDA_API_KEY·NEXT_PUBLIC_SUPABASE_ANON_KEY가 stale**(young API 400·REST 401) → 로컬 검증값으로 갱신, 8종 중 6 ✅·2 ⚠️(US 지역 차단) ⑥ 지역 검색 인덱스 `src/lib/region-search-index.ts` 공용화(region-search·compare 셀렉터, 테스트 4건, parity 실측) | vercel.json, scripts/check-compute-reproducibility.ts, .github/workflows/api-health.yml, src/lib/region-search-index.ts | 회장 "너가 판단해서 자체적으로 처리해". **워크플로 수정은 반드시 workflow_dispatch 1회 실측**(8/18 표준) — 이번엔 실측이 3건의 잠복 결함(fail-fast 중단·stale 시크릿·미인코딩 쿼리)을 연쇄로 드러냈다. `bash -e` 환경에서 `VAR=$(cmd)`는 cmd 실패가 곧 스크립트 종료 — 외부 호출 대입엔 `\|\| true`. GH 시크릿과 로컬 키가 갈라지는 건 감시 대상 — 헬스체크가 ⚠️(4xx)를 "서버 생존"으로 통과시키면 키 부패를 못 본다 |
| 2026-09-02 | **커뮤니티 승인 대기 알림** `community-pending.yml`(5,35분 cron + dispatch) — Supabase REST(service role)로 pending 조회 → 이슈 생성(assignee KangseonLEE → iPhone 푸시) / 새 id만 코멘트 / 0건이면 자동 종료. 라벨 `community-pending`, §15 감시 대상 추가. LLM 분류 층은 회장 결정(API 키 미발급)으로 제거 — 필터는 허니팟·룰·관리자 승인·신고 4층 | .github/workflows/community-pending.yml, scripts/watchman/check-schedule-health.sh | 회장 "승인 필요 항목 알림 받을 수 있나" → 기존 알림 체인 재사용, 새 토큰 0. 실시간(Supabase Webhook)은 GitHub PAT 저장 필요라 미채택. 검증: diag 3건으로 생성→무동작→코멘트→자동 종료(#121) 전 경로 실측, 잔존 0. **워크플로 `run:` 블록 안 다중행 문자열은 YAML 블록을 벗어난다** — 히어독 대신 printf 조립. jq `$var \| contains(" \(.id) ")`는 `.`가 $var 를 가리키므로 `.id as $id` 선바인딩 |
| 2026-09-02 | **모바일 가상 키보드 안전망** — ① `/admin/login` 카드 모바일 상단 정렬(100vh 중앙 → 입력창 ≈30vh) ② 전역 `KeyboardFocusGuard`(layout.tsx): 터치 기기에서 입력 포커스 후 키보드 안정(350ms/visualViewport resize) 시 입력창이 헤더~하단 탭바 사이에 없으면 `scrollIntoView(center)` — 이미 보이면 무개입, `role=search`·fixed 컨테이너 제외 ③ 모바일 `html { scroll-padding-bottom: 탭바+safe-area+16px }` | src/app/admin/login/page.module.css, src/components/layout/keyboard-focus-guard.tsx, src/app/globals.css, agents/frontend-engineer.md #6 | 회장 9/2 iOS Chrome 스크린샷 — 키보드가 뜨자 입력창이 화면 밖으로. **입력창을 100vh 세로 중앙에 두는 짧은 페이지는 iOS 키보드(하단 ~40%)에 반드시 밀린다** — 레이아웃이 1차 방어, 가드는 안전망. Playwright는 키보드를 못 흉내 내므로 `focus({preventScroll:true})`로 가드 로직만 실측 |
| 2026-09-02 | **업데이트 소식·정정 이력 정리 + 전역 포인터** — ① 정정 이력 10건 페이지네이션 전 화면(모바일 CSS 숨김 트릭 → 실제 slice) + 행 간격 18px ② 업데이트 소식 목록(날짜·태그라인·건수·태그 행) → `/about/updates/[date]` 상세(카카오 공지 구조, 문서형 — 카드 박스 없이 여백 36~48px, 이전/다음 소식 내비, `dynamicParams=false`), 랜딩 배너는 최신 상세 직결, `RELEASE_GROUPS·getRelease·releaseTitle` 파생 + 계약 테스트 ③ **`UpdateItem.media`·`before` 필수화** — 13건 전부 이전/이후 실캡처(이전 = 해당 커밋 직전 워크트리 `next dev --webpack` + Playwright `bypassCSP`), 파일 실존 테스트 ④ `globals.css` 전역 `cursor: pointer`(a[href]·button·summary·label[for]·select·role button/option/tab·체크/라디오/파일/range) + disabled `not-allowed`, 10 라우트 computed cursor 전수 실측 | src/app/about/updates/**, src/app/about/corrections/*, src/lib/data/updates.ts, src/app/globals.css, public/updates/*.webp | 회장 9/2 연속 지시. **워크트리 캡처 함정 3종**: webpack CSS Modules는 순수 `:global(#id)` 선택자를 거부(Turbopack 허용) → 로컬 클래스 접두 패치 / 앱 CSP에 `unsafe-eval`이 없어 webpack dev 번들이 하이드레이션 실패(클릭 무반응, 콘솔 에러 없음) → Playwright `bypassCSP: true` / Next 개발 오버레이 `<nextjs-portal>`이 캡처에 찍힘 → 스크린샷 전 제거. **`rm -rf scripts/_diag` 광역 삭제 사고** — 진단 임시 파일은 `_`-prefix 파일만 지운다(디렉토리에 추적 파일 10종 상존, `git checkout` 즉시 복구) |
| 2026-09-03 | **§15 watchman-ci 자기 참조 루프 재보강** — 9/2 1차 보정("열린 이슈 있으면 skip")은 오탐 이슈(#119·#120)를 닫는 순간 직전 failure 3건이 🔴 → exit 1 → 새 이슈(#122) → 다음 날 또 failure…의 **자기 영속 루프**를 만들었다. 실행 직후 30분 내 watchman 이슈 생성(열림/닫힘 무관)이면 설계 동작 `designed`로 치환, 이슈 없는 failure(크래시)만 계속 판정. dispatch 실측 ✅ | scripts/watchman/check-schedule-health.sh | 세션 마무리 점검에서 발견. **감시 규칙이 자기 출력을 입력으로 삼으면 상태(열림/닫힘)에 따라 진동한다** — 자기 참조 판정은 "그 실패가 이미 표면화됐는가"라는 사실(이슈 생성 시각)에 묶어야 한다. 소프트 404 일괄 정리는 회장 지시로 백로그 |
| 2026-09-04 | **레이어 경계 lint + 배치 규칙 명문화 (카카오페이 FSD 글 검토 후 부분 차용)** — ① `eslint.config.mjs`에 `no-restricted-imports` 3블록(components→app / lib·hooks·types→UI / components/ui→도메인) error ② 역참조 9건 정리: `app/stats/stats.module.css`→`components/stats/stats-shared.module.css`(6 import), landing `parseIncome10a`는 `lib/format` 직접 import, `app/regions/[id]/sigungu-list`→`components/region`, `components/ui/irang-sprout`→`lib/icons/irang-sprout`(22 import) ③ 단·복수 병존 디렉토리 통합 `components/crop`→`crops`, `components/regions`→`region` ④ CLAUDE.md "코드 배치 규칙" 신설 + checklist I. FSD 전면 전환은 비채택 | eslint.config.mjs, src/components/{crops,region,stats}, src/lib/icons, CLAUDE.md, .claude/rules/checklist.md | 회장 "FSD 반영할만한지 체크 → 괜찮으면 적용". 카카오페이 글 자체가 "구조에 문제 없으면 바꾸지 말라"·2인+ 팀 전제. 이랑은 의존 방향이 대체로 건강(ui→도메인 0건)하되 **문서 규칙만 있고 lint 게이트가 없어 역참조 9건이 조용히 쌓였고**, `crop`/`crops`·`region`/`regions` 병존이 에이전트마다 배치를 다르게 판단하게 만들었다. FSD의 실질 가치는 레이어 이름이 아니라 **"어디까지 재사용되는가"를 lint 로 강제하는 것** — 그것만 가져옴 |
| 2026-09-04 | **GA4 내부·테스트 트래픽 제외 게이트** — ① `GoogleAnalytics`는 `NODE_ENV === "production"`에서만 렌더(로컬 dev·CF 터널 dev 집계 차단) ② `src/lib/analytics-gate.ts` `irangGaGate(window, id)`를 **toString으로 인라인**해 브라우저에서 UA `irang-e2e`·localStorage `irang-internal=1`이면 gtag.js 로드 자체를 생략 + `ga-disable-<ID>` 설정 ③ `AdminShell` 마운트 시 플래그 자동 설정(운영자 브라우저는 /admin 한 번 열면 이후 전 페이지 제외, IP 무관) ④ 단위 테스트 8건(toString→재평가 자기 완결성 포함). 로컬 prod 서버 4시나리오 Playwright 실측(일반 GTM 2건 / e2e·플래그·admin 후 0건). **세션 규칙**: 라이브에 Playwright 실측을 돌릴 때는 `context.addInitScript(() => localStorage.setItem("irang-internal","1"))`를 반드시 넣는다(curl은 JS 미실행이라 무관) | src/lib/analytics-gate.ts, src/components/analytics/google-analytics.tsx, src/components/admin/admin-shell.tsx, src/__tests__/analytics-gate.test.ts | 회장 "GA에 너·내 접속이 집계되니?" → 실측: e2e는 fixture가 비콘 차단 중이었지만 **회장 브라우저·세션 Playwright 실측·로컬 dev 접속은 전부 집계**(GA 컴포넌트에 환경 분기·opt-out 0). 검색 5건/일 규모에선 이 잡음이 실제 신호와 같은 자릿수라 8/30 랜딩 IA 계측 판독을 흐린다. toString 인라인 함수는 모듈 참조가 조용히 ReferenceError로 죽으므로 재평가 테스트가 필수 게이트. GA4 관리자 내부 트래픽 IP 필터는 회장 측 병행 권고(소급 없음) |
| 2026-09-04 | **백로그 5건 일괄 (회장 "알아서 다 처리")** — ① 교육↔체험 이중 등재 정리: evt-007(서귀포 설명회)·ED-007(무주 살아보기) 삭제, 각 프로그램을 성격에 맞는 한 목록에만 두고 `check-cross-reference.ts` **G-1**(EDUCATION_COURSES.url ∩ EVENTS.url = ∅) 신설. Supabase에 해당 행 없음 확인 ② 서귀포 하반기 귀농 창업·주택구입 지원사업: 접수 6/12~7/3 종료 → 미등재, SP-001(국비 동일 사업)의 "각 시군 농업기술센터·매년 초 접수" 안내가 시군별 실태와 달라 정정 + `supabase/migrations/20260904_sp001_copy_fix.sql`(DB 우선 병합이라 **회장 apply 필요**) ③ 소프트 404: 7 라우트는 이미 `notFound()`+noindex였고 200의 원인은 `loading.tsx` Suspense 스트리밍(헤더 선발송) — `generateMetadata`도 notFound로 통일(빈 제목 제거) + `/regions/[id]`만 `dynamicParams=false`(17 시·도 전집합)로 진짜 404. 시·군·구 하위(on-demand ISR 230건)·programs/education/events(DB 전용 행)는 상태코드 전환 불가로 확정 ④ 드롭다운 CSS 4중 복제 → `ui/dropdown.module.css` 공용 1벌(composes 1단), 64요소×2뷰포트 computed style diff 0 ⑤ knip 도입(`knip.json`, `npm run knip` 0건): 파일 2·심볼 60여 건 삭제, export 68건 해제, SIDO 계층 생성 데이터 −354줄(생성기 템플릿 동기), 미사용 dep 0 ⑥ Vercel CLI 53→59 | scripts/check-cross-reference.ts, src/lib/data/{events,education,programs,corrections}.ts, src/app/regions/[id]/page.tsx 외 6 page, src/components/ui/dropdown.module.css + 4 CSS, knip.json, 71 파일 | 4 sub-agent 병렬(조사 전용 1 + 파일 경계 명시 3). **`.next` 충돌 방지로 sub-agent 빌드 금지·CoS 1회 빌드**, dev 서버는 Next 16이 repo당 1개만 허용해(`Another next dev server is already running`) 두 번째 에이전트는 기존 서버로 실측. 프로덕션 DB write는 auto-mode 분류기가 차단 → 마이그레이션 파일 경로가 정석. **소프트 404의 진범은 `notFound()` 누락이 아니라 스트리밍**: loading.tsx가 있는 트리에서 상태코드를 바꾸려면 라우터 단계(`dynamicParams=false`)나 middleware에서 끊어야 한다 |
| 2026-09-04 | **CI `tsx` devDependency 고정** — ci.yml의 무결성 스텝 8종이 `npx tsx`인데 tsx가 의존성에 없어 **job마다 레지스트리에서 다운로드**. 9/4 e24ce0a CI가 첫 `npx tsx` 스텝에서 6분 43초 걸려(평소 1초) `timeout-minutes: 10`에 두 번 연속 취소("The operation was canceled" — 빌드 스텝에서 잘렸지만 진범은 그 앞 스텝). `npm i -D tsx`로 로컬 해석 | package.json | **CI 취소는 취소된 스텝이 아니라 스텝별 소요 표를 본다** — 성공 run과 나란히 놓으면 6분짜리 이상치가 바로 보인다. `npx <미설치 패키지>`는 러너 네트워크 상태에 따라 무한정 느려질 수 있으니 CI에서 쓰는 도구는 전부 devDependency로 |
| 2026-09-06 | **GNB 여정형 재편 + 랜딩 지역 블록 검색창 중심 개편** — ① GNB 4그룹 20항목(지역·작물/가이드/신청/자료실) → **5그룹 21항목**(탐색 4 / 비교·진단 5(+/match) / 준비 5 / 신청 4 / 참고자료 3). 메뉴 정의가 header·/more·mobile-nav morePaths·footer **4~5중 복제**(이미 `/crops` 라벨 드리프트)였던 것을 `src/lib/data/navigation.ts` SSOT로 통합, 그룹 활성은 최장 basePath 1개만(기존 코드는 `/regions/compare`에서 두 그룹 동시 active), 헤더 `nav[aria-label]` 문자열 querySelector → ref, 하단 탭 landmark 이름 분리, 드롭다운 `aria-expanded`·Enter/Esc·바깥 클릭. 900px 폭 실측 여유 24px·overflow 0 ② 랜딩 "지역부터 볼래요"(시·도 칩 17 나열) → "어디부터 볼까요?": `RegionSearch` 지연 로드 임베드(`landing-region-search.tsx`, `dynamic(ssr:false)` + `useSyncExternalStore` mounted 게이트로 BAILOUT 마커 0 유지, placeholder 높이 동일 CLS 0) + 페르소나 4 링크(`/regions/ranking?persona=`) + 시·도 17 소형 텍스트 링크 유지 → SSR 내부 링크 22→25, GA `quickstart:*` 라벨 유지·`quickstart:search:`·`quickstart:persona:` 신설. 모바일 360/375/414 실측·터치 44px·드롭다운이 하단 탭바 침범 → `region-search.module.css` 모바일 높이 캡 ③ 업데이트 소식 2건(이전/이후 데스크탑 프레임) | src/lib/data/navigation.ts, components/layout/{header,mobile-nav,footer}.tsx, app/more/page.tsx, components/landing/{quick-start-section,landing-region-search}.*, components/region/region-search.*, src/__tests__/{navigation,quick-start-section}.test.*, tests/e2e/critical-paths.spec.ts | 회장 "GNB 구조 개편 + 랜딩 지역 검증 부분 개편" → UX·프론트 2 에이전트 read-only 병렬 검토 → A/B/C 비교표 결재(GNB 5그룹 여정형 / 랜딩 검색창 중심). 근거: 30일 검색어 106건 대부분 "충북 서산·가평·고성"처럼 **지명을 이미 아는 사용자** → 검색창이 정답, 페르소나 필터는 보조. UX안의 `?mode=persona`는 normalize 화이트리스트 밖이라 308 strip — **딥링크 제안은 반드시 curl 실측**(6/16 함정 4번째). 구현 2 에이전트 병렬(파일 경계 명시, dev 서버는 Next 16 repo당 1개라 공유). 회장 중간 지시 "랜딩은 모바일까지 항상 고려" → 모바일 게이트 4종 추가 후 인수 (`feedback_landing_mobile_first_always`) |
| 2026-09-06 | **랜딩 "내 조건으로 순위 보기" → 일러스트 카드 슬라이드** — 페르소나 4종(자녀·청년농·통근·은퇴) 텍스트 버튼을 `PersonaSlider`(components/landing, "use client", CSS scroll-snap + 화살표·점, `useDragScroll` 재사용)로 교체. 카드 전부 `<Link>`라 SSR 링크·GA `quickstart:persona:*` 유지. 일러스트는 codex(`gpt-5.5`) 병렬 4장 — 작물 일러스트와 같은 **수채화·흰 배경·텍스트 0** 톤, `public/landing/personas/{id}.webp` 640px. 함정: 그리드 자식 `.regionBlock`에 `min-width:0`이 없어 모바일에서 트랙이 부모(343px)를 970px로 넓히며 슬라이드가 잠김 → `min-width:0` + 트랙 `width:100%`. 카드 폭 모바일 62vw / 768+ 200px / 1024+ 236px(3장 + 다음 카드 peek) | src/components/landing/persona-slider.*, quick-start-section.*, public/landing/personas/*.webp | 회장 9/6 "일러스트를 가미해 슬라이드로, 모바일도, codex로 기존 톤" — 스크롤 컨테이너를 grid/flex 자식에 넣을 땐 **부모 `min-width:0` 먼저** 확인(`scrollable:false`·트랙 폭 > 부모 폭이 신호). 일러스트 톤 프롬프트는 `reference_persona_illustration_prompt` 메모리 |
| 2026-09-06 | **회장 데스크탑 스크린샷 자가 점검 → 랜딩 바로 시작하기 레이아웃 3건 수정** — ① 검색창이 제목보다 84px 들여쓰기·폭 640 고정: RegionSearch 루트의 `max-width:640px; margin:0 auto`(/regions 전용)가 랜딩에도 적용. `className` prop 신설 + `.fullWidth.fullWidth`(지연 로드된 region-search CSS가 뒤에 주입돼 같은 특이성이면 짐 → 클래스 2중) ② 좌 진단 카드 243px vs 우 열 1,000px로 카드 아래 공백: 슬라이드·시·도 행을 `grid-template-areas`로 **두 열에 걸치는 전폭 행**으로 내리고 1행은 `align-items:center` ③ 4번째 카드가 열 경계에서 잘림: 전폭 행에서 카드 `flex:1 1 0`으로 4장이 행을 채우고, 스크롤 불가면 화살표·점을 JS로 숨김(768~1023은 200px 카드 슬라이드 유지). 5폭 실측 searchLeftDelta 0·overflowX 0 | src/components/landing/{quick-start-section,landing-region-search,persona-slider}.*, src/components/region/region-search.tsx | 회장 "이 이미지에서 이상한 부분 스스로 체크" — 실측 표(폭·가시 카드 수)만 보고 통과시켰던 것을 **스크린샷 한 장이 잡았다**. 수치 게이트에 "정렬(좌측 x 일치)"과 "열 높이 균형"이 없었음 → 랜딩 실측 스크립트에 `searchLeftDelta`·행 높이 차를 상시 항목으로 추가. 컴포넌트 재사용 시 원 페이지 전용 폭·정렬 규칙(max-width·margin auto)이 따라오는지 먼저 본다 |
| 2026-09-07 | **히어로 아이콘 퀵메뉴 8종 신설 + 바로 시작하기 섹션 전체 제거** — 회장이 타 포털의 아이콘 퀵메뉴 캡처를 보이며 "차라리 히어로에 이런 섹션, 오늘 처리한 건 제거" 제안 → 사실 대조 3건으로 채택: ① 히어로 통합검색이 시·군·구 이름을 이미 해석("가평"→가평군 첫 결과, "충북 서산"→서산시)해 9/6 시·군·구 검색창은 중복 ② 바로 시작하기가 모바일 976px(히어로의 2배)로 인터뷰 아래 1,500px 지점 ③ 진단·지역·순위 진입은 히어로 아이콘이 더 높은 위치에서 흡수(8/30 가설 B'의 직접 해결). `HeroQuickMenu`(Server, 8 `<Link>`, lucide 원형 타일, 여정 순: 지역 탐색·작물 정보·지역 비교·유형 진단·내 조건 순위·비용 가이드·지원사업·정착 로드맵), 모바일·태블릿(<1024) 가로 스냅 스크롤 4~6개 노출, 1024+ 한 줄 8개. GA `hero_quick:*`(quickstart:* 종료). 제거: quick-start-section·landing-region-search·persona-slider + 테스트·미디어. 페르소나 일러스트 4장은 `public/landing/personas/` 보존(순위 페이지 조건 선택 UI 후속 후보). SSR: hero_quick 링크 8·bailout 0·h1 1 | src/components/landing/hero-quick-menu.*, src/app/page.tsx·page.module.css, src/__tests__/hero-quick-menu.test.tsx, src/lib/data/updates.ts | 9/6 하루 동안 만든 것을 다음 날 걷어냈지만 **매몰 비용보다 사실(검색 로그·히어로 검색의 시군구 해석·섹션 높이)이 우선**. 8/30 가설 검증용 계측(quickstart)은 1주 만에 종료 — 저트래픽에서 IA 판단은 어차피 데이터로 못 하니 회장 판단 + 사실 대조로 결정. 참고 이미지의 컬러 아이콘은 브랜드 규칙(lucide·그린 팔레트)으로 번역 |
| 2026-09-07 | **히어로 다이어트 + "자주 찾는 서비스" 별도 섹션** — 회장 3연속 지시: ① 자동 흐름 키워드 마퀴 2줄 제거(히어로 375 577→477) ② "히어로가 너무 넓다·배너↔타이틀 간격 축소" → 히어로 padding-top 48/56/64/72 → 8/20/24/24, `UpdatesBanner` 음수 마진 -40 → 모바일 -52·데스크탑 -72(`.page` gap 64/120 보정), 하단 64→40. 데스크탑 배너→h1 152→72px ③ 히어로 안 아이콘 행 → 타 포털 QUICK LINK 참고로 **히어로 밖 `QuickLinkSection`**(틴트 패널, 좌 제목 블록 "자주 찾는 서비스" + 우 아이콘 8, 1024+ 그리드 220px/1fr) ④ 모바일은 가로 스크롤 대신 **4×2 그리드로 8개 한 화면**. GA `quick_link:*`(hero_quick 폐기), ScrollReveal `trackId="quick_link"`. 1024px에서 8번째 아이콘 잘림(트랙 620px) → item 72px/gap 4, 1280+ 92px | src/components/landing/quick-link-section.*, src/app/page.tsx·page.module.css, components/landing/updates-banner.module.css | 실측 스크립트에 `gapBannerToH1`·`heroToQuick`·`rows/visible` 항목 추가 — **"넓다"는 어느 간격인지 px로 쪼개서 본다**(배너→히어로는 `.page` gap과 배너 음수 마진의 합성이라 한 곳만 고치면 절반만 줄어듦). 히어로 하루 3회 수정은 회장 시각 피드백 루프가 빠르다는 뜻 — 매 라운드 375·1280 캡처를 보고에 첨부 |
| 2026-09-07 | **모바일 검색창 탭 판정(`useTapGesture`) + 스크롤 안내 화살표 제거** — ① 히어로·/search 모바일 검색창이 `onPointerDown`에서 전역 오버레이를 열어 **검색창을 잡고 스크롤을 시작만 해도 오버레이가 뜨던** 버그(회장 라이브). `src/lib/hooks/use-tap-gesture.ts`: pointerdown 좌표·scrollY 기록 → pointerup에서 이동 < 10px·스크롤 0일 때만 탭, pointercancel은 무시, Enter/Space 키보드 지원 + `role=button`·`aria-label`. iPhone 13 프로필 실측: 60px 드래그·페이지 스크롤 동반 → 오버레이 0, 탭 → 1 ② 히어로가 324px로 짧아져 첫 화면에 다음 섹션이 보이므로 `ScrollIndicator` 삭제(회장 "화살표 간격 이상"), 모바일 hero padding-bottom 40→28 | src/lib/hooks/use-tap-gesture.ts, components/search/{hero-search,search-page-search-bar}.tsx, src/app/page.tsx·page.module.css | **터치 UI는 "누름"이 아니라 "눌렀다 뗌"에 반응해야 한다** — pointerdown/touchstart에서 상태를 바꾸는 트리거는 스크롤 제스처와 충돌한다. 인터뷰 캐러셀 `useDragScroll`처럼 이동 판정을 분리. Playwright는 `[role=dialog]` 카운트에 Next dev 오버레이(`nextjs-portal`)가 섞일 수 있어 `aria-label`로 식별 |
| 2026-09-07 | **서비스 명칭 통일 "맞춤 시군구 찾기"** — 같은 서비스(`/regions/ranking`)가 자주 찾는 서비스 "내 조건 순위" / GNB "시군구 순위" / 페이지 제목 "시군구 점수 비교" 세 이름이었음(회장 "명칭이 애매"). 타일·GNB(desc "내 조건에 맞는 시·군·구 순위")·페이지 title·h1·breadcrumb·methodology 복귀 링크·업데이트 소식까지 한 이름으로. 타일 라벨은 2줄이라 `.label { min-height: 2줄 }`로 행 높이 통일 | src/components/landing/quick-link-section.*, src/lib/data/navigation.ts, src/app/regions/ranking/**, src/lib/data/updates.ts | **한 서비스는 한 이름** — 진입점(타일·GNB)과 도착 페이지 제목이 다르면 사용자는 다른 곳에 왔다고 느낀다. 명칭 변경 시 `grep`으로 breadcrumb·복귀 링크·업데이트 소식까지 전수 |
| 2026-09-07 | **자주 찾는 서비스 → primary 풀블리드 띠** — 회장 "배경 primary 주면 아래(인터뷰 딥그린)와 겹치려나?" → dev에서 CSS 주입 시안 3장(primary 375/1280·현재 375)을 캡처해 SendUserFile로 보내고 판단: 같은 계열 한 단계 어두워지는 흐름이라 충돌 없음, 흰 타일 대비 ↑. 결재 "primary + 박스 말고 화면 꽉 채워 띠처럼" → `page.module.css .fullWidth` 기법(`margin: 0 calc(-50vw + 50%); padding: 0 calc(50vw - 50%)`)을 섹션 모듈에 복제(cross-file composes 회피), radius 0, 안쪽 `.inner`(max-width 1280-64, 데스크탑 220px/1fr 그리드), 텍스트 흰색·타일 그림자 제거·hover 딥그린 반전. 5폭 실측 secW == vw, overflowX 0, 제목 좌측 = 페이지 컨테이너 좌측 | src/components/landing/quick-link-section.* , src/lib/data/updates.ts | **색·배경 판단은 시안을 캡처해 회장에게 이미지로 보낸다** — 말로 설명하는 것보다 3장 비교가 결재를 한 번에 끝냈다. 풀블리드는 `html { overflow-x: clip }`이 스크롤바 폭 초과분을 가려 주는 전제 위에서만 안전 |
| 2026-09-07 | **자주 찾는 서비스 띠 간격 3건(회장 모바일·데스크탑 확인)** — ① 모바일: 설명→그리드 6→28px(`.inner` 세로 스택 gap 22 — 섹션 gap이 `.inner` 래퍼 도입 후 무효였음), 아이콘 행 사이 26→14px(라벨 2줄 예약을 데스크탑 전용으로, 행 gap 6) ② 데스크탑: 라벨 2줄 예약(36px) 때문에 타일 중심이 링크 블록 중심보다 위 → `.intro { padding-bottom: 44px }`로 제목 블록 중심 = 타일 중심(실측 702 vs 701) ③ 히어로↔띠 흰 여백 56/40 → 24/20 | src/components/landing/quick-link-section.module.css | **래퍼를 새로 끼우면 부모의 gap/grid 규칙이 끊긴다** — `.inner` 도입 후 `.section { gap }`가 죽은 채 실측 표만 보고 넘어갔음. 실측 항목에 "설명→그리드"·"행 사이"·"타일 중심 vs 제목 중심"을 추가해 잡음 |
| 2026-09-07 | **띠 데스크탑 세로 중앙 2차 수정** — 1차(제목 중심=타일 중심)는 맞았지만 **아이콘 묶음 전체가 띠 안에서 위로 치우침**(위 39 / 한 줄 라벨 아래 55px): 2줄 라벨 예약(36px)이 모든 링크 박스를 키워 띠가 그 박스를 중앙에 놓은 결과. 예약 제거, 데스크탑 `.link { height: 90px }`(타일 64+8+라벨 18) 고정 + `overflow: visible`로 둘째 줄만 아래 여백으로 흘림, `.intro { padding-bottom: 26px }`. 실측 위 38 / 아래 37, 타일 중심=제목 중심, 8개 타일 상단 동일 | src/components/landing/quick-link-section.module.css | "중앙"은 **회장이 보는 묶음(타일+라벨)의 중심**이지 레이아웃 박스의 중심이 아니다 — 예약 공간이 있으면 박스 중심과 시각 중심이 갈라진다. 실측에 `blockCenter vs bandCenter`·`bottomPad(1줄 기준)` 추가 |
| 2026-09-07 | **띠 3·4차: 제목은 띠 중심, 타일 크기 통일** — ③ 제목 블록 보정 여백(26px) 제거 → 그리드 `align-items:center`로 띠 중심(715/715/715) ④ 회장 스크린샷: "맞춤 시군구 찾기" 타일만 작음 — 고정 높이 링크 박스 안에서 2줄 라벨이 타일을 flex-shrink로 눌렀음. 타일 `flex: 0 0 auto`, 라벨 `white-space: nowrap`, 타일 라벨을 짧은 표기 **"맞춤 시군구"**(정식 명칭 "맞춤 시군구 찾기"는 GNB·페이지 유지), 1024~1279 라벨 12px·item 76·gap 0. 6폭 실측 tileSizes 1종·라벨 1줄·clipped 0 | src/components/landing/quick-link-section.* | 고정 높이 flex 컬럼에서 자식이 커지면 **다른 자식이 줄어든다** — 절대 크기 요소엔 `flex-shrink: 0`. 실측에 `tileSizes`(Set 크기 1)·`labelLines`·`clippedLabels` 추가 |
| 2026-09-07 | **자주 찾는 서비스 = 공공포털 문법으로 재정의(B2)** — 회장 "너무 못생겼다, Pinterest·gdweb 참고" → 토스·당근 계열 시안 3종(A 그라데이션 히어로+pill / B 소프트 카드 / C 분할 히어로+일러스트) 제시 → 회장 "당근·토스 말고 **공공기관** 봐라, 추천안 보류" → 복지로·고용24·태안·그린대로·홈택스·서울·경기·농사로 8곳 Playwright 캡처 → 보드 2장 + 패턴 4종(검색이 주인공 / 자주 찾는 서비스는 검색 바로 아래 **연한 바탕 띠** / 흰 원·둥근사각 타일 64~90px + 컬러 아이콘 + 그림자 / 모바일 4×2 제목 가운데) → 이랑 톤 시안 B2 → 결재. 구현: primary 원색 띠 폐기 → `linear-gradient(#f3f8f6, #eef5f1)`, 타일 64(모바일·1024)/72(1280+) 흰 둥근사각 + 그림자, 라벨 14px, 데스크탑 좌 제목 블록(26px 딥그린)·우 8개 110px, 모바일 제목 가운데·행 간격 18. 6폭 실측 타일 1종·라벨 1줄·중심 일치 | src/components/landing/quick-link-section.module.css, scratchpad refs/*(캡처) | **레퍼런스는 회장의 준거 집단으로** — 같은 "퀵링크"라도 토스 문법과 공공 문법은 결이 다르고, 이랑의 준거는 공공 포털. 취향 판단은 실제 사이트 캡처 보드 + 우리 DOM에 CSS만 입힌 시안을 **같이** 보내면 한 라운드에 끝난다. 정부24는 헤드리스 차단 |
| 2026-09-07 | **"이랑에서 할 수 있는 것" 3카드 신설 (픽케어 참고) + 정부사업 길잡이 섹션 제거** — 회장 "pickcare.co.kr 레이아웃 참고해 개선 가능?" → 캡처·구조 분석: 가져올 것(문장형 검색 신호 / 일러스트+한 줄+CTA 카드 / 모바일은 카드로 접기) vs 안 가져올 것(온보딩 모달=CLAUDE 금지 / 400vh 고정 스크롤텔링·3D 마스코트·거대 워드마크=장식 금지·성능). 시안 결재 후 회장 수정 2건: **버튼 없이 카드 전체 링크**, **모바일 캐러셀**. `StartCardsSection`(server, 지원사업 카드에 서버 집계 "지금 신청 N건·이번 주 마감 N건") + `StartCards`(client: scroll-snap 트랙 + 위치 점, 768+ 3열 그리드). 페르소나 일러스트 3장 재사용(청년농=유형 진단, 통근=맞춤 시군구, 가족=지원사업). `GovSupportGuide`(정부사업 5종 가로 스크롤) 삭제 — 역할 중복. 5폭 실측: 카드 내 button 0, SSR 링크 3, 점 동기화, 모서리 화살표↔설명 2줄 겹침 → body 우측 64px | src/components/landing/start-cards*.{tsx,css}, src/app/page.tsx, src/__tests__/start-cards-section.test.tsx | 외부 레퍼런스 분석은 **"가져올 것 / 안 가져올 것"을 CLAUDE 원칙에 대조해 먼저 가른다**(모달 금지·장식 금지·SSR). next/image 는 SSR src 를 `/_next/image?url=` 로 감싸므로 테스트는 인코딩 경로로 확인 |
| 2026-09-07 | **랜딩 순서 교체(지원사업 ↑ 인터뷰 ↓) + 작물 한눈에 6→3** — 회장 "인터뷰가 주요 데이터로 안 보임" → 지원사업을 자주 찾는 서비스 바로 아래(2번째)로, 인터뷰 다크 띠는 뉴스 앞(6번째)으로. 작물 `TOP_N` 6→3, 헤더 "전체 작물"·하단 딥링크(연소득순·난이도순)로 /crops 이동(펼치기 대신 링크 — 클라이언트 상태 불필요, /crops 가 그 역할). 최종 순서: 히어로 → 자주 찾는 서비스 → 지원사업 → 트렌드·비용 → 작물+3카드(연그린) → 인터뷰(다크) → 소식 → CTA. 모바일 전체 높이 7,745px | src/app/page.tsx, src/components/landing/crop-glance-section.tsx | 섹션 순서는 **첫 화면이 무엇으로 채워졌는지에 따라 재평가** — 자주 찾는 서비스·3카드가 생긴 뒤엔 사회적 증거(인터뷰)보다 실용(지원사업)이 먼저. `order-check.mjs`로 aria-label 순서·카드 수·SSR을 한 번에 실측 |
| 2026-09-07 | **[크리티컬] 작물 적합도 "배추"→고구마 선택 사고 수정 — 한글 IME 조합 Enter + 설명문 검색 + 하이라이트 미리셋** | src/lib/ime.ts, app/regions/compare/crop-suitability-selector.tsx, app/crops/compare/crop-selector.tsx, components/region/region-search.tsx, components/search/search-bar.tsx, components/ui/select-combobox.tsx, src/__tests__/ime.test.ts | 회장 "너무 크리티컬" 리포트. 서버·데이터·캐시(RSC·HTML no-store)·탭·연속선택·지역변경 5경로 전부 정상이라 **회장에게 정확한 경로를 물어** "배추 입력 후 엔터" 확보 → 조합 중 Enter 가설 → 부분 입력 재현으로 확정. 상세는 Lessons Learned |
| 2026-09-07 | **볼트↔리포 역할 분리 + 경로 단절 복구** — 볼트 경로 `/Users/igangseon/David_agit` → `~/Desktop/David_agit` 오기 3곳 수정(CLAUDE.md 2·CoS 1). 4개월간 리포 에이전트가 볼트를 갱신할 수 없던 원인. 볼트 이랑 실행 문서 25건 `_archive/` 이관, 허브 `이랑.md` 전략층으로 재작성(현황 스냅샷 2026-09-07·Phase 통일). README Phase 정의를 실제와 일치(Phase 2 진단v2+SEO ✅ → Phase 3 커뮤니티 1단계 🔄) | CLAUDE.md §0-4, README.md, .claude/agents/chief-of-staff.md | **SSOT 3개(볼트 허브·README·리포 CLAUDE.md)의 Phase 정의가 전부 달랐다.** 문서가 두 곳이면 실제 작업 동선에 있는 쪽만 산다 — 전략/실행 층으로 갈라 각자 한 곳만 갱신 |
| 2026-09-08 | **M7 판정 기준 확정 (기준선 #2 = 10월 초 첫 정식 판정)** — Go: 월 활성 ≥ 600 & 진단 완료/방문자 ≥ 5% & 재방문 ≥ 10% / Pivot: 유입 유지되나 완료 < 5% 또는 재방문 < 10% ← **현재 위치**(기준선 #1: 활성 624, 완료 12건 = 1.9%, 재방문 ≈ 2%) / 유입 우선: 월 활성 < 300. 볼트 허브 `이랑.md` Key Decisions 기록 완료, 리포는 이 행이 SSOT | CLAUDE.md §0-5 | 회장 결재(볼트 세션 david-agit-87 경유, 리포 세션에서 회장 직접 확인 후 기록). GA4 28일 활성 624명 중 /assess 인기 페이지 7위 밖 — **문제는 기능 부족이 아니라 핵심 기능(진단)으로의 전환**. 기준선 #2용 GA4 경로: 탐색 → 유입경로 `assess_start` → `assess_complete`, 재방문은 유지 보고서. 자동 스냅샷은 GA4 Data API 서비스 계정 JSON + 숫자 속성 ID 발급 후 watchman-ci 잡으로(허용 (d)) |
| 2026-09-08 | **신규 기능 동결 — 10월 M7 판정까지** (§0 상단 배너). 허용 4종(진단 진입 / 재방문 / 버그·데이터·보안 / 계측), 그 외 신규 화면·섹션·기능·리디자인 금지. 진행 중 작업 판정: 0건(배추→고구마 수정 7fdf41d는 (c) 완료), 미착수 히어로 질문형 검색창은 금지 범위 → 보류, GA `quick_link:*`·`start_card:*` 분포 리뷰는 (d) 유지 | CLAUDE.md §0 배너, §0-5 | 회장 결재. 9/6~9/7 랜딩 라운드 10여 회가 진단 도달 1.9%를 움직이지 못한 것이 근거 — 표면 개편보다 **랜딩 → /assess 전환·결과 재열람** 두 경로에 집중. 동결 범위 밖 요청은 착수 전 배너 인용 후 회장 확인 |
| 2026-09-08 | **GA4 계측 보강 + Data API 스냅샷 (동결 허용 (d))** — ① `PageViewTracker`(루트 layout, Suspense 격리): Next 클라이언트 이동에 page_view가 아무도 안 보내 /assess·/match 등 랜딩에서 이동해 들어가는 페이지 조회수가 GA4에서 0이었음(볼트 세션 Data API 실측: /assess page_view 0 vs assess_start 11명). 최초 로드는 gtag config가 보내므로 건너뜀. GA4 향상된 측정 "브라우저 기록 이벤트"는 꺼진 채 유지(켜면 이중) ② `scripts/watchman/ga4-snapshot.mjs`(의존성 0, SA JWT → runReport) + `ga4-snapshot.yml`(매월 1일 + dispatch → 이슈 `ga4-snapshot`), §15 감시 추가. 첫 실측 #126: 활성 624·재방문 8.3%·진단 완료 0.6%·시작→완료 36.4% → Pivot. GH 시크릿 GA4_PROPERTY_ID·GA4_SA_JSON은 볼트 세션이 등록 | src/components/analytics/page-view-tracker.tsx, src/app/layout.tsx, scripts/watchman/ga4-snapshot.mjs, .github/workflows/ga4-snapshot.yml, scripts/watchman/check-schedule-health.sh | 회장 "적용해". **SPA에서 "조회는 page_view가 대신한다"는 전제가 틀려 있었다** — 9/3에 상세 조회 이벤트를 지우며 page_view에 기댔지만 클라이언트 이동은 아무도 안 보내고 있었음. 퍼널의 분모(도달)가 없으면 전환율 자체를 못 잰다. external_click 목적지는 `event_label` 맞춤 측정기준(9/3 등록)으로 이미 조회 가능 — 볼트 세션의 link_url 요청은 철회 |
| 2026-09-14 | **검색·데이터 점검 + PMF 스냅샷 회신(볼트)** — ① 유저 검색 로그 조회(Supabase search_logs): "참깨" 0건은 8/28 `resolveSearchDisplay` 수정(지식 패널이 카드 흡수 시 hitCount 0) 전 잔상 로그 5건이 30일 창에 섞인 것 — 라이브 정상 확인 후 옛 0건 로그 5건 id 지정 삭제 ② 인기 검색어 20종 searchAll 실행 검증 — 대부분 정상, 진짜 0건은 고사리·산마늘·명이나물(작물 미존재)·박스(비작물) ③ 9/13 Daily Data Sync 1회 실패는 RDA 상태 업데이트 Gateway Timeout 일시 오류(수집 0건, 손상 없음) → 수동 재실행 성공 확인 ④ watchman #127 종결: §13 SSR 마커는 PageViewTracker 부산물(경로 전용 전환으로 해소), §11 assessment 0건은 회귀 아닌 저트래픽(write 경로 3위저드 정상 연결·knip은 읽기 경로만 삭제) | (조회·검증 위주, 코드 변경은 아래 행) | 회장 세션 지시. **검색 0건 진단의 1차 분기점은 "데이터 부재 vs 표시 로직"** — 참깨는 데이터·검색 모두 정상, 옛 로그 잔상이었음. §11 🔴는 배포가 관련 경로를 건드렸다는 사실만으로 승격되나 write 경로 실연결을 grep으로 확인해야 회귀 여부 확정 |
| 2026-09-14 | **결과 없음 검색 화면 전면 정비 (네이버 무결과 화면 참고)** — ① "이런 작물은 어때요?" 힌트: 필 → 실제 작물 카드(`getNoResultHintItems`→ResultCard 재사용), 이모지 → 작물 일러스트(`renderCropCard`가 ILLUSTRATED_CROPS면 webp 썸네일, 검색 결과 작물 카드 전반 적용) ② 순서: 결과 없음 → 정보 추가 요청(중앙) → 추천 작물 카드 → (제거) 카테고리 링크 3종 ③ 뜬금없던 지역/작물/지원 링크 제거(하단 탭바 중복, 네이버도 카테고리 링크 없음) ④ 안내 문구 "철자 확인·더 짧은 키워드"로 실용화 + 콤마 절 nowrap으로 어색한 줄바꿈 방지(모바일 2줄/데스크탑 1줄) ⑤ 요청 버튼: 이어진 라벨 → 설명문 + "정보 추가 요청하기" 분리, primary 채움(진녹·흰 글씨) ⑥ "이런 작물은 어때요?" 제목 primary 강조(모바일 18·데스크탑 20) | src/app/search/page.tsx·page.module.css, src/lib/data/search-index.ts, src/components/search/result-card.tsx, src/lib/crop-image.ts | 회장 연속 스크린샷 피드백(모바일·데스크탑). getNoResultHints 시드는 실재 작물(더덕·도라지)만 — value가 또 0건이면 무의미. **레퍼런스(네이버)는 "가져올 것/안 가져올 것"으로 대조** — 카테고리 링크는 네이버도 안 씀, 대신 오타 제안·기능형 대안(질문하기)을 프레임과 함께 |
| 2026-09-14 | **검색 결과 0건 힌트 시드 + 랜딩 지원사업 탭 중복 해소** — ① `getNoResultHints`(고사리·산마늘·명이나물 → 더덕·도라지) — 검색 1회 수준 저수요라 정식 작물 추가 대신 힌트만(회장 "추가 고민" → 힌트만 결재) ② 랜딩 지원사업: 마감 임박 탭 5건이 진행·예정 10건의 완전 부분집합이라 같은 건 중복 노출 → 마감 임박 탭 제거 + 진행·예정 카드에 D-N 배지 인라인(모집중 & D-14 이내), `deadlinePrograms` prop·`DEADLINE_THRESHOLD_DAYS` 제거, `URGENT_DAYS` 컴포넌트 이동 | src/lib/data/search-index.ts, src/app/page.tsx, src/components/landing/programs-section.tsx | 회장 "겹치는 경우 상태 표기 or 마감 임박 제거" → 부분집합이면 별도 탭보다 인라인 배지가 중복 0·긴급도 상시 노출로 우월. 신규 작물 추가 판단 기준: 반복 검색(월 5회+) 누적 시 정식 승격 |
| 2026-09-14 | **헤더 검색 UX 2건** — ① SearchBar 돋보기 아이콘이 `aria-hidden` 장식이라 클릭 무반응(Enter만 검색) → `type=submit` 버튼으로(클릭=Enter 동일) ② 랜딩은 히어로 검색이 기본이라 헤더 검색 트리거를 최상단·아래 스크롤 시 숨기고 **위로 스크롤하면 노출**(모바일 접근성, 헤더 복귀 동작과 일치). 그 외 페이지는 항상 노출 | src/components/search/search-bar.tsx·search-bar.module.css, src/components/layout/header.tsx | 회장 라이브: 돋보기 클릭 안 됨 + "랜딩은 검색창이 기본이니 헤더 검색 숨기자" → "위로 스크롤 시엔 놔둬라(모바일 중요)". 터치 UI 돋보기는 장식이 아니라 제출 버튼이어야. **라이브 데스크탑 실측은 실제 Chrome UA 필수** — 기본 headless UA는 CF가 빈 body로 차단(모바일 devices UA는 통과) |
| 2026-09-14 | **GA4 후속: SPA page_view 계측 + 스냅샷 + cta_click 오해 해소** (9/8 세션 연장, 볼트 david-agit-87 협업) — ① `PageViewTracker`(usePathname 경로 전용, useSearchParams 미사용 → bailout 0): Next 클라이언트 이동에 page_view 미발화라 /assess 도달 0이던 것 보강 ② `ga4-snapshot.mjs`(SA JWT→runReport, 의존성 0) + `ga4-snapshot.yml`(월 1회+dispatch→이슈), §15 감시 추가, 첫 실측 #126(활성 624·재방문 8.3%·완료 0.6%·Pivot) ③ cta_click 0건은 도입 후 호출처 0인 죽은 이벤트 — 실제는 `landing_cta_click`×event_label. 회신은 메시지 승인 만료 반복 → 파일(`/tmp/irang-*.md`)로 전달 | src/components/analytics/page-view-tracker.tsx, src/app/layout.tsx, scripts/watchman/ga4-snapshot.mjs, .github/workflows/ga4-snapshot.yml | GA4 Data API 자격증명은 볼트 세션이 GH 시크릿 등록(GA4_PROPERTY_ID 531149933). **"조회는 page_view가 대신한다"는 SPA에서 틀림** — 클라이언트 이동은 아무도 안 보냄, 퍼널 분모가 사라진다. 크로스 세션 메시지가 승인 만료로 미달되면 파일 폴백 |
| 2026-09-17 | **지역 상세 = 작물 상세 레이아웃 통일 + "현장 이야기" 명칭** — ① 시·도·시·군·구 상세를 작물과 같은 5fr/2fr 2열 + sticky 사이드바(`RegionProfileCard` 개요: 정착 점수·시군구/면적·추천 작물·하이라이트 칩·비교/순위 CTA + `SidebarTabs` 추천 작물 4·이런 분에게·현장 이야기 티저)로 재편. `SidebarTabs`는 `app/crops/[id]` → `components/ui` 승격(2개 라우트 재사용 규칙) ② 커뮤니티 "한 줄 의견" → **"현장 이야기"**(섹션)·"한마디 남기기"(버튼) 전역 개명(약관 제6조·admin·알림 라벨 포함) ③ `/regions/[id]/stories`·`/regions/[id]/[sigungu]/stories`·`/crops/[id]/stories` 전용 화면(`StoriesPage`, noindex) + 각 섹션 "전체 보기 →"(`community_jump_click` stories_more/…_side_more) ④ 실측: 시·도 사이드바 1,370→818px·시군구 701px(뷰포트 900 이내라 sticky 실작동), 3,500px 스크롤 후 aside 따라옴, 모바일 overflowX 0, 딥링크 `?sido=`·`?regions=` normalize 통과 | src/app/regions/[id]/**, src/app/crops/[id]/**, src/components/ui/sidebar-tabs.*, src/components/region/region-profile-card.*, src/components/community/{stories-page,community-notes}.* | 회장 9/17 "지역 상세를 작물 상세와 동일하게 + 의견 더 보기 화면 + '의견' 명칭 재고". 명칭은 '의견'(평가 뉘앙스)·'후기'(경험 전제)·'한마디'(가벼움) 비교 후 **현장 이야기**(귀농인 경험담 프레임, 인터뷰 섹션과 결 일치) 채택. **sticky 사이드바는 높이 ≤ 뷰포트가 전제** — 1,370px 사이드바는 sticky 선언이 있어도 안 따라온다(실측으로만 드러남). 페르소나 블록을 3번째 탭으로 접고 카드 4개 캡으로 해결 |
| 2026-09-19 | **자기 오염 재발 방지 3층 (회장 "앞으로 발생하지 않도록, 정밀하게")** — ① 게이트: `irangGaGate` 에 `navigator.webdriver` 차단(자동화 브라우저는 UA·플래그·호스트와 무관하게 표준 신호) — 라이브에서 무표식 Playwright 로 실측해 gtag 미로드 확인 ② 호출처: `internalRequestHeaders()`(webdriver → `x-irang-e2e`, 플래그 → `x-irang-internal`)를 `/api/*` POST 9곳 전부에 펼침 + **계약 테스트** `internal-traffic-callsites.test.ts` 가 src 를 스캔해 빠진 POST 호출처를 실패시킴(5/11 logSearch 누락과 같은 결의 구조적 차단) ③ 감시: watchman-ci **§17** `check-ga4-anomaly.mjs`(사이트 외 호스트 ≥ 1명 🟡 / 활성 중앙값 3배 급증 🟡 + 해상도·도시·브라우저 서명) + GA4 클라이언트 공용화(`ga4-client.mjs`) ④ 실측 헬퍼 `scripts/diag-browser.mjs openContext()`(localStorage·쿠키·헤더 3중 + Chrome UA) ⑤ CLAUDE.md 규칙 섹션 "실측·테스트 트래픽 격리" + checklist J | src/lib/{analytics-gate,internal-traffic}.ts, write 호출처 9파일, src/__tests__/{analytics-gate,internal-traffic,internal-traffic-callsites}.test.ts, scripts/watchman/{ga4-client,check-ga4-anomaly,ga4-snapshot}.mjs, scripts/diag-browser.mjs, .github/workflows/watchman-ci.yml, CLAUDE.md, .claude/rules/checklist.md, agents/reminder-watchman.md §17 | 네 번째 자기 오염(5/10·8/31·9/14·9/17)의 공통점은 전부 **사람이 기억해야 하는 규칙**이었다는 것. 이번 구조: 표식이 없어도 걸리는 신호(webdriver·호스트) + 호출처 누락을 잡는 계약 테스트 + 결과 쪽 일일 감시. 게이트는 "어디서 오는가"가 아니라 "무엇으로 왔는가"(자동화 여부)로 닫아야 새 실측 방식에도 버틴다 |
| 2026-09-19 | **[계측 오염] 9/17 GA4 방문 급증 = 로컬 prod 서버 Playwright 실측 — 호스트 허용목록 + 스냅샷 호스트 필터** — 회장 "17일 방문자 폭발, 우리 테스트 로그 아닌지". GA4 Data API 진단(`ga4-snapshot.mjs` **진단 모드** `GA4_DIAG=1` / dispatch `diag=true`: 일자×호스트·해상도·도시·브라우저 분해)으로 확정: 9/17 활성 86명 중 **localhost 70명**, Seoul·Chrome Macintosh 58, 해상도 1280x900·1280x700·393x851·375x900 = 세션 Playwright 뷰포트 그대로, 페이지도 실측 대상(persimmon 28·gangwon 13·suncheon 13). 원인: 로컬 `next start` 는 NODE_ENV=production 이라 GA 가 렌더되고, 9/4 게이트(e2e UA·운영자 플래그·/admin)에 **호스트 조건이 없어** 새 브라우저 컨텍스트마다 새 사용자로 집계. 조치 ① `irangGaGate` 호스트 허용목록(`irangfarm.com`·`www.`) — localhost·127.0.0.1·vercel.app alias 전부 차단 ② 정규 스냅샷 리포트 전부 `hostName == irangfarm.com` 필터(GA 는 과거 데이터를 못 지우므로 10월 M7 판정 지표에서 걸러냄; 진단 모드만 전체 호스트) ③ `vercel.json ignoreCommand`·e2e-smoke 에 `.github/`·`scripts/` 제외(CI 전용 변경은 사이트 빌드 불필요) | src/lib/analytics-gate.ts, src/__tests__/analytics-gate.test.ts, scripts/watchman/ga4-snapshot.mjs, .github/workflows/ga4-snapshot.yml, vercel.json, .github/workflows/e2e-smoke.yml | **"프로덕션 빌드" ≠ "프로덕션 사이트"** — 환경 분기(NODE_ENV)만으로는 로컬 prod 서버·미리보기 alias 를 못 거른다, 계측 게이트는 호스트로 닫는다. 실측 스크립트에 `irang-internal` 플래그를 넣는 규칙(9/4)은 라이브용이었고 로컬 prod 서버엔 아무도 안 넣었다 — 사람 규칙은 빠진다, 게이트가 막아야 한다. 진단은 GA UI 가 아니라 Data API 로 호스트×해상도 서명을 뽑으면 한 번에 끝난다 |
| 2026-09-17 | **[버그] 사이드바 탭 링크·카드 간격 무스타일 — `"use client"` 모듈의 CSS 객체 re-export 함정** — 회장 스크린샷: "근거 보기"·"한마디 남기기"·"전체 보기" 가 버튼 없이 텍스트로 붙고 작물 카드 간격 0. 라이브 HTML 에 `<a href="#region-crops">` 처럼 **class 자체가 없었다**. `sidebar-tabs.tsx`("use client") 가 `export const sidebarTabStyles = s` 로 CSS 모듈 객체를 내보냈고, 서버 컴포넌트가 그걸 import 하면 **클라이언트 참조 프록시**가 와서 `st.sideTabMore` 가 undefined. CSS 자체는 청크에 있었다. 페이지 3곳이 `import st from "…/sidebar-tabs.module.css"` 로 직접 import 하도록 교체, re-export 삭제 | src/components/ui/sidebar-tabs.tsx, src/app/{regions/[id],regions/[id]/[sigungu],crops/[id]}/page.tsx | **클라이언트 모듈에서는 컴포넌트만 export 한다** — 상수·객체를 서버가 import 하면 조용히 프록시가 된다(빌드·tsc·lint 전부 통과). 이번 실측 게이트(높이·탭 수·h1)는 **클래스 부재를 못 봤다** — SSR 실측에 "class 없는 `<a>` 0건"·핵심 클래스 computed style 을 항목으로 넣는다 |
| 2026-09-17 | **사이드바 sticky 재설계(탭 카드만 고정) + 지역 상세 2열 시작점을 탭 내비 바로 아래로 + 탭 포커스 링** — 회장 스크린샷 4장: ① 노트북 뷰포트에서 sticky 사이드바 **하단이 잘린 채** 고정 ② 첫 탭 포커스 링 좌상단 잘림 ③ 시·도 상세는 통계·기후·지원사업이 그리드 **위**라 탭 내비에 들어와도 오른쪽이 비어 있음 ④ 1차 조치(스크롤 방향별 상·하단 고정 "스마트 sticky" JS)는 아래로 내릴 때 **상단이 뷰포트에 딱 붙어 잘리는** 모습이라 기각. 최종: 사이드바(aside)는 sticky 를 풀고 행 전체를 차지(`align-self: stretch`), **탭 카드(`.sideTabs`, ≈450px)만 sticky** — 개요 카드는 본문과 함께 흘러가고 탭 카드는 어느 노트북에서도 통째로 보인다. 작물 상세는 추천 지원사업을 탭 카드 위로(뒤에 오는 형제는 sticky 밑으로 파고듦) + 관련 작물 4개 캡. 시·도·시·군·구 모두 `AnchorTabNav` 를 Suspense·그리드 밖으로, 통계·기후(스트리밍)를 좌측 컬럼 첫 항목으로 → 탭 진입 순간부터 사이드바 동반. 시·도 그리드 2fr/1fr → 5fr/2fr. 포커스 링 offset −4 + radius 12 | src/components/ui/sidebar-tabs.module.css, src/app/{regions/[id],regions/[id]/[sigungu],crops/[id]}/page.tsx·page.module.css | **뷰포트보다 긴 sticky 는 어느 변을 붙잡아도 한쪽이 잘린다** — 방향별 고정(호갱노노식)도 회장 눈엔 "잘린 것". 답은 붙잡는 단위를 뷰포트 안에 들어오는 크기로 줄이는 것. 900px 실측만 보고 통과시킨 게 발단 — 게이트는 700·900 두 뷰포트 × 250px 전수 스크롤에서 sticky 카드 top == 헤더+12 · bottom ≤ vh · 형제와 겹침 0 |
| 2026-09-16 | **내부·테스트 트래픽 DB 적재 게이트 (`lib/internal-traffic`)** — 회장 라이브: 9/14 세션 테스트 검색이 admin 인기 검색어에 그대로 쌓임. ① 9/14 테스트 로그 48건(고사리 46·딸기 1·당근 1) JSON 백업 후 id 지정 삭제, 잔존 0건 — 9/8 실사용 고사리 1건은 보존, 30일 인기 검색어가 들깨(9)·가지(6)로 정상 복귀 ② 판정 SSOT 신설: `e2e`(UA `irang-e2e`·헤더 `x-irang-e2e`) / `internal`(쿠키 `irang-internal=1`·헤더 `x-irang-internal`) / `dev`(NODE_ENV≠production). **쿠키를 쓰는 이유 — localStorage 는 서버가 못 읽고, 헤더는 write 호출처마다 손으로 붙여야 해 새 엔드포인트에서 빠진다.** AdminShell 이 `markInternalBrowser()`로 localStorage(GA)+쿠키(DB) 동시 설정 ③ 적용: `/api/search-log`·`/api/quick-feedback` 전면 게이트, `/api/assess`는 **의도적으로 e2e만** 유지(운영자·dev 를 막으면 `/assess/result/[id]` 재열람 테스트가 깨지고, M7 완료율은 GA4 로 재므로) ④ `request-modal`이 `skipped`를 전부 실패로 보던 것 → 의도된 skip 3종은 성공 처리(헛된 오류 노출 방지) ⑤ community `isE2eRequest` 를 SSOT 로 재수출 ⑥ **`?internal=1` URL 토글**(middleware) — /admin 에 안 들어가는 기기(폰)를 링크 한 번으로 표시, `?internal=0` 으로 해제. **normalize 화이트리스트 밖이라 반드시 정규화 2단계보다 먼저 처리**(안 그러면 308 strip), 307(영구 아님) + `Cache-Control: private, no-store`(5/11 CF 308 hold 박제). httpOnly 미사용 — GA 게이트가 같은 쿠키를 브라우저에서 읽는다 ⑦ `irangGaGate` 에 쿠키 분기 추가 — 토글한 기기가 DB 는 빠지는데 GA4 엔 잡히는 반쪽 제외 방지 | src/lib/internal-traffic.ts, src/app/api/{search-log,quick-feedback,assess}/route.ts, src/components/admin/admin-shell.tsx, src/components/feedback/request-modal.tsx, src/lib/community/ip-hash.ts, src/__tests__/internal-traffic.test.ts | 로컬 prod 서버(3100) 10 시나리오 curl 실측 — 게이트 5종 전부 `skipped`, 비게이트 2건만 적재 후 즉시 삭제(잔존 0). **집계 오염 차단은 이벤트(GA)와 DB 를 따로 막아야 한다** — 9/4 GA 게이트는 localStorage 라 서버 write 를 전혀 못 막았고, 그 사각지대가 이번 48건. 게이트를 UI 피드백이 있는 엔드포인트에 걸 때는 "성공으로 보이되 저장 안 함"이 사용자를 디버깅에 빠뜨리지 않는지 호출처까지 확인 |
| 2026-09-16 | **감시 이슈 3건 정리 + 판정 규칙 3종 교정** — 열린 이슈가 신규 발행을 막는 구조라 해소된 경보 하나가 그 뒤 모든 finding 을 가린다(8/29 #115 11일 방치). ① **#128 api-health**: 9/14 SGIS·KOSIS·RDA 타임아웃은 일시 — 오늘 실행 실패 0건, 한국에서 302/200/200 실측. check-links 류 만성 지역차단이 아니라 임계 강등은 하지 않고, 대신 **실패 0건이면 열린 이슈 자동 종료**(community-pending 패턴) + 이슈 본문 `--body-file` 전환(표의 백틱이 쉘 명령 치환에 먹혀 #128 엔드포인트 칸이 통째로 비어 있었다) ② **#129 watchman**: §15 sync-data 판정이 "최근 3건 중 failure 1건이라도"라 9/13 일시 실패가 9/14·9/15 성공 뒤에도 3일간 🔴 → **최신 실행 기준**으로, 플래핑(3건 중 2건+)만 🟡 ③ **자기 참조 3차 교정**: 9/2 열린이슈·9/3 직후30분·오늘 내 "열린 이슈 대기 중" 분기까지 전부 **이슈 상태에 묶여 진동**했다 → 실행 자체의 사실(설계된 실패는 마지막 취합 스텝만 failure, 크래시는 더 앞 스텝에서 죽음)로 재정의 ④ **search_logs 9/8 이후 8일 0건 조사**: 라이브 POST 적재 정상 + **GA search 이벤트도 9/8 이후 0** → 회귀 아닌 사용자 활동 부재. §11 🔴 문구 "배포 후 적재 중단, 회귀 의심"이 내 배포를 범인으로 지목했던 것을 두 가설 병기 + 가르는 법으로 교체. GA4 스냅샷에 **검색 일별 추이·`/search` 조회** 행 추가 | scripts/watchman/{check-schedule-health.sh,check-write-activity.ts,ga4-snapshot.mjs}, .github/workflows/api-health.yml | **감시 규칙은 자기 출력(이슈)에 묶으면 반드시 진동한다** — 세 번째 재발. 실행 스텝처럼 규칙 밖에서 결정되는 사실에 묶어야 한다. **0건 경보는 "끊겼다"와 "안 쓴다"를 못 가른다** — 클라이언트 이벤트(GA)와 서버 적재(DB)를 같은 날짜 축에 놓으면 한 번에 갈린다. 남는 진짜 신호: 28일 활성 622명 중 검색 사용자 15명(2.4%)·`/search` 23명 |
| 2026-09-16 | **[지표 버그] M7 진단 도달 분모가 구조적으로 항상 0이었다 — `/assess` → `/match` 교정** — `/assess/page.tsx` 는 `redirect("/match?mode=assess")` 한 줄짜리라 page_view 가 영원히 0. 9/8 에 PageViewTracker 를 넣으며 "이제 도달을 잰다"고 기록했지만 **잘못된 URL 을 보고 있었고**, 각주("9/8 이후 수집분부터 유효")까지 사실과 달랐다. 실제 진단 UI 는 `/match` 의 `ServiceGateway` 가 `?mode=quick\|assess\|match` 로 분기해 띄운다. 교정 후 퍼널이 처음으로 온전해짐: **활성 622 → /match 도달 22(3.5%) → assess_start 11(50%) → 완료 4(36.4%)**. 병목은 622→22 한 구간뿐이고 **도달한 사람의 전환은 정상**. + `mode_select_clicked`(진입 CTA 목적지 결정 근거)·유입 채널·유입 상위 30·랜딩/목록/상세 구성·검색 일별 추이 추가 | scripts/watchman/ga4-snapshot.mjs | 회장 "정밀 재확인" 지시로 발견. **리다이렉트 전용 페이지를 퍼널 분모로 쓰면 0이 나오는데, 그 0을 "계측 미비"로 설명하면 영원히 안 고쳐진다** — 지표가 0일 때 1차 분기점은 "그 URL 에 실제로 사람이 머무는가"(curl 로 redirect 여부 확인). 유입 실측: 랜딩 71세션(9.4%) · 목록 84 · 상세 193 · 상위 30 밖 351 — **랜딩은 유입의 10%**라 랜딩 개편만으로 도달을 못 올린다(9/6~9/7 라운드가 안 움직인 이유). `/regions/compare` 60명으로 `/match` 22명의 3배 — 실사용 1순위는 진단이 아니라 지역 비교 |
| 2026-09-17 | **[보안] 전체 점검 + 조치 4건 · [커뮤니티] 상단 바로가기** — 점검 결과 무결: npm audit 0 · 하드코딩 시크릿 0 · git 이력 env 유입 0 · PostgREST 는 전부 파라미터 바인딩(`.or()` 문자열 조립 0) · insert 는 필드 명시라 mass assignment 0(커뮤니티 `status` 는 서버 계산이라 승인 우회 불가) · `eval`/`new Function`/문자열 타이머 0 · `child_process` 0 · UGC 는 JSX 텍스트 노드라 XSS 0 · 외부 링크 `rel=noopener noreferrer` · Worker 는 고정 origin + 경로 허용목록 + 시크릿 헤더라 SSRF 불가. **발견 4건**: ① 🔴 `assessment_results` **45행이 anon 키로 전체 조회**(answers·user_agent·referrer) — 공유 링크용 Public Read 정책이 "id 한 건만"을 강제 못 해 사실상 전체 공개. 읽기 3곳(API·결과 페이지·OG)을 service_role 로 이관 + RLS 마이그레이션 ② 🔴 관리자 로그인 **시도 제한 없음** — 인메모리로 1차 조치했으나 **라이브 실측에서 연속 8회 전부 401, 429 미발생**(서버리스 인스턴스마다 카운터가 따로) → DB 영속 카운터 `admin_login_attempts` 로 교체(테이블 미적용 시 fail-open) ③ 🟡 `/admin/api/*` 3종이 미들웨어 한 겹 의존 → `requireAdmin()` 2차 방어선 ④ ⚪ JSON-LD script 문맥 미이스케이프 → 출력에서 차단. + CSP `object-src 'none'`·`base-uri 'self'`·`form-action 'self'`, 외부 링크 http(s) 프로토콜 가드(React 19 는 `javascript:` 에 렌더 예외를 던져 **가용성**이 먼저 깨진다) / **커뮤니티**: 작성 UI 는 이미 상시 노출인데 45일 1건 — 실측하니 의견란이 모바일 375 에서 작물 6.4화면·시·도 8.9화면·시·군구 7.3화면 아래(문서 69~85%). **섹션을 위로 올리는 안은 철회**(의견이 재배·통계보다 앞에 오는 게 더 나쁨), 대신 상단 순수 앵커 `CommunityJumpLink` + `community_view`(IO 30%)·`community_jump_click` | src/lib/admin/{require-admin,login-throttle}.ts, src/app/admin/api/**, src/components/community/community-jump-link.*, src/components/seo/json-ld.tsx, next.config.ts, supabase/migrations/20260916_assessment_results_rls.sql | **레이트리밋은 "넣었다"가 아니라 "라이브에서 걸리는가"로 검증해야 한다** — 인메모리는 서버리스에서 사실상 무효. **Vercel Git 연동이 멈춰 `782e311` 이 13시간 미배포**(CI·E2E 는 통과해 초록으로 보였고, E2E 는 옛 빌드를 검증했다) → `vercel --prod` 수동 배포로 복구. 자동 배포가 안 도는 동안 초록 CI 는 배포 증거가 아니다 |
| 2026-09-17 | **[리디자인] 상세 3종 화면 구성 통일 — 사이드 탭 · 섹션 탭 · 압축 카드** (회장 결재, 동결 범위 밖) — ① **작물 상세 사이드바** 1,749→1,036px(−41%): 관련 작물이 카드당 337px·블록 1,083px(62%)였고 `position: sticky` 가 걸려 있어도 뷰포트를 넘겨 **작동하지 않았다**. `SidebarTabs`([관련 작물][의견]) + 기존 공용 `CropLinkCard` 로 압축(비교 상세는 `/crops/compare` 담당). **숨은 패널도 항상 렌더하고 `hidden` 으로만 감춘다** — 조건부 렌더면 내부 링크가 SSR 에서 사라진다(유입 61% Organic) ② **지역 상세**: 점수 산식 `<details>` 접기 + 추천 작물 상위 3개만 근거 카드·나머지 `CropLinkCard`(모바일 시·도 8,719→6,956px) ③ **섹션 탭 통일**: `AnchorTabNav` 를 `app/crops/[id]/`→`components/ui/` 승격(배치 규칙대로), 시·도 9탭·시군구 8탭, 마지막은 "의견"(track 으로 지면별 계측) ④ `withJosa`(lib/format) — "감을(를)" 표기 제거 | src/components/ui/anchor-tab-nav.*, src/app/crops/[id]/sidebar-tabs.tsx, src/app/regions/**, src/components/region/settlement-score-breakdown.*, src/lib/format.ts | **전수 점검 2회에서 실제 결함 2건을 잡았다.** ① 활성 탭 오판: `intersectionRatio` 는 "그 요소가 얼마나 보이는가"라 **짧은 섹션이 항상 이긴다** — 섹션이 긴 작물에선 안 보이던 게 지역에서 드러났다("지원사업" 클릭→"필지·임지" 활성). 각 섹션의 **자기 `scroll-margin-top` 을 뺀 위치** 중 가장 아래를 고르는 방식으로 교체(고정 OFFSET 추측 제거 + 탭 배열≠DOM 순서 문제 동시 해결) ② **E2E 가 잡은 회귀**: 시·도 점수 설명을 접자 **모바일에서 보이는 시군구 링크가 10→0**. 링크가 5차원 근거 안에 섞여 있고 모바일 탐색기는 지도 뷰로 시작해 카드가 숨어 있었다 → 시·도만 펼침 기본으로. **높이보다 탐색 경로가 우선.** 측정 함정: 부드러운 스크롤 도중을 찍으면 활성 탭이 중간값으로 잡힌다(2.5s 대기 필요) |
| 2026-09-17 | **Vercel Hobby 한도 조치 — 프로덕션 E2E 하루 1회 + docs 커밋 빌드 생략** (회장 지시) — 팀 Deployment Storage 27.23/10 GB(272%) · Fluid Active CPU 2h58m/4h(74%). 원인은 **프로덕션 배포 하루 20~26회**(배포 1건 ≈ 240 MB = `.next/server` 173 + `public` 59) + **푸시마다 프로덕션 대상 E2E**. 묵은 배포 174건은 볼트 세션이 `vercel rm --safe` 로 정리, Hobby 는 보관 정책 설정 불가라 재발 방지를 리포에서. ① `e2e.yml` `on: push`·`pull_request` 제거 → schedule(07:00 KST)+dispatch. PR 트리거도 뺐다 — 어차피 프로덕션을 때리므로 PR 검증 의미가 없다 ② `e2e-smoke.yml` 신설 — 푸시엔 `@smoke` 2건만(74→4, −95%). 전부 끄지 않은 건 같은 날 "지역 탐색 → 시군구 상세 → compare" 가 **실제 회귀를 잡았기** 때문 ③ `vercel.json ignoreCommand` — `CLAUDE.md`·`docs/`·`worklog/`·`*.md` 만 바뀐 커밋은 빌드 생략. **`git rev-parse HEAD^` 가드를 앞에 둔다** — exit 0 이 "생략"이라 명령이 실패하면 빌드가 진행되는 쪽이 안전하다 | .github/workflows/e2e.yml·e2e-smoke.yml, vercel.json, tests/e2e/core-journeys.spec.ts | **CI 가 인프라 한도를 먹는다는 시각이 없었다** — 푸시 검증을 늘릴수록 프로덕션 CPU·배포 스토리지를 쓴다. 검증은 "많이"가 아니라 "회귀를 실제로 잡아 온 것만"으로 좁힌다. 이미지 WebP 전환도 같은 날 완료 — **시·도 배경 PNG 17장 37MB → WebP q80 2.4MB(−93%, 배포당 −34MB)**. `cwebp -q 80`, 해상도 1672×941 유지, 일러스트라 하늘 그라데이션 뭉침 없음. 참조 2곳은 이미 `next/image`+`fill`+`sizes` 라 경로만 교체. 라이브 17장 200·구 PNG 404·깨진 이미지 0. 이어서 **`public/crops` 사진 39장 8.5MB 삭제 + H-1 가드 신설**: 작물 55종 **전부 일러스트가 있어(55/55)** `getCropImageSrc` 의 사진 폴백은 실행된 적 없는 죽은 경로였다(라이브 실측 illustrations 140 / jpg 0). **폴백은 가리개였지 방어가 아니었다** — 새 작물을 일러스트 없이 추가하면 그 jpg 도 없으니 어차피 깨진다. 폴백을 걷어내고 `check-cross-reference.ts` **H-1**(CROPS ↔ 일러스트 파일 1:1)로 CI 차단(실측: 1장 제거 → exit 1). **public 24MB → 16MB, 배포당 합계 −42.5MB.** Usage 3종 추이는 볼트 세션이 9/19~20 재점검 |
| 2026-09-17 | **[리팩토링] 죽은 CSS 47개 클래스·64규칙·512줄 제거 (17개 모듈)** — 회장 지시. 1차 스캔의 "175개"는 오탐 포함 수치였고 정밀 스캐너로 47개. **오탐 제거 방법**: ① 동적 클래스 접근(`s[...]`)이 있는 모듈 12개는 통째로 제외 — 정적 분석으로는 무엇이 쓰이는지 알 수 없다(`suitability-view` 의 `s[r.tone]`) ② 문자열 리터럴(clsx·querySelector)·다른 CSS 의 `composes` 참조도 사용으로 인정 ③ composes 전용 모듈(action-button·dropdown)은 importer 부재로 제외. **삭제는 선택자의 모든 클래스 토큰이 죽었을 때만** — `.listItem:last-child, .listItemLink:last-child` 처럼 산 것과 묶인 1개는 보존 | src/app/**/*.module.css, src/components/**/*.module.css (17개) | **CSS 삭제는 빌드·테스트가 못 잡는다**(8/31 박제) → 24페이지(데스크탑·모바일) × **시각 요소 10,478개** computed style 지문 전/후 비교로 **차이 0건** 확인. 처음 4페이지가 달랐지만 **같은 빌드를 두 번 떠서 대조**하니 3건은 Recharts SVG 렌더 편차·1건은 script 순서였다 — **재현 대조군 없이는 노이즈를 회귀로 오인한다.** 삭제기 버그도 잡음: 선행 주석이 붙은 `@media` 를 감지 못해 1차 실행이 블록을 통째로 건너뜀 |
| 2026-09-16 | **[전환] 목록·상세 6개 지면에 진단 진입 배너 + 지역 비교 계측 (회장 결재 1·2단계)** — ① **PersonaCta**(Server Component) 를 `/crops`·`/regions`·`/programs` + 작물·지원사업·시도·시군구 상세에 삽입. 목적지는 `/match?mode=assess`(‘/assess’ 는 리다이렉트 전용이라 홉 제거). `/crops`·`/programs` 는 이미 `?persona=` 정렬을 지원하므로 persona 유무로 "맞춤 정렬 중"/"2분 진단 시작" 분기 — **이미 있는 기능과 그 생산자를 잇는 한 줄**이지 새 기능이 아니다. `useSearchParams` 대신 **서버 prop** 으로 persona 를 받아 6/1 bailout 사고를 원천 차단 ② 계측 `data-assess-entry` + 전역 `AssessEntryTracker`(LandingClickTracker 와 같은 위임 패턴, 속성이 달라 이중 발화 없음) — label 로 **어느 지면이 도달을 만드는지** 가른다 ③ **지역 비교 계측 신설**: `compare_view`(탭·지역수)·`compare_region_change` — 28일 60명으로 진단(22명)의 3배인데 analytics 호출이 0이었다 | src/components/persona/persona-cta.*, components/analytics/assess-entry-tracker.tsx, app/{crops,regions,programs}/**, app/regions/compare/*, src/lib/analytics.ts | 근거: 랜딩 유입 71세션(9.4%) vs 목록+상세 277세션(3.9배)인데 목록·상세 본문 진단 진입 **0개**. 9/6~9/7 랜딩 라운드가 지표를 못 움직인 건 설계가 아니라 **상한 문제**였다. 실측 6라우트×5뷰포트(진단 링크·h1 1개·overflowX 0) + BAILOUT 마커 stash 대조로 전/후 동일(crop 상세 3=3) 확인. **함정 2건**: `grep -c` 는 줄 수라 마커 수가 아니다(1↔2 오판) / **middleware 가 HeadlessChrome UA 를 403 으로 막아** Playwright 기본 UA 실측이 전부 "요소 없음"으로 나온다 — 로컬 실측도 실제 Chrome UA 필수. 되돌림 조건: 2주 뒤 `assess_entry_click` 이 지면별 0에 가까우면 철회 |

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

#### formatPopulation / SEOUL_AREA_KM2 (`@/lib/format`)

- `formatPopulation(pop)`: 인구수 → "123,456명" 정확한 숫자 포맷
- `SEOUL_AREA_KM2 = 605`: 서울 면적 기준 상수 (면적 비교 계산용)
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
- 커밋 후 `git push origin main` → Vercel 자동 배포
- 커밋 메시지 접두사: `feat:`, `fix:`, `style:`, `copy:`, `redesign:`, `refactor:`

### Scripts

| 명령 | 스크립트 | 설명 |
|------|---------|------|
| `npm run check-links` | `scripts/check-links.sh` | 전체 외부 URL 유효성 검사 (HTTP 상태코드 + 타이틀) |
| `npm run check-policy` | `scripts/check-policy-sources.ts` | 지원사업 출처 URL 검증 (스냅샷 비교 모드 포함) |
| `npm run check-integrity` | `scripts/check-regions-stations-integrity.ts` | regions ↔ stations 양방향 sync (CI 자동, 5/12 세종/울산 누락 사고 재발 방지) |
| `npm run knip` | `knip.json` | 미사용 파일·export·타입 검출 (2026-09-04 도입, 기준 0건 유지). scripts·province/district-maps·테스트는 entry, workers·supabase functions·루트 일회성 mjs는 ignore |
| — | `scripts/generate-province-maps.ts` | 시도별 SVG 지도 데이터 생성 |

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
