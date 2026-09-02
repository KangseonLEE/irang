import type { UpdateTag } from "@/lib/data/updates";
import u from "./page.module.css";

/** 태그별 pill 색 변형 — 정의는 page.module.css 한 곳. 목록·상세 공용 */
export const TAG_CLASS: Record<UpdateTag, string> = {
  기능: u.tagFeature,
  개선: u.tagImprove,
  수정: u.tagFix,
  데이터: u.tagData,
};
