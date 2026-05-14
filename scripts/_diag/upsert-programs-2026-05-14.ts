/**
 * Supabase support_programs UPSERT — 2026-05-14 신규 6건 (SP-021~SP-026)
 *
 * 5/11 sprint UPSERT 패턴 (SP-019/020) 동일.
 * data-engineer 가드 #4: 마이그레이션 X, UPSERT만.
 *
 * 실행:
 *   npx tsx scripts/_diag/upsert-programs-2026-05-14.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { PROGRAMS } from "../../src/lib/data/programs";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("환경변수 누락: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const NEW_IDS = ["SP-021", "SP-022", "SP-023", "SP-024", "SP-025", "SP-026"];

async function main() {
  const targets = PROGRAMS.filter((p) => NEW_IDS.includes(p.id));
  if (targets.length !== NEW_IDS.length) {
    console.error(`정적 데이터 누락: 기대 ${NEW_IDS.length}건, 발견 ${targets.length}건`);
    process.exit(1);
  }

  console.log(`UPSERT 대상 ${targets.length}건:`);
  targets.forEach((p) => console.log(`  - ${p.id}: ${p.title}`));

  const rows = targets.map((p) => ({
    slug: p.id,
    title: p.title,
    summary: p.summary,
    description: p.description ?? "",
    region: p.region,
    organization: p.organization,
    support_type: p.supportType,
    support_amount: p.supportAmount,
    eligibility_age_min: p.eligibilityAgeMin,
    eligibility_age_max: p.eligibilityAgeMax,
    eligibility_detail: p.eligibilityDetail,
    application_start: p.applicationStart,
    application_end: p.applicationEnd,
    status: p.status,
    related_crops: p.relatedCrops,
    source_url: p.sourceUrl,
    link_status: "active",
    year: p.year,
  }));

  const { data, error } = await sb
    .from("support_programs")
    .upsert(rows, { onConflict: "slug" })
    .select("slug,title");

  if (error) {
    console.error("UPSERT 실패:", error);
    process.exit(1);
  }

  console.log(`\n✅ UPSERT 성공: ${data?.length ?? 0}건`);
  data?.forEach((r) => console.log(`  - ${r.slug}: ${r.title}`));

  // 잔존 SELECT 검증 (CoS 인수 #2: 5/11 가드)
  console.log("\n--- 잔존 검증 SELECT ---");
  const { data: verify, error: verifyError } = await sb
    .from("support_programs")
    .select("slug,title,application_start,application_end")
    .in("slug", NEW_IDS)
    .order("slug");

  if (verifyError) {
    console.error("검증 SELECT 실패:", verifyError);
    process.exit(1);
  }

  console.log(`확인: ${verify?.length ?? 0}건 / 기대 ${NEW_IDS.length}건`);
  verify?.forEach((r) =>
    console.log(`  ${r.slug} | ${r.application_start} ~ ${r.application_end} | ${r.title}`),
  );

  if ((verify?.length ?? 0) !== NEW_IDS.length) {
    console.error(`❌ 검증 실패: ${NEW_IDS.length - (verify?.length ?? 0)}건 누락`);
    process.exit(1);
  }

  console.log(`\n✅ 잔존 row 검증 통과 — ${NEW_IDS.length}건 모두 정상 적재`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
