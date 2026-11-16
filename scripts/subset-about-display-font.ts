/**
 * /about 제목 서체 서브셋 생성 — public/fonts/irang-about-display-700.woff2
 *
 * 원본은 네이버 마루부리 Bold(SIL OFL 1.1). 원문 저작권 줄이 MaruBuri 를 예약 글꼴 이름(RFN)으로 두므로,
 * 글자를 잘라낸 이 파일(OFL 의 수정본)은 조건 3 에 따라 이름 레코드에서 원래 이름을 빼고
 * IrangAboutDisplay 로 바꾼다(11/16). 저작권(nameID 0)은 원본 그대로, 라이선스(13/14)는 OFL 문구.
 *
 * 사용:
 *   npx tsx scripts/subset-about-display-font.ts --font <MaruBuri-Bold.ttf> --python <fonttools·brotli 가 깔린 python>
 *
 * 원본 글꼴은 네이버 공식 배포본(https://hangeul.naver.com → maruburi.zip, TTF/MaruBuri-Bold.ttf)을 리포 밖(임시 폴더)에
 * 받아 쓴다. fonttools 는 리포 의존성에 넣지 않는다(가상환경의 python 을 넘긴다). 글자 목록은 src/lib/fonts/about-display-subset.ts 하나뿐.
 */
import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import {
  ABOUT_DISPLAY_FAMILY,
  ABOUT_DISPLAY_FONT_FILE,
  ABOUT_DISPLAY_SUBSET,
} from "../src/lib/fonts/about-display-subset";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const font = arg("--font");
if (!font) {
  console.error("--font <원본 TTF> 가 필요해요");
  process.exit(1);
}
const python = arg("--python") ?? "python3";
const out = resolve(__dirname, "..", ABOUT_DISPLAY_FONT_FILE);

// 1) 글자 서브셋 (이름 레코드는 다음 단계에서 통째로 다시 쓴다)
execFileSync(
  python,
  [
    "-I",
    "-m",
    "fontTools.subset",
    font,
    `--text=${ABOUT_DISPLAY_SUBSET}`,
    "--flavor=woff2",
    "--layout-features=kern",
    "--no-hinting",
    "--desubroutinize",
    "--name-IDs=0",
    `--output-file=${out}`,
  ],
  { stdio: "inherit" },
);

// 2) 이름 바꾸기 — 예약 이름(MaruBuri·Maru·Nanum)이 어떤 레코드에도 남지 않게
const RENAME = `
import sys
from fontTools.ttLib import TTFont
path, family = sys.argv[1], sys.argv[2]
f = TTFont(path)
name = f["name"]
copyright_records = [r for r in name.names if r.nameID == 0]
name.names = []
for r in copyright_records:
    name.setName(r.toUnicode(), 0, r.platformID, r.platEncID, r.langID)
values = {
    1: family,
    2: "Bold",
    3: family + "-Bold;subset",
    4: family + " Bold",
    5: "Version 2.000 (subset)",
    6: family + "-Bold",
    13: "This Font Software is licensed under the SIL Open Font License, Version 1.1.",
    14: "https://openfontlicense.org",
}
for nid, val in values.items():
    name.setName(val, nid, 3, 1, 0x409)
    name.setName(val, nid, 1, 0, 0)
for r in name.names:
    s = r.toUnicode().lower()
    if "maru" in s or "nanum" in s:
        sys.exit("예약 이름이 남았어요: %d %s" % (r.nameID, r.toUnicode()))
if "CFF " in f:
    sys.exit("CFF 원본은 다루지 않아요 — TTF 를 넘기세요")
f["post"].formatType = 3.0  # 글리프 이름 표 제거(원본 이름 흔적 없음)
f.flavor = "woff2"
f.save(path)
`;
execFileSync(python, ["-I", "-c", RENAME, out, ABOUT_DISPLAY_FAMILY], { stdio: "inherit" });

const chars = [...new Set(ABOUT_DISPLAY_SUBSET)].length;
console.log(`${out} — ${chars}자, ${(statSync(out).size / 1024).toFixed(1)}KB`);
