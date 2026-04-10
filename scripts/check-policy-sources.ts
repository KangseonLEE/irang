#!/usr/bin/env npx tsx
/* ==========================================================================
   정책 데이터 검증 스크립트
   - 공식 출처 URL 접근성 확인 (링크 깨짐 감지)
   - lastVerified 경과일 기반 갱신 필요 사업 표시
   - 출처별 스냅샷 저장 → 다음 실행 시 변경 감지

   사용법:
     npx tsx scripts/check-policy-sources.ts              # 전체 검증
     npx tsx scripts/check-policy-sources.ts --stale 30    # 30일 이상 미검증 사업만
     npx tsx scripts/check-policy-sources.ts --snapshot    # 스냅샷 저장 모드
     npx tsx scripts/check-policy-sources.ts --ci          # CI 모드 (실패 시 GitHub Issue 생성)
   ========================================================================== */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/* ── 데이터 직접 임포트 대신 파일 파싱 (tsx 호환) ── */
const DATA_PATH = path.resolve(__dirname, "../src/lib/data/gov-roadmap.ts");
const SNAPSHOT_DIR = path.resolve(__dirname, "../.policy-snapshots");

/* ── CLI 인자 ── */
const args = process.argv.slice(2);
const staleArgIdx = args.indexOf("--stale");
const staleDays = staleArgIdx >= 0 ? parseInt(args[staleArgIdx + 1] || "90", 10) : 90;
const snapshotMode = args.includes("--snapshot");
const ciMode = args.includes("--ci");

/* ── 타입 ── */
interface SourceInfo {
  programId: string;
  programName: string;
  lastVerified: string | null;
  source: { label: string; url: string; covers: string[] };
}

/* ── 데이터 파싱 (정규식으로 sources/lastVerified 추출) ── */
function extractProgramMeta(): SourceInfo[] {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const results: SourceInfo[] = [];

  // 각 프로그램 블록 분리
  const programBlocks = raw.split(/\/\*\s*═+\s*\n\s*\d+\.\s*/);

  for (const block of programBlocks) {
    const idMatch = block.match(/id:\s*"([^"]+)"/);
    const nameMatch = block.match(/name:\s*"([^"]+)"/);
    const verifiedMatch = block.match(/lastVerified:\s*"([^"]+)"/);

    if (!idMatch || !nameMatch) continue;

    const programId = idMatch[1];
    const programName = nameMatch[1];
    const lastVerified = verifiedMatch?.[1] ?? null;

    // sources 배열 추출
    const sourcesMatch = block.match(/sources:\s*\[([\s\S]*?)\],\s*\n\s*lastVerified/);
    if (!sourcesMatch) continue;

    const sourcesBlock = sourcesMatch[1];

    // 개별 source 객체 추출
    const sourceRegex =
      /\{\s*label:\s*"([^"]+)",\s*url:\s*"([^"]+)",\s*covers:\s*\[([^\]]+)\]/g;
    let match;
    while ((match = sourceRegex.exec(sourcesBlock)) !== null) {
      const covers = match[3]
        .split(",")
        .map((s) => s.trim().replace(/"/g, ""));
      results.push({
        programId,
        programName,
        lastVerified,
        source: { label: match[1], url: match[2], covers },
      });
    }
  }

  return results;
}

/* ── URL 접근성 확인 ── */
async function checkUrl(
  url: string,
): Promise<{ ok: boolean; status: number; redirected: boolean; finalUrl: string; contentLength: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PolicyChecker/1.0; +https://irang.kr)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    const text = await res.text();

    return {
      ok: res.ok,
      status: res.status,
      redirected: res.redirected,
      finalUrl: res.url,
      contentLength: text.length,
    };
  } catch {
    return {
      ok: false,
      status: 0,
      redirected: false,
      finalUrl: url,
      contentLength: 0,
    };
  }
}

/* ── 스냅샷 저장/비교 ── */
function getSnapshotPath(programId: string, sourceIdx: number): string {
  return path.join(SNAPSHOT_DIR, `${programId}_source${sourceIdx}.txt`);
}

function saveSnapshot(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
}

function loadSnapshot(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/* ── 경과일 계산 ── */
function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

/* ── 메인 ── */
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  🔍 정부사업 정책 데이터 검증 스크립트                  ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const sources = extractProgramMeta();

  if (sources.length === 0) {
    console.log("⚠️  sources 데이터를 찾을 수 없습니다. gov-roadmap.ts를 확인하세요.");
    process.exit(1);
  }

  // 프로그램별 그룹핑
  const grouped = new Map<string, SourceInfo[]>();
  for (const s of sources) {
    const list = grouped.get(s.programId) || [];
    list.push(s);
    grouped.set(s.programId, list);
  }

  let totalSources = 0;
  let okCount = 0;
  let failCount = 0;
  let staleCount = 0;
  const failedItems: { programName: string; label: string; url: string; status: number }[] = [];
  const staleItems: { programName: string; programId: string; lastVerified: string | null; days: number }[] = [];

  for (const [programId, items] of grouped) {
    const { programName, lastVerified } = items[0];
    const days = lastVerified ? daysSince(lastVerified) : Infinity;
    const isStale = days >= staleDays;

    console.log(`\n┌─ 📋 ${programName} (${programId})`);
    console.log(
      `│  마지막 검증: ${lastVerified ?? "미설정"} ${
        lastVerified ? `(${days}일 전)` : ""
      } ${isStale ? "⚠️ 갱신 필요" : "✅"}`,
    );

    if (isStale) {
      staleCount++;
      staleItems.push({ programName, programId, lastVerified, days });
    }

    for (let i = 0; i < items.length; i++) {
      const { source } = items[i];
      totalSources++;

      process.stdout.write(`│  ${i + 1}. ${source.label} ... `);

      const result = await checkUrl(source.url);

      if (result.ok) {
        okCount++;
        const sizeKb = (result.contentLength / 1024).toFixed(1);
        console.log(
          `✅ ${result.status} (${sizeKb}KB)${result.redirected ? ` → ${result.finalUrl.substring(0, 60)}...` : ""}`,
        );

        // 스냅샷 모드: 콘텐츠 길이 저장 (전체 HTML은 너무 크므로 해시 대용)
        if (snapshotMode) {
          const snapshotPath = getSnapshotPath(programId, i);
          const snapshotData = JSON.stringify({
            url: source.url,
            checkedAt: new Date().toISOString(),
            status: result.status,
            contentLength: result.contentLength,
          });

          const prev = loadSnapshot(snapshotPath);
          if (prev) {
            const prevData = JSON.parse(prev);
            const sizeDiff = Math.abs(
              result.contentLength - prevData.contentLength,
            );
            const pctChange = prevData.contentLength
              ? ((sizeDiff / prevData.contentLength) * 100).toFixed(1)
              : "N/A";

            if (sizeDiff > 500) {
              console.log(
                `│     📝 콘텐츠 변경 감지: ${prevData.contentLength}→${result.contentLength} bytes (${pctChange}% 변화)`,
              );
            }
          }

          saveSnapshot(snapshotPath, snapshotData);
        }
      } else {
        failCount++;
        failedItems.push({
          programName,
          label: source.label,
          url: source.url,
          status: result.status,
        });
        console.log(
          `❌ ${result.status || "TIMEOUT"} — 접근 불가!`,
        );
      }

      // 커버 필드 표시
      console.log(`│     └ 커버: ${source.covers.join(", ")}`);
    }

    console.log("└──");
  }

  // 요약 보고
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("📊 검증 결과 요약");
  console.log("──────────────────────────────────────────────────────────");
  console.log(`  총 출처:       ${totalSources}건`);
  console.log(`  접근 성공:     ${okCount}건 ✅`);
  console.log(`  접근 실패:     ${failCount}건 ${failCount > 0 ? "❌" : ""}`);
  console.log(`  갱신 필요:     ${staleCount}건 (${staleDays}일 기준) ${staleCount > 0 ? "⚠️" : ""}`);
  console.log("══════════════════════════════════════════════════════════");

  if (failCount > 0) {
    console.log(
      "\n💡 접근 실패 출처는 URL이 변경되었거나 서버 점검 중일 수 있습니다.",
    );
    console.log("   gov-roadmap.ts의 sources 배열에서 해당 URL을 업데이트하세요.");
  }

  if (staleCount > 0) {
    console.log(
      `\n💡 ${staleCount}개 사업이 ${staleDays}일 이상 미검증 상태입니다.`,
    );
    console.log(
      "   공식 출처를 방문하여 데이터를 확인한 후 lastVerified를 갱신하세요.",
    );
  }

  if (snapshotMode) {
    console.log(`\n📸 스냅샷 저장 위치: ${SNAPSHOT_DIR}`);
  }

  /* ── CI 모드: GitHub Issue 자동 생성 ── */
  if (ciMode && (failCount > 0 || staleCount > 0)) {
    createGitHubIssue(failedItems, staleItems, {
      totalSources,
      okCount,
      failCount,
      staleCount,
      staleDays,
    });
  }

  // 종료 코드: 실패가 있으면 1
  process.exit(failCount > 0 ? 1 : 0);
}

/* ── CI 모드: GitHub Issue 자동 생성 ── */
function createGitHubIssue(
  failed: { programName: string; label: string; url: string; status: number }[],
  stale: { programName: string; programId: string; lastVerified: string | null; days: number }[],
  stats: { totalSources: number; okCount: number; failCount: number; staleCount: number; staleDays: number },
): void {
  try {
    execSync("which gh", { stdio: "ignore" });
  } catch {
    console.log("\n⚠️  gh CLI를 찾을 수 없습니다. Issue 생성을 건너뜁니다.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const issueTitle = `📋 정책 데이터 검증 실패 — ${today}`;

  // 같은 날짜 이슈가 이미 있는지 확인
  try {
    const existing = execSync(
      `gh issue list --label "policy-check" --state open --json title --jq '.[].title'`,
      { encoding: "utf-8" },
    );
    if (existing.includes(today)) {
      console.log("\nℹ️  오늘자 이슈가 이미 존재합니다. 새 이슈를 생성하지 않습니다.");
      return;
    }
  } catch {
    // label이 없거나 gh 인증 실패 — 계속 진행
  }

  // Issue body 구성
  let body = `## 정책 데이터 검증 결과\n\n`;
  body += `**검사일시:** ${today}\n`;
  body += `**결과:** 총 ${stats.totalSources}건 중 성공 ${stats.okCount}건, 실패 ${stats.failCount}건, 갱신 필요 ${stats.staleCount}건\n\n`;

  if (failed.length > 0) {
    body += `### ❌ 접근 실패 출처\n\n`;
    body += `| 사업명 | 출처 | 상태 | URL |\n`;
    body += `|--------|------|------|-----|\n`;
    for (const f of failed) {
      body += `| ${f.programName} | ${f.label} | ${f.status || "TIMEOUT"} | ${f.url} |\n`;
    }
    body += `\n`;
  }

  if (stale.length > 0) {
    body += `### ⚠️ 갱신 필요 (${stats.staleDays}일 초과)\n\n`;
    body += `| 사업명 | ID | 마지막 검증 | 경과일 |\n`;
    body += `|--------|----|-------------|--------|\n`;
    for (const s of stale) {
      body += `| ${s.programName} | \`${s.programId}\` | ${s.lastVerified ?? "미설정"} | ${s.days === Infinity ? "∞" : `${s.days}일`} |\n`;
    }
    body += `\n`;
  }

  body += `### 조치 방법\n\n`;
  body += `1. **접근 실패**: \`src/lib/data/gov-roadmap.ts\`의 \`sources\` 배열에서 해당 URL을 확인·업데이트\n`;
  body += `2. **갱신 필요**: 공식 출처 방문 후 데이터 확인 → \`lastVerified\`를 오늘 날짜로 갱신\n`;
  body += `3. 일시적 장애인 경우 다음 주기에 자동 재검사됩니다\n`;

  try {
    execSync(
      `gh issue create --title "${issueTitle}" --body "${body.replace(/"/g, '\\"')}" --label "policy-check"`,
      { encoding: "utf-8", stdio: "pipe" },
    );
    console.log("\n✅ GitHub Issue가 생성되었습니다.");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`\n⚠️  Issue 생성 실패: ${message}`);
  }
}

main().catch((err) => {
  console.error("스크립트 실행 오류:", err);
  process.exit(1);
});
