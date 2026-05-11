# data-engineer 보고 표준 템플릿

> chief-of-staff.md 5/11 1on1 인수 체크리스트 8종 중 #1~#3에 매핑.
> 보고 유형에 따라 해당 섹션만 채우고 나머지는 삭제.
> 모든 라인은 `scripts/cos-inbox-check.ts`가 자동 grep함 — 라벨/키워드 변경 시 스크립트도 함께 갱신.

---

## 핵심 결론 (1-3줄)

(요약)

## 변경 / 작업 파일

- `path/to/file.ts` — 변경 사유 한 줄
- `path/to/file2.ts` — 변경 사유 한 줄

---

## 보고 유형: 진단·검증 (prod write 동반)

> 인수 체크리스트 #1. data-engineer.md 5/11 1on1 가드 #5 근거.

### 검증 결과

- INSERT 결과: row 1건 정상 적재 확인 ✅
- (필수) 잔존 row 0건 SELECT 결과: 0건 ✅
  - 실행 쿼리: `SELECT count(*) FROM <table> WHERE <조건>`
  - 결과 시각: YYYY-MM-DD HH:MM
- 어드민 UI 표시 확인: 영향 없음 ✅

### cleanup 절차

- DELETE 쿼리: `DELETE FROM <table> WHERE <조건>`
- 영향 행 수: N건
- 재검증: SELECT count(*) = 0 ✅

---

## 보고 유형: API · 정적 데이터 갱신

> 인수 체크리스트 #2. CLAUDE.md David 철학 #8 (외부 URL 삼중 체크) 근거.

### 데이터 변경 요약

- 추가/갱신 항목: N건
- 출처: <기관명, URL>

### (필수) 출처 URL 삼중 검증

| URL | HTTP | 정상 타이틀 | 비정상 키워드 |
|-----|------|-----------|--------------|
| https://... | HTTP 200 ✅ | "..." 확인 ✅ | 비정상 키워드 0건 ✅ |

- 삼중 검증 통과: ✅ (HTTP 200 + 정상 타이틀 + 비정상 키워드 0건)
- 비정상 키워드 체크 항목: 찾을 수 없 / not found / 404 / GoDaddy / Sedo / 파킹 / 접근 제한 등

---

## 보고 유형: Supabase 마이그레이션

> 인수 체크리스트 #3. CLAUDE.md 회장 결재 사항 (DB 변경) 근거.

### 스키마 변경 요약

- 대상 테이블: `<table_name>`
- 변경 내용: (컬럼 추가/삭제/타입 변경 등)
- 영향 범위: (어디 코드가 영향받는지)

### (필수) 파일 생성

- 마이그레이션 파일 생성 완료 (apply 안 함)
- 파일 경로: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
- 적용 명령: 회장 결재 후 `supabase migration up` 실행 예정

### 롤백 plan

- 롤백 SQL: (down 스크립트 또는 수동 절차)

---

## 리스크 / 후속 작업

- (있으면 기재, 없으면 "없음")
