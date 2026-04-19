@AGENTS.md

# 이랑 프로젝트 개발 규칙

> 이 파일은 Claude가 세션마다 자동 로드하는 규칙이다.
> **하네스 계층**: 에이전트·스킬·hook은 `.claude/` 하위에 분리. 이 파일(CLAUDE.md)은 기존 코드 컨벤션·디자인 원칙을 보존하고, 하네스 진입점만 §0에 추가.

---

## 0. 하네스 진입점 (2026-04-15 추가)

### 0-1. 디스패치 테이블

| 트리거 | 대상 | 비고 |
|--------|------|------|
| "이랑 작업", "코드 작업", "배포 준비", "개발 진행상황" | `chief-of-staff` 에이전트 | 회장 대리, 분배·종합 |
| "페이지 만들어줘", "컴포넌트 추가", "UI 수정", "CSS 조정" | `frontend-engineer` 에이전트 | Next.js 16 + CSS Modules 구현 |
| "API 연동", "데이터 갱신", "Supabase", "DB 스키마", "공공데이터" | `data-engineer` 에이전트 | 8 API · 폴백 · 마이그레이션 |
| "QA 해줘", "배포 전 점검", "Lighthouse", "린트 체크" | `qa-reviewer` 에이전트 | 배포 전 게이트 |
| "놓친 거 확인", "상시 점검", "stale 체크" | `reminder-watchman` 에이전트 | uncommit·타입·빌드·API 상시 |
| "커밋 전 체크", "체크리스트 확인" | `.claude/skills/pre-commit-check/SKILL.md` | A~H 자동 검증 |
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
- Kill Criteria 날짜(4/17, 5/3) D-2부터 chief-of-staff가 자동 알림

### 0-4. David_agit(기획 볼트) 연동

- 기획 SSOT: `/Users/igangseon/David_agit/10.projects/이랑/` (19개 활성 + 21개 _archive, 허브 `이랑.md`)
- 코드 변경이 기획에 영향 → chief-of-staff가 허브 Progress Log 갱신 제안
- 기획 변경이 코드에 영향 → David_agit-CoS로부터 위임 요청 수신

---

## 기존 프로젝트 개발 규칙 (이하 원본 유지)


## 프로젝트 개요

- **서비스명**: 이랑 (irang) — 귀농 정보 큐레이션 포탈
- **브랜드**: 밭고랑(농업 본질) + "함께 이랑" 중의적 의미
- **타겟**: 귀농을 고려하는 3040 도시 직장인
- **기술 스택**: Next.js 16 (App Router) + TypeScript + CSS Modules + lucide-react
- **배포**: Vercel (`irang-wheat.vercel.app`)
- **코드 저장소**: `~/Workspace/irang/`
- **볼트 문서**: `/Users/igangseon/David_agit/10.projects/이랑/이랑-*.md` (19개 활성 + 21개 `_archive/`, 허브 노트 `이랑.md`)

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

## 환경변수 & 외부 API

API 키는 `.env.local`에서 관리한다. Vercel 환경변수에도 동일하게 설정.

| 환경변수 | 용도 | API 파일 | 폴백 |
|---------|------|----------|------|
| `DATA_GO_KR_API_KEY` | data.go.kr 공통 (기상청·심평원·교육부) | `weather.ts`, `hira.ts`, `education.ts` | 정적 데이터 |
| `KOSIS_API_KEY` | 통계청 KOSIS (인구·귀농 통계) | `kosis.ts` | `POPULATION_FALLBACK` |
| `NAVER_CLIENT_ID` / `SECRET` | 네이버 뉴스 검색 | `news.ts` | `landing.ts` 정적 뉴스 |
| `NEIS_API_KEY` | 교육부 NEIS (학교 목록) | Route Handler | 빈 리스트 |
| `RDA_API_KEY` | 농진청 (작물 상세) | `rda.ts` | `crops.ts` 정적 |
| `SGIS_KEY` / `SECRET` | 통계청 SGIS (인구 밀도) | `sgis.ts` | `population.ts` 정적 |
| `UNSPLASH_ACCESS_KEY` | Unsplash (지역 이미지) | `unsplash.ts` | 기본 이미지 |
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
- **한국어 줄바꿈**: `word-break: keep-all` 글로벌 적용 (globals.css). 문장 중간 끊김 방지. 개별 컴포넌트에서 `word-break: break-all` 사용 금지.
- **제목 줄바꿈**: h1~h6에 `text-wrap: balance` 글로벌 적용. 좌우 균등 줄바꿈.

### 컴포넌트

- Server Component 기본. 인터랙션 필요 시에만 `"use client"` 사용.
- SSR 안전: 클라이언트 컴포넌트에서 `useState` + `useEffect` 패턴으로 `mounted` 플래그 사용 (localStorage 등)
- 아이콘: lucide-react 전용. 크기는 `size` prop 사용 (14~20px 범위).
- 장식 요소에는 `aria-hidden="true"` + `pointer-events: none` 필수.

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
- Props: `open`, `onClose`, `title`, `children`
- z-index: 200, max-width: 640px, max-height: 80vh
- **모달이 필요하면 반드시 이 컴포넌트 사용. 페이지별 모달 재구현 금지**

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

> 상세 체크리스트(A~H)는 `.claude/rules/checklist.md` 참조

**핵심 3줄 요약**: 공통 컴포넌트 재사용 필수. 인라인 스타일·CSS 복붙 금지. Server↔Client 경계 준수.

---

## 빌드 & 배포

- 빌드 명령: `npm run build`
- SGIS API 관련 경고는 정상 (Dynamic route fallback)
- 커밋 후 `git push origin main` → Vercel 자동 배포
- **배포 상태 자동 확인**: `git push` 후 반드시 아래 명령으로 배포 완료를 확인하고 결과를 사용자에게 보고한다.
  ```bash
  # 1) 최신 배포 ID 조회
  gh api repos/KangseonLEE/irang/deployments --jq '.[0].id'
  # 2) 해당 배포의 상태 확인 (success / pending / failure)
  gh api repos/KangseonLEE/irang/deployments/{id}/statuses --jq '.[0] | "\(.state) | \(.description)"'
  ```
  - `pending`이면 30초 후 재확인, 최대 3회 재시도
  - 결과를 ✅/❌ 이모지와 함께 간결하게 보고
- 커밋 메시지 접두사: `feat:`, `fix:`, `style:`, `copy:`, `redesign:`, `refactor:`

### Scripts

| 명령 | 스크립트 | 설명 |
|------|---------|------|
| `npm run check-links` | `scripts/check-links.sh` | 전체 외부 URL 유효성 검사 (HTTP 상태코드 + 타이틀) |
| `npm run check-policy` | `scripts/check-policy-sources.ts` | 지원사업 출처 URL 검증 (스냅샷 비교 모드 포함) |
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

---

## 차트 컴포넌트 가이드

- 위치: `src/components/charts/`
- 라이브러리: Recharts 3.x (`"use client"` 필수)
- 공용 스타일: `chart-styles.module.css` (툴팁, 범례, 인사이트 배지)
- 브랜드 색상 상수: 각 차트 파일 상단에 `COLOR_PRIMARY = "#1B6B5A"` 등 정의
- 유의미 데이터 판별: 평균값 기준, 특정 연도 Set, 상위 N개 등 데이터 성격에 맞게
- 원인 분석: `CauseAnalysis` 인터페이스 (`stats.ts`), `CauseAnalysisSection` 아코디언 컴포넌트
