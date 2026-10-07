/**
 * generate-province-map-sgis.ts — 통계청(SGIS) 행정 경계로 시·도 지도 데이터를 만든다 (2026-10-07)
 *
 * 기존 지도(scripts/generate-province-maps.ts, statgarten/maps)는 옛 경계라 행정구역 개편을 담지 못한다.
 * 개편이 있은 시·도만 이 생성기로 다시 만든다:
 *   - incheon: 2026-07-01 개편 — 중구·동구·서구 → 제물포구·영종구·서해구·검단구 (행정동 경계를 묶는다)
 *   - daegu:   2023-07-01 군위군 편입
 * 신설 구의 행정동 구성은 src/lib/data/region-composites.ts 하나만 쓴다(인구 합산과 같은 정의).
 *
 * 순서: SGIS 경계(시·군·구 + 나뉜 옛 구의 행정동, UTM-K 미터) → 단위(우리 시·군·구 id)별 묶기 →
 *       mapshaper(npx, 의존성 추가 없음)로 합치기(dissolve)·단순화·내부 라벨점 → 800px 너비로 투영 →
 *       src/lib/data/province-maps/{id}.ts (기존과 같은 형식)
 * 면적(km²)은 단순화 전 경계로 계산해 함께 출력한다 — sigungus.ts 면적 대조용.
 *
 * 실행(한국 회선, .env.local 의 SGIS_KEY·SGIS_SECRET): npx tsx scripts/generate-province-map-sgis.ts incheon
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROVINCES } from "@/lib/data/regions";
import { REPLACED_SGIS_GU, compositesInProvince, resolveSplitGu, splitGuOf } from "@/lib/data/region-composites";

type Ring = number[][];
type Geometry = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
type Feature = { type: "Feature"; properties: Record<string, string>; geometry: Geometry };

/**
 * 라벨을 내부점 대신 면적 가중 중심에 둘 단위 — 섬이 흩어진 군은 내부점이 맨 끝 섬(옹진 → 백령도)에
 * 찍힌다. 옛 지도처럼 섬 무리 가운데 바다에 둔다.
 */
const CENTROID_LABEL = new Set(["ongjin"]);

const SUPPORTED = ["incheon", "daegu"];
const WIDTH = 800;
const PAD = 2;

function env(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

async function sgisJson(url: string): Promise<{ result?: { accessToken?: string }; features?: Feature[]; errCd?: number }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`SGIS HTTP ${res.status}`);
  return res.json();
}

const polygonsOf = (g: Geometry): Ring[][] => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
const ringArea = (r: Ring) => {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
  return Math.abs(a / 2);
};
/** 평면 면적(m²) — 바깥 고리 − 구멍 */
const areaOf = (g: Geometry) =>
  polygonsOf(g).reduce((s, [outer, ...holes]) => s + ringArea(outer) - holes.reduce((h, r) => h + ringArea(r), 0), 0);
/** 면적 가중 중심 — 고리마다 꼭짓점 평균을 그 고리 면적으로 가중 (라벨 자리라 이 정도로 충분) */
function centroidOf(g: Geometry): [number, number] {
  let sx = 0;
  let sy = 0;
  let sa = 0;
  for (const [outer] of polygonsOf(g)) {
    const a = ringArea(outer);
    const cx = outer.reduce((s, p) => s + p[0], 0) / outer.length;
    const cy = outer.reduce((s, p) => s + p[1], 0) / outer.length;
    sx += cx * a;
    sy += cy * a;
    sa += a;
  }
  return [sx / sa, sy / sa];
}

async function main() {
  const provinceId = process.argv[2];
  const province = PROVINCES.find((p) => p.id === provinceId);
  if (!province || !SUPPORTED.includes(provinceId)) throw new Error(`지원하는 시·도: ${SUPPORTED.join(", ")}`);
  const composites = compositesInProvince(province.sgisCode);
  const splitGu = splitGuOf(composites);

  const e = env();
  const B = "https://sgisapi.kostat.go.kr/OpenAPI3";
  const token = (await sgisJson(`${B}/auth/authentication.json?consumer_key=${e.SGIS_KEY}&consumer_secret=${e.SGIS_SECRET}`))
    .result?.accessToken;
  if (!token) throw new Error("SGIS 인증 실패");
  const boundary = async (admCd: string) => {
    const r = await sgisJson(`${B}/boundary/hadmarea.geojson?accessToken=${token}&year=2024&adm_cd=${admCd}&low_search=1`);
    if (!r.features?.length) throw new Error(`경계 없음 ${admCd} (errCd ${r.errCd})`);
    return r.features;
  };

  // 1) 시·군·구 경계 + 나뉜 옛 구의 행정동 경계
  const guFeatures = await boundary(province.sgisCode);
  const dongByGu = new Map(await Promise.all(splitGu.map(async (gu) => [gu, await boundary(gu)] as const)));

  // 2) 단위(우리 시·군·구 id)별로 묶기
  const byCode = new Map(SIGUNGUS.map((s) => [s.sgisCode, s]));
  const out: Feature[] = [];
  const push = (f: Feature, id: string, name: string) =>
    out.push({ type: "Feature", properties: { unit: id, name }, geometry: f.geometry });
  for (const c of composites) {
    for (const gu of c.wholeGu) {
      const g = guFeatures.find((f) => f.properties.adm_cd === gu);
      if (!g) throw new Error(`${c.name}: 옛 구 경계 ${gu} 없음`);
      push(g, c.sigunguId, c.name);
    }
  }
  for (const [gu, dongs] of dongByGu) {
    const assigned = resolveSplitGu(gu, dongs.map((d) => d.properties.adm_cd));
    if (!assigned) throw new Error(`옛 구 ${gu} 의 행정동이 region-composites.ts 정의와 맞지 않아요`);
    for (const c of composites) {
      for (const code of assigned.get(c.sgisCode) ?? []) push(dongs.find((d) => d.properties.adm_cd === code)!, c.sigunguId, c.name);
    }
  }
  for (const g of guFeatures) {
    if (REPLACED_SGIS_GU.has(g.properties.adm_cd)) continue;
    const sg = byCode.get(g.properties.adm_cd);
    if (!sg || sg.sidoId !== provinceId) throw new Error(`우리 ${provinceId} 데이터에 없는 SGIS 코드 ${g.properties.adm_cd} ${g.properties.adm_nm}`);
    push(g, sg.id, sg.name);
  }
  const ours = SIGUNGUS.filter((s) => s.sidoId === provinceId).map((s) => s.id);
  const drawn = new Set(out.map((f) => f.properties.unit));
  const missing = ours.filter((id) => !drawn.has(id));
  if (missing.length > 0) throw new Error(`경계를 못 찾은 시·군·구: ${missing.join(", ")}`);

  // 3) mapshaper — 합치기(면적용 원본) → 단순화·내부 라벨점
  const dir = mkdtempSync(join(tmpdir(), "irang-map-"));
  const input = join(dir, "in.json");
  writeFileSync(input, JSON.stringify({ type: "FeatureCollection", features: out }));
  const full = join(dir, "full.json");
  const shapes = join(dir, "shapes.json");
  const points = join(dir, "points.json");
  const run = (args: string[]) => execFileSync("npx", ["--yes", "mapshaper@0.6", ...args], { stdio: "pipe" });
  run(["-i", input, "-dissolve", "unit", "copy-fields=name", "-o", full, "format=geojson"]);
  run(["-i", full, "-simplify", "percentage=6%", "keep-shapes", "-o", shapes, "format=geojson"]);
  run(["-i", shapes, "-points", "inner", "-o", points, "format=geojson"]);
  const areaKm2 = new Map<string, number>(
    (JSON.parse(readFileSync(full, "utf8")).features as Feature[]).map((f) => [f.properties.unit, areaOf(f.geometry) / 1e6]),
  );
  const dissolved: Feature[] = JSON.parse(readFileSync(shapes, "utf8")).features;
  const labels: Feature[] = JSON.parse(readFileSync(points, "utf8")).features;

  // 4) 투영 — UTM-K(미터, 북쪽이 위) → 800px 너비 SVG
  const all = dissolved.flatMap((f) => polygonsOf(f.geometry).flat(2));
  const minX = Math.min(...all.map((p) => p[0]));
  const maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1]));
  const maxY = Math.max(...all.map((p) => p[1]));
  const scale = (WIDTH - PAD * 2) / (maxX - minX);
  const height = Math.round((maxY - minY) * scale + PAD * 2);
  const px = (x: number) => +((x - minX) * scale + PAD).toFixed(2);
  const py = (y: number) => +((maxY - y) * scale + PAD).toFixed(2);
  const pathOf = (g: Geometry) =>
    polygonsOf(g)
      .flat()
      .map((r) => `M ${r.map(([x, y]) => `${px(x)} ${py(y)}`).join(" ")} Z`)
      .join(" ");

  const rows = dissolved
    .map((f) => {
      const id = f.properties.unit;
      const name = f.properties.name;
      const inner = labels.find((l) => l.properties.unit === id)?.geometry as unknown as { coordinates: number[] } | undefined;
      const [lx, ly] = CENTROID_LABEL.has(id)
        ? centroidOf(f.geometry)
        : inner
          ? inner.coordinates
          : centroidOf(f.geometry);
      return { id, name, path: pathOf(f.geometry), lx: px(lx), ly: py(ly) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const file = [
    `// Auto-generated by scripts/generate-province-map-sgis.ts — 다시 만들려면 이 생성기를 실행하세요`,
    `// Source: 통계청 SGIS 행정구역 경계(2024${composites.length > 0 ? ", 신설 구는 행정동을 region-composites.ts 정의대로 묶음" : ""}) — ${province.name}`,
    "",
    "export interface SigunguMapLocation {",
    "  sigunguId: string;",
    "  name: string;",
    "  path: string;",
    "  labelX: number;",
    "  labelY: number;",
    "}",
    "",
    `export const VIEWBOX = "0 0 ${WIDTH} ${height}";`,
    "",
    "export const SIGUNGUS: SigunguMapLocation[] = [",
    ...rows.map((r) => `  { sigunguId: "${r.id}", name: "${r.name}", path: "${r.path}", labelX: ${r.lx}, labelY: ${r.ly} },`),
    "];",
    "",
  ].join("\n");
  const target = `src/lib/data/province-maps/${provinceId}.ts`;
  writeFileSync(target, file);
  console.log(`${target} — ${rows.length}개 단위, viewBox 0 0 ${WIDTH} ${height}, ${(file.length / 1024).toFixed(1)}KB`);
  for (const r of rows) {
    const sg = SIGUNGUS.find((s) => s.id === r.id);
    console.log(
      `  ${r.id.padEnd(16)} ${r.name.padEnd(6)} 부분 ${String(r.path.split("M").length - 1).padStart(3)} · 라벨 (${r.lx}, ${r.ly}) · ` +
        `경계 면적 ${areaKm2.get(r.id)?.toFixed(2)}km² (sigungus.ts ${sg?.area ?? "-"})`,
    );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
