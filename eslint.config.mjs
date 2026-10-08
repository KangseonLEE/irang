import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    "workers/**", // Cloudflare Worker — 별도 런타임 타입(caches.default 등), 앱 린트 제외 (8/30)
    ".claude/**", // 에이전트 작업 공간(.claude/worktrees) — 리포 사본이 통째로 들어와 검사가 두 벌이 된다 (10/8)
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ═══════════════════════════════════════════════════════════════
  // 점진적 규칙 도입 (Gradual Rule Adoption)
  //
  // Next.js 메이저 업그레이드 등으로 새 lint 규칙이 추가될 때:
  //   1. 아래에 "warn"으로 먼저 등록 → CI 통과, 워닝만 리포트
  //   2. 기존 코드 위반 수정 완료 후 → 해당 줄 삭제 (기본 error 복귀)
  //
  // 이렇게 하면 CI가 한꺼번에 깨지는 "늑대소년 현상"을 방지합니다.
  // ═══════════════════════════════════════════════════════════════
  {
    rules: {
      // 현재 모든 위반 수정 완료. 새 규칙 추가 시 아래 패턴 사용:
      // "rule-name": "warn",  // TODO: 위반 수정 후 이 줄 삭제
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 레이어 경계 (Layer Boundaries) — 2026-09-04, FSD 단방향 의존 차용
  //
  //   app (라우트)  →  components (도메인 UI / ui 공용)  →  lib · hooks · types
  //
  // 의존은 항상 위 화살표 방향으로만. 역방향 import 는 lint error.
  //   · components 는 app 을 모른다 (라우트 이동 시 깨짐 방지)
  //   · lib/hooks/types 는 UI 를 모른다 (scripts · 테스트에서 재사용 보장)
  //   · components/ui 는 도메인 컴포넌트를 모른다 (공용 → 도메인 역참조 금지)
  // 배치 기준은 CLAUDE.md "코드 배치 규칙" 참조.
  // ═══════════════════════════════════════════════════════════════
  {
    files: ["src/components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app", "@/app/**"],
              message:
                "components → app 역참조 금지. 여러 라우트가 쓰는 코드는 components/ 또는 lib/ 로 옮기세요.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app", "@/app/**"],
              message: "components/ui → app 역참조 금지.",
            },
            {
              group: ["@/components/**", "!@/components/ui", "!@/components/ui/**"],
              message:
                "components/ui 는 공용 레이어 — 도메인 컴포넌트(components/<domain>)를 참조하면 안 됩니다.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/lib/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}", "src/types/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app", "@/app/**", "@/components", "@/components/**"],
              message:
                "lib/hooks/types → UI 역참조 금지. 아이콘 등 UI 무관 공용은 lib/icons 처럼 lib 안에 두세요.",
            },
          ],
        },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 브라우저 기본 팝업 금지 (2026-09-29 회장) — `useDialog()` 의 confirm/alert 을 쓴다.
  // OS 팝업은 브랜드 밖이고, 모달 위에서 포커스·스크롤 잠금과 충돌하며 카피 톤도 못 맞춘다.
  // ═══════════════════════════════════════════════════════════════
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/__tests__/**", "src/lib/analytics-gate.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "confirm", message: "window.confirm 금지 — useDialog().confirm() 을 쓰세요." },
        { name: "alert", message: "window.alert 금지 — useDialog().alert() 을 쓰세요." },
        { name: "prompt", message: "window.prompt 금지 — 전용 입력 UI 를 만드세요." },
      ],
      "no-restricted-properties": [
        "error",
        { object: "window", property: "confirm", message: "window.confirm 금지 — useDialog().confirm()" },
        { object: "window", property: "alert", message: "window.alert 금지 — useDialog().alert()" },
        { object: "window", property: "prompt", message: "window.prompt 금지" },
      ],
    },
  },
]);

export default eslintConfig;
