/**
 * ═══════════════════════════════════════════
 *  §20 접수 중 항목의 원문 '모집 끝남' 점검 (2026-10-26 신설 · 같은 날 교육·행사·DB 행으로 확대)
 *
 *  사용: npx tsx scripts/watchman/check-program-closure.ts
 *  CI:   npx tsx scripts/watchman/check-program-closure.ts --ci
 *
 *  배경: SP-044 괴산 희망둥지는 "모집완료 시까지"라 마감일을 9999 로 뒀는데, 원문 제목이 `<모집완료>` 로
 *  바뀐 뒤에도 화면이 '모집중'이었다(회장 발견). 화면 상태는 날짜로만 정해지고, 수집 행은 한 번 검증되면
 *  다시 쓰지 않는다(sync-crawl `is_verified` 건너뜀). 원문이 일찍 닫히거나 날짜가 바뀌면 아무도 몰랐다.
 *
 *  대상: 오늘 접수 중으로 보이는 지원사업·교육·행사 — DB 행(수집·큐레이션) + DB 에 없는 정적 큐레이션 행.
 *  같은 id 가 둘 다 있으면 화면과 같게 DB 를 본다(loadPrograms 병합 규칙).
 *
 *  확인 방법 — 원천마다 다르다:
 *    · 그린대로 교육(crawl-greendaero-education-*): 상세 HTML 은 자바스크립트가 채우기 전 견본(2022년·홍길동)이라
 *      읽을 수 없다. 수집기와 같은 공개 JSON 목록에서 같은 slug 를 찾아 접수 마감일을 대조한다.
 *    · 그린대로 살아보기(crawl-greendaero-live-*): 딥링크가 없다. JSON 의 vlg_state 3 = 모집완료, 마감일 대조.
 *    · 그 밖(지자체 게시글·농진청 상세): 원문 HTML 에서 `<모집완료>`·`[마감]`·"모집이 완료되었습니다" 를 찾는다
 *      (lib/programs/closure-markers). 농진청 상세는 '신청기간 A ~ B' 의 마감일도 대조한다.
 *    · 원문이 게시글이 아니라 목록·홈 주소면 상태를 읽을 수 없다 → ⚪ 한 줄로만 센다.
 *
 *  등급:
 *    🔴 원천은 끝났는데(모집 끝남 표시·마감일 지남·모집완료) 화면은 접수 중
 *    🟡 원천 마감일이 우리 값과 다름 / 원천 목록에서 사라짐 / 원문을 읽지 못함(미국 러너만의 실패일 수 있음, W4)
 *    🟡 마감일 없는 행(9999)이 시작한 해를 넘김 — '2026년 사업·예산 소진 시까지'가 이듬해에도 '모집중'으로 남는다
 *    ⚪ 게시글 주소가 아니라 확인 불가
 *
 *  출력 계약: WATCHMAN_FINDINGS 파일에 `등급|항목|근거` 1행씩 append. exit 0.
 * ═══════════════════════════════════════════
 */

import { appendFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PROGRAMS } from "../../src/lib/data/programs";
import { EDUCATION_COURSES } from "../../src/lib/data/education";
import { EVENTS } from "../../src/lib/data/events";
import { kstToday } from "../../src/lib/program-status";
import { findClosureMarker, htmlToText } from "../../src/lib/programs/closure-markers";
import { crawlSlug } from "../../supabase/functions/_shared/crawl-utils";
import { toIsoDate } from "../../supabase/functions/_shared/greendaero";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const GD = "https://www.greendaero.go.kr";
const MIN_TEXT = 1500;
/**
 * 미국 러너(CI)에선 막히고 한국 회선에선 열리는 원문 도메인 (W4 — 해외만의 실패는 URL 단위 경고).
 * 넣는 조건: 한국 회선에서 200·본문 일치를 확인한 뒤에만. CI 에서 이 도메인의 '읽지 못함'은 ⚪ 로 적는다
 * (매일 🟡 이슈가 다른 발견을 가린다 — 8/29 #115). 로컬(한국) 실행에선 그대로 🟡 라 진짜 404 는 거기서 잡힌다.
 *   www.cheongdo.go.kr — 10/27 한국 200(임시거주 임대료 본문) · CI 본문 225~227자
 *   www.goryeong.go.kr — 10/27 한국 200(하반기 귀농인 지원사업 공고) · CI 404
 */
const KR_ONLY_HOSTS = new Set(["www.cheongdo.go.kr", "www.goryeong.go.kr"]);
const SHOW = 15;

type Kind = "지원사업" | "교육" | "행사";
interface Target {
  id: string;
  title: string;
  kind: Kind;
  url: string;
  /** 접수 시작일 (없으면 null) */
  start: string | null;
  /** 우리 화면의 접수 마감일 (없으면 null = 마감일 없음) */
  end: string | null;
  origin: "DB" | "정적";
}

interface Finding {
  grade: "🔴" | "🟡" | "⚪";
  item: string;
  detail: string;
}

/** 화면에서 접수 중인가 — deriveStatus 와 같은 규칙(시작일 없음 + 마감일 있음 = 마감일까지 접수 중, 9999 페어 = 공고 전) */
function isOpen(start: string | null | undefined, end: string | null | undefined, today: string): boolean {
  const s = start && start !== "9999-12-31" ? start : null;
  const e = end && end !== "9999-12-31" ? end : null;
  if (!s) return e !== null && e >= today;
  return s <= today && (e === null || e >= today);
}

const realEnd = (end: string | null | undefined) => (!end || end === "9999-12-31" ? null : end);

/* ── 대상 모으기 ── */

async function loadDbTargets(today: string): Promise<{ targets: Target[]; allIds: Set<string>; error?: string }> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { targets: [], allIds: new Set(), error: "Supabase 환경변수 없음" };
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const specs = [
    { table: "support_programs", kind: "지원사업", urlCol: "source_url", endCol: null, linkCol: "link_status" },
    { table: "education_courses", kind: "교육", urlCol: "url", endCol: null, linkCol: "link_status" },
    { table: "farm_events", kind: "행사", urlCol: "url", endCol: "date_end", linkCol: null },
  ] as const;
  const targets: Target[] = [];
  // 정적 병합 기준은 접수 중 행이 아니라 DB 의 모든 slug — 화면은 DB 에 있으면 DB 값을 쓴다(loadPrograms 병합 규칙)
  const allIds = new Set<string>();
  for (const s of specs) {
    const cols = ["slug", "title", s.urlCol, "application_start", "application_end", s.endCol, s.linkCol].filter(Boolean).join(",");
    const { data, error } = await sb.from(s.table).select(cols).limit(5000);
    if (error) return { targets: [], allIds: new Set(), error: `${s.table} 조회 실패: ${error.message}` };
    for (const r of (data ?? []) as unknown as Record<string, string | null>[]) {
      if (r.slug) allIds.add(r.slug);
      const end = r.application_end ?? (s.endCol ? r[s.endCol] : null);
      if (!isOpen(r.application_start, end, today)) continue;
      // 목록·상세가 숨기는 행(원문 깨짐)은 화면에 접수 중으로 안 보인다 — 화면과 같게 뺀다 (10/28)
      if (s.linkCol && r[s.linkCol] === "broken") continue;
      targets.push({
        id: r.slug ?? "",
        title: r.title ?? "",
        kind: s.kind,
        url: r[s.urlCol] ?? "",
        start: realEnd(r.application_start),
        end: realEnd(end),
        origin: "DB",
      });
    }
  }
  return { targets, allIds };
}

function staticTargets(today: string, dbIds: Set<string>): Target[] {
  const rows: Target[] = [
    ...PROGRAMS.filter((p) => isOpen(p.applicationStart, p.applicationEnd, today)).map((p) => ({
      id: p.id, title: p.title, kind: "지원사업" as Kind, url: p.sourceUrl, start: realEnd(p.applicationStart), end: realEnd(p.applicationEnd), origin: "정적" as const,
    })),
    ...EDUCATION_COURSES.filter((c) => isOpen(c.applicationStart, c.applicationEnd, today)).map((c) => ({
      id: c.id, title: c.title, kind: "교육" as Kind, url: c.url, start: realEnd(c.applicationStart), end: realEnd(c.applicationEnd), origin: "정적" as const,
    })),
    ...EVENTS.filter((e) => isOpen(e.applicationStart, e.applicationEnd ?? e.dateEnd, today)).map((e) => ({
      id: e.id, title: e.title, kind: "행사" as Kind, url: e.url, start: realEnd(e.applicationStart ?? null), end: realEnd(e.applicationEnd ?? e.dateEnd), origin: "정적" as const,
    })),
  ];
  return rows.filter((r) => !dbIds.has(r.id));
}

/* ── 원천별 확인 ── */

async function getText(url: string, headers: Record<string, string> = {}): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA, ...headers },
    redirect: "follow",
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** 그린대로 교육 JSON — 우리 slug 가 다 나오거나 목록이 끝날 때까지(최대 GD_MAX_PAGES 쪽)
 *  목록 순서가 날마다 바뀌어 6쪽(1,200건) 한도에선 있는 행도 '못 찾음'이 됐다(10/28, 전체 2,779건) — 전체를 덮게 둔다. */
const GD_MAX_PAGES = 25;
async function greendaeroEducation(wanted: Set<string>) {
  const found = new Map<string, { start?: string; end?: string; name: string }>();
  let exhausted = false;
  for (let page = 1; page <= GD_MAX_PAGES && found.size < wanted.size; page++) {
    const body = await getText(`${GD}/svc/rfph/edc/offline/getEdcList.do?page=${page}&itemsPerPage=200`, {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `${GD}/svc/rfph/edc/offline/front/applicationList.do`,
    });
    if (!body.trimStart().startsWith("{")) throw new Error(`JSON 아님(${body.length}바이트) — 경로 변경 의심`);
    const list = (JSON.parse(body) as { list?: Record<string, string | null>[] }).list;
    if (!Array.isArray(list)) throw new Error("list 없음 — 형식 변경 의심");
    for (const raw of list) {
      const slug = crawlSlug("greendaero-education", (raw.eduDetailCrseId ?? "").trim());
      if (wanted.has(slug)) {
        found.set(slug, { start: toIsoDate(raw.eduRcrtBgngDt), end: toIsoDate(raw.eduRcrtEndDt), name: raw.eduDetailCrseNm ?? "" });
      }
    }
    if (list.length < 200) exhausted = true;
    if (exhausted) break;
  }
  return { found, exhausted };
}

async function greendaeroLive() {
  const body = await getText(`${GD}/svc/rfph/edc/live/apply/list.do?search_mode=1&page=1&items_per_page=400&searchText=`, {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Referer: `${GD}/svc/rfph/edc/live/front/apply/list.do`,
  });
  if (!body.trimStart().startsWith("{")) throw new Error(`JSON 아님(${body.length}바이트) — 경로 변경 의심`);
  const list = (JSON.parse(body) as { list?: Record<string, string | number | null>[] | null }).list ?? [];
  const bySlug = new Map<string, { state: number | null; end?: string }>();
  for (const raw of list) {
    const slug = crawlSlug("greendaero-live", String(raw.vlg_oper_mngno ?? "").trim());
    bySlug.set(slug, { state: raw.vlg_state == null ? null : Number(raw.vlg_state), end: toIsoDate(String(raw.aply_end_ymd ?? "")) });
  }
  return bySlug;
}

/** 게시글(개별 공고)을 가리키는 주소인가 — 목록·홈은 다른 공고의 머리표가 섞여 판정할 수 없다 */
function isPostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (/[?&][^=]*(id|no|idx|seq|sid|mgtno|nttno|datasid|wr_id|key)[^=]*=\w/i.test(u.search)) return true;
    return /\/\d{3,}\/?$/.test(u.pathname);
  } catch {
    return false;
  }
}

/** 농진청 상세 '신청기간 2026-10-21 ~ 2026-10-28' 의 마감일 */
function rdaApplyEnd(text: string): string | undefined {
  return text.match(/신청기간\s*\d{4}-\d{2}-\d{2}\s*~\s*(\d{4}-\d{2}-\d{2})/)?.[1];
}

async function checkHtml(t: Target, today: string): Promise<Finding | null> {
  let html: string;
  try {
    html = await getText(t.url);
  } catch (e) {
    return { grade: "🟡", item: "원문을 읽지 못함", detail: `${t.id} — ${(e as Error).name === "TimeoutError" ? "타임아웃" : (e as Error).message} · ${t.url}` };
  }
  if (/location\.href\s*=\s*["']https?:\/\/[^/"']+\/?["']/.test(html) && html.length < 2000) {
    return { grade: "🟡", item: "원문을 읽지 못함", detail: `${t.id} — 홈으로 튕김(링크가 게시글이 아님) · ${t.url}` };
  }
  const text = htmlToText(html);
  if (text.length < MIN_TEXT) return { grade: "🟡", item: "원문을 읽지 못함", detail: `${t.id} — 본문 ${text.length}자 · ${t.url}` };
  const marker = findClosureMarker(text);
  if (marker) return { grade: "🔴", item: "원문은 모집 끝남, 화면은 접수 중", detail: `${t.id} ${t.title} — "${marker}" · ${t.url}` };
  if (t.url.includes("rda.go.kr")) {
    const srcEnd = rdaApplyEnd(text);
    if (srcEnd && srcEnd !== t.end) {
      return srcEnd < today
        ? { grade: "🔴", item: "원천 마감일이 지났는데 화면은 접수 중", detail: `${t.id} — 우리 ${t.end ?? "없음"} · 원천 ${srcEnd} · ${t.url}` }
        : { grade: "🟡", item: "원천 마감일이 우리 값과 다름", detail: `${t.id} — 우리 ${t.end ?? "없음"} · 원천 ${srcEnd} · ${t.url}` };
    }
  }
  return null;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

/* ── 실행 ── */

async function main() {
  const ci = process.argv.includes("--ci");
  const today = kstToday();
  const findings: Finding[] = [];

  const db = await loadDbTargets(today);
  if (db.error) findings.push({ grade: "🟡", item: "DB 대상 조회 실패", detail: `${db.error} — 수집·DB 행은 이번에 확인 못 함` });
  const targets = [...db.targets, ...staticTargets(today, db.allIds)];

  const gdEdu = targets.filter((t) => t.id.startsWith("crawl-greendaero-education-"));
  const gdLive = targets.filter((t) => t.id.startsWith("crawl-greendaero-live-"));
  const rest = targets.filter((t) => !gdEdu.includes(t) && !gdLive.includes(t));
  const posts = rest.filter((t) => isPostUrl(t.url));
  const notPosts = rest.filter((t) => !isPostUrl(t.url));
  let checked = 0;

  // 그린대로 교육
  if (gdEdu.length) {
    try {
      const { found, exhausted } = await greendaeroEducation(new Set(gdEdu.map((t) => t.id)));
      for (const t of gdEdu) {
        const src = found.get(t.id);
        if (!src) {
          findings.push({ grade: "🟡", item: `그린대로 목록에서 못 찾음${exhausted ? "" : `(${GD_MAX_PAGES}쪽 안)`}`, detail: t.id });
          continue;
        }
        checked++;
        if (src.end && src.end !== t.end) {
          findings.push(
            src.end < today
              ? { grade: "🔴", item: "원천 마감일이 지났는데 화면은 접수 중", detail: `${t.id} ${src.name} — 우리 ${t.end} · 그린대로 ${src.end}` }
              : { grade: "🟡", item: "원천 마감일이 우리 값과 다름", detail: `${t.id} ${src.name} — 우리 ${t.end} · 그린대로 ${src.end}` },
          );
        }
      }
    } catch (e) {
      findings.push({ grade: "🟡", item: "그린대로 교육 목록 조회 실패", detail: `${(e as Error).message} — ${gdEdu.length}건 확인 못 함` });
    }
  }

  // 그린대로 살아보기
  if (gdLive.length) {
    try {
      const bySlug = await greendaeroLive();
      for (const t of gdLive) {
        const src = bySlug.get(t.id);
        if (!src) {
          findings.push({ grade: "🟡", item: "그린대로 목록에서 못 찾음", detail: t.id });
          continue;
        }
        checked++;
        if (src.state === 3) {
          findings.push({ grade: "🔴", item: "원문은 모집 끝남, 화면은 접수 중", detail: `${t.id} ${t.title} — 그린대로 vlg_state 3(모집완료)` });
        } else if (src.end && src.end !== t.end) {
          findings.push({
            grade: src.end < today ? "🔴" : "🟡",
            item: src.end < today ? "원천 마감일이 지났는데 화면은 접수 중" : "원천 마감일이 우리 값과 다름",
            detail: `${t.id} ${t.title} — 우리 ${t.end} · 그린대로 ${src.end}`,
          });
        }
      }
    } catch (e) {
      findings.push({ grade: "🟡", item: "그린대로 살아보기 목록 조회 실패", detail: `${(e as Error).message} — ${gdLive.length}건 확인 못 함` });
    }
  }

  // 개별 게시글 — 지자체 서버에 몰리지 않게 순차
  for (const t of posts) {
    const f = await checkHtml(t, today);
    if (!f || f.grade !== "🟡" || f.item !== "원문을 읽지 못함") checked++;
    if (f && ci && f.item === "원문을 읽지 못함" && KR_ONLY_HOSTS.has(hostOf(t.url))) {
      findings.push({ ...f, grade: "⚪", item: "원문을 읽지 못함(해외 회선 차단 도메인 — 한국에서 확인)" });
    } else if (f) findings.push(f);
  }

  // 마감일 없이(9999) 열린 행이 시작한 해를 넘겼다 — '2026년 사업·예산 소진 시까지'가 해가 바뀌어도 '모집중'으로 남는다
  for (const t of targets) {
    if (!t.end && t.start && t.start.slice(0, 4) < today.slice(0, 4)) {
      findings.push({ grade: "🟡", item: "마감일 없는 공고가 해를 넘김", detail: `${t.id} ${t.title} — ${t.start} 시작 · 올해도 접수 중인지 원문 확인 후 마감일 지정` });
    }
  }

  for (const t of notPosts) {
    findings.push({ grade: "⚪", item: "원문이 게시글 주소가 아님(상태 확인 불가)", detail: t.id });
  }

  console.log(
    `[§20] 접수 중 ${targets.length}건(DB ${db.targets.length} · 정적 ${targets.length - db.targets.length}) — ` +
      `그린대로 교육 ${gdEdu.length} · 살아보기 ${gdLive.length} · 게시글 ${posts.length} · 확인 불가 주소 ${notPosts.length} · 확인 완료 ${checked}`,
  );

  // 같은 등급·항목은 한 줄로 묶는다(이슈가 100줄이 되지 않게)
  const grouped = new Map<string, string[]>();
  for (const f of findings) {
    const k = `${f.grade}|§20 ${f.item}`;
    grouped.set(k, [...(grouped.get(k) ?? []), f.detail]);
  }
  const lines = [...grouped].map(([k, ds]) => {
    const head = ds.slice(0, SHOW).join(" / ");
    return `${k}|${ds.length}건 — ${head}${ds.length > SHOW ? ` 외 ${ds.length - SHOW}건` : ""}`;
  });
  for (const l of lines) console.log("  " + l);

  if (ci && lines.length) {
    const file = process.env.WATCHMAN_FINDINGS;
    if (!file) throw new Error("WATCHMAN_FINDINGS 없음");
    appendFileSync(file, lines.join("\n") + "\n", "utf-8");
  }
}

main();
