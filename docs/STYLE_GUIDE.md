# 이랑 디자인 시스템 스타일 가이드

> **최종 업데이트**: 2026-04-11  
> **대상 사용자**: 40~60대 귀농·귀촌 희망자 (가독성 최우선)  
> **기술 스택**: Next.js App Router · CSS Modules · CSS Custom Properties (No Tailwind)

---

## 1. 컬러 토큰

### 1.1 기본 시맨틱 컬러

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--background` | `#FFFFFF` | 페이지 배경 |
| `--foreground` | `#111827` | 본문 텍스트 |
| `--card` | `#FFFFFF` | 카드/컨테이너 배경 |
| `--primary` | `#1b6b5a` | 브랜드 주색, CTA, 링크 |
| `--primary-foreground` | `#FFFFFF` | primary 배경 위 텍스트 |
| `--secondary` | `#F0F9F6` | 연한 브랜드 배경 |
| `--muted` | `#F9FAFB` | 비활성/보조 배경 |
| `--muted-foreground` | `#6B7280` | 보조 텍스트, 캡션 |
| `--border` | `#E5E7EB` | 테두리, 구분선 |
| `--destructive` | `#DC2626` | 위험/삭제 액션 |

### 1.2 상태 컬러

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--success` | `#16A34A` | 성공, 긍정 지표 |
| `--warning` | `#D97706` | 경고, 주의 |
| `--warning-light` | `#eab308` | 팁, 우대 안내 |
| `--error` | `#DC2626` | 에러, 의무사항 |
| `--error-light` | `#ef4444` | 연한 에러 배경 |
| `--info` | `#2563EB` | 정보, 설명회 |

### 1.3 브랜드 스케일 (50~900)

```
--brand-50:  #F0F9F6    --brand-500: #1b6b5a
--brand-100: #D4EDE6    --brand-600: #155748
--brand-200: #A8D9CC    --brand-700: #0F4035
--brand-300: #70BEA9    --brand-800: #092922
--brand-400: #3EA088    --brand-900: #041410
```

### 1.4 컬러 사용 규칙

```css
/* ✅ 올바른 사용 — 시맨틱 토큰 + 폴백 */
color: var(--foreground, #111827);
background: var(--card, #fff);
border: 1px solid var(--border, #e5e7eb);

/* ✅ color-mix 내부 — var() 래핑 필수 */
background: color-mix(in srgb, var(--primary, #1b6b5a) 10%, transparent);

/* ✅ 흰색 텍스트 (컬러 배경 위) */
color: var(--primary-foreground);

/* ❌ 금지 — raw hex 직접 사용 */
color: #1b6b5a;           /* → var(--primary) */
background: #fff;         /* → var(--card) 또는 var(--background) */
color: #fff;              /* → var(--primary-foreground) */
```

**예외**: 장식용 일회성 컬러(그라데이션, 고유 틴트)는 raw hex 허용.

---

## 2. 타이포그래피

### 2.1 폰트 사이즈 스케일

Minor Third (1.2) 기반, 모바일 우선.

| 토큰 | Mobile | Tablet (768px) | Desktop (1024px) |
|------|--------|----------------|------------------|
| `--fs-h2` | 24px | 28px | 30px |
| `--fs-h3` | 20px | 22px | 24px |
| `--fs-h4` | 18px | 19px | 20px |
| `--fs-body-lg` | 17px | 17px | 18px |
| `--fs-body` | 16px | 16px | 16px |
| `--fs-body-sm` | 15px | 15px | 15px |
| `--fs-caption` | 13px | 13px | 14px |
| `--fs-overline` | 11px | 12px | 12px |

### 2.2 페이지 레벨 타이포그래피

상세 페이지(regions/[id]/[sigungu], programs/[id] 등) 전용.

| 토큰 | Mobile | Tablet (768px) | Desktop (1024px) |
|------|--------|----------------|------------------|
| `--fs-detail-title` | 24px | 28px | 32px |
| `--fs-detail-overline` | 13px | 13px | 13px |
| `--fs-detail-desc` | 14px | 15px | 15px |
| `--fs-section-title` | 18px | 20px | 22px |

> **허브 페이지**(regions/[id])는 `--fs-detail-title` 대신 자체 히어로 스타일(`2rem`) 사용.

### 2.3 라인하이트

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--lh-tight` | 1.2 | 제목, 큰 텍스트 |
| `--lh-snug` | 1.4 | 서브제목, 카드 텍스트 |
| `--lh-normal` | 1.6 | 본문, 설명 |
| `--lh-relaxed` | 1.75 | 긴 문단, 읽기 콘텐츠 |

```css
/* ✅ 토큰 사용 */
line-height: var(--lh-snug);

/* ✅ 허용 — 토큰 범위 밖 의도적 커스텀 */
line-height: 1;      /* 아이콘, 아바타, 칩 */
line-height: 1.1;    /* 디스플레이 헤딩 */
line-height: 1.65;   /* 가이드 본문 (normal~relaxed 사이) */

/* ❌ 금지 — 토큰 매치 값을 raw로 쓰기 */
line-height: 1.4;    /* → var(--lh-snug) */
line-height: 1.6;    /* → var(--lh-normal) */
```

---

## 3. 간격 & 레이아웃

### 3.1 페이지 패딩 표준

| 패턴 | 유형 | Mobile | Tablet (640px) | Desktop (1024px) |
|------|------|--------|----------------|------------------|
| **A** | 목록/허브 페이지 | `24px 16px` | `32px 24px` | `40px 32px` |
| **B** | 상세 페이지 ([id]) | `16px 16px` | `24px 24px` | `40px 32px` |
| **특수** | 가이드형 (costs, roadmap) | `20px 16px` | `28px 24px` | `40px 32px` |

- `max-width: 1280px` + `margin: 0 auto` 공통
- 하단 고정 CTA가 있는 페이지: bottom padding `80px` (mobile/tablet), `64px` (desktop)
- **로딩 스켈레톤은 반드시 실제 페이지와 동일한 패딩을 사용** (CLS 방지)

### 3.2 컴포넌트 갭 참고값

| 컨텍스트 | 값 |
|----------|-----|
| 페이지 내 섹션 간 | `24px` |
| 카드 내부 요소 간 | `8~12px` |
| 그리드 갭 (모바일) | `8~10px` |
| 그리드 갭 (데스크탑) | `12~16px` |

---

## 4. Border Radius

### 4.1 스케일

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | 8px | 배지, 인풋, 작은 요소 |
| `--radius-md` | 12px | 서브카드, 인라인 블록 |
| `--radius-lg` | 16px | 메인 카드 컨테이너 |
| `--radius-xl` | 20px | 히어로 섹션, 대형 카드 |
| `--radius-full` | 9999px | pill 버튼, 아바타, 태그 |

### 4.2 사용 규칙

```css
/* ✅ 카드 컨테이너 */
border-radius: var(--radius-lg);      /* 16px */

/* ✅ 대형 섹션 카드 */
border-radius: var(--radius-xl);      /* 20px */

/* ✅ 소형 요소, 인풋 */
border-radius: var(--radius-sm);      /* 8px */

/* ✅ pill 형태 */
border-radius: var(--radius-full);    /* 9999px */

/* ❌ 금지 — 카드에 raw 14px/16px */
border-radius: 14px;  /* → var(--radius-lg) */
border-radius: 16px;  /* → var(--radius-lg) */
```

**예외**: 6px (아이콘 박스), 10px (내부 서브요소), 50% (원형) 등 스케일 외 값은 raw 허용.

---

## 5. 아이콘

### 5.1 사이즈 스케일

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--icon-xs` | 12px | 장식, chevron |
| `--icon-sm` | 14px | 인라인 아이콘 |
| `--icon-md` | 16px | 기본 본문 아이콘 |
| `--icon-lg` | 20px | 섹션 헤더 아이콘 |
| `--icon-xl` | 24px | 카드 헤더, 네비게이션 |
| `--icon-2xl` | 48px | 빈 상태, 히어로 |

### 5.2 컨테이너

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--icon-box-sm` | 28px | 소형 아이콘 박스 |
| `--icon-box-md` | 34px | 섹션 헤더 아이콘 |
| `--icon-box-lg` | 40px | 히어로, 빈 상태 |
| `--icon-box-xl` | 64px | 빈 상태 히어로 |

### 5.3 사용 규칙

- 아이콘은 **bare** (배경 없음)으로만 사용
- lucide-react 기본 + 커스텀 아이콘 (IrangSearch, IrangSprout)
- `<Icon>` 래퍼 컴포넌트 통해 사이즈 일관성 확보

---

## 6. Z-Index 레이어

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--z-float` | 10 | 맵 툴팁, 인라인 팝업 |
| `--z-sticky` | 30 | 고정 탭 |
| `--z-mobile-overlay` | 49 | 모바일 메뉴 배경 |
| `--z-header` | 50 | 글로벌 헤더, 모바일 하단 네비 |
| `--z-dropdown` | 60 | 헤더 드롭다운 |
| `--z-overlay` | 100 | 검색, 북마크, 토스트 |
| `--z-modal` | 200 | 모달 다이얼로그 |
| `--z-tooltip` | 9999 | Portal 기반 용어 툴팁 |

> 내부 장식용 z-index (1~2)는 하드코딩 허용. 크로스 컴포넌트 레이어만 변수 사용.

---

## 7. 반응형 브레이크포인트

| 이름 | 값 | 대상 |
|------|-----|------|
| sm | `640px` | 태블릿 시작 |
| md | `768px` | 타이포그래피 스케일업 |
| lg | `1024px` | 데스크탑, 사이드바 레이아웃 |

```css
/* 모바일 우선 — min-width 사용 */
@media (min-width: 640px) { /* 태블릿 */ }
@media (min-width: 768px) { /* 폰트 스케일업 */ }
@media (min-width: 1024px) { /* 데스크탑 */ }

/* 호버 — 터치 기기 제외 */
@media (hover: hover) { .link:hover { ... } }

/* 접근성 — 모션 감소 */
@media (prefers-reduced-motion: reduce) { ... }
```

---

## 8. CSS 작성 규칙 요약

| 규칙 | 올바른 예 | 금지 예 |
|------|----------|---------|
| 시맨틱 컬러 | `var(--primary, #1b6b5a)` | `#1b6b5a` |
| 흰색 텍스트 | `var(--primary-foreground)` | `#fff` |
| 흰색 배경 | `var(--card)` | `#fff` |
| 섹션 제목 | `var(--fs-section-title)` | `var(--fs-h4)` |
| 상세 페이지 타이틀 | `var(--fs-detail-title)` | `var(--fs-h4)` |
| 카드 radius | `var(--radius-lg)` | `14px` / `16px` |
| 라인하이트 1.4 | `var(--lh-snug)` | `1.4` |
| 데스크탑 15px 폰트 | `var(--fs-body-sm)` | `15px` |

---

## 9. 파일 체크리스트 (새 페이지 추가 시)

- [ ] `.page` 클래스에 패턴 A 또는 B 패딩 적용
- [ ] 섹션 제목에 `var(--fs-section-title)` 사용
- [ ] 카드 컨테이너에 `var(--radius-lg)` 또는 `var(--radius-xl)` 사용
- [ ] 컬러는 시맨틱 토큰 + 폴백 형태로 작성
- [ ] 대응하는 `loading.module.css` 생성, 패딩 동일하게 설정
- [ ] `@media (hover: hover)` 로 호버 스타일 감싸기
- [ ] `font-size: 15px` → `var(--fs-body-sm)` 등 토큰 확인
