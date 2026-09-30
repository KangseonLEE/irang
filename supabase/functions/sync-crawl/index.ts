/**
 * sync-crawl Edge Function
 * - rda.go.kr/young (똑똑!청년농부) HTML 크롤링
 * - uni.agrix.go.kr 농림부 통합 지원사업 JSON API
 * - greendaero.go.kr 지자체 귀농귀촌 교육·체험 JSON API (2026-09-29 신설)
 * - 수집 데이터는 is_verified: 자동 검증 (broken URL만 false)
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
  fetchRdaListing,
  fetchRdaEvents,
  fetchAgrixPrograms,
  checkUrlHealth,
  crawlSlug,
  inferEventType,
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

/** 한 실행에서 원문 URL 헬스체크를 수행할 최대 건수 (URL별 캐시 적용) */
const MAX_URL_CHECKS_PER_TARGET = 12;

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

  const targets =
    targetId === "all"
      ? CRAWL_TARGETS
      : CRAWL_TARGETS.filter((t) => t.id === targetId);

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
    status: allErrors.length > 0 ? "partial" : "success",
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

async function collectItems(target: CrawlTarget): Promise<CrawledItem[]> {
  switch (target.type) {
    case "rda-events":
      return await fetchRdaEvents();
    case "rda-listing":
      return await fetchRdaListing(target.params);
    case "agrix-api":
      return await fetchAgrixPrograms(1, 30);
    case "greendaero-education":
      return await fetchGreendaeroEducation();
    case "greendaero-live":
      return await fetchGreendaeroLive();
    default:
      return [];
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

  try {
    console.log(`[sync-crawl] ${target.name} 크롤링 시작...`);
    items = await collectItems(target);
    console.log(`[sync-crawl] ${target.name}: ${items.length}건 수집`);

    const capped = items.slice(0, MAX_ITEMS_PER_TARGET);

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

    const pending = refresh ? prepared : prepared.filter((p) => !verified.has(`${p.table}:${p.slug}`));
    skipped = prepared.length - pending.length;

    // ── 3. 원문 URL 헬스체크 (URL 캐시 + 건수 예산) ──
    const healthCache = new Map<string, LinkStatus>();
    let checks = 0;
    async function linkStatusOf(url: string): Promise<LinkStatus> {
      if (!url) return "unverified";
      const cached = healthCache.get(url);
      if (cached) return cached;
      if (checks >= MAX_URL_CHECKS_PER_TARGET) return "unverified";
      checks++;
      const status = await checkUrlHealth(url);
      healthCache.set(url, status);
      return status;
    }

    // ── 4. 테이블별 행 조립 후 일괄 upsert ──
    const today = new Date().toISOString().slice(0, 10);
    // deno-lint-ignore no-explicit-any
    const rowsByTable: Record<string, any[]> = {};

    for (const { item, slug, table } of pending) {
      const linkStatus = await linkStatusOf(item.url);
      const { region, sigungu } = normalizeRegion(item.region || "전국");
      const isVerified = linkStatus !== "broken";
      const description = [
        `${target.name}에서 수집했어요.`,
        item.note,
      ]
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
          date_start: item.operationStart ?? item.dateStart ?? today,
          date_end: item.operationEnd ?? item.dateEnd ?? null,
          application_start: item.dateStart ?? null,
          application_end: item.dateEnd ?? null,
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
          support_amount: "상세 공고 참조",
          eligibility_age_min: 18,
          eligibility_age_max: 65,
          eligibility_detail: item.capacity || "상세 공고 참조",
          application_start: item.dateStart || today,
          application_end: item.dateEnd || today,
          status: item.status === "마감" ? "마감" : item.status === "모집예정" ? "모집예정" : "모집중",
          related_crops: [],
          source_url: item.url,
          link_status: linkStatus,
          year: new Date().getFullYear(),
          is_verified: isVerified,
        });
      } else {
        const schedule =
          item.operationStart && item.operationEnd
            ? `${item.operationStart} ~ ${item.operationEnd}`
            : item.dateStart && item.dateEnd
              ? `${item.dateStart} ~ ${item.dateEnd}`
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
          application_start: item.dateStart || today,
          application_end: item.dateEnd || today,
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
