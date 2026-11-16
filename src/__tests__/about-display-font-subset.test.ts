/**
 * /about 제목 서체(IrangAboutDisplay — 원본 네이버 마루부리 Bold) 서브셋 계약 (2026-11-16).
 *
 * 이 woff2 는 /about 문구에 쓰인 글자만 담는다. 문구에 새 글자가 들어왔는데 서브셋을 다시 만들지 않으면
 * 그 글자만 대체 서체(나눔명조·Pretendard)로 튄다 — 빌드·타입 검사로는 안 잡히므로 여기서 막는다.
 * 실제 화면이 읽는 값(about-display-copy — page.tsx 가 그대로 그린다)을 import 한다.
 *
 * woff2 도 직접 연다(11/16 QA): 목록에 글자만 더하고 woff2 를 다시 안 만들었거나, 파일을 다른 글꼴로 바꿔치기해도
 * 목록 검사만으로는 통과했다. cmap(woff2 에서 변환되지 않는 테이블)의 코드포인트 집합 = 목록 집합.
 * 이름: MaruBuri·Nanum 은 원본의 예약 글꼴 이름(RFN)이라 수정본(서브셋)은 쓸 수 없다(OFL 조건 3) →
 * family = IrangAboutDisplay, 어떤 name 레코드에도 MaruBuri·Maru·Nanum 이 없어야 한다.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import {
  ABOUT_CTA_TITLE,
  ABOUT_JOURNEY_TITLE,
  ABOUT_QUOTE_LINES,
} from "@/lib/data/about-display-copy";
import { START_LANES } from "@/lib/data/journey-lanes";
import {
  ABOUT_DISPLAY_FAMILY,
  ABOUT_DISPLAY_FONT_FILE,
  ABOUT_DISPLAY_SUBSET,
} from "@/lib/fonts/about-display-subset";

const SOURCES: Record<string, string> = {
  인용제목: ABOUT_QUOTE_LINES.join(" "),
  여정제목: ABOUT_JOURNEY_TITLE,
  여정카드이름: START_LANES.map((l) => l.label).join(""),
  진단제목: ABOUT_CTA_TITLE,
};

/* ── woff2 최소 판독기: 테이블 디렉터리 → brotli 해제 → cmap·name ── */
const KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ",
  "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS",
  "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc",
  "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop",
  "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill",
];

function readWoff2Tables(buf: Buffer): Map<string, Buffer> {
  if (buf.toString("latin1", 0, 4) !== "wOF2") throw new Error("woff2 서명이 아니에요");
  const numTables = buf.readUInt16BE(12);
  const compressedLen = buf.readUInt32BE(20);
  let off = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = buf[off++];
      v = v * 128 + (b & 0x7f);
      if (!(b & 0x80)) return v;
    }
    throw new Error("UIntBase128 오류");
  };
  const dir: { tag: string; len: number }[] = [];
  for (let i = 0; i < numTables; i++) {
    const flags = buf[off++];
    const idx = flags & 0x3f;
    const tag = idx === 63 ? buf.toString("latin1", off, (off += 4)) : KNOWN_TAGS[idx];
    const version = (flags >> 6) & 3;
    const origLength = base128();
    const transformed = tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    const len = transformed ? base128() : origLength;
    dir.push({ tag, len });
  }
  if (buf.toString("latin1", 4, 8) === "ttcf") throw new Error("컬렉션은 다루지 않아요");
  const data = brotliDecompressSync(buf.subarray(off, off + compressedLen));
  const out = new Map<string, Buffer>();
  let p = 0;
  for (const { tag, len } of dir) {
    out.set(tag, data.subarray(p, p + len));
    p += len;
  }
  return out;
}

function cmapCodepoints(cmap: Buffer): Set<number> {
  const cps = new Set<number>();
  const n = cmap.readUInt16BE(2);
  for (let i = 0; i < n; i++) {
    const so = cmap.readUInt32BE(4 + i * 8 + 4);
    const fmt = cmap.readUInt16BE(so);
    if (fmt === 4) {
      const segX2 = cmap.readUInt16BE(so + 6);
      const ends = so + 14;
      const starts = ends + segX2 + 2;
      const deltas = starts + segX2;
      const ranges = deltas + segX2;
      for (let s = 0; s < segX2 / 2; s++) {
        const end = cmap.readUInt16BE(ends + s * 2);
        const start = cmap.readUInt16BE(starts + s * 2);
        const delta = cmap.readInt16BE(deltas + s * 2);
        const ro = cmap.readUInt16BE(ranges + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          const gid = ro === 0 ? (c + delta) & 0xffff : cmap.readUInt16BE(ranges + s * 2 + ro + (c - start) * 2);
          if (gid !== 0) cps.add(c);
        }
      }
    } else if (fmt === 12) {
      const groups = cmap.readUInt32BE(so + 12);
      for (let g = 0; g < groups; g++) {
        const go = so + 16 + g * 12;
        for (let c = cmap.readUInt32BE(go); c <= cmap.readUInt32BE(go + 4); c++) cps.add(c);
      }
    }
  }
  return cps;
}

function nameRecords(name: Buffer): { id: number; text: string }[] {
  const count = name.readUInt16BE(2);
  const strOff = name.readUInt16BE(4);
  const out: { id: number; text: string }[] = [];
  for (let i = 0; i < count; i++) {
    const r = 6 + i * 12;
    const [platform, , , nameId, len, o] = [0, 2, 4, 6, 8, 10].map((d) => name.readUInt16BE(r + d));
    const raw = Buffer.from(name.subarray(strOff + o, strOff + o + len));
    out.push({
      id: nameId,
      text: platform === 3 || platform === 0 ? raw.swap16().toString("utf16le") : raw.toString("latin1"),
    });
  }
  return out;
}

function missingChars(text: string, subset: string): string[] {
  const have = new Set(subset);
  return [...new Set(text)].filter((ch) => !have.has(ch));
}

describe("/about 제목 서체 서브셋", () => {
  for (const [name, text] of Object.entries(SOURCES)) {
    it(`${name} 의 모든 글자가 서브셋에 있다`, () => {
      expect(text.length).toBeGreaterThan(0);
      expect(missingChars(text, ABOUT_DISPLAY_SUBSET), `${name}: "${text}"`).toEqual([]);
    });
  }

  it("검사기가 빠진 글자를 실제로 잡는다", () => {
    expect(missingChars("이랑", ABOUT_DISPLAY_SUBSET)).toEqual(["이", "랑"]);
  });

  const file = join(__dirname, "../..", ABOUT_DISPLAY_FONT_FILE);
  const tables = () => readWoff2Tables(readFileSync(file));

  it("woff2 의 cmap 글자 집합이 목록과 정확히 같다", () => {
    expect(existsSync(file)).toBe(true);
    const cmap = tables().get("cmap")!;
    const inFont = [...cmapCodepoints(cmap)].sort((a, b) => a - b);
    const inList = [...new Set(ABOUT_DISPLAY_SUBSET)].map((c) => c.codePointAt(0)!).sort((a, b) => a - b);
    expect(inFont.map((c) => String.fromCodePoint(c)).join("")).toBe(
      inList.map((c) => String.fromCodePoint(c)).join(""),
    );
  });

  it("이름은 IrangAboutDisplay 이고, 어떤 name 레코드에도 예약 이름(MaruBuri·Maru·Nanum)이 없다", () => {
    const records = nameRecords(Buffer.from(tables().get("name")!));
    const families = records.filter((r) => r.id === 1).map((r) => r.text);
    expect(families.length).toBeGreaterThan(0);
    expect(new Set(families)).toEqual(new Set([ABOUT_DISPLAY_FAMILY]));
    expect(records.filter((r) => /maru|nanum/i.test(r.text))).toEqual([]);
  });
});

/**
 * 로고 서체(IrangLogo, 원본 나눔명조 ExtraBold "이랑" 서브셋) — 11/16 OFL 예약 이름 정리.
 * name: family = IrangLogo, 저작권 원문(nameID 0 — 원문이 예약 이름 목록을 담고 있다)을 뺀 모든 레코드에 Nanum·Maru 없음.
 * cmap: layout.tsx @font-face unicode-range 의 완성형 글자와 같다(조합형 자모 U+1100~11FF 는 Google Fonts 서브셋 CSS
 * 에서 따라온 범위라 글꼴에 없다 — 없어도 해가 없다). 공백 U+0020 은 서브셋 도구가 늘 넣는다.
 */
describe("로고 서체 IrangLogo", () => {
  const file = join(__dirname, "../../public/fonts/irang-logo-800.woff2");
  const layout = readFileSync(join(__dirname, "../app/layout.tsx"), "utf8");

  it("layout.tsx 가 이 파일을 'Irang Logo' 로 선언·미리 받기하고 --font-logo 첫 항목으로 쓴다", () => {
    expect(layout).toContain('preload("/fonts/irang-logo-800.woff2"');
    expect(layout).toMatch(/font-family: "Irang Logo";[\s\S]*?src: url\(\/fonts\/irang-logo-800\.woff2\)/);
    expect(layout).toMatch(/--font-logo: "Irang Logo",/);
    expect(layout).not.toMatch(/font-family: "Nanum Myeongjo"/);
  });

  it("name — family 는 IrangLogo, 저작권 원문 외 레코드에 예약 이름(Nanum·Maru)이 없다", () => {
    const records = nameRecords(Buffer.from(readWoff2Tables(readFileSync(file)).get("name")!));
    expect(new Set(records.filter((r) => r.id === 1).map((r) => r.text))).toEqual(new Set(["IrangLogo"]));
    expect(records.filter((r) => r.id !== 0 && /maru|nanum/i.test(r.text))).toEqual([]);
    expect(records.find((r) => r.id === 0)?.text).toMatch(/NAVER Corporation[\s\S]*SIL Open Font License, Version 1\.1/);
  });

  it("cmap 의 글자 = layout.tsx unicode-range 의 완성형 글자", () => {
    const range = layout.match(/font-family: "Irang Logo";[\s\S]*?unicode-range: ([^;]+);/)![1];
    const inRange = range
      .split(",")
      .map((u) => parseInt(u.trim().replace(/^U\+/i, ""), 16))
      .filter((c) => c < 0x1100 || c > 0x11ff)
      .sort((a, b) => a - b);
    const inFont = [...cmapCodepoints(readWoff2Tables(readFileSync(file)).get("cmap")!)]
      .filter((c) => c !== 0x20)
      .sort((a, b) => a - b);
    expect(inFont).toEqual(inRange);
    expect(inFont.map((c) => String.fromCodePoint(c))).toEqual(expect.arrayContaining(["이", "랑"]));
  });
});
