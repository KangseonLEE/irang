/**
 * 행정구역명 정규화 — PROVINCES.name(구표기) SSOT 귀결
 *
 * 배경 (2026-09-29):
 *  수집 파이프라인(RDA·그린대로)이 넘기는 지역 표기가 제각각이라
 *  `support_programs` 55/102 · `education_courses` 87/96 행이 SSOT 밖 값이었다.
 *  `/programs` 지역 필터는 `program.region !== filters.region` 정확 일치라
 *  "전북 진안" 같은 값은 어떤 시·도를 골라도 목록에서 사라진다.
 *
 * 입력 형태 (실측):
 *  · 약칭        "경기" · "전남"
 *  · 약칭 + 시·군 "경기 양평" · "전남 해남" · "전북 진안"
 *  · 정식 명칭    "충청남도" · "대구광역시"
 *  · 신표기       "강원특별자치도" · "전북특별자치도" · "전남광주통합특별시"
 *  · 도로명 주소  "서울 서초구 강남대로 27" · "전남광주통합특별시 해남군 송지면 산정1길 80"
 *  · 비지역       "비대면" · "온라인"
 *
 * 출력: { region: PROVINCES.name 17종 또는 "전국", sigungu: 원문 시·군·구 토큰 | null }
 *
 * ⚠ 이 파일은 `supabase/functions/_shared/mapping.ts`(Deno)에 미러링된다.
 *   Deno 런타임은 `src/`를 import 할 수 없으므로 표·로직이 두 벌 존재하며,
 *   `src/__tests__/region-normalize.test.ts`의 패리티 테스트가 두 구현의
 *   동일 동작을 강제한다. 한쪽만 고치면 CI가 실패한다.
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

/** 전국(광역 미지정) 버킷 */
export const NATIONWIDE = "전국";

/**
 * 전남·광주 통합 표기 센티널.
 * "전남광주통합특별시"는 전라남도와 광주광역시를 함께 가리켜 단독으로는 확정 불가.
 * 뒤따르는 시·군·구 토큰이 "○○구"면 광주광역시, 그 외(시·군)면 전라남도로 가른다.
 * (전라남도에는 자치구가 없고, 광주광역시는 5개 자치구만 가진다.)
 */
const GWANGJU_JEONNAM = "__GJ_JN__";

/**
 * 시·도 별칭 → SSOT 이름.
 * 정식 명칭 17종은 아래에서 자동 추가되므로 여기엔 변형만 둔다.
 *
 * ⚠ "광주시"는 넣지 않는다 — 경기도 광주시와 충돌한다.
 *   "경기 광주시"는 첫 토큰 "경기"가 먼저 매칭되므로 정상 처리된다.
 */
const PROVINCE_ALIASES: Record<string, string> = {
  // 약칭 (RDA area1Nm·그린대로 주소 앞 토큰)
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

  // 신표기 → 구표기 SSOT (CLAUDE.md "행정구역명 SSOT")
  강원특별자치도: "강원도",
  전북특별자치도: "전라북도",
  전남광주통합특별시: GWANGJU_JEONNAM,

  // 흔한 축약·변형
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

/** 지역이 아닌 운영 형태 토큰 — 전국 버킷으로 보낸다. */
const NON_REGION_TOKENS = new Set([
  NATIONWIDE,
  "비대면",
  "온라인",
  "전국일원",
  "미정",
  "기타",
  "해당없음",
]);

/** 광주광역시 자치구 5종 — 전남·광주 통합 표기를 가르는 판정에 쓴다. */
const GWANGJU_DISTRICTS = new Set(["동구", "서구", "남구", "북구", "광산구"]);

/** 별칭 + SSOT 정식 명칭 통합 인덱스 */
const PROVINCE_INDEX: Record<string, string> = (() => {
  const index: Record<string, string> = { ...PROVINCE_ALIASES };
  for (const name of PROVINCE_SSOT_NAMES) index[name] = name;
  return index;
})();

export interface NormalizedRegion {
  /** PROVINCES.name 17종 중 하나, 또는 "전국" */
  region: string;
  /** 원문에 있던 시·군·구 토큰 (예: "진안" · "해남군" · "서초구"). 없으면 null */
  sigungu: string | null;
  /** 시·도를 실제로 식별했는지. false면 region은 "전국" 폴백 */
  matched: boolean;
}

/**
 * 남은 토큰이 시·군·구인지 판정.
 *
 * 접미사만으로는 "안동"(시)과 "역삼동"(법정동)을 가를 수 없으므로 구조로 판단한다:
 *  · 시/군/구로 끝나면 언제나 시·군·구 ("서초구" · "연천군" · "춘천시")
 *  · 접미사가 없어도 **남은 토큰이 그것 하나뿐이면** 시·군 약칭 ("진안" · "안동" · "정읍")
 *  · 접미사 없이 뒤에 주소가 더 붙으면 읍·면·동 이하 ("공도읍 대신두길 13") → 버린다
 * 도로명·번지(로·길·숫자)는 애초에 한글 2~6자 조건에서 걸러진다.
 */
function looksLikeSigungu(token: string, restCount: number): boolean {
  if (!/^[가-힣]{2,6}$/.test(token)) return false;
  if (/(시|군|구)$/.test(token)) return true;
  return restCount === 1;
}

/**
 * 임의 지역 표기를 SSOT 시·도 + 시·군·구로 정규화한다.
 *
 * 매칭 실패 시 원문을 그대로 통과시키지 않고 "전국"으로 떨어뜨린다 —
 * SSOT 밖 값이 DB에 다시 쌓이면 지역 필터에서 조용히 사라지기 때문.
 * (틀린 시·도에 배치되는 것보다 전국 버킷이 덜 해롭다.)
 */
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

  // 첫 토큰부터 최장 일치로 시·도를 찾는다 ("전남광주통합특별시 해남군" 등)
  for (let take = Math.min(tokens.length, 3); take >= 1; take--) {
    const candidate = tokens.slice(0, take).join(" ");
    const hit = PROVINCE_INDEX[candidate] ?? PROVINCE_INDEX[candidate.replace(/ /g, "")];
    if (!hit) continue;

    const rest = tokens.slice(take);
    const sigungu =
      rest.length > 0 && looksLikeSigungu(rest[0], rest.length) ? rest[0] : null;

    if (hit === GWANGJU_JEONNAM) {
      // 자치구면 광주광역시, 시·군이면 전라남도. 뒤 토큰이 없으면 전라남도(농촌 맥락 기본).
      const region = sigungu && GWANGJU_DISTRICTS.has(sigungu) ? "광주광역시" : "전라남도";
      return { region, sigungu, matched: true };
    }

    return { region: hit, sigungu, matched: true };
  }

  return { region: NATIONWIDE, sigungu: null, matched: false };
}

/**
 * 시·도 이름만 반환하는 축약형 (기존 `mapAreaName` 호환).
 * 반환값은 항상 PROVINCES.name 17종 또는 "전국"이다.
 */
export function mapAreaName(raw: string | null | undefined): string {
  return normalizeRegion(raw).region;
}

/** 표시용 라벨 — "전라북도 진안" 형태. sigungu가 없으면 시·도만. */
export function regionLabel(region: string, sigungu?: string | null): string {
  if (!sigungu) return region;
  return `${region} ${sigungu}`;
}

/** SSOT 시·도 이름인지 (테스트·가드용) */
export function isSsotRegion(value: string): boolean {
  return value === NATIONWIDE || (PROVINCE_SSOT_NAMES as readonly string[]).includes(value);
}
