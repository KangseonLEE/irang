/**
 * ═══════════════════════════════════════════
 *  §20 접수 중 지원사업 원문 '모집 끝남' 점검 (2026-10-26)
 *
 *  사용: npx tsx scripts/watchman/check-program-closure.ts
 *  CI:   npx tsx scripts/watchman/check-program-closure.ts --ci
 *
 *  배경: SP-044 괴산 희망둥지는 "모집완료 시까지"라 마감일을 9999 로 뒀는데, 원문 제목이 `<모집완료>` 로
 *  바뀐 뒤에도 화면이 '모집중'이었다(회장 발견). 링크 점검은 200·제목만, §19 는 대조 경과일만 봐서
 *  원문의 상태 표시를 아무도 안 읽었다. 화면 상태는 날짜로만 정해지므로 조기 마감은 원문을 읽어야 보인다.
 *
 *  대상: 정적 큐레이션 행 중 오늘 '모집중'(시작 ≤ 오늘 ≤ 마감, 9999 마감 포함).
 *  등급:
 *    🔴 원문에 모집 끝남 표시가 있는데 화면이 '모집중' — programs.ts 마감 처리 + 정정 이력
 *    🟡 원문을 읽지 못함(응답 실패·홈으로 튕김·본문 너무 짧음) — URL 단위. 미국 러너만의 실패일 수 있으니
 *       한국 회선에서 이 스크립트로 재확인(W4)
 *
 *  출력 계약: WATCHMAN_FINDINGS 파일에 `등급|항목|근거` 1행씩 append. exit 0.
 * ═══════════════════════════════════════════
 */

import { appendFileSync } from "node:fs";
import { PROGRAMS } from "../../src/lib/data/programs";
import { deriveStatus, kstToday } from "../../src/lib/program-status";
import { findClosureMarker, htmlToText } from "../../src/lib/programs/closure-markers";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const MIN_TEXT = 1500;

type Result =
  | { kind: "closed"; evidence: string }
  | { kind: "open" }
  | { kind: "unreadable"; reason: string };

async function inspect(url: string): Promise<Result> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
  } catch (e) {
    return { kind: "unreadable", reason: `요청 실패 ${(e as Error).name}` };
  }
  if (!res.ok) return { kind: "unreadable", reason: `HTTP ${res.status}` };
  const html = await res.text();
  // 게시글 주소가 홈으로 튕기는 경우(진안 게시판: 글 번호 없는 주소 → location.href 홈)
  if (/location\.href\s*=\s*["']https?:\/\/[^/"']+\/?["']/.test(html) && html.length < 2000) {
    return { kind: "unreadable", reason: "홈으로 튕김 — 원문 링크가 게시글을 가리키지 않아요" };
  }
  const text = htmlToText(html);
  if (text.length < MIN_TEXT) return { kind: "unreadable", reason: `본문 ${text.length}자` };
  const evidence = findClosureMarker(text);
  return evidence ? { kind: "closed", evidence } : { kind: "open" };
}

async function main() {
  const ci = process.argv.includes("--ci");
  const today = kstToday();
  const targets = PROGRAMS.filter(
    (p) => p.sourceUrl?.startsWith("http") && deriveStatus(p.applicationStart, p.applicationEnd, today) === "모집중",
  );

  const findings: string[] = [];
  // 지자체 서버에 몰리지 않게 순차
  for (const p of targets) {
    const r = await inspect(p.sourceUrl);
    const tag = r.kind === "closed" ? `끝남 — ${r.evidence}` : r.kind === "unreadable" ? `못 읽음 — ${r.reason}` : "열림";
    console.log(`  ${p.id} ${tag}`);
    if (r.kind === "closed") {
      findings.push(
        `🔴|§20 원문은 모집 끝남인데 화면은 모집중|${p.id} ${p.title} — 원문 "${r.evidence}" · ${p.sourceUrl} · programs.ts 마감 처리 + corrections.ts 정정 이력`,
      );
    } else if (r.kind === "unreadable") {
      findings.push(`🟡|§20 원문 상태 확인 불가|${p.id} ${p.title} — ${r.reason} · ${p.sourceUrl} · 한국 회선에서 재확인`);
    }
  }

  console.log(`[§20] 모집중 ${targets.length}건 점검 · 발견 ${findings.length}`);
  for (const f of findings) console.log("  " + f);

  if (ci && findings.length) {
    const file = process.env.WATCHMAN_FINDINGS;
    if (!file) throw new Error("WATCHMAN_FINDINGS 없음");
    appendFileSync(file, findings.join("\n") + "\n", "utf-8");
  }
}

main();
