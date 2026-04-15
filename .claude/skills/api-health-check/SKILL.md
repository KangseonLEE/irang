---
name: api-health-check
description: "8개 외부 API(기상청·SGIS·KOSIS·NEIS·HIRA·RDA·네이버·Unsplash) 연동 건강성 + 환경변수 존재 + 폴백 작동·Supabase 연결·Sentry DSN 통합 점검. 트리거: 'API 확인', 'API 건강성', '환경변수 점검', 'api 상태', 'api-health-check', '외부 API 작동하나'. 각 API 1건씩 샘플 호출 + 응답 시간·상태 기록. data-engineer가 주기 실행."
---

# API Health Check — 외부 API 건강성 점검

## 목적
이랑이 의존하는 8개 외부 API + Supabase + Sentry의 실제 작동 여부·환경변수 설정·폴백 동작을 통합 점검.

## 트리거
- 자연어: "API 확인", "환경변수 점검"
- data-engineer 주 1회 실행 권고
- 배포 전 qa-reviewer가 호출

## 실행 절차

### STEP 1: 환경변수 존재 확인

`.env.local` 읽기(내용 출력 금지. 키 목록만):

```bash
grep -o '^[A-Z_]*' .env.local | sort -u
```

필수 키 13종:
1. `DATA_GO_KR_API_KEY`
2. `KOSIS_API_KEY`
3. `NAVER_CLIENT_ID`
4. `NAVER_CLIENT_SECRET`
5. `NEIS_API_KEY`
6. `RDA_API_KEY`
7. `SGIS_KEY`
8. `SGIS_SECRET`
9. `UNSPLASH_ACCESS_KEY`
10. `NEXT_PUBLIC_SUPABASE_URL`
11. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
12. `NEXT_PUBLIC_SENTRY_DSN`
13. `SENTRY_AUTH_TOKEN` (선택, 소스맵 업로드용)

누락 시 `🔴 FAIL`. **이 중 Sentry DSN은 critical-reviewer 04-15 지적 재확인 대상**.

### STEP 2: 각 API 샘플 호출

| API | 테스트 엔드포인트 | 기대 응답 |
|-----|----------------|---------|
| 기상청 (data.go.kr) | 서울 기상관측 1건 | 200 + JSON |
| KOSIS | 전국 인구 1건 | 200 + JSON |
| SGIS | 인구 밀도 샘플 | 200 + JSON |
| NEIS | 서울 학교 1건 | 200 + JSON |
| HIRA | 의료기관 1건 | 200 + JSON |
| RDA | 작물 상세 1건 | 200 + JSON |
| 네이버 뉴스 | "귀농" 검색 | 200 + JSON |
| Unsplash | "farm" 이미지 1건 | 200 + JSON |
| Supabase | 테이블 존재 확인 | 200 + 배열 |

**실행 방법**: `src/lib/api/*.ts`의 실제 연동 함수를 `scripts/health-check.ts`(없으면 신규 생성 제안) 통해 호출.

**수집 정보**:
- HTTP status
- 응답 시간(ms)
- 에러 메시지 (있을 때)

### STEP 3: 폴백 작동 확인

각 API에 대해 의도적으로 잘못된 키로 호출 → 폴백 데이터가 반환되는지:

| API | 폴백 소스 | 검증 |
|-----|---------|------|
| KOSIS | `POPULATION_FALLBACK` | 객체 반환 |
| SGIS | `src/lib/data/population.ts` | 배열 반환 |
| RDA | `src/lib/data/crops.ts` | 배열 반환 |
| 기상청 | 정적 데이터 | 객체 반환 |
| ... | | |

폴백 실패 시 `🔴 FAIL` (에러 throw는 프로덕션에서 500 유발).

### STEP 4: Sentry 연결 확인

- `sentry.client.config.ts` / `sentry.edge.config.ts`의 DSN 변수 읽기
- 실제 이벤트 1건 test 전송 (옵션)
- Sentry 프로젝트 대시보드에서 수신 확인 (수동 검토 단계)

### STEP 5: 결과 리포트

```
## 🔌 API Health Check — {YYYY-MM-DD HH:mm}

### 환경변수 ({X}/13 설정)
- ✅ 설정: ...
- ❌ 누락: NEXT_PUBLIC_SENTRY_DSN (경로: sentry.client.config.ts:7)

### API 응답 (8/8 정상 기준)
| API | Status | 응답시간 | 비고 |
|-----|--------|---------|------|
| 기상청 | 200 | 320ms | ✅ |
| KOSIS | 429 | - | ⚠️ Rate limit |
| ... | | | |

### 폴백 (8/8 정상)
- ✅ 모든 폴백 작동

### Sentry
- ✅ DSN 설정됨, 이벤트 수신 확인 필요 (수동)

### 배포 판정: READY / DEGRADED / BLOCK
```

## 주의사항
- `.env.local` 내용을 채팅에 출력 금지
- Rate limit 소진 우려 — 샘플은 각 1건만
- Supabase anon key로 RLS 우회 금지 (데이터 읽기만)
- 실행 시 실제 API 호출 비용 발생 가능 — 주 1회 권고

## 팀 통신
- data-engineer 1차 실행
- qa-reviewer가 배포 전 재실행
- FAIL 건 → chief-of-staff 에스컬레이션 (환경변수 누락은 회장 개입 없이 data-engineer가 자체 조치)
