/**
 * 시도 × 작물 지역 적합도 배지 데이터
 *
 * 시도 상세 페이지의 "추천 작물" 섹션에서 카드별로 노출되는
 * 간단한 2단계 적합도 배지(`high` / `mid`)와 1줄 근거 카피를 산출한다.
 *
 * 회장 결재: "Phase 6 personaFit 시동 X, 부담 적은 범위" — 외부 API 호출 없이
 * 정적 데이터(`crops.ts`의 `majorRegions` + `sigungus.ts`의 `mainCrops`) 만으로 산출.
 *
 * 산출 기준 (시도가 작물의 majorRegions에 포함된 카드만 노출되는 전제):
 *   - 산하 시군구 mainCrops에 작물 이름이 ≥ 3곳 등장 → high (광역 주산지)
 *   - 1~2곳 등장 → high (지역 주산지)
 *   - 0곳 → mid (시도는 주산지지만 시군구 단위 매칭 부재)
 *
 * 별칭 처리: `CROP_NAME_LOOKUP`을 통해 "방울토마토" → "토마토" 등의
 * 별칭이 사용된 시군구도 정규 작물에 카운트한다.
 */

import type { Sigungu } from "./sigungus";
import { getCropByName } from "./crops";

export type CropFitLevel = "high" | "mid";

export interface CropFit {
  level: CropFitLevel;
  reason: string;
}

/**
 * 시도 ID와 작물 ID를 받아 적합도를 계산한다.
 * 시도가 작물의 `majorRegions`에 없으면 호출하지 않는 것이 전제.
 *
 * @param provinceShortName 시도 약칭 (예: "전남") — 카피 생성용
 * @param cropName 작물 이름 (예: "딸기")
 * @param sigungus 산하 시군구 배열 (이미 시도로 필터링된 상태)
 */
export function getCropFit(
  provinceShortName: string,
  cropName: string,
  sigungus: Pick<Sigungu, "mainCrops">[],
): CropFit {
  // 시군구 mainCrops에서 작물 이름(별칭 포함) 일치 카운트
  let matchCount = 0;
  for (const sg of sigungus) {
    const matched = sg.mainCrops.some((mc) => {
      // 정규 이름이 정확히 일치
      if (mc === cropName) return true;
      // 별칭 매핑을 통해 정규 이름이 같은 작물인지 확인
      const resolved = getCropByName(mc);
      return resolved?.name === cropName;
    });
    if (matched) matchCount += 1;
  }

  if (matchCount >= 3) {
    return {
      level: "high",
      reason: `${provinceShortName} 산하 ${matchCount}곳에서 재배해요`,
    };
  }
  if (matchCount >= 1) {
    return {
      level: "high",
      reason: `${provinceShortName} ${matchCount}곳에서 재배 중이에요`,
    };
  }
  return {
    level: "mid",
    reason: `${provinceShortName} 주산지로 재배 환경이 잘 맞아요`,
  };
}
