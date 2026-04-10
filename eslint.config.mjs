import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
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
]);

export default eslintConfig;
