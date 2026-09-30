# Sentry → GitHub 이슈 브리지 (2026-09-30)

## 왜 만들었나

Sentry 알림 규칙(Alert Rule)의 **GitHub 이슈 생성 액션**이
`The GitHub action is no longer available` 로 죽어 있다(요금제 변경 추정).
그 결과 아래 알림 체인이 끊겼다.

```
Sentry 오류/피드백 → GitHub Issue → auto-assign-issues 워크플로 → iPhone 푸시
```

무료 플랜에서도 쓸 수 있는 **Internal Integration 웹훅**으로 첫 화살표를 대체한다.

```
Sentry Alert Rule 액션 → POST /api/sentry-webhook → GitHub Issues API
   → auto-assign-issues(issues: opened) → assignee KangseonLEE → iPhone 푸시
```

## 구성

| 파일 | 역할 |
|---|---|
| `src/app/api/sentry-webhook/route.ts` | 웹훅 수신·서명 검증·리소스 분기·상태코드 |
| `src/lib/sentry-webhook/verify.ts` | `sentry-hook-signature` HMAC-SHA256 검증(timing-safe) |
| `src/lib/sentry-webhook/payload.ts` | `event_alert` · `issue` 페이로드 → `SentryReport` |
| `src/lib/sentry-webhook/github.ts` | 이슈 제목·본문(마크다운 표) 조립, 중복 확인 → 생성/코멘트 |
| `src/__tests__/sentry-webhook.test.ts` | 서명·분기·본문 변환·중복 경로 21건 |

### 동작 규칙

- **서명**: 본문 원문(`request.text()`)을 Client Secret 으로 HMAC-SHA256 → hex 를
  `sentry-hook-signature` 와 timing-safe 비교.
- **상태코드**: 시크릿·토큰 미설정 `503` / 서명 불일치 `401` / 우리가 다루지 않는
  리소스·action `204` / 본문 JSON 깨짐 `400` / GitHub 실패 `502`(Sentry 재시도) / 성공 `200`.
  **성공처럼 보이는 조용한 통과는 만들지 않는다** — 5/26 quick_feedback silent 202 가
  33일 잠복한 교훈.
- **리소스**: `event_alert`(알림 규칙 액션), `issue`(action `created`·`unresolved`·`regression`만).
  `resolved`·`assigned` 등은 204 로 흘린다(소음 방지).
- **중복 방지**: 이슈 본문에 `<!-- sentry:<issue id> -->` 마커. 생성 전에
  `GET /search/issues?q=repo:… "sentry:<id>" in:body` 로 찾아 있으면 **코멘트만** 추가.
  검색 API 가 실패(레이트 리밋)하면 생성으로 넘어간다 — 알림 유실이 중복 이슈보다 나쁘다.
- **라벨**: 오류 `bug` / 사용자 피드백 `user-feedback`. 라벨이 리포에 없어 422 가 나면
  라벨 없이 한 번 더 생성한다.
- 서버-서버 호출이라 내부 트래픽 게이트(`internalSkipReason`)는 적용하지 않는다
  (집계 테이블에 쓰지 않고, Sentry 는 표식을 실을 수도 없다).
- 모든 외부 호출에 `AbortSignal.timeout(10_000)`.

## 설정 절차 (회장 조치)

### ① GitHub 토큰

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
2. Repository access: **Only select repositories → `irang`**
3. Permissions → Repository permissions → **Issues: Read and write** (Metadata: Read 는 자동 포함)
4. 만료: **1년** (만료일을 캘린더에 기록 — 만료되면 알림이 조용히 끊긴다)
5. 발급된 토큰을 Vercel → Project `irang` → Settings → Environment Variables 에
   **`GITHUB_ISSUE_TOKEN`** / Environment **Production** / **Sensitive** 로 등록

> 등록 직후 실측 필수: `cd` 체인에서 변수가 비어 **빈 시크릿이 "Success" 로 등록**되는 함정이 있다(8/30).

### ② Sentry Internal Integration

1. Sentry → **Settings → Developer Settings → Custom Integrations → Create New Integration → Internal Integration**
2. Name: **`irang-github-bridge`**
3. Webhook URL: **`https://irangfarm.com/api/sentry-webhook`**
4. **Alert Rule Action 켜기** (이걸 켜야 알림 규칙 THEN 목록에 이 통합이 나타난다)
5. Permissions → **Issue & Event: Read**
6. Webhooks → **issue** 체크
7. 저장 후 상세 화면의 **Client Secret** 복사 → Vercel env
   **`SENTRY_WEBHOOK_SECRET`** / **Production** / **Sensitive** 로 등록
8. env 2종 등록 후 **재배포** (env 는 새 빌드에만 반영된다)

### ③ 알림 규칙 교체 (오류·피드백 2개)

각 규칙 편집 → **THEN** 절에서
- 죽은 **GitHub 이슈 생성 액션 제거**
- **`Send a notification via irang-github-bridge`** 추가

### ④ 검증

1. Internal Integration 상세 화면 → **Send Test Notification**
2. `https://github.com/KangseonLEE/irang/issues` 에 `[Sentry] …` 이슈 생성 확인
3. auto-assign 워크플로가 KangseonLEE 를 assign → **iPhone 푸시** 수신 확인
4. 같은 이슈로 한 번 더 발사 → 새 이슈 대신 **코멘트**가 붙는지 확인

## 알아 둘 것

- **코멘트 경로는 `issues: opened` 를 트리거하지 않는다** → auto-assign 이 돌지 않는다.
  다만 그 이슈는 이미 KangseonLEE 에게 assign 돼 있어 GitHub 의 코멘트 알림으로 전달된다.
- 이슈 생성에 **PAT** 를 쓰므로 워크플로가 정상 트리거된다(`GITHUB_TOKEN` 으로 만든 이슈는
  워크플로를 트리거하지 않는다).
- Search API 는 색인 지연이 있어(수초~수십초) 같은 이슈가 아주 빠르게 두 번 발사되면
  이슈가 2건 생길 수 있다. 중복이 보이면 한 건을 닫는다.
- 토큰 만료·Client Secret 회전 시 **양쪽(발급처·Vercel env) 등록을 즉시 실측**한다
  (7/25 `E2E_SECRET` 미등록이 2달 잠복한 패턴).
