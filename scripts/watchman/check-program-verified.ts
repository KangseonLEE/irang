/**
 * ═══════════════════════════════════════════
 *  §19 지원사업 원문 대조일 점검 (2026-10-10)
 *
 *  사용: npx tsx scripts/watchman/check-program-verified.ts
 *  CI:   npx tsx scripts/watchman/check-program-verified.ts --ci
 *
 *  배경: 10/10 전수 목록화에서 지원사업 71행에 '언제 원문과 대조했는가'를 적는 칸이 없었다. 정정이 반복된 행도
 *  어느 날짜 기준 값인지 알 수 없었다. programs.ts 에 verifiedAt 칸을 만들었고, 이 점검이 아직 접수 중이거나
 *  앞으로 접수할 사업 중 대조가 오래된 행을 알린다.
 *
 *  등급:
 *    🟡 접수 중·예정인데 원문 대조가 90일을 넘은 행
 *    ⚪ 접수 중·예정인데 원문 대조일이 비어 있는 행(아직 대조 기록이 없다 — 큐레이션 때 채운다).
 *       만성 경보가 다른 발견을 가리지 않게(8/29 #115 교훈) 이슈를 만들지 않는 ⚪로 둔다.
 *
 *  출력 계약: WATCHMAN_FINDINGS 파일에 `등급|항목|근거` 1행씩 append. exit 0(🔴 없음).
 * ═══════════════════════════════════════════
 */

import { appendFileSync } from "node:fs";
import { PROGRAMS } from "../../src/lib/data/programs";

const STALE_DAYS = 90;

function kstToday(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

function main() {
  const ci = process.argv.includes("--ci");
  const today = kstToday();
  // 마감이 지난 행은 화면 상태가 '마감'이라 결정에 덜 쓰인다 — 접수 중·예정(종료일 ≥ 오늘, 9999 = 정기·상시)만 본다
  const open = PROGRAMS.filter((p) => p.applicationEnd >= today);
  const stale = open.filter((p) => p.verifiedAt && daysBetween(p.verifiedAt, today) > STALE_DAYS);
  const missing = open.filter((p) => !p.verifiedAt);

  const findings: string[] = [];
  if (stale.length) {
    findings.push(
      `🟡|§19 지원사업 원문 대조 ${STALE_DAYS}일 경과|${stale.length}건 — ${stale
        .map((p) => `${p.id}(${p.verifiedAt})`)
        .join(", ")} · 원문 재대조 후 programs.ts verifiedAt 갱신`,
    );
  }
  if (missing.length) {
    findings.push(
      `⚪|§19 지원사업 원문 대조일 없음|접수 중·예정 ${open.length}건 중 ${missing.length}건 — ${missing
        .map((p) => p.id)
        .join(", ")} · 큐레이션 때 원문 대조 후 채워요`,
    );
  }

  console.log(`[§19] 접수 중·예정 ${open.length}건 · 대조 ${STALE_DAYS}일 경과 ${stale.length} · 대조일 없음 ${missing.length}`);
  for (const f of findings) console.log("  " + f);

  if (ci && findings.length) {
    const file = process.env.WATCHMAN_FINDINGS;
    if (!file) throw new Error("WATCHMAN_FINDINGS 없음");
    appendFileSync(file, findings.join("\n") + "\n", "utf-8");
  }
}

main();
