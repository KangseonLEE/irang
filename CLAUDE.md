@AGENTS.md

# 이랑 프로젝트 개발 규칙

## 프로젝트 개요

- **서비스명**: 이랑 (irang) — 귀농 정보 큐레이션 포탈
- **브랜드**: 밭고랑(농업 본질) + "함께 이랑" 중의적 의미
- **타겟**: 귀농을 고려하는 3040 도시 직장인
- **기술 스택**: Next.js 16 (App Router) + TypeScript + CSS Modules + lucide-react
- **배포**: Vercel (`irang-wheat.vercel.app`)
- **코드 저장소**: `~/Workspace/irang/`
- **볼트 문서**: `/Users/igangseon/David_agit/10.projects/이랑*.md`

---

## 데이터 조회 원칙

- 공공데이터 API 호출 시 **항상 당해년도 기준**으로 조회한다.
- 연도를 하드코딩하지 않고 `new Date().getFullYear()`로 동적 산출한다.
- 예시: 2026년에 실행하면 startDt=20260101, endDt=20261231

## 환경변수

- API 키는 `.env.local`에서 관리한다.
- `DATA_GO_KR_API_KEY`: data.go.kr 공통 인증키 (기상청, 심평원, 교육부)

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

- `formatPopulation(pop)`: 인구수 → "N만명" 또는 "N명" 포맷
- `SEOUL_AREA_KM2 = 605`: 서울 면적 기준 상수 (면적 비교 계산용)
- **인구 포맷이나 서울 비교 로직을 인라인으로 재작성하지 않는다**

#### TermTooltip / GlossaryTerm (`@/components/ui/term-tooltip`)

- 전문 용어 CSS-only 툴팁 (hover/focus-within, `"use client"` 불필요)
- `GlossaryTerm`: 내장 용어 사전(`GLOSSARY`)에서 자동 매칭
  - 등록 용어: ha, 10a, 노지, 시설재배, 스마트팜, 전업농, 겸업농, 영농정착지원금, 체류형귀농, 귀농, 귀촌
- `TermTooltip`: 커스텀 용어-설명 직접 전달
- **초보자가 모를 수 있는 농업/부동산 전문 용어에 적극 적용**
- 새 용어 추가: `term-tooltip.tsx`의 `GLOSSARY` 객체에 key-value 추가

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
- 데이터 수치(PROVINCES.length 등) 하드코딩 금지 → 배열 길이에서 동적 계산

---

## 카피라이팅 원칙

> 토스 라이팅 원칙 + 제일기획 수준 벤치마킹 기반

### 핵심 규칙

1. **"~합니다" 금지**. "~세요" 또는 명사 종결 사용.
2. **서비스를 주어로 세우지 않는다**. "이랑이 정리한 ~" ← 금지. 사용자 관점으로.
3. **섹션 제목 10자 이내**. 길어도 13자 초과 금지.
4. **잡초 제거**: "앞으로", "다양한", "기반" 같은 넣어도 빠져도 그만인 단어 삭제.
5. **빈 문장 제거**: 제목에서 한 말을 서브헤드에서 반복하지 않음.
6. **설명하지 말고 느끼게**: 기능 나열보다 사용자 감정/상태 변화를 담는다.
7. **소리 내어 읽었을 때 자연스러운 문장**. 한자어·문어체 금지.
8. **강요 대신 제안**: 공포 마케팅, 손실 강조 금지. 혜택을 중립적으로.

### 카피 패턴 (참고)

| 패턴 | 예시 |
|------|------|
| 끊어 말하기 (쉼표 분절) | "귀농, 막막할수록 숫자가 답입니다" |
| 범위 확장형 (~부터 ~까지) | "세금 납부, 등본 발급까지 토스로 한 번에" |
| 수치/시간 구체화 | "5분이면 내 귀농지 윤곽이 잡힙니다" |
| 감정형 선언 (마침표.) | "출처가 분명한 정보입니다" |

### 현재 적용된 랜딩 카피 (변경 시 위 원칙 준수)

```
[아이브로우] 어디로 갈지 모르겠다면
[헤드라인]   내 땅을 찾는 / 가장 빠른 길
[서브헤드]   지역, 작물, 지원금까지 한 곳에서 비교하세요.
[벤토 섹션]  여기서 시작하세요
[트렌드]     지금, 농촌은
[트렌드 서브] 같은 생각을 한 사람들, 이렇게 많아요.
[귀농 이유]  떠난 사람들의 이유
[뉴스]       농촌 소식
[데이터]     믿을 수 있는 숫자
[CTA 제목]   내 땅, 어디쯤일까요?
[CTA 설명]   나이, 예산, 원하는 삶의 방식만 알려주세요.
[CTA 버튼]   내 귀농지 찾기
```

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

### 8. 외부 URL 검증은 이중 체크 필수

- `sourceUrl`, `url` 등 외부 링크를 데이터에 추가/변경할 때 반드시 **이중 검증**한다:
  1. **HTTP 상태코드 확인**: `curl -sL -o /dev/null -w "%{http_code}" URL`
  2. **페이지 타이틀/본문 확인**: `curl -sL URL | sed -n 's/.*<title>\(.*\)<\/title>.*/\1/p'`
- **소프트 404 패턴**: 한국 정부/공공 사이트(gov.kr, go.kr 등)는 페이지가 삭제되어도 HTTP 200을 반환하면서 실제 화면에 "서비스를 찾을 수 없습니다", "페이지를 찾을 수 없습니다" 등을 표시하는 경우가 흔하다. 상태코드만으로 판단 금지.
- **타이틀 소프트 404 키워드**: `찾을 수 없`, `not found`, `404`, `에러`, `존재하지`, `서비스를 찾`, `오류`, `접근할 수 없`
- **한국 뉴스 사이트 주의**: HEAD 요청 시 404/403/405를 반환하지만, GET 요청으로는 정상 콘텐츠를 서빙하는 경우가 많다. 반드시 GET으로 검증한다.
- **도메인 변경 감지**: 리다이렉트(`curl -sL -w "%{url_effective}"`)로 최종 도메인이 바뀌면 canonical URL로 교체한다.
- 데이터 일괄 교체 시에는 전체 URL 전수조사를 실시한다.

### 9. 반복 문제 방지 — 코드 작성 전 체크리스트

> 아래 체크리스트를 **코드를 한 줄이라도 작성하기 전에** 확인한다. 과거에 반복적으로 발생했던 문제들을 방지하기 위한 규칙이다.

#### 체크리스트 A: "이미 있는 것을 또 만들고 있지 않은가?"

| 만들려는 것 | 먼저 확인할 공통 컴포넌트 |
|-------------|--------------------------|
| 페이지 헤더 (아이콘+라벨+h1+설명+건수) | `@/components/ui/page-header` |
| 필터 바 (pill 필터, 검색, 토글) | `@/components/filter/filter-bar` |
| 상태 배지 (모집중/마감 등) | `@/components/ui/status-badge` |
| 빈 상태 UI (dashed border + 안내문) | `@/components/ui/empty-state` |
| 반응형 카드 그리드 (1→2→3열) | `@/components/ui/card-grid` |
| 전문 용어 툴팁 (ha, 10a 등) | `@/components/ui/term-tooltip` |

**위 목록에 해당하는 UI를 페이지 파일 안에 직접 구현하면 안 된다.** 공통 컴포넌트를 import하여 사용한다.

#### 체크리스트 B: "CSS를 복붙하고 있지 않은가?"

- 새 `page.module.css`에 CSS를 작성하기 전에, 동일한 스타일이 **다른 page.module.css에 이미 있는지** 검색한다.
- 3개 이상의 파일에서 동일 CSS 블록이 나타나면 → `src/components/` 아래에 공통 컴포넌트/CSS로 추출한다.
- **절대 금지**: `.pageHeader`, `.headerTop`, `.headerTitle`, `.statusBadge`, `.emptyState` 등 공통 패턴을 page.module.css에 새로 정의하는 것.

#### 체크리스트 C: "인라인 스타일을 쓰고 있지 않은가?"

- `style={{ display: "flex", ... }}` 같은 인라인 스타일은 원칙적으로 금지.
- **허용 예외**: 동적 계산 값 (`width: ${progress}%`), `objectFit`, 1회성 크기 지정.
- 인라인 스타일이 3번 이상 반복되면 반드시 CSS class로 추출한다.

#### 체크리스트 D: "클라이언트 컴포넌트가 정말 필요한가?"

- `"use client"` 추가 전: 이 컴포넌트에 `useState`, `useEffect`, `onClick` 등이 **진짜 필요한지** 확인한다.
- CSS-only로 해결 가능한 인터랙션 (hover 툴팁, 토글 등)은 서버 컴포넌트로 유지한다.
- Link 기반 필터링은 서버 컴포넌트에서 가능 → `useRouter`/`useSearchParams` 불필요.

#### 체크리스트 E: "@media (hover: hover) 래핑했는가?"

- 모든 `:hover` 스타일은 `@media (hover: hover) { }` 안에 넣어야 한다.
- 터치 디바이스에서 hover가 고착(sticky)되는 문제를 방지한다.
- 이 규칙을 어긴 hover 스타일이 발견되면 즉시 수정한다.

#### 체크리스트 F: "CSS 선언 순서가 올바른가?"

- **기본 규칙 → `@media` 오버라이드** 순서를 반드시 지킨다.
- 미디어쿼리가 기본 규칙보다 **위에** 선언되면, 기본 규칙이 나중에 파싱되어 오버라이드를 무효화한다.
- CSS Modules에서도 동일: 같은 파일 내 선언 순서가 specificity를 결정한다.
- **검증 방법**: 미디어쿼리를 작성한 뒤, 해당 셀렉터의 기본 규칙이 미디어쿼리보다 **아래에** 있지 않은지 반드시 확인한다.
- 잘못된 예:
  ```css
  @media (max-width: 639px) { .foo { flex: unset; } }  /* 113행 */
  .foo { flex: 1; }                                      /* 127행 ← 이게 이김! */
  ```
- 올바른 예:
  ```css
  .foo { flex: 1; }                                      /* 기본 먼저 */
  @media (max-width: 639px) { .foo { flex: unset; } }   /* 오버라이드 나중에 */
  ```

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

---

## 차트 컴포넌트 가이드

- 위치: `src/components/charts/`
- 라이브러리: Recharts 3.x (`"use client"` 필수)
- 공용 스타일: `chart-styles.module.css` (툴팁, 범례, 인사이트 배지)
- 브랜드 색상 상수: 각 차트 파일 상단에 `COLOR_PRIMARY = "#1B6B5A"` 등 정의
- 유의미 데이터 판별: 평균값 기준, 특정 연도 Set, 상위 N개 등 데이터 성격에 맞게
- 원인 분석: `CauseAnalysis` 인터페이스 (`stats.ts`), `CauseAnalysisSection` 아코디언 컴포넌트
