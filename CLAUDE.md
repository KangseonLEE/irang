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
[아이브로우] 귀농을 결심한 순간부터
[헤드라인]   귀농, 막막할수록 숫자가 답입니다
[서브헤드]   농림부, 통계청, 건강보험 데이터로 만든 귀농 지도입니다.
[벤토 섹션]  귀농에 필요한 것들
[트렌드]     올해 귀농 트렌드
[데이터]     출처가 분명한 정보입니다
[CTA 제목]   5분이면 내 귀농지 윤곽이 잡힙니다
[CTA 설명]   나이, 예산, 원하는 삶의 방식을 알려주시면 지역과 작물을 추려드립니다.
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

---

## 빌드 & 배포

- 빌드 명령: `npm run build`
- SGIS API 관련 경고는 정상 (Dynamic route fallback)
- 커밋 후 `git push origin main` → Vercel 자동 배포
- 커밋 메시지 접두사: `feat:`, `fix:`, `style:`, `copy:`, `redesign:`, `refactor:`
