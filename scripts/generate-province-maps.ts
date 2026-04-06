/**
 * generate-province-maps.ts
 *
 * Downloads 17 per-province SVG maps from statgarten/maps (MIT License),
 * extracts path geometry, maps Korean names to sigungu slugs, merges
 * sub-district paths (e.g. "수원시 장안구" → "수원시"), computes label
 * centroids, and writes TypeScript data files to src/lib/data/province-maps/.
 *
 * Run: npx tsx scripts/generate-province-maps.ts
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Resolve project root (works regardless of CWD)
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Province definitions
// ---------------------------------------------------------------------------
interface Province {
  id: string;
  name: string;
}

const PROVINCES: Province[] = [
  { id: "seoul", name: "서울특별시" },
  { id: "incheon", name: "인천광역시" },
  { id: "gyeonggi", name: "경기도" },
  { id: "gangwon", name: "강원도" },
  { id: "chungbuk", name: "충청북도" },
  { id: "sejong", name: "세종특별자치시" },
  { id: "daejeon", name: "대전광역시" },
  { id: "chungnam", name: "충청남도" },
  { id: "jeonbuk", name: "전라북도" },
  { id: "gwangju", name: "광주광역시" },
  { id: "jeonnam", name: "전라남도" },
  { id: "gyeongbuk", name: "경상북도" },
  { id: "daegu", name: "대구광역시" },
  { id: "gyeongnam", name: "경상남도" },
  { id: "busan", name: "부산광역시" },
  { id: "ulsan", name: "울산광역시" },
  { id: "jeju", name: "제주특별자치도" },
];

// ---------------------------------------------------------------------------
// Import SIGUNGUS from the project's canonical data source
// ---------------------------------------------------------------------------
interface Sigungu {
  id: string;
  name: string;
  sidoId: string;
}

async function loadSigungus(): Promise<Sigungu[]> {
  const mod = await import(
    resolve(PROJECT_ROOT, "src/lib/data/sigungus.ts")
  );
  return mod.SIGUNGUS as Sigungu[];
}

// ---------------------------------------------------------------------------
// SVG download
// ---------------------------------------------------------------------------
function buildSvgUrl(provinceName: string): string {
  const encoded = encodeURIComponent(`${provinceName}_시군구_경계`);
  return `https://raw.githubusercontent.com/statgarten/maps/main/svg/simple/${encoded}.svg`;
}

async function downloadSvg(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

// ---------------------------------------------------------------------------
// SVG parsing (regex-based — the source format is simple & predictable)
// ---------------------------------------------------------------------------
interface SvgPath {
  id: string;
  d: string;
}

function parseViewBox(svg: string): string {
  const match = svg.match(/viewBox="([^"]+)"/);
  if (!match) throw new Error("No viewBox found in SVG");
  return match[1];
}

function parsePaths(svg: string): SvgPath[] {
  const results: SvgPath[] = [];
  // Match <path ... /> elements. Handles both id-first and d-first attribute order.
  const pathRegex = /<path\s[^>]*?\/>/g;
  let pathMatch: RegExpExecArray | null;

  while ((pathMatch = pathRegex.exec(svg)) !== null) {
    const tag = pathMatch[0];
    const idMatch = tag.match(/id="([^"]+)"/);
    const dMatch = tag.match(/d="([^"]+)"/);
    if (idMatch && dMatch) {
      results.push({ id: idMatch[1], d: dMatch[1] });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Centroid computation from SVG path d attribute
//
// Strategy: extract all coordinate number pairs (x, y) from the d string.
// We only consider coordinates following M, L, or bare number pairs (implicit
// lineto). We skip control-point-heavy commands (C, S, Q, T, A) by only
// reading pairs that follow M/L or are continuation pairs in a M/L sequence.
//
// The spec says the SVG files use simple M/L paths, so this covers the data.
// ---------------------------------------------------------------------------
function computeCentroid(d: string): { x: number; y: number } {
  // Parse all M/L coordinate sequences.
  // The pattern: optional command letter (M or L), then pairs of numbers.
  const coords: { x: number; y: number }[] = [];
  // Match all floating-point numbers in the d attribute
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) {
    return { x: 0, y: 0 };
  }

  // Walk through the d attribute token by token
  // We'll parse the d string more carefully to only get M/L coordinates
  const tokens: string[] = [];
  const tokenRegex = /([MLHVCSQTAZmlhvcsqtaz]|-?\d+(?:\.\d+)?)/g;
  let tokenMatch: RegExpExecArray | null;
  while ((tokenMatch = tokenRegex.exec(d)) !== null) {
    tokens.push(tokenMatch[1]);
  }

  let i = 0;
  let currentCommand = "";

  while (i < tokens.length) {
    const token = tokens[i];

    // Check if token is a command letter
    if (/^[MLHVCSQTAZmlhvcsqtaz]$/.test(token)) {
      currentCommand = token;
      i++;
      continue;
    }

    // Token is a number — how we interpret it depends on current command
    const upperCmd = currentCommand.toUpperCase();
    if (upperCmd === "M" || upperCmd === "L" || upperCmd === "") {
      // Read x, y pair
      const x = parseFloat(tokens[i]);
      const y = i + 1 < tokens.length ? parseFloat(tokens[i + 1]) : NaN;
      if (!isNaN(x) && !isNaN(y)) {
        coords.push({ x, y });
        i += 2;
      } else {
        i++;
      }
    } else if (upperCmd === "H") {
      // Horizontal line — skip (single number, no y)
      i++;
    } else if (upperCmd === "V") {
      // Vertical line — skip (single number, no x)
      i++;
    } else if (upperCmd === "C") {
      // Cubic bezier: 3 pairs (6 numbers) — skip all
      i += 6;
    } else if (upperCmd === "S" || upperCmd === "Q") {
      // Smooth cubic / quadratic: 2 pairs (4 numbers) — skip
      i += 4;
    } else if (upperCmd === "T") {
      // Smooth quadratic: 1 pair (2 numbers) — skip
      i += 2;
    } else if (upperCmd === "A") {
      // Arc: 7 numbers — skip
      i += 7;
    } else if (upperCmd === "Z") {
      i++;
    } else {
      i++;
    }
  }

  if (coords.length === 0) {
    return { x: 0, y: 0 };
  }

  const sumX = coords.reduce((acc, c) => acc + c.x, 0);
  const sumY = coords.reduce((acc, c) => acc + c.y, 0);

  return {
    x: Math.round(sumX / coords.length),
    y: Math.round(sumY / coords.length),
  };
}

// ---------------------------------------------------------------------------
// Name matching logic
//
// SVG path ids use Korean district names. For simple districts (e.g. "강남구"),
// we match directly to SIGUNGUS[].name. For sub-districts (e.g. "수원시 장안구"),
// we extract the city portion ("수원시") and match to that.
//
// Special case: Sejong SVG uses "세종시" but data uses "세종특별자치시".
// ---------------------------------------------------------------------------
const SPECIAL_NAME_MAP: Record<string, string> = {
  "세종시": "세종특별자치시",
};

function findSigunguForPath(
  pathId: string,
  sigungus: Sigungu[],
  provinceId: string,
): { sigungu: Sigungu; mergeKey: string } | null {
  // Check special name map first
  const mappedName = SPECIAL_NAME_MAP[pathId];
  if (mappedName) {
    const found = sigungus.find(
      (sg) => sg.name === mappedName && sg.sidoId === provinceId,
    );
    if (found) return { sigungu: found, mergeKey: found.id };
  }

  // Check if the pathId contains a space (sub-district pattern)
  if (pathId.includes(" ")) {
    const cityName = pathId.split(" ")[0]; // e.g. "수원시" from "수원시 장안구"
    // Try matching city name
    const found = sigungus.find(
      (sg) => sg.name === cityName && sg.sidoId === provinceId,
    );
    if (found) return { sigungu: found, mergeKey: found.id };

    // Also try special map for the city portion
    const mappedCity = SPECIAL_NAME_MAP[cityName];
    if (mappedCity) {
      const found2 = sigungus.find(
        (sg) => sg.name === mappedCity && sg.sidoId === provinceId,
      );
      if (found2) return { sigungu: found2, mergeKey: found2.id };
    }
  }

  // Direct name match
  const direct = sigungus.find(
    (sg) => sg.name === pathId && sg.sidoId === provinceId,
  );
  if (direct) return { sigungu: direct, mergeKey: direct.id };

  return null;
}

// ---------------------------------------------------------------------------
// Output generation
// ---------------------------------------------------------------------------
interface SigunguMapEntry {
  sigunguId: string;
  name: string;
  pathParts: string[];
}

function generateFileContent(
  viewBox: string,
  entries: SigunguMapEntry[],
): string {
  const lines: string[] = [
    "// Auto-generated by scripts/generate-province-maps.ts",
    "// Source: statgarten/maps (MIT License)",
    "",
    "export interface SigunguMapLocation {",
    "  sigunguId: string;",
    "  name: string;",
    "  path: string;",
    "  labelX: number;",
    "  labelY: number;",
    "}",
    "",
    `export const VIEWBOX = ${JSON.stringify(viewBox)};`,
    "",
    "export const SIGUNGUS: SigunguMapLocation[] = [",
  ];

  for (const entry of entries) {
    const combinedPath = entry.pathParts.join(" ");
    const centroid = computeCentroid(combinedPath);
    const pathStr = JSON.stringify(combinedPath);
    lines.push(
      `  { sigunguId: ${JSON.stringify(entry.sigunguId)}, name: ${JSON.stringify(entry.name)}, path: ${pathStr}, labelX: ${centroid.x}, labelY: ${centroid.y} },`,
    );
  }

  lines.push("];");
  lines.push("");

  return lines.join("\n");
}

function generateIndexContent(): string {
  return [
    "// Auto-generated by scripts/generate-province-maps.ts",
    "",
    "import type { SigunguMapLocation } from './seoul';",
    "",
    "export type { SigunguMapLocation };",
    "",
    "// Dynamic import helper for code-splitting",
    "export async function loadProvinceMap(provinceId: string) {",
    "  const mod = await import(`./${provinceId}`);",
    "  return { viewBox: mod.VIEWBOX as string, sigungus: mod.SIGUNGUS as SigunguMapLocation[] };",
    "}",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Loading SIGUNGUS data...");
  const allSigungus = await loadSigungus();
  console.log(`  Loaded ${allSigungus.length} sigungu entries.`);

  const outDir = resolve(PROJECT_ROOT, "src/lib/data/province-maps");
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  let totalFiles = 0;
  let totalWarnings = 0;

  for (const province of PROVINCES) {
    const url = buildSvgUrl(province.name);
    console.log(`\n[${province.id}] Downloading ${province.name}...`);

    let svgContent: string;
    try {
      svgContent = await downloadSvg(url);
    } catch (err) {
      console.error(`  ERROR: ${(err as Error).message}`);
      continue;
    }

    const viewBox = parseViewBox(svgContent);
    const paths = parsePaths(svgContent);
    console.log(`  viewBox: ${viewBox} | paths: ${paths.length}`);

    // Build merged entries: group sub-district paths by their parent sigungu
    const entryMap = new Map<
      string,
      { sigunguId: string; name: string; pathParts: string[] }
    >();

    for (const p of paths) {
      const result = findSigunguForPath(p.id, allSigungus, province.id);
      if (!result) {
        console.warn(`  WARN: Unmatched SVG path id="${p.id}" in ${province.name}`);
        totalWarnings++;
        continue;
      }

      const existing = entryMap.get(result.mergeKey);
      if (existing) {
        existing.pathParts.push(p.d);
      } else {
        entryMap.set(result.mergeKey, {
          sigunguId: result.sigungu.id,
          name: result.sigungu.name,
          pathParts: [p.d],
        });
      }
    }

    const entries = Array.from(entryMap.values());
    const content = generateFileContent(viewBox, entries);
    const filePath = resolve(outDir, `${province.id}.ts`);
    writeFileSync(filePath, content, "utf-8");
    console.log(`  Wrote ${filePath} (${entries.length} sigungus)`);
    totalFiles++;
  }

  // Write index.ts barrel
  const indexPath = resolve(outDir, "index.ts");
  writeFileSync(indexPath, generateIndexContent(), "utf-8");
  console.log(`\nWrote ${indexPath}`);

  console.log(`\nDone. ${totalFiles} province files generated, ${totalWarnings} warnings.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
