# Watchlist — 이랑 Code Repo 상시 놓침 방지 SSOT

> reminder-watchman 에이전트의 임계값·억제 이력 관리.
> 2026-04-15 초기 생성 (이랑 코드 리포 하네스 구축).

---

## 1. 임계값 기본값

| 대상 | 기본 임계 | 단위 |
|------|----------|------|
| Uncommit 변경 | 3 | 영업일 (가장 오래된 수정 파일) |
| Unpushed 커밋 | 5 | 건 |
| 타입 에러 | 발견 즉시 | - |
| 빌드 실패 | 발견 즉시 | - |
| 린트 경고 | 5 | 건 |
| 환경변수 누락 | 발견 즉시 (필수 5종) | - |
| 정책 스냅샷 미확인 | 7 | 영업일 |
| 의존성 미업데이트 | 30 | 일 (달력) |
| Kill Criteria 임박 | 2 | 영업일 |

---

## 2. Kill Criteria 날짜 (Sprint1 실행플랜)

| 시나리오 | 날짜 | 조건 | 발동 액션 |
|---------|------|------|----------|
| Scenario A | 2026-04-17 (목) | 일 UV < 5 (GA4) | 개발 7일 중단 + 인터뷰 5건 강제 |
| Scenario B | 2026-05-03 (일) | WAU < 20 | 코드 동결 14일 + PMF 재작성 |

판정일 D-2부터 reminder-watchman이 chief-of-staff에 자동 알림.

---

## 3. 필수 환경변수

### 3-1. 판정 원칙 (2026-04-15 개정)

- **프로덕션 기준은 Vercel 환경변수**. `.env.local` 부재만으로 "누락" 판정 금지.
- 판정 순서:
  1. 코드 통합 여부 먼저 확인 (import / config 파일 / next.config wrapper 등)
  2. 코드 통합됨 → Vercel 환경변수 확인 필요 (CLI 없으면 David에게 대시보드 확인 요청)
  3. 코드 통합 없음 + .env.local 없음 → "미통합" 보고 (누락 아님)
- `.env.local` 공란은 **로컬 개발 영향만**. 프로덕션에서 `enabled: NODE_ENV === "production"` 같은 가드가 있으면 로컬 미설정은 정상.
- 오탐 방지: "env 누락" 보고 전 반드시 해당 SDK의 코드 통합 상태부터 grep.

### 3-2. 로컬 개발용 필수 (.env.local)

1. DATA_GO_KR_API_KEY
2. KOSIS_API_KEY
3. NAVER_CLIENT_ID + NAVER_CLIENT_SECRET
4. NEIS_API_KEY
5. RDA_API_KEY
6. SGIS_KEY + SGIS_SECRET
7. UNSPLASH_ACCESS_KEY
8. NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY

### 3-3. 프로덕션 전용 (Vercel에서만 검증)

- `NEXT_PUBLIC_SENTRY_DSN` — 로컬은 `enabled: false`로 불필요. Vercel Production에만 있으면 OK.
- `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` — 소스맵 업로드용, 선택.

> Sentry는 코드 통합 완료(`next.config.ts` withSentryConfig + `sentry.*.config.ts` 3종 + `src/instrumentation.ts`). `.env.local`에 없어도 정상.

---

## 4. 프로젝트·항목별 오버라이드

| 대상 | 오버라이드 | 사유 | 만료일 |
|------|----------|------|--------|
| (예) .next/ | 무시 | 빌드 아티팩트 | - |

---

## 5. 알림 억제 이력

| 등록일 | 대상 | 억제 유형 | 사유 | 재경고 시점 |
|--------|------|----------|------|------------|
| (비어있음) | | | | |

**억제 유형:**
- `once` — 한 번만 무시
- `session` — 세션 단위
- `until:YYYY-MM-DD` — 특정 날짜까지
- `permanent` — 영구 (David 명시 요청 시만)

---

## 6. 변경 이력

| 날짜 | 변경 | 사유 |
|------|------|------|
| 2026-04-15 | 초기 생성 | 이랑 코드 리포 미니 하네스 구축 |
| 2026-04-15 | 환경변수 판정 원칙 개정 | Sentry 오탐 재발 방지. .env.local 단독 판정 금지, 코드 통합 + Vercel env 기준 |
