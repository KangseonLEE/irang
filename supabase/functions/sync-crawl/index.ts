/**
 * sync-crawl Edge Function
 * - rda.go.kr/young (똑똑!청년농부) HTML 크롤링
 * - uni.agrix.go.kr 농림부 통합 지원사업 JSON API
 * - 수집 데이터는 is_verified: 자동 검증 (broken URL만 false)
 *
 * 타겟별 개별 호출:
 *   POST /functions/v1/sync-crawl { "target": "rda-programs" }
 *   POST /functions/v1/sync-crawl { "target": "all" }
 *
 * 트리거: GitHub Actions cron (sync-rda 이후 실행)
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
import { mapAreaName } from "../_shared/mapping.ts";

interface CrawlResult {
  ok: boolean;
  target: string;
  itemsFound: number;
  newItems: number;
  skipped: number;
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
  try {
    const body = await req.json();
    targetId = body.target || "all";
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
    const result = await crawlTarget(supabase, target);
    results.push(result);
  }

  // ─── 동기화 로그 ───
  const totalNew = results.reduce((s, r) => s + r.newItems, 0);
  const allErrors = results.flatMap((r) => r.errors);

  await supabase.from("data_sync_log").insert({
    source: "crawl",
    table_name: targets.map((t) => t.category).join(","),
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
      })),
      timestamp: new Date().toISOString(),
    },
  });

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});

// ─── 개별 타겟 크롤링 ───

// deno-lint-ignore no-explicit-any
async function crawlTarget(supabase: any, target: CrawlTarget): Promise<CrawlResult> {
  const errors: string[] = [];
  let newItems = 0;
  let skipped = 0;
  let items: CrawledItem[] = [];

  try {
    console.log(`[sync-crawl] ${target.name} 크롤링 시작...`);

    // ─── 데이터 수집 (타겟 타입별) ───
    if (target.type === "rda-events") {
      items = await fetchRdaEvents();
    } else if (target.type === "rda-listing") {
      items = await fetchRdaListing(target.params);
    } else if (target.type === "agrix-api") {
      items = await fetchAgrixPrograms(1, 30);
    }

    console.log(`[sync-crawl] ${target.name}: ${items.length}건 수집`);

    // ─── DB upsert (최대 30건, CPU 시간 제한 고려) ───
    for (const item of items.slice(0, 30)) {
      const slug = crawlSlug(target.id, item.title);
      const tableName =
        target.category === "programs"
          ? "support_programs"
          : target.category === "events"
            ? "farm_events"
            : "education_courses";

      // 이미 검증된 항목이면 스킵
      const { data: existing } = await supabase
        .from(tableName)
        .select("slug, is_verified")
        .eq("slug", slug)
        .maybeSingle();

      if (existing?.is_verified) {
        skipped++;
        continue;
      }

      // URL 헬스 체크 (URL이 있을 때만)
      let linkStatus: "active" | "broken" | "unverified" = "unverified";
      if (item.url) {
        linkStatus = await checkUrlHealth(item.url);
      }

      // 지역명 매핑
      const region = mapAreaName(item.region || "전국");
      const today = new Date().toISOString().slice(0, 10);

      if (target.category === "events") {
        const eventType = inferEventType(item.title);
        const { error } = await supabase.from("farm_events").upsert(
          {
            slug,
            title: item.title,
            region,
            organization: item.organization || target.name,
            type: eventType,
            date_start: item.dateStart || today,
            date_end: item.dateEnd || null,
            location: region,
            cost: "상세 공고 참조",
            description: `${target.name}에서 수집된 행사 정보입니다.`,
            capacity: null,
            target: item.capacity || "상세 공고 참조",
            url: item.url,
            status: item.status === "마감" ? "마감" : item.status === "모집예정" ? "접수예정" : "접수중",
            is_verified: linkStatus !== "broken",
          },
          { onConflict: "slug" }
        );
        if (error) errors.push(`${item.title}: ${error.message}`);
        else newItems++;
      } else if (target.category === "programs") {
        const { error } = await supabase.from("support_programs").upsert(
          {
            slug,
            title: item.title,
            summary: `${target.name}에서 수집. 상세 내용은 원문을 확인하세요.`,
            region,
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
            is_verified: linkStatus !== "broken",
          },
          { onConflict: "slug" }
        );
        if (error) errors.push(`${item.title}: ${error.message}`);
        else newItems++;
      } else {
        const { error } = await supabase.from("education_courses").upsert(
          {
            slug,
            title: item.title,
            region,
            organization: item.organization || target.name,
            type: "오프라인",
            duration: "상세 공고 참조",
            schedule: item.dateStart && item.dateEnd
              ? `${item.dateStart} ~ ${item.dateEnd}`
              : "상세 공고 참조",
            target: item.capacity || "상세 공고 참조",
            cost: "상세 공고 참조",
            description: `${target.name}에서 수집된 교육과정입니다.`,
            application_start: item.dateStart || today,
            application_end: item.dateEnd || today,
            status: item.status === "마감" ? "마감" : item.status === "모집예정" ? "모집예정" : "모집중",
            level: "초급",
            url: item.url,
            link_status: linkStatus,
            is_verified: linkStatus !== "broken",
          },
          { onConflict: "slug" }
        );
        if (error) errors.push(`${item.title}: ${error.message}`);
        else newItems++;
      }
    }

    console.log(
      `[sync-crawl] ${target.name} 완료: ${newItems}건 추가, ${skipped}건 스킵`
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
    errors,
  };
}
