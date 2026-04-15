---
name: pre-commit-check
description: "커밋 직전 자동 실행되는 체크리스트 A~H + 카피 톤 + 빌드·타입·린트 통합 점검. .claude/rules/checklist.md의 8개 체크리스트를 자동 검증하고 위반 사항을 발견. 트리거: '커밋 전 체크', 'pre-commit', '커밋 전 확인', '코드 점검', '체크리스트 확인', 'checklist', '커밋해도 되나'. 수동 호출 또는 frontend-engineer가 작업 완료 시 자체 호출. 위반 발견 시 🔴/🟡/⚪ 분류."
---

# Pre-Commit Check — 커밋 직전 통합 점검

## 목적
`.claude/rules/checklist.md`의 8종 체크리스트(A~H) + 카피 톤 + 빌드·타입·린트를 커밋 전 자동 점검. 위반 발견 시 커밋 차단·수정 유도.

## 트리거
- 자연어: "커밋 전 체크", "체크리스트 확인"
- frontend-engineer 작업 완료 시 자동 호출
- 수동 `/pre-commit-check`

## 실행 절차

### STEP 1: 변경된 파일 수집

```bash
git status --short
git diff --name-only
git diff --cached --name-only
```

변경 파일 목록을 STEP 2~8 대상으로 한정.

### STEP 2: 체크리스트 A — 공통 컴포넌트 재사용

변경된 `.tsx`/`.module.css` 파일에서 아래 패턴 검색:

| 패턴 (위반 신호) | 대응 공통 컴포넌트 |
|----------------|------------------|
| `.pageHeader` 로컬 정의 | `@/components/ui/page-header` |
| `.statusBadge` 인라인 | `@/components/ui/status-badge` |
| `.emptyState` 인라인 | `@/components/ui/empty-state` |
| `.cardGrid`·`grid-template-columns` 반응형 | `@/components/ui/card-grid` |
| `filter` + `select`·`pill` 커스텀 | `@/components/filter/filter-bar` |

→ 위반 시 `🔴 FAIL: 페이지 {파일} 에 {공통컴포넌트} 대신 로컬 구현`

### STEP 3: 체크리스트 B — CSS 복붙

- 동일 CSS 블록이 3개+ `page.module.css`에 존재하는지
- `grep -c "display: flex"` 같은 단순 카운트는 의미 없음 — **구조적 동일 블록** 대상

→ 위반 시 `🟡 WARN: 공통 CSS 추출 필요 ({파일들})`

### STEP 4: 체크리스트 C — 인라인 스타일

```bash
grep -rn 'style={{' src/ | grep -v 'objectFit\|width: ${\|height: ${'
```

→ 3회+ 반복 시 `🟡 WARN: 인라인 스타일 {N}건 — CSS class 추출 권고`

### STEP 5: 체크리스트 D — use client 정당성

```bash
grep -l '"use client"' src/app/**/*.tsx src/components/**/*.tsx
```

각 파일에서 `useState`/`useEffect`/`onClick`/`useRouter`/`useSearchParams` 실제 사용 여부 확인. 하나도 없으면:

→ `🟡 WARN: {파일} use client 불필요`

### STEP 6: 체크리스트 E — hover 래핑

```bash
grep -B2 ':hover' src/**/*.module.css | grep -v '@media (hover: hover)'
```

→ 미래핑 hover 있으면 `🔴 FAIL: {파일} hover 미래핑`

### STEP 7: 체크리스트 G — CSS 선언 순서

`@media` 쿼리가 기본 규칙보다 **위**에 있는 파일 감지. 패턴:

```bash
awk '/@media/{m=NR} /^\.[a-zA-Z]+ *{/ && m>0 && NR>m{print FILENAME":"m"->"NR}' src/**/*.module.css
```

→ 의심 파일 있으면 `🟡 WARN: CSS 선언 순서 재검토 ({파일:라인})`

### STEP 8: 카피 톤 점검

변경된 `.tsx` 파일의 문자열 리터럴에서:

| 금지 패턴 | 카운트 |
|----------|------|
| `"~합니다"` | 0 |
| `"~입니다"` | 0 |
| `"~하였습니다"` | 0 |
| `"~다양한"` | 0 (빈 수식어) |
| `"~앞으로"` | 0 |
| `"~기반"` | 0 (빈 수식어) |

→ 1건+ 발견 시 `🟡 WARN: 카피 톤 위반 {파일}:{라인} "{문구}"`

### STEP 9: 빌드·타입·린트

**순차 실행** (실패 시 즉시 중단):
```bash
npx tsc --noEmit  # 타입 체크
npm run lint      # 린트
npm run build     # 빌드
```

- 타입 에러 1건+ → `🔴 FAIL`
- 린트 warning 5건+ → `🟡 WARN`
- 빌드 실패 → `🔴 FAIL`

### STEP 10: 결과 종합

```
## 🔍 Pre-commit Check — {YYYY-MM-DD HH:mm}

### 🔴 FAIL ({N}건) — 커밋 차단
- ...

### 🟡 WARN ({M}건) — 커밋은 가능하나 권고
- ...

### ⚪ INFO ({K}건) — 참고
- ...

### 결과: BLOCK / CONDITIONAL / PASS
```

- FAIL 1건+ → **BLOCK** (커밋 말고 수정 먼저)
- WARN만 → **CONDITIONAL** (David 판단)
- 전부 clean → **PASS**

## 주의사항
- 파일 수정 금지. 점검·보고만.
- 빌드가 느리면 (Next.js 16 빌드 1~3분) "빌드 체크 생략할까요?" 확인
- 체크리스트 F(SPA 네비게이션)·H(Server/Client 경계)는 정적 분석으로 검출이 어려워 수동 검토 권고만 포함

## 팀 통신
- frontend-engineer가 작업 완료 시 자체 호출 우선
- FAIL 발견 시 → frontend-engineer에 재작업 위임
- chief-of-staff에 요약 보고
