#!/usr/bin/env npx tsx
/* ==========================================================================
   정책 데이터 검증 스크립트
   - 공식 출처 URL 접근성 확인 (링크 깨짐 감지)
   - 본문 검증 (8/29 추가): 응답 크기 하한 · 소프트 404/파킹 키워드 · 출처별 mustContain 키워드
     → HTTP 200이어도 메인·게시판·리다이렉트 스텁·소프트 404면 "내용 실패"로 집계
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
  source: { label: string; url: string; covers: string[]; mustContain: string[] };
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

    // 개별 source 객체 추출 — 객체 단위로 자른 뒤 필드별 파싱 (mustContain은 선택)
    const objectRegex = /\{([^{}]*)\}/g;
    let match;
    while ((match = objectRegex.exec(sourcesBlock)) !== null) {
      const body = match[1];
      const label = body.match(/label:\s*"([^"]+)"/)?.[1];
      const url = body.match(/url:\s*"([^"]+)"/)?.[1];
      const coversRaw = body.match(/covers:\s*\[([^\]]*)\]/)?.[1];
      if (!label || !url || coversRaw === undefined) continue;
      const parseList = (raw: string) =>
        raw
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      const mustRaw = body.match(/mustContain:\s*\[([^\]]*)\]/)?.[1];
      results.push({
        programId,
        programName,
        lastVerified,
        source: {
          label,
          url,
          covers: parseList(coversRaw),
          mustContain: mustRaw ? parseList(mustRaw) : [],
        },
      });
    }
  }

  return results;
}

/* ── URL 접근성 확인 (timeout 25s + retry 1회) ── */
async function checkUrl(
  url: string,
  attempt = 1,
): Promise<{
  ok: boolean;
  status: number;
  redirected: boolean;
  finalUrl: string;
  contentLength: number;
  text: string;
}> {
  const MAX_ATTEMPTS = 2;
  const TIMEOUT_MS = 25_000;
  const RETRY_DELAY_MS = 2_000;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        // 한국 정부 사이트(rda/mafra/korea.kr 등)는 봇 UA 차단 강함 — 일반 브라우저 UA 사용.
        // (2026-05-25 issue #53 학습 — PolicyChecker/1.0 UA로 3건 TIMEOUT 후 Mozilla로 통일)
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
      text,
    };
  } catch {
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return checkUrl(url, attempt + 1);
    }
    return {
      ok: false,
      status: 0,
      redirected: false,
      finalUrl: url,
      contentLength: 0,
      text: "",
    };
  }
}

/* ── 본문 검증 (8/29 추가) ──
   HTTP 200이어도 내용이 없는 페이지를 걸러낸다. 8/29 실측에서 4건이 ✅로 통과했다:
   epis.or.kr(55바이트 JS 리다이렉트 스텁) · greendaero rfphStep.do(본문 "페이지가 존재하지 않습니다")
   · mafra 5108(6,601건 롤링 게시판 목록) · smartfarmkorea.net(포털 메인). CLAUDE.md §8 삼중 검증 원칙. */
const MIN_RAW_BYTES = 5_000; // EPIS 스텁(55B) 즉시 검출
const MIN_TEXT_CHARS = 300; // 태그 제거 후 가시 텍스트 하한
/** <title> 전체에 적용 — CLAUDE.md §8 비정상 타이틀 키워드 */
const BAD_TITLE_PATTERNS = [
  /찾을 수 없/, /not found/i, /\b404\b/, /존재하지/, /서비스를 찾/, /접근할 수 없/, /접근이 제한/,
  /점검 중/, /maintenance/i, /GoDaddy/i, /for sale/i, /Sedo/, /Afternic/i, /파킹/, /판매 중/,
];
/** 본문에는 강한 문구만 — "오류"·"차단" 같은 단어는 정상 페이지 내비게이션에도 흔하다 */
const BAD_BODY_PATTERNS = [
  /페이지가 존재하지 않/, /페이지를 찾을 수 없/, /서비스를 찾을 수 없/, /요청하신 페이지/,
  /접근이 제한/, /점검 중입니다/, /page not found/i, /this domain is for sale/i,
];

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
}

/** 통과면 null, 실패면 사유 문자열 */
function analyzeBody(html: string, rawBytes: number, mustContain: string[]): string | null {
  if (rawBytes < MIN_RAW_BYTES) return `본문 없음 (${rawBytes}B < ${MIN_RAW_BYTES}B — 리다이렉트 스텁·빈 페이지)`;
  const title = extractTitle(html);
  const text = stripHtml(html);
  const badTitle = BAD_TITLE_PATTERNS.find((re) => re.test(title));
  if (badTitle) return `비정상 타이틀 "${title.slice(0, 40)}" (${badTitle.source})`;
  const badBody = BAD_BODY_PATTERNS.find((re) => re.test(text));
  if (badBody) return `소프트 404 (본문 "${badBody.source}")`;
  if (text.length < MIN_TEXT_CHARS) return `가시 텍스트 부족 (${text.length}자 < ${MIN_TEXT_CHARS}자)`;
  const compact = text.replace(/\s/g, "");
  const missing = mustContain.filter((kw) => !compact.includes(kw.replace(/\s/g, "")));
  if (missing.length > 0) return `필수 키워드 누락: ${missing.join(", ")}`;
  return null;
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
  // KST 자정~09시에 UTC 기준 "오늘"이 어제라 -1이 나오는 함정(5/15 memory) — 0으로 클램프
  return Math.max(0, Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)));
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
  let timeoutCount = 0;
  let staleCount = 0;
  const failedItems: { programName: string; label: string; url: string; status: number; reason: string }[] = [];
  // status 0 = 타임아웃·네트워크 단절. US 러너에서 한국 정부 사이트(go.kr)는 상시 타임아웃이라
  // (8/29 실측: 8건 TIMEOUT 전건 한국에서 200·2초 이내) 실패가 아니라 경고로만 다룬다.
  // 8/17 check-links 동일 학습 — 경보 피로가 진짜 깨진 링크를 가린다.
  const timeoutItems: { programName: string; label: string; url: string }[] = [];
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
      const contentIssue = result.ok
        ? analyzeBody(result.text, result.contentLength, source.mustContain)
        : null;

      if (result.ok && contentIssue) {
        // HTTP 200이지만 내용이 근거를 못 뒷받침 — 실패로 집계 (8/29 본문 검증)
        failCount++;
        failedItems.push({
          programName,
          label: source.label,
          url: source.url,
          status: result.status,
          reason: contentIssue,
        });
        console.log(`❌ ${result.status} 내용 실패 — ${contentIssue}`);
      } else if (result.ok) {
        okCount++;
        const sizeKb = (result.contentLength / 1024).toFixed(1);
        const kwNote = source.mustContain.length > 0 ? ` · 키워드 ${source.mustContain.length}/${source.mustContain.length}` : "";
        console.log(
          `✅ ${result.status} (${sizeKb}KB)${kwNote}${result.redirected ? ` → ${result.finalUrl.substring(0, 60)}...` : ""}`,
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
      } else if (result.status === 0) {
        timeoutCount++;
        timeoutItems.push({ programName, label: source.label, url: source.url });
        console.log("⚠️ TIMEOUT — 러너 지역 차단 가능(경고, 실패 아님)");
      } else {
        failCount++;
        failedItems.push({
          programName,
          label: source.label,
          url: source.url,
          status: result.status,
          reason: `HTTP ${result.status}`,
        });
        console.log(`❌ ${result.status} — 접근 불가!`);
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
  console.log(`  타임아웃:      ${timeoutCount}건 ${timeoutCount > 0 ? "⚠️ (경고 — 러너 지역 차단 가능, 한국에서 재확인)" : ""}`);
  console.log(`  갱신 필요:     ${staleCount}건 (${staleDays}일 기준) ${staleCount > 0 ? "⚠️" : ""}`);
  console.log("══════════════════════════════════════════════════════════");

  if (failCount > 0) {
    console.log("\n💡 실패 출처는 URL 변경·서버 점검, 또는 HTTP 200이어도 메인/게시판/소프트 404일 수 있습니다.");
    console.log("   gov-roadmap.ts의 sources 배열에서 고정 상세 URL로 교체하고 mustContain 키워드를 넣으세요.");
    for (const f of failedItems) console.log(`   - ${f.programName} / ${f.label}: ${f.reason}`);
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
  // 타임아웃만으로는 이슈를 만들지 않는다 (경고). HTTP 실패·갱신 필요가 있을 때만.
  if (ciMode && (failCount > 0 || staleCount > 0)) {
    createGitHubIssue(failedItems, timeoutItems, staleItems, {
      totalSources,
      okCount,
      failCount,
      timeoutCount,
      staleCount,
      staleDays,
    });
  }

  // 종료 코드: HTTP 실패가 있으면 1 (타임아웃은 exit 0)
  process.exit(failCount > 0 ? 1 : 0);
}

/* ── CI 모드: GitHub Issue 자동 생성 ── */
function createGitHubIssue(
  failed: { programName: string; label: string; url: string; status: number; reason: string }[],
  timeouts: { programName: string; label: string; url: string }[],
  stale: { programName: string; programId: string; lastVerified: string | null; days: number }[],
  stats: {
    totalSources: number;
    okCount: number;
    failCount: number;
    timeoutCount: number;
    staleCount: number;
    staleDays: number;
  },
): void {
  try {
    execSync("which gh", { stdio: "ignore" });
  } catch {
    console.log("\n⚠️  gh CLI를 찾을 수 없습니다. Issue 생성을 건너뜁니다.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const issueTitle = `📋 정책 데이터 검증 실패 — ${today}`;

  // 열린 policy-check 이슈가 있으면 새로 만들지 않는다 — 미해결 상태에서 매주 1건씩 쌓이던
  // 것을 막는다 (6/1~8/24 11건 누적 후 8/29 정리. watchman report.sh와 동일 패턴).
  try {
    const openCount = execSync(
      `gh issue list --label "policy-check" --state open --json number --jq 'length'`,
      { encoding: "utf-8" },
    ).trim();
    if (openCount !== "0") {
      console.log(`\nℹ️  열린 policy-check 이슈가 이미 ${openCount}건 있습니다. 새 이슈를 생성하지 않습니다.`);
      console.log("    (처리 후 이슈를 닫으면 다음 주기에 새로 보고합니다)");
      return;
    }
  } catch {
    // label이 없거나 gh 인증 실패 — 계속 진행
  }

  // Issue body 구성
  let body = `## 정책 데이터 검증 결과\n\n`;
  body += `**검사일시:** ${today}\n`;
  body += `**결과:** 총 ${stats.totalSources}건 중 성공 ${stats.okCount}건, 실패 ${stats.failCount}건, 타임아웃 ${stats.timeoutCount}건(경고), 갱신 필요 ${stats.staleCount}건\n\n`;

  if (failed.length > 0) {
    body += `### ❌ 실패 출처 (HTTP 오류 또는 내용 검증 실패)\n\n`;
    body += `| 사업명 | 출처 | 사유 | URL |\n`;
    body += `|--------|------|------|-----|\n`;
    for (const f of failed) {
      body += `| ${f.programName} | ${f.label} | ${f.reason} | ${f.url} |\n`;
    }
    body += `\n`;
  }

  if (timeouts.length > 0) {
    body += `### ⏱️ 타임아웃 (참고 — 실패로 집계하지 않음)\n\n`;
    body += `US 러너에서 한국 정부 사이트(go.kr)는 상시 타임아웃이 나요. 한국에서 \`curl -sL -A "Mozilla/5.0"\`로 재확인해 주세요.\n\n`;
    body += `| 사업명 | 출처 | URL |\n|--------|------|-----|\n`;
    for (const t of timeouts) {
      body += `| ${t.programName} | ${t.label} | ${t.url} |\n`;
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
  body += `1. **실패 출처**: \`src/lib/data/gov-roadmap.ts\`의 \`sources\` 배열에서 고정 상세 URL로 교체 + \`mustContain\` 키워드 등록 (메인·게시판·소프트 404는 HTTP 200이어도 실패)\n`;
  body += `2. **갱신 필요**: 공식 출처 방문 후 데이터 확인 → \`lastVerified\`를 오늘 날짜로 갱신\n`;
  body += `3. 일시적 장애인 경우 다음 주기에 자동 재검사됩니다\n`;
  body += `4. 처리 후 **이 이슈를 닫아 주세요** — 열려 있는 동안은 새 이슈를 만들지 않아요\n`;

  try {
    execSync(
      `gh issue create --title "${issueTitle}" --body "${body.replace(/"/g, '\\"')}" --label "policy-check" --assignee "KangseonLEE"`,
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
