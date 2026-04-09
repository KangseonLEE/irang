# 코드 작성 전 체크리스트

> 아래 체크리스트를 **코드를 한 줄이라도 작성하기 전에** 확인한다. 과거에 반복적으로 발생했던 문제들을 방지하기 위한 규칙이다.

## 체크리스트 A: "이미 있는 것을 또 만들고 있지 않은가?"

| 만들려는 것 | 먼저 확인할 공통 컴포넌트 |
|-------------|--------------------------|
| 페이지 헤더 (아이콘+라벨+h1+설명+건수) | `@/components/ui/page-header` |
| 필터 바 (pill 필터, 검색, 토글) | `@/components/filter/filter-bar` |
| 상태 배지 (모집중/마감 등) | `@/components/ui/status-badge` |
| 빈 상태 UI (dashed border + 안내문) | `@/components/ui/empty-state` |
| 반응형 카드 그리드 (1→2→3열) | `@/components/ui/card-grid` |
| 전문 용어 툴팁 (ha, 10a 등) | `@/components/ui/term-tooltip` |
| 본문 텍스트 용어 자동 감지 | `@/components/ui/auto-glossary` |
| 모달 (Portal, ESC 닫기, 포커스 트랩) | `@/components/ui/modal` |

**위 목록에 해당하는 UI를 페이지 파일 안에 직접 구현하면 안 된다.** 공통 컴포넌트를 import하여 사용한다.

## 체크리스트 A-2: "본문 텍스트에 AutoGlossary를 적용했는가?"

- 사용자가 읽는 **2줄 이상의 본문 텍스트**에는 `<AutoGlossary text={...} />`를 적용한다.
- 대상: 설명(description), 이야기(story), 조언(advice), 후기, 프로그램 상세, 작물 설명 등
- 비대상: 제목, 라벨, 버튼, 짧은 메타 텍스트(나이, 지역명 등)

## 체크리스트 A-3: "UI 텍스트가 UX 라이팅 톤 가이드를 따르는가?"

- `.claude/rules/copywriting.md` 참조
- "~합니다/입니다" → "~이에요/예요/어요" 변환 필수
- 불필요한 수식어 제거. 섹션 제목 10자 이내.

## 체크리스트 B: "CSS를 복붙하고 있지 않은가?"

- 새 `page.module.css`에 CSS 작성 전, 동일 스타일이 다른 page.module.css에 이미 있는지 검색한다.
- 3개 이상의 파일에서 동일 CSS 블록 → `src/components/` 아래에 공통 컴포넌트/CSS로 추출.
- **절대 금지**: `.pageHeader`, `.statusBadge`, `.emptyState` 등 공통 패턴을 page.module.css에 새로 정의.

## 체크리스트 C: "인라인 스타일을 쓰고 있지 않은가?"

- `style={{ display: "flex", ... }}` 같은 인라인 스타일은 원칙적으로 금지.
- **허용 예외**: 동적 계산 값 (`width: ${progress}%`), `objectFit`, 1회성 크기 지정.
- 인라인 스타일이 3번 이상 반복되면 반드시 CSS class로 추출.

## 체크리스트 D: "클라이언트 컴포넌트가 정말 필요한가?"

- `"use client"` 추가 전: `useState`, `useEffect`, `onClick` 등이 진짜 필요한지 확인.
- CSS-only로 해결 가능한 인터랙션 (hover 툴팁, 토글 등)은 서버 컴포넌트로 유지.
- Link 기반 필터링은 서버 컴포넌트에서 가능 → `useRouter`/`useSearchParams` 불필요.

## 체크리스트 E: "@media (hover: hover) 래핑했는가?"

- 모든 `:hover` 스타일은 `@media (hover: hover) { }` 안에 넣어야 한다.
- 터치 디바이스에서 hover 고착(sticky) 방지.

## 체크리스트 F: "SPA 네비게이션 후 UI 상태가 정리되는가?"

- pathname 변경 시 모바일 메뉴 + 데스크탑 드롭다운 모두 닫혀야 한다.
- `document.activeElement.blur()`로 포커스 해제.
- 터치 디바이스(태블릿 768px+)에서는 fallback 타이머(400ms)로 상태 자동 복원.

## 체크리스트 G: "CSS 선언 순서가 올바른가?"

- **기본 규칙 → `@media` 오버라이드** 순서를 반드시 지킨다.
- 미디어쿼리가 기본 규칙보다 위에 선언되면, 기본 규칙이 오버라이드를 무효화.
- 잘못된 예:
  ```css
  @media (max-width: 639px) { .foo { flex: unset; } }  /* 위에 선언 */
  .foo { flex: 1; }                                      /* ← 이게 이김! */
  ```

## 체크리스트 H: "Server → Client Component 경계를 지키는가?"

- Server Component에서 Client Component로 **함수(render prop, callback)** 전달 불가.
- Client Component의 children은 ReactNode만 가능.
- 인터랙티브 섹션은 자체 완결 Client Component로 리팩터링.
- rAF로 직접 제어하는 CSS 속성에는 CSS transition 사용 금지 (충돌).
