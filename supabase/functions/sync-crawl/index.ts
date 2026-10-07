/**
 * sync-crawl Edge Function
 * - rda.go.kr/young (똑똑!청년농부) HTML 크롤링
 * - uni.agrix.go.kr 농림부 통합 지원사업 JSON API — 2026-10-06 수집 중단(농업e지 이관, CRAWL_TARGETS disabled)
 * - greendaero.go.kr 지자체 귀농귀촌 교육·체험 JSON API (2026-09-29 신설)
 * - 수집 데이터는 is_verified: 자동 검증 (broken URL, 상세 보강을 못 한 RDA 행만 false — 다음 실행에서 다시 받는다)
 * - RDA(rda-*) 는 적재할 항목만 상세 페이지로 보강한다: 주관 기관·접수 기간·지원 내용 요약 (10/3)
 * - 원천 요청 실패(1회 재시도 후)·응답 형식 변경은 그 타깃을 ok:false 로 — "성공·0건" 금지 (10/4).
 *   원천이 정상 응답한 0건(RDA "총 0건", 그린대로 빈 목록 등)은 실패가 아니다.
 *
 * 타겟별 개별 호출:
 *   POST /functions/v1/sync-crawl { "target": "rda-programs" }
 *   POST /functions/v1/sync-crawl { "target": "all" }
 *
 * 트리거: GitHub Actions cron (sync-rda 이후 실행)
 *
 * ⚠ CRAWL_TARGETS에 타겟을 추가하면 **반드시 함수를 재배포**해야 한다.
 *   2026-09-29 진단: `rda-events`가 리포에는 있었지만 배포본에 없어
 *   워크플로가 매일 `{"error":"Unknown target: rda-events"}` HTTP 400을 받았고,
 *   워크플로는 500 미만을 아예 무시해서 `data_sync_log`에 events 행이 0건이었다.
 */

import { getServiceClient } from "../_shared/supabase-client.ts";
import {
  CRAWL_TARGETS,
  selectCrawlTargets,
  UNKNOWN_DATE,
  fetchRdaListing,
  fetchRdaEvents,
  fetchAgrixPrograms,
  enrichRdaItems,
  checkUrlHealth,
  crawlSlug,
  inferEventType,
  kstToday,
  type CollectResult,
  type CrawlTarget,
  type CrawledItem,
} from "../_shared/crawl-utils.ts";
import { normalizeRegion, regionLabel } from "../_shared/region.ts";
import {
  fetchGreendaeroEducation,
  fetchGreendaeroLive,
} from "../_shared/greendaero.ts";

/** 타겟당 적재 상한 (Edge Function wall-clock 보호) */
const MAX_ITEMS_PER_TARGET = 60;

/**
 * 타겟별 상한 예외 (10/2 dev QA).
 * 그린대로 교육은 공개 JSON 한 번 호출이라 비용이 upsert 1회뿐인데, 기본 상한 60 에 잘려
 * 활성 138건 중 약 72건이 적재되지 않았다(10/2 정기 실행: itemsFound 138, skipped 60).
 * 원천이 교육 시작일 오름차순이라 시작이 늦은 과정은 앞쪽이 마감돼야 창에 들어왔다.
 * URL 헬스체크는 MAX_URL_CHECKS_PER_TARGET 예산이 따로 있어 상한을 올려도 늘지 않는다.
 */
const MAX_ITEMS_BY_TARGET: Record<string, number> = {
  "greendaero-education": 200,
};

/** 한 실행에서 원문 URL 헬스체크를 수행할 최대 건수 (URL별 캐시 적용) */
const MAX_URL_CHECKS_PER_TARGET = 12;

/**
 * 타깃 하나의 외부 요청 마감 (ms, 크롤 시작부터). Edge Function wall-clock 150초·워크플로 curl
 * --max-time 150 안에 upsert 까지 끝내려고 상세 보강·헬스체크를 이 시각에 멈춘다 (10/4).
 * 목록 재시도(최악 50초)가 생기면서 고정 예산만으로는 150초를 넘길 수 있게 됐다.
 */
const CRAWL_DEADLINE_MS = 120_000;

type LinkStatus = "active" | "broken" | "unverified";

interface CrawlResult {
  ok: boolean;
  target: string;
  itemsFound: number;
  newItems: number;
  skipped: number;
  /** 항목 단위 분류로 실제 적재된 테이블별 건수 */
  byTable: Record<string, number>;
  errors: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 인증: CRON_SECRET 검증 (필수 — 미설정 시 요청 거부)
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: "CRON_SECRET not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // ─── 타겟 결정 ───
  let targetId = "all";
  // refresh=true: 이미 검증된(is_verified) 행도 다시 upsert — 원천에 새 필드가 생겼을 때 백필용 (9/30 사진 등)
  let refresh = false;
  try {
    const body = await req.json();
    targetId = body.target || "all";
    refresh = body.refresh === true;
  } catch {
    // body 없으면 전체 실행
  }

  // 중단(disabled)된 타깃은 "all" 에서 빠지고, 단독 호출이면 원천 요청·DB 쓰기 없이 200 으로 답한다 (10/6 agrix)
  const { run: targets, disabled } = selectCrawlTargets(targetId);

  if (disabled.length > 0 && targets.length === 0) {
    const t = disabled[0];
    console.log(`[sync-crawl] ${t.name} 수집 중단 상태라 건너뜀 (${t.disabled?.since}): ${t.disabled?.reason}`);
    return new Response(
      JSON.stringify({
        ok: true,
        skipped: "disabled",
        target: t.id,
        since: t.disabled?.since,
        reason: t.disabled?.reason,
        results: [],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }

  if (targets.length === 0) {
    return new Response(
      JSON.stringify({
        error: `Unknown target: ${targetId}`,
        available: CRAWL_TARGETS.map((t) => t.id),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const supabase = getServiceClient();
  const results: CrawlResult[] = [];

  for (const target of targets) {
    const result = await crawlTarget(supabase, target, refresh);
    results.push(result);
  }

  // ─── 동기화 로그 ───
  const totalNew = results.reduce((s, r) => s + r.newItems, 0);
  const allErrors = results.flatMap((r) => r.errors);
  const tablesTouched = [
    ...new Set(results.flatMap((r) => Object.keys(r.byTable))),
  ];

  await supabase.from("data_sync_log").insert({
    source: "crawl",
    // 항목 단위로 테이블이 갈리므로 실제 적재 대상만 기록한다
    table_name:
      tablesTouched.length > 0
        ? tablesTouched.join(",")
        : targets.map((t) => t.category).join(","),
    action: "sync",
    record_count: totalNew,
    // 모든 타깃이 원천에서 0건으로 실패하면 'failed' — 예전엔 전면 실패도 'partial' 로 남았다 (10/4 QA)
    status:
      allErrors.length === 0
        ? "success"
        : results.length > 0 && results.every((r) => r.errors.length > 0 && r.itemsFound === 0)
          ? "failed"
          : "partial",
    error_message: allErrors.length > 0 ? allErrors.join("; ") : null,
    metadata: {
      targets: results.map((r) => ({
        id: r.target,
        found: r.itemsFound,
        new: r.newItems,
        skipped: r.skipped,
        byTable: r.byTable,
      })),
      timestamp: new Date().toISOString(),
    },
  });

  return new Response(JSON.stringify({ ok: allErrors.length === 0, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ─── 수집 ───

/**
 * 원천 수집. 요청 실패·응답 형식 변경은 빈 배열이 아니라 `errors` 로 돌아온다 (10/4 "성공·0건" 금지).
 */
async function collectItems(target: CrawlTarget): Promise<CollectResult> {
  switch (target.type) {
    case "rda-events":
      return await fetchRdaEvents();
    case "rda-listing":
      return await fetchRdaListing(target.params);
    case "agrix-api":
      return await fetchAgrixPrograms(1, 30);
    case "greendaero-education":
      return await fetchGreendaeroEducation(kstToday());
    case "greendaero-live":
      return await fetchGreendaeroLive(kstToday());
    default:
      return { items: [], errors: [`수집기 없는 타깃 유형: ${target.type}`] };
  }
}

/** 항목이 들어갈 테이블 — 항목 지정(category)이 타겟 기본값을 이긴다 */
function tableFor(item: CrawledItem, target: CrawlTarget): string {
  const category = item.category ?? target.category;
  if (category === "programs") return "support_programs";
  if (category === "events") return "farm_events";
  return "education_courses";
}

/** 상태 문자열 → farm_events.status 어휘 */
function eventStatus(status: string): string {
  if (status === "마감") return "마감";
  if (status === "모집예정") return "접수예정";
  return "접수중";
}

// ─── 개별 타겟 크롤링 ───

// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function crawlTarget(supabase: any, target: CrawlTarget, refresh = false): Promise<CrawlResult> {
  const errors: string[] = [];
  const byTable: Record<string, number> = {};
  let newItems = 0;
  let skipped = 0;
  let items: CrawledItem[] = [];

  const deadline = Date.now() + CRAWL_DEADLINE_MS;

  try {
    console.log(`[sync-crawl] ${target.name} 크롤링 시작...`);
    const collected = await collectItems(target);
    items = collected.items;
    // 원천 실패는 타깃 오류 → 응답 ok:false → sync-data.yml Phase B 실패 (모은 항목은 그대로 적재)
    for (const message of collected.errors) {
      errors.push(`${target.name}: ${message}`);
      console.error(`[sync-crawl] ${target.name} 수집 오류: ${message}`);
    }
    console.log(`[sync-crawl] ${target.name}: ${items.length}건 수집`);

    const capped = items.slice(0, MAX_ITEMS_BY_TARGET[target.id] ?? MAX_ITEMS_PER_TARGET);

    // ── 1. 슬러그 계산 + 테이블별 분류 ──
    interface Prepared {
      item: CrawledItem;
      slug: string;
      table: string;
    }
    const prepared: Prepared[] = capped.map((item) => ({
      item,
      // sourceKey가 있으면 원천 고유 키로 slug를 만든다 — 같은 과정명이
      // 회차별로 반복되는 그린대로에서 제목 해시는 충돌한다.
      slug: crawlSlug(target.id, item.sourceKey ?? item.title),
      table: tableFor(item, target),
    }));

    // ── 2. 이미 검증된 slug 일괄 조회 (항목당 SELECT 제거) ──
    const verified = new Set<string>();
    for (const table of new Set(prepared.map((p) => p.table))) {
      const slugs = prepared.filter((p) => p.table === table).map((p) => p.slug);
      if (slugs.length === 0) continue;
      const { data, error } = await supabase
        .from(table)
        .select("slug, is_verified")
        .in("slug", slugs);
      if (error) {
        errors.push(`${table} 기존 조회 실패: ${error.message}`);
        continue;
      }
      for (const row of (data ?? []) as { slug: string; is_verified: boolean }[]) {
        if (row.is_verified) verified.add(`${table}:${row.slug}`);
      }
    }

    // 같은 배치에 같은 slug 가 두 번 있으면 PostgREST upsert 가 "cannot affect row a second time" 로 통째 실패한다
    // (9/30 refresh 실측: agrix 60건·rda 8건). 검증 필터가 가려 주던 중복을 여기서 명시적으로 제거 — 첫 항목 우선.
    const seenSlug = new Set<string>();
    const deduped = prepared.filter((p) => {
      const key = `${p.table}:${p.slug}`;
      if (seenSlug.has(key)) return false;
      seenSlug.add(key);
      return true;
    });
    let pending = refresh ? deduped : deduped.filter((p) => !verified.has(`${p.table}:${p.slug}`));
    skipped = prepared.length - pending.length;

    const healthCache = new Map<string, LinkStatus>();

    // ── 2-1. RDA 상세 보강 (10/3) ──
    // 목록에는 주관 기관·접수 시작일·지원 내용이 없다 → 적재할 항목(pending)만 상세 페이지를 받는다.
    // 상세 응답이 곧 원문 링크 확인이라 헬스체크 캐시에 그대로 넣어 같은 URL 을 두 번 받지 않는다.
    if (target.type === "rda-listing" || target.type === "rda-events") {
      const enriched = await enrichRdaItems(
        pending.map((p) => p.item),
        {
          today: kstToday(),
          requireOperationDate: target.category === "events",
          // 목록 재시도로 시간을 쓴 만큼 줄인다 — 요청 1건 초과분(10초)은 남겨 둔다
          timeBudgetMs: Math.max(0, Math.min(70_000, deadline - Date.now() - 10_000)),
        },
      );
      for (const [url, status] of enriched.linkStatus) healthCache.set(url, status);
      const before = pending.length;
      pending = pending.flatMap((p, i) => {
        const item = enriched.items[i];
        if (!item) return []; // 운영 날짜 없는 행사 — 날짜를 지어내지 않는다
        // 상세를 못 받은 목록 값으로 이미 검증된 행을 덮지 않는다 (refresh 중 일시 장애 대비)
        if (item.detailMissing && verified.has(`${p.table}:${p.slug}`)) return [];
        return [{ ...p, item }];
      });
      skipped += before - pending.length;
      console.log(
        `[sync-crawl] ${target.name} 상세 보강: 요청 ${enriched.fetched}건 · 실패 ${enriched.failed}건 · 예산 밖 ${enriched.deferred}건 · 날짜 없는 행사 제외 ${enriched.dropped}건`
      );
    }

    // ── 3. 원문 URL 헬스체크 (URL 캐시 + 건수 예산) ──
    let checks = 0;
    async function linkStatusOf(url: string): Promise<LinkStatus> {
      if (!url) return "unverified";
      const cached = healthCache.get(url);
      if (cached) return cached;
      if (checks >= MAX_URL_CHECKS_PER_TARGET || Date.now() >= deadline) return "unverified";
      checks++;
      const status = await checkUrlHealth(url);
      healthCache.set(url, status);
      return status;
    }

    // ── 4. 테이블별 행 조립 후 일괄 upsert ──
    // 날짜 폴백도 KST — 06:00 KST 스케줄은 UTC 로 전날이다 (10/4)
    const today = kstToday();
    // deno-lint-ignore no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rowsByTable: Record<string, any[]> = {};

    /** 날짜 미상(9999) 표기를 실제 날짜와 가른다 — 미상은 일정 문구·nullable 컬럼으로 새면 안 된다 */
    const realDate = (date?: string): string | null =>
      date && date !== UNKNOWN_DATE ? date : null;

    // 접수 마감일을 모르는 지원사업·교육은 적재하지 않는다 (10/4 QA). 수집일로 채우면 하루 '모집중'이었다가 마감되고
    // (10/2 그린대로 3행), 9999 로 두면 수집기가 행을 지우지 않아 '공고 발표 예정'으로 기본 목록에 남는다.
    // 시작일만 모르면 시작 미상(9999) — 표기는 "~ 마감일", 판정은 마감일까지 모집중(program-status).
    // RDA 의 마감일 미상(9999)도 같은 취급 — 목록·상세 둘 다 마감일을 못 줬으면 다음 실행에서 다시 받는다.
    // 체험·행사는 날짜(운영 시작 또는 접수 시작)가 하나도 없으면 같은 이유로 적재하지 않는다(예전엔 수집일로 채움).
    const hasDates = (p: (typeof pending)[number]) =>
      p.table === "farm_events"
        ? !!(p.item.operationStart ?? p.item.dateStart)
        : !!p.item.dateEnd && p.item.dateEnd !== UNKNOWN_DATE;
    const noDates = pending.length - pending.filter(hasDates).length;
    if (noDates > 0) {
      pending = pending.filter(hasDates);
      skipped += noDates;
      console.log(`[sync-crawl] ${target.name} 날짜 없는 항목 ${noDates}건 제외(접수 마감일·운영일 미상)`);
    }

    for (const { item, slug, table } of pending) {
      const linkStatus = await linkStatusOf(item.url);
      const { region, sigungu } = normalizeRegion(item.region || "전국");
      // 상세를 못 받은 목록 값뿐인 행(RDA)은 미검증으로 남겨 다음 실행에서 다시 받는다
      const isVerified = linkStatus !== "broken" && !item.detailMissing;
      // 원문 요약 + 주의 문구만 쓴다. "…에서 수집했어요" 출처 상투문은 정보량이 0 이라 뺐다 (10/3) —
      // 출처는 source_url·url 로 충분하다. 요약이 없으면 빈 문자열(화면이 빈 요약을 숨긴다).
      const description = [item.summary, item.note]
        .filter(Boolean)
        .join(" ")
        .slice(0, 500);

      const bucket = (rowsByTable[table] ??= []);

      if (table === "farm_events") {
        bucket.push({
          slug,
          title: item.title,
          region,
          sigungu,
          organization: item.organization || target.name,
          type: item.eventType ?? inferEventType(item.title),
          // RDA 행사는 운영 날짜(교육기간)가 없으면 위 2-1 단계에서 빠진다 — 아래 폴백은 그린대로용
          // 날짜 없는 행사는 위에서 빠진다 — 수집일로 채우지 않는다
          date_start: (item.operationStart ?? item.dateStart) as string,
          date_end: item.operationEnd ?? item.dateEnd ?? null,
          application_start: realDate(item.dateStart),
          application_end: realDate(item.dateEnd),
          location: regionLabel(region, sigungu),
          cost: "상세 공고 참조",
          description,
          capacity: item.capacityCount ?? null,
          target: item.capacity || "상세 공고 참조",
          url: item.url,
          status: eventStatus(item.status),
          is_verified: isVerified,
          // 9/30 살아보기 마을 카드 필드 — 마이그레이션 20260930_farm_events_village_fields 적용 후 유효
          image_url: item.imageUrl ?? null,
          move_in_date: item.moveInDate ?? null,
          households: item.households ?? null,
          village_type: item.villageType ?? null,
        });
      } else if (table === "support_programs") {
        bucket.push({
          slug,
          title: item.title,
          summary: description,
          region,
          sigungu,
          organization: item.organization || target.name,
          support_type: "보조금",
          support_amount: item.amount || "상세 공고 참조",
          eligibility_age_min: 18,
          eligibility_age_max: 65,
          eligibility_detail: item.capacity || "상세 공고 참조",
          application_start: item.dateStart || UNKNOWN_DATE,
          application_end: item.dateEnd,
          status: item.status === "마감" ? "마감" : item.status === "모집예정" ? "모집예정" : "모집중",
          related_crops: [],
          source_url: item.url,
          link_status: linkStatus,
          // 원천이 준 목록 연도 (agrix 는 saupYear 폴백이면 작년), 없으면 KST 올해
          year: item.year ?? Number(today.slice(0, 4)),
          is_verified: isVerified,
        });
      } else {
        const applyStart = realDate(item.dateStart);
        const applyEnd = realDate(item.dateEnd);
        const schedule =
          item.operationStart && item.operationEnd
            ? `${item.operationStart} ~ ${item.operationEnd}`
            : applyStart && applyEnd
              ? `${applyStart} ~ ${applyEnd}`
              : "상세 공고 참조";
        bucket.push({
          slug,
          title: item.title,
          region,
          sigungu,
          organization: item.organization || target.name,
          type: item.educationType ?? "오프라인",
          duration: "상세 공고 참조",
          schedule,
          target: item.capacity || "상세 공고 참조",
          cost: "상세 공고 참조",
          description,
          capacity: item.capacityCount ?? null,
          application_start: item.dateStart || UNKNOWN_DATE,
          application_end: item.dateEnd,
          status: item.status === "마감" ? "마감" : item.status === "모집예정" ? "모집예정" : "모집중",
          level: "초급",
          url: item.url,
          link_status: linkStatus,
          is_verified: isVerified,
        });
      }
    }

    for (const [table, rows] of Object.entries(rowsByTable)) {
      if (rows.length === 0) continue;
      const { error } = await supabase.from(table).upsert(rows, { onConflict: "slug" });
      if (error) {
        errors.push(`${table} upsert 실패(${rows.length}건): ${error.message}`);
        continue;
      }
      byTable[table] = (byTable[table] ?? 0) + rows.length;
      newItems += rows.length;
    }

    console.log(
      `[sync-crawl] ${target.name} 완료: ${newItems}건 적재(${JSON.stringify(byTable)}), ${skipped}건 스킵, URL 체크 ${checks}회`
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`${target.name}: ${msg}`);
    console.error(`[sync-crawl] ${target.name} 에러:`, msg);
  }

  return {
    ok: errors.length === 0,
    target: target.id,
    itemsFound: items.length,
    newItems,
    skipped,
    byTable,
    errors,
  };
}
