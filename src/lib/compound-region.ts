/**
 * 붙여 쓴 지역명 판정 (2026-10-13) — '경북안동'·'충남서산시'처럼 시·도(정식명·약칭) 바로 뒤에
 * 그 시·도 안의 시·군·구 이름이 남김없이 붙은 검색어. 지금은 월간 0건 재대조
 * (scripts/watchman/zero-result-recheck.ts)가 착수 기준(3회)을 세는 데만 쓴다.
 * 분리 검색을 넣을 때도 이 판정을 그대로 쓴다 — Algolia 방식: 두 조각, 둘 다 실재 이름일 때만.
 */
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

export function isCompoundRegionQuery(q: string): boolean {
  if (/\s/.test(q)) return false;
  for (const p of PROVINCES) {
    for (const prefix of [p.name, p.shortName]) {
      if (!q.startsWith(prefix) || q.length === prefix.length) continue;
      const rest = q.slice(prefix.length);
      const hit = SIGUNGUS.some(
        (sg) => sg.sidoId === p.id && (rest === sg.name || rest === sg.shortName),
      );
      if (hit) return true;
    }
  }
  return false;
}

