#!/usr/bin/env npx tsx
/* ==========================================================================
   데이터 cross-reference 일관성 검증 (CI 게이트)

   5/22 D1 진단 sprint 후 영구 자동화. PROVINCES.name(구표기) SSOT 기준.
   crops·sigungus·programs·interviews 4종이 PROVINCES·CROPS 메타와 어긋나면
   build fail.

   검증 차원 (모두 필수):
   A. 작물 ↔ 지역
      A-1. CROP_DETAILS.majorRegions ⊆ PROVINCES.name
      A-2. (warning) sigungus.mainCrops와 CROPS.name 부분일치 0건 시군구
   B. 카테고리·환경 일관성
      B-1. 스마트팜 highlights 시군구의 mainCrops에 시설작목 ≥1개
   C. 페르소나 cross-page 일관성
      C-1. CROP_FIT_OVERRIDES key ⊆ CROPS.id (고아 override 0건)
   D. 지원사업 ↔ 지역·작물
      D-1. PROGRAMS.region ⊆ PROVINCES.name ∪ {"전국"}
      D-2. PROGRAMS.relatedCrops ⊆ CROPS.name (부분일치 허용)
   E. 인터뷰 ↔ 지역·작물
      E-1. interviews.regionUrl → PROVINCES.id · SIGUNGUS.id 존재
      E-2. interviews.cropLinks.href → CROPS.id 존재

   exit code: 모든 필수 통과 0 / 하나라도 fail 1
   ========================================================================== */

import * as fs from "node:fs";
import * as path from "node:path";

import { CROPS, CROP_DETAILS } from "../src/lib/data/crops";
import { PROVINCES } from "../src/lib/data/regions";
import { SIGUNGUS } from "../src/lib/data/sigungus";
import { interviews } from "../src/lib/data/landing";

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
  isWarning?: boolean;
}

const SMARTFARM_CROP_NAMES = new Set([
  "딸기", "방울토마토", "토마토", "파프리카", "오이", "상추", "가지", "허브",
]);

function check(): CheckResult[] {
  const results: CheckResult[] = [];

  const provinceNames = new Set(PROVINCES.map((p) => p.name));
  const provinceIds = new Set(PROVINCES.map((p) => p.id));
  const cropIds = new Set(CROPS.map((c) => c.id));
  const cropNames = new Set(CROPS.map((c) => c.name));

  // ──────────────────────────────────────────────────────────
  // A-1. CROP_DETAILS.majorRegions ⊆ PROVINCES.name
  // ──────────────────────────────────────────────────────────
  const aFails: string[] = [];
  for (const detail of CROP_DETAILS) {
    const crop = CROPS.find((c) => c.id === detail.id);
    if (!crop) continue;
    for (const region of detail.majorRegions) {
      if (!provinceNames.has(region)) {
        aFails.push(`${crop.name}(${detail.id}): "${region}"`);
      }
    }
  }
  results.push({
    name: "A-1. CROP_DETAILS.majorRegions ⊆ PROVINCES.name",
    passed: aFails.length === 0,
    detail:
      aFails.length === 0
        ? `CROP_DETAILS ${CROP_DETAILS.length}건 majorRegions 전부 PROVINCES.name 일치`
        : `미일치 ${aFails.length}건: ${aFails.slice(0, 5).join(", ")}${aFails.length > 5 ? " …" : ""}`,
  });

  // ──────────────────────────────────────────────────────────
  // A-2. (warning) sigungu.mainCrops 매칭 0건
  // ──────────────────────────────────────────────────────────
  const a2Fails: string[] = [];
  for (const sg of SIGUNGUS) {
    if (sg.mainCrops.length === 0) continue;
    const anyMatch = sg.mainCrops.some(
      (mc) => cropNames.has(mc) || [...cropNames].some((cn) => cn.includes(mc) || mc.includes(cn)),
    );
    if (!anyMatch) {
      a2Fails.push(`${sg.name}(${sg.id}): [${sg.mainCrops.join(", ")}]`);
    }
  }
  results.push({
    name: "(warning) A-2. sigungu.mainCrops 매칭 0건",
    passed: true,
    isWarning: true,
    detail:
      a2Fails.length === 0
        ? "모든 시군구 mainCrops가 CROPS와 1건 이상 부분일치"
        : `매칭 0건 ${a2Fails.length}건 (수산물·기타 제외 OK): ${a2Fails.join(", ")}`,
  });

  // ──────────────────────────────────────────────────────────
  // B-1. 스마트팜 highlights → mainCrops 시설작목 매칭
  // ──────────────────────────────────────────────────────────
  const smartfarmSigungus = SIGUNGUS.filter(
    (sg) => sg.highlights.some((h) => h.includes("스마트팜")) || sg.description.includes("스마트팜"),
  );
  const bFails: string[] = [];
  for (const sg of smartfarmSigungus) {
    const hasSmartfarmCrop = sg.mainCrops.some((mc) =>
      [...SMARTFARM_CROP_NAMES].some((sc) => mc.includes(sc) || sc.includes(mc)),
    );
    if (!hasSmartfarmCrop) {
      bFails.push(`${sg.name}(${sg.id}): mainCrops=[${sg.mainCrops.join(", ")}]`);
    }
  }
  results.push({
    name: "B-1. 스마트팜 highlights ↔ mainCrops 시설작목 매칭",
    passed: bFails.length === 0,
    detail:
      bFails.length === 0
        ? `스마트팜 시군구 ${smartfarmSigungus.length}건 모두 시설작목 보유`
        : `시설작목 0건 ${bFails.length}건: ${bFails.join(", ")}`,
  });

  // ──────────────────────────────────────────────────────────
  // C-1. CROP_FIT_OVERRIDES key ⊆ CROPS.id
  // ──────────────────────────────────────────────────────────
  const overrideFile = fs.readFileSync(
    path.resolve(__dirname, "../src/lib/data/persona-fit.ts"),
    "utf-8",
  );
  const overrideKeys: string[] = [];
  const startIdx = overrideFile.indexOf("const CROP_FIT_OVERRIDES");
  if (startIdx >= 0) {
    const endIdx = overrideFile.indexOf("\n};", startIdx);
    const block = overrideFile.slice(startIdx, endIdx);
    const entryRegex = /\n\s+"?([a-z][a-z0-9-]*)"?\s*:\s*\{/g;
    let m: RegExpExecArray | null;
    while ((m = entryRegex.exec(block)) !== null) {
      overrideKeys.push(m[1]);
    }
  }
  const orphanOverrides = overrideKeys.filter((k) => !cropIds.has(k));
  results.push({
    name: "C-1. CROP_FIT_OVERRIDES key ⊆ CROPS.id (고아 0건)",
    passed: orphanOverrides.length === 0,
    detail:
      orphanOverrides.length === 0
        ? `CROP_FIT_OVERRIDES ${overrideKeys.length}건 모두 실제 CROPS와 매칭`
        : `고아 override ${orphanOverrides.length}건: ${orphanOverrides.join(", ")}`,
  });

  // ──────────────────────────────────────────────────────────
  // D-1. PROGRAMS.region ⊆ PROVINCES.name ∪ {"전국"}
  // D-2. PROGRAMS.relatedCrops ⊆ CROPS.name (부분일치)
  // ──────────────────────────────────────────────────────────
  const programsFile = fs.readFileSync(
    path.resolve(__dirname, "../src/lib/data/programs.ts"),
    "utf-8",
  );
  const programIds = [...programsFile.matchAll(/id:\s*"(SP-\d+)"/g)].map((m) => m[1]);
  const regionMatches = [...programsFile.matchAll(/region:\s*"([^"]+)"/g)].map((m) => m[1]);
  const relatedCropsMatches = [...programsFile.matchAll(/relatedCrops:\s*\[([^\]]*)\]/g)].map((m) =>
    m[1].split(",").map((s) => s.replace(/["\s]/g, "")).filter(Boolean),
  );

  const validRegions = new Set<string>(["전국", ...PROVINCES.map((p) => p.name)]);
  const dRegionFails: string[] = [];
  regionMatches.forEach((r, i) => {
    if (!validRegions.has(r)) dRegionFails.push(`${programIds[i] ?? "?"}: "${r}"`);
  });
  results.push({
    name: "D-1. PROGRAMS.region ⊆ PROVINCES.name ∪ '전국'",
    passed: dRegionFails.length === 0,
    detail:
      dRegionFails.length === 0
        ? `PROGRAMS ${regionMatches.length}건 region 모두 유효`
        : `미일치 ${dRegionFails.length}건: ${dRegionFails.slice(0, 5).join(", ")}`,
  });

  const dCropFails: string[] = [];
  let dCropTotal = 0;
  relatedCropsMatches.forEach((crops, i) => {
    for (const crop of crops) {
      if (!crop) continue;
      dCropTotal++;
      const matched = [...cropNames].some(
        (cn) => cn === crop || cn.includes(crop) || crop.includes(cn),
      );
      if (!matched) dCropFails.push(`${programIds[i] ?? "?"}: "${crop}"`);
    }
  });
  results.push({
    name: "D-2. PROGRAMS.relatedCrops ⊆ CROPS.name (부분일치)",
    passed: dCropFails.length === 0,
    detail:
      dCropFails.length === 0
        ? `PROGRAMS relatedCrops ${dCropTotal}건 모두 CROPS와 매칭`
        : `미매칭 ${dCropFails.length}건: ${dCropFails.slice(0, 5).join(", ")}`,
  });

  // ──────────────────────────────────────────────────────────
  // E-1. interviews.regionUrl → PROVINCES.id · SIGUNGUS.id
  // E-2. interviews.cropLinks.href → CROPS.id
  // ──────────────────────────────────────────────────────────
  const eRegionFails: string[] = [];
  for (const iv of interviews) {
    if (!iv.regionUrl || !iv.regionUrl.startsWith("/regions/")) continue;
    const parts = iv.regionUrl.replace(/^\/regions\//, "").split("/");
    const [sidoId, sigunguId] = parts;
    if (!provinceIds.has(sidoId)) {
      eRegionFails.push(`${iv.id}(${iv.name}): "${iv.regionUrl}" — sido 없음`);
      continue;
    }
    if (sigunguId) {
      const sg = SIGUNGUS.find((s) => s.id === sigunguId && s.sidoId === sidoId);
      if (!sg) {
        eRegionFails.push(`${iv.id}(${iv.name}): "${iv.regionUrl}" — sigungu 없음`);
      }
    }
  }
  results.push({
    name: "E-1. interviews.regionUrl → PROVINCES·SIGUNGUS",
    passed: eRegionFails.length === 0,
    detail:
      eRegionFails.length === 0
        ? `interviews ${interviews.length}건 regionUrl 모두 유효`
        : `깨진 link ${eRegionFails.length}건: ${eRegionFails.slice(0, 5).join(", ")}`,
  });

  const eCropFails: string[] = [];
  let eCropTotal = 0;
  for (const iv of interviews) {
    for (const link of iv.cropLinks) {
      eCropTotal++;
      if (!link.href.startsWith("/crops/")) {
        eCropFails.push(`${iv.id}: "${link.href}"`);
        continue;
      }
      const cropId = link.href.replace(/^\/crops\//, "");
      if (!cropIds.has(cropId)) {
        eCropFails.push(`${iv.id}(${iv.name}): "${link.href}" — crop id 없음`);
      }
    }
  }
  results.push({
    name: "E-2. interviews.cropLinks.href → CROPS.id",
    passed: eCropFails.length === 0,
    detail:
      eCropFails.length === 0
        ? `cropLinks ${eCropTotal}건 모두 유효 crop id`
        : `깨진 link ${eCropFails.length}건: ${eCropFails.slice(0, 5).join(", ")}`,
  });

  return results;
}

function main(): void {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  🔍 데이터 cross-reference 일관성 검증                  ║");
  console.log("║     PROVINCES.name (구표기) SSOT 기준                   ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const results = check();
  const required = results.filter((r) => !r.isWarning);
  const failedRequired = required.filter((r) => !r.passed);

  for (const r of results) {
    const icon = r.passed ? (r.isWarning ? "⚠️ " : "✅") : "❌";
    console.log(`${icon} ${r.name}`);
    console.log(`   ${r.detail}\n`);
  }

  console.log("══════════════════════════════════════════════════════════");
  if (failedRequired.length === 0) {
    console.log("✅ 모든 필수 검증 통과");
    process.exit(0);
  } else {
    console.log(
      `❌ 필수 검증 ${failedRequired.length}건 실패 — 데이터 cross-reference 깨짐`,
    );
    console.log("   PROVINCES.name(구표기) SSOT 기준 정규화 필요");
    process.exit(1);
  }
}

main();
