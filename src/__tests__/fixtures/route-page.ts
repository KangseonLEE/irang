/**
 * URL 경로 → 그 경로를 그리는 `src/app/**\/page.tsx` 파일 (라우트 그룹 `(이름)` 포함).
 *
 * 2026-10-17 부터 `/crops`·`/programs` 목록 페이지는 `crops/(list)/page.tsx`·`programs/(list)/page.tsx` 에 있다
 * (목록 로딩 화면이 상세까지 감싸지 않게 — app-loading-boundary.test.ts). "링크가 실존 라우트인가"를 보는 테스트는
 * `src/app/<경로>/page.tsx` 만 보면 그룹 안 페이지를 못 찾으므로 이 함수를 쓴다.
 * 세그먼트는 정적 폴더가 있으면 그것, 없으면 그 자리의 동적 세그먼트(`[id]`·`[lane]`)로 맞춘다 —
 * "/interviews/lee-gyuho" 같은 실제 주소도, "crops/[id]" 같은 패턴도 받는다.
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const APP = join(process.cwd(), "src", "app");

function groupDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.startsWith("(") && n.endsWith(")"))
    .map((n) => join(dir, n))
    .filter((p) => statSync(p).isDirectory());
}

/** 경로의 세그먼트를 따라 내려가며 각 단계에서 그룹 폴더도 후보로 둔다 */
function candidates(segments: string[]): string[] {
  let dirs = [APP, ...groupDirs(APP)];
  for (const seg of segments) {
    const next: string[] = [];
    for (const d of dirs) {
      const p = join(d, seg);
      if (existsSync(p)) {
        next.push(p, ...groupDirs(p));
        continue;
      }
      const dynamic = readdirSync(d).find((n) => n.startsWith("[") && n.endsWith("]") && statSync(join(d, n)).isDirectory());
      if (dynamic) next.push(join(d, dynamic), ...groupDirs(join(d, dynamic)));
    }
    dirs = next;
  }
  return dirs;
}

/** 페이지 파일 경로, 없으면 null. `route` 는 "/crops"·"crops"·"crops/[id]" 어느 형식이든 */
export function routePageFile(route: string): string | null {
  const segments = route.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  for (const d of candidates(segments)) {
    for (const f of ["page.tsx", "page.ts"]) {
      const p = join(d, f);
      if (existsSync(p)) return p;
    }
  }
  return null;
}
