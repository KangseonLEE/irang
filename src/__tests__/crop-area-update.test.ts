/**
 * 재배면적 통계 교체 안내 (2026-11-05 #200)
 * 문구는 이전 값과 현재 값의 차이로 만든다. 사실이 문장과 어긋나지 않는지, 기간이 배포일부터 세어지는지 본다.
 */
import { describe, it, expect } from "vitest";
import { getCropAreaUpdate } from "@/lib/crops/area-update";
import { isCropUpdateBadgeOn, isCropUpdateNoticeOn } from "@/lib/crops/area-update-window";
import { CROP_AREAS } from "@/lib/data/crop-areas";
import { CROP_AREA_PREVIOUS, CROP_AREA_UPDATE } from "@/lib/data/crop-area-updates";
import { CROP_DETAILS } from "@/lib/data/crops";

const ids = Object.keys(CROP_AREA_PREVIOUS);
const majors = (id: string) => CROP_DETAILS.find((d) => d.id === id)!.majorRegions;

describe("재배면적 안내 문구", () => {
  it("대상 25종, 모두 새 연도로 넘어갔다", () => {
    expect(ids.length).toBe(25);
    for (const id of ids) expect(CROP_AREAS[id].year, id).toBeGreaterThan(CROP_AREA_PREVIOUS[id].year);
  });

  it("수박·오이는 1위가 바뀐 사실을 이전·이후 지역으로 말한다", () => {
    const w = getCropAreaUpdate("watermelon")!;
    expect(w.title).toBe("수박 재배면적 1위, 전북으로 바뀌었어요");
    expect(w.body).toContain("2024년엔 충남이 1위였어요");
    expect(w.badge).toBe("1위 바뀜");
    const c = getCropAreaUpdate("cucumber")!;
    expect(c.title).toBe("오이 재배면적 1위, 충남으로 바뀌었어요");
    expect(c.body).toContain("강원이 1위였어요");
  });

  it("배지는 주산지가 바뀐 11종뿐 — 1위 2 · 산지 9", () => {
    const badges = ids.map((id) => [id, getCropAreaUpdate(id)!.badge] as const).filter(([, b]) => b);
    expect(badges.length).toBe(11);
    expect(badges.filter(([, b]) => b === "1위 바뀜").map(([id]) => id).sort()).toEqual(["cucumber", "watermelon"]);
    for (const [id] of badges) expect(majors(id).join(), id).not.toBe(CROP_AREA_PREVIOUS[id].majorRegions.join());
    for (const id of ids) {
      if (!getCropAreaUpdate(id)!.badge) expect(majors(id).join(), id).toBe(CROP_AREA_PREVIOUS[id].majorRegions.join());
    }
  });

  it("산지 변동 문장 — '올라왔어요'는 전보다 정말 높을 때만, 빠진 지역은 5% 문장", () => {
    expect(getCropAreaUpdate("potato")!.body).toContain("경북이 2위로 올라왔어요");
    expect(getCropAreaUpdate("buckwheat")!.body).toContain("경북이 2위로 올라왔어요");
    expect(getCropAreaUpdate("maesil")!.body).toContain("경북은 전국 5% 아래로 내려갔어요");
    for (const id of ids) {
      const m = getCropAreaUpdate(id)!.body.match(/(\S+?)[이가] (\d)위로 올라왔어요/);
      if (!m) continue;
      const rank = Number(m[2]) - 1;
      const prevRank = CROP_AREA_PREVIOUS[id].majorRegions.indexOf(majors(id)[rank]);
      expect(prevRank === -1 || prevRank > rank, id).toBe(true);
    }
  });

  it("늘고 줄었다는 말이 숫자 방향과 같고, 값만 바뀐 작물은 제목에 증감률", () => {
    expect(getCropAreaUpdate("carrot")!.title).toBe("당근 재배면적, 전국 27.8% 늘었어요");
    expect(getCropAreaUpdate("carrot")!.body).toBe("2024년 3,054ha에서 3,904ha가 됐어요.");
    for (const id of ids) {
      const u = getCropAreaUpdate(id)!;
      const text = u.title + u.body;
      const up = CROP_AREAS[id].totalHa >= CROP_AREA_PREVIOUS[id].totalHa;
      expect(/줄어|줄었어요/.test(text), id).toBe(!up);
    }
  });

  it("모든 문구가 카피 규칙을 지킨다 — '합니다' 없음, 제목 26자 이내", () => {
    for (const id of ids) {
      const u = getCropAreaUpdate(id)!;
      expect(u.title + u.body).not.toMatch(/합니다|입니다/);
      expect(u.title.length, u.title).toBeLessThanOrEqual(26);
    }
  });

  it("대상이 아닌 작물은 안내가 없다", () => {
    expect(getCropAreaUpdate("rice")).toBeNull();
    expect(getCropAreaUpdate("없는작물")).toBeNull();
  });
});

describe("표시 기간은 배포일부터", () => {
  it("배포일이 설정값 그대로", () => expect(CROP_AREA_UPDATE.releasedAt).toBe("2026-11-18"));
  it("안내 30일 — 전날 꺼짐, 첫날·29일째 켜짐, 30일째 꺼짐", () => {
    expect(isCropUpdateNoticeOn("2026-11-17")).toBe(false);
    expect(isCropUpdateNoticeOn("2026-11-18")).toBe(true);
    expect(isCropUpdateNoticeOn("2026-12-17")).toBe(true);
    expect(isCropUpdateNoticeOn("2026-12-18")).toBe(false);
  });
  it("배지 7일", () => {
    expect(isCropUpdateBadgeOn("2026-11-17")).toBe(false);
    expect(isCropUpdateBadgeOn("2026-11-24")).toBe(true);
    expect(isCropUpdateBadgeOn("2026-11-25")).toBe(false);
  });
});
