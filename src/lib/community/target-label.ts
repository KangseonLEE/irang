/**
 * 커뮤니티 의견이 달린 대상(target)의 한글 표시 이름 — 2026-09-03 회장 지시
 * ("작물 명칭이 영어로 eggplant 로 표시되는데 다 한글로").
 *
 * DB에는 라우팅 키(`eggplant`, `gyeongbuk/yeongju`, `SP-012`)만 저장한다. 관리 화면·알림처럼
 * 사람이 읽는 곳에서는 이 모듈로 한글 이름을 붙인다.
 *
 * ⚠️ 의존성 주의 — 이 파일은 GitHub Actions(community-pending.yml)에서 node_modules 없이
 * `npx tsx`로 실행된다. 외부 패키지를 import 하는 모듈(`data/programs.ts` → supabase 등)을
 * 여기서 import 하면 CI 라벨 해석이 깨진다. 지원사업 제목은 호출 측이 `programTitles`로 넘긴다.
 */

import { CROPS } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import type { NoteTargetType } from "./types";

/** 대상 종류 한글 (배지용) */
export const TARGET_TYPE_LABELS: Record<NoteTargetType, string> = {
  region: "지역",
  crop: "작물",
  program: "지원사업",
};

/**
 * `targetId` → 사람이 읽는 한글 이름. 못 찾으면 원본 id를 그대로 돌려준다(데이터가 지워졌거나
 * 새 종류가 생긴 경우 — 빈 문자열보다 원본이 낫다).
 *
 * - region: `gyeongbuk` → "경북", `gyeongbuk/yeongju` → "경북 영주시"
 * - crop:   `eggplant` → "가지"
 * - program: `programTitles`에 있으면 제목, 없으면 id (SP-012)
 */
export function resolveTargetLabel(
  targetType: NoteTargetType,
  targetId: string,
  programTitles?: ReadonlyMap<string, string>,
): string {
  if (targetType === "crop") {
    return CROPS.find((c) => c.id === targetId)?.name ?? targetId;
  }

  if (targetType === "region") {
    const [provinceId, sigunguId] = targetId.split("/");
    const province = PROVINCES.find((p) => p.id === provinceId);
    if (!province) return targetId;
    if (!sigunguId) return province.shortName;
    const sigungu = SIGUNGUS.find((sg) => sg.id === sigunguId && sg.sidoId === provinceId);
    return sigungu ? `${province.shortName} ${sigungu.name}` : province.shortName;
  }

  return programTitles?.get(targetId) ?? targetId;
}

/** 대상 페이지 경로 — 관리 화면에서 원문 맥락을 바로 열어보기 위한 링크 */
export function resolveTargetHref(targetType: NoteTargetType, targetId: string): string {
  if (targetType === "crop") return `/crops/${targetId}`;
  if (targetType === "program") return `/programs/${targetId}`;
  return `/regions/${targetId}`;
}
