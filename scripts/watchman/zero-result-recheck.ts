/**
 * ═══════════════════════════════════════════
 *  결과 0건 검색어 재대조 (2026-10-13)
 *
 *  사용: npx tsx scripts/watchman/zero-result-recheck.ts        (로컬 — .env.local)
 *  CI:   npx tsx scripts/watchman/zero-result-recheck.ts --ci   (ga4-snapshot.yml, 매월 1일)
 *
 *  배경: 10/13 0건 로그(6개월 380건 중 37건)를 지금 검색으로 하나씩 다시 돌려 보니
 *        13종은 그 사이 데이터·규칙 정정으로 이미 결과가 나왔고, 남은 0건은 '안내 있음'과
 *        '아무 안내 없음'으로 갈렸다. 0건 '비율'은 하루 수 건 규모에선 출렁여서 판정에
 *        못 쓴다 → "그때 0건이던 검색어가 지금은 어떤가"를 매달 표로 남긴다(회장 결재).
 *
 *  착수 기준(10/13 결재): 붙여 쓴 지역명('경북안동' = 시·도 약칭 + 그 시·도 안의 시·군·구)
 *        0건이 누적 3회가 되면 Algolia 방식(두 조각·둘 다 실재 지명일 때만) 분리를 착수한다.
 *        이 스크립트가 그 횟수를 센다.
 *
 *  read-only: search_logs 조회만 한다. 출력은 stdout 마크다운(이슈 본문에 이어 붙음).
 * ═══════════════════════════════════════════
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { searchAll, getNoResultSuggestions, getNoResultHintItems } from "../../src/lib/data/search-index";
import { findTypoCandidates } from "../../src/lib/typo-correct";
import { isCompoundRegionQuery } from "../../src/lib/compound-region";

const CI_MODE = process.argv.includes("--ci");
if (!CI_MODE) config({ path: resolve(__dirname, "../../.env.local") });

const WINDOW_DAYS = 180;
const COMPOUND_REGION_TRIGGER = 3;
const MAX_ROWS = 30;

function guidance(q: string): string {
  const suggest = getNoResultSuggestions(q);
  if (suggest.length) return `대체·제안: ${suggest.join(", ")}`;
  const typo = findTypoCandidates(q.toLowerCase());
  if (typo.length) return `오타 제안: ${typo.join(", ")}`;
  const cards = getNoResultHintItems(q).map((x) => x.title);
  if (cards.length) return `추천 카드: ${cards.join(", ")}`;
  return "**안내 없음**";
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) {
    console.log("\n## 결과 0건 검색어 재대조\n\n- Supabase 자격증명이 없어 건너뛰었어요.\n");
    return;
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
  const { data, error } = await sb
    .from("search_logs")
    .select("query, created_at")
    .eq("result_count", 0)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(`search_logs 조회 실패: ${error.message}`);

  const byQuery = new Map<string, { count: number; last: string }>();
  for (const r of data ?? []) {
    const q = String(r.query ?? "").trim();
    if (!q) continue;
    const cur = byQuery.get(q);
    if (cur) cur.count += 1;
    else byQuery.set(q, { count: 1, last: String(r.created_at).slice(0, 10) });
  }

  const rows = [...byQuery.entries()].map(([q, v]) => {
    const now = searchAll(q).length;
    return { q, ...v, now, note: now > 0 ? "해소" : guidance(q) };
  });
  // 아직 0건 → 안내 없음 우선, 그다음 횟수
  rows.sort((a, b) =>
    (a.now > 0 ? 1 : 0) - (b.now > 0 ? 1 : 0) ||
    (b.note === "**안내 없음**" ? 1 : 0) - (a.note === "**안내 없음**" ? 1 : 0) ||
    b.count - a.count,
  );

  const total = rows.reduce((a, r) => a + r.count, 0);
  const resolved = rows.filter((r) => r.now > 0);
  const bare = rows.filter((r) => r.now === 0 && r.note === "**안내 없음**");
  const compound = rows.filter((r) => r.now === 0 && isCompoundRegionQuery(r.q));
  const compoundCount = compound.reduce((a, r) => a + r.count, 0);

  const md = `
## 결과 0건 검색어 재대조 (최근 ${WINDOW_DAYS}일)

0건 기록 ${total}회 · 검색어 ${rows.length}종 → 지금은 결과 있음 ${resolved.length}종 · 아직 0건 ${rows.length - resolved.length}종(그중 안내 없음 ${bare.length}종)

붙여 쓴 지역명 0건: ${compoundCount}회${compound.length ? ` (${compound.map((r) => r.q).join(", ")})` : ""} — 착수 기준 ${COMPOUND_REGION_TRIGGER}회${compoundCount >= COMPOUND_REGION_TRIGGER ? " **도달 → 지역명 분리 착수 안건**" : " 미달"}

| 검색어 | 0건 횟수 | 마지막 | 지금 결과 | 지금 안내 |
|---|---|---|---|---|
${rows.slice(0, MAX_ROWS).map((r) => `| ${r.q.replace(/\|/g, "\\|")} | ${r.count} | ${r.last} | ${r.now} | ${r.note} |`).join("\n") || "| (없음) | | | | |"}
${rows.length > MAX_ROWS ? `\n…외 ${rows.length - MAX_ROWS}종\n` : ""}
> '안내 없음'이 반복되면(월 5회+) 정식 작물·동의어·추천 카드 후보예요. 작물이 아닌 검색어(박스·조직 등)는 요청 버튼으로 충분해요.
`;
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}

main().catch((e) => {
  // 스냅샷 이슈 본문을 막지 않는다 — 실패 사실만 남긴다
  console.log(`\n## 결과 0건 검색어 재대조\n\n- 실패: ${e instanceof Error ? e.message : String(e)}\n`);
});
