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

## 3. 필수 환경변수 (.env.local 체크 대상)

1. DATA_GO_KR_API_KEY
2. KOSIS_API_KEY
3. NAVER_CLIENT_ID + NAVER_CLIENT_SECRET
4. NEIS_API_KEY
5. RDA_API_KEY
6. SGIS_KEY + SGIS_SECRET
7. UNSPLASH_ACCESS_KEY
8. NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
9. **NEXT_PUBLIC_SENTRY_DSN** (critical-reviewer 04-15 지적 재확인 대상)

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
