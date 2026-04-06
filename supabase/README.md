# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 → 로그인
2. "New Project" 클릭
3. 프로젝트 설정:
   - **Name**: `irang`
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: `Northeast Asia (Tokyo)` (한국 서비스 최적)
4. 프로젝트 생성 완료까지 약 2분 대기

## 2. 스키마 적용

1. Supabase Dashboard → **SQL Editor** 열기
2. `supabase/schema.sql` 파일 내용을 복사하여 실행
3. 테이블 4개 + 뷰 3개 + 트리거 3개가 생성됨

```
support_programs    — 지원사업
education_courses   — 교육과정
farm_events         — 행사/체험
data_sync_log       — 동기화 이력
```

## 3. 환경변수 설정

Supabase Dashboard → **Settings** → **API** 에서 확인:

```env
# .env.local 에 추가
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...    # ⚠️ 서버 전용 (시드/관리 스크립트)
```

Vercel Dashboard → **Settings** → **Environment Variables** 에도 동일하게 ���가.

## 4. 시드 데이터 삽입

```bash
# 프로젝트 루트에서 실행
npx tsx supabase/seed.ts
```

기존 정적 데이터(.ts)에서 핵심 항목들을 DB로 마이그레이션합니다.

## 5. 데이터 갱신

### 수동 갱신
- Supabase Dashboard → **Table Editor** 에서 직접 수정

### 자동 상태 업데이트
Supabase Dashboard → **SQL Editor** 에서 cron 설정:
```sql
-- pg_cron 확장 활성화 (Supabase Pro 플랜)
SELECT cron.schedule(
  'auto-update-status',
  '0 6 * * *',  -- 매일 오전 6시
  $$ SELECT auto_update_program_status() $$
);
```

### API 연동 (향후)
- Edge Function으로 RDA API 데이터 자동 동기화
- `data_sync_log` 테이블에 이력 기록

## 아키텍처

```
[Next.js App]
    ├── Supabase 설정됨 → DB에서 실시간 조회
    └── 미설정 → 정적 .ts 파일 폴백 (개발/데모)

[Supabase DB]
    ├── support_programs  (지원사업)
    ├── education_courses (교육과정)
    ├── farm_events       (행사/체험)
    └── data_sync_log     (동기화 로그)

[데이터 흐름]
    수동 입력 (Dashboard) ─┐
    RDA API 동기화 ──��─────┤→ Supabase DB → Next.js 서버 컴포넌트
    웹 스크래핑 ───────────┘
```
