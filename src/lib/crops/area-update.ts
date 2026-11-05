import { CROP_AREAS } from "@/lib/data/crop-areas";
import { CROP_AREA_PREVIOUS } from "@/lib/data/crop-area-updates";
import { CROP_DETAILS, CROPS } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";

/**
 * 재배면적 통계가 바뀐 작물의 안내 문구 (2026-11-05 회장: 값 옆 안내 + 산지가 바뀐 작물 배지).
 * 결론부터 한 줄 — 1위가 바뀌었으면 그 사실, 산지가 달라졌으면 어디가 올라왔는지, 아니면 얼마나 늘고 줄었는지.
 * 숫자·지역은 전부 이전 값(crop-area-updates.ts)과 현재 값의 차이에서 나온다.
 */
export interface CropAreaUpdate {
  eyebrow: string;
  title: string;
  body: string;
  /** 카드 배지 — 주산지가 바뀐 작물만 */
  badge: string | null;
}

const shortName = (name: string) => PROVINCES.find((p) => p.name === name)?.shortName ?? name;

/** 받침 있으면 first, 없으면 second */
function josa(word: string, first: string, second: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? first : second;
}
const ha = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}ha`;

export function getCropAreaUpdate(cropId: string): CropAreaUpdate | null {
  const prev = CROP_AREA_PREVIOUS[cropId];
  const area = CROP_AREAS[cropId];
  const name = CROPS.find((c) => c.id === cropId)?.name;
  const majors = CROP_DETAILS.find((d) => d.id === cropId)?.majorRegions;
  if (!prev || !area || !name || !majors) return null;

  const rate = Math.abs((area.totalHa - prev.totalHa) / prev.totalHa) * 100;
  const moved = area.totalHa >= prev.totalHa ? "늘어" : "줄어";
  const totalLine = `전국 면적은 ${rate.toFixed(1)}% ${moved} ${ha(area.totalHa)}예요.`;
  const eyebrow = `${area.year}년 새 통계`;

  if (majors[0] !== prev.majorRegions[0]) {
    const before = shortName(prev.majorRegions[0]);
    const after = shortName(majors[0]);
    return {
      eyebrow,
      title: `${name} 재배면적 1위, ${after}${josa(after, "으로", "로")} 바뀌었어요`,
      body: `${prev.year}년엔 ${before}${josa(before, "이", "가")} 1위였어요. ${totalLine}`,
      badge: "1위 바뀜",
    };
  }

  if (majors.join() !== prev.majorRegions.join()) {
    const top = shortName(majors[0]);
    const i = majors.findIndex((r, idx) => r !== prev.majorRegions[idx]);
    let change: string;
    if (i >= 0) {
      const up = shortName(majors[i]);
      change = `${up}${josa(up, "이", "가")} ${i + 1}위로 올라왔어요.`;
    } else {
      const out = shortName(prev.majorRegions[majors.length]);
      change = `${out}${josa(out, "은", "는")} 전국 5% 아래로 내려갔어요.`;
    }
    return {
      eyebrow,
      title: `${name} 주요 산지가 달라졌어요`,
      body: `1위는 ${top} 그대로예요. ${change} ${totalLine}`,
      badge: "산지 변동",
    };
  }

  return {
    eyebrow,
    title: `${name} 재배면적, 전국 ${rate.toFixed(1)}% ${area.totalHa >= prev.totalHa ? "늘었어요" : "줄었어요"}`,
    body: `${prev.year}년 ${ha(prev.totalHa)}에서 ${ha(area.totalHa)}가 됐어요.`,
    badge: null,
  };
}
