/**
 * 행정구역명 정규화 (Deno 미러)
 *
 * ⚠ 이 파일은 `src/lib/region-normalize.ts`의 미러다.
 *   Deno Edge Function 런타임은 `src/`를 import 할 수 없어 두 벌이 존재한다.
 *   `src/__tests__/region-normalize.test.ts`의 패리티 테스트가 두 구현을
 *   같은 코퍼스로 대조하므로, 한쪽만 고치면 CI가 실패한다.
 *
 * 규칙·배경 설명은 원본(src/lib/region-normalize.ts) 주석 참조.
 */

/** PROVINCES.name 구표기 SSOT — src/lib/data/regions.ts와 1:1 */
export const PROVINCE_SSOT_NAMES = [
  "서울특별시",
  "인천광역시",
  "경기도",
  "강원도",
  "충청북도",
  "세종특별자치시",
  "대전광역시",
  "충청남도",
  "전라북도",
  "광주광역시",
  "전라남도",
  "부산광역시",
  "대구광역시",
  "울산광역시",
  "경상북도",
  "경상남도",
  "제주특별자치도",
] as const;

export const NATIONWIDE = "전국";

/** 전남·광주 통합 표기 센티널 (뒤 토큰이 자치구면 광주광역시) */
const GWANGJU_JEONNAM = "__GJ_JN__";

const PROVINCE_ALIASES: Record<string, string> = {
  서울: "서울특별시",
  인천: "인천광역시",
  경기: "경기도",
  강원: "강원도",
  충북: "충청북도",
  세종: "세종특별자치시",
  대전: "대전광역시",
  충남: "충청남도",
  전북: "전라북도",
  광주: "광주광역시",
  전남: "전라남도",
  부산: "부산광역시",
  대구: "대구광역시",
  울산: "울산광역시",
  경북: "경상북도",
  경남: "경상남도",
  제주: "제주특별자치도",

  강원특별자치도: "강원도",
  전북특별자치도: "전라북도",
  전남광주통합특별시: GWANGJU_JEONNAM,

  서울시: "서울특별시",
  인천시: "인천광역시",
  대전시: "대전광역시",
  부산시: "부산광역시",
  대구시: "대구광역시",
  울산시: "울산광역시",
  세종시: "세종특별자치시",
  세종특별시: "세종특별자치시",
  제주도: "제주특별자치도",
  강원자치도: "강원도",
  전북자치도: "전라북도",
  경기광역시: "경기도",
};

const NON_REGION_TOKENS = new Set([
  NATIONWIDE,
  "비대면",
  "온라인",
  "전국일원",
  "미정",
  "기타",
  "해당없음",
]);

const GWANGJU_DISTRICTS = new Set(["동구", "서구", "남구", "북구", "광산구"]);

const PROVINCE_INDEX: Record<string, string> = (() => {
  const index: Record<string, string> = { ...PROVINCE_ALIASES };
  for (const name of PROVINCE_SSOT_NAMES) index[name] = name;
  return index;
})();

export interface NormalizedRegion {
  region: string;
  sigungu: string | null;
  matched: boolean;
}

/**
 * 남은 토큰이 시·군·구인지 판정 (원본 주석 참조).
 *  · 시/군/구로 끝나면 언제나 시·군·구
 *  · 접미사가 없어도 남은 토큰이 하나뿐이면 시·군 약칭 ("진안" · "안동" · "정읍")
 *  · 접미사 없이 뒤에 주소가 더 붙으면 읍·면·동 이하 → 버린다
 */
function looksLikeSigungu(token: string, restCount: number): boolean {
  if (!/^[가-힣]{2,6}$/.test(token)) return false;
  if (/(시|군|구)$/.test(token)) return true;
  return restCount === 1;
}

export function normalizeRegion(raw: string | null | undefined): NormalizedRegion {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return { region: NATIONWIDE, sigungu: null, matched: false };

  if (NON_REGION_TOKENS.has(text)) {
    return { region: NATIONWIDE, sigungu: null, matched: text === NATIONWIDE };
  }

  const tokens = text.split(" ");
  if (NON_REGION_TOKENS.has(tokens[0])) {
    return { region: NATIONWIDE, sigungu: null, matched: tokens[0] === NATIONWIDE };
  }

  for (let take = Math.min(tokens.length, 3); take >= 1; take--) {
    const candidate = tokens.slice(0, take).join(" ");
    const hit = PROVINCE_INDEX[candidate] ?? PROVINCE_INDEX[candidate.replace(/ /g, "")];
    if (!hit) continue;

    const rest = tokens.slice(take);
    const sigungu =
      rest.length > 0 && looksLikeSigungu(rest[0], rest.length) ? rest[0] : null;

    if (hit === GWANGJU_JEONNAM) {
      const region = sigungu && GWANGJU_DISTRICTS.has(sigungu) ? "광주광역시" : "전라남도";
      return { region, sigungu, matched: true };
    }

    return { region: hit, sigungu, matched: true };
  }

  return { region: NATIONWIDE, sigungu: null, matched: false };
}

export function mapAreaName(raw: string | null | undefined): string {
  return normalizeRegion(raw).region;
}

export function regionLabel(region: string, sigungu?: string | null): string {
  if (!sigungu) return region;
  return `${region} ${sigungu}`;
}

export function isSsotRegion(value: string): boolean {
  return value === NATIONWIDE || (PROVINCE_SSOT_NAMES as readonly string[]).includes(value);
}
