/**
 * 통계청(SGIS)에 아직 코드가 없는 신설 구 — 옛 구·행정동 통계를 더해 센다 (2026-10-07)
 *
 * 2026-07-01 인천 행정체제 개편으로 생긴 제물포구·영종구·서해구·검단구는 SGIS 에 아직 없다
 * (10/7 확인: 주소 단계·인구 통계 2024·경계 2025 모두 옛 10개 구·군). 새 구는 옛 행정동을 그대로
 * 묶어 만든 것이라, 행정동 값을 더하면 새 구의 값이 된다. SGIS 는 지난 연도 통계도 지금의 행정동
 * 코드로 돌려줘(2018년 서구에도 아라동이 있다) 연도와 무관하게 같은 묶음으로 더할 수 있다.
 *
 * 이 정의 하나를 인구(lib/api/sgis.ts)·인구 추이(/api/population-trend·collect-population-trend)·
 * 읍·면·동 검색 안내(generate-sub-regions)·시·도 지도(generate-province-map-sgis)가 함께 쓴다.
 *
 * 규칙
 * - 정의한 행정동이 응답에 하나라도 없거나, 어느 신설 구에도 속하지 않는 행정동이 나오면 합을 내지
 *   않는다 — 덜 센 합을 숫자로 내보내지 않는다(10/7 원칙).
 * - 나뉜 옛 구마다 '나머지' 구는 하나만 둔다. 동이 새로 생기거나 나뉘는 쪽을 나머지로 둔다 — 검단(아라동 2021 신설·
 *   2025-10-20 아라1·2동 분동)과 영종(운서동 2026-01-01 운서1·2동 분동)이 나머지라, 옛 구 쪽 행정동이 더 나뉘어도
 *   그대로 맞는다. 목록으로 둔 서해 16개 동·제물포(옛 중구 내륙) 7개 동은 2018년부터 그대로다.
 * - sgisCode 는 국가데이터처 「한국행정구역분류」 2026.7.10 기준판 코드(제물포 23100·영종 23110·서해 23120·검단 23130).
 *   SGIS 는 이 분류 코드를 그대로 써 왔지만(군위 22520·미추홀 23090) 10/7 현재 새 구는 아직 없다. 행정동 합이 안 되는
 *   해에는 같은 코드로 SGIS 를 직접 묻는다 — SGIS 가 새 구를 싣는 날부터는 그 값이 나온다(lib/api/sgis.ts).
 * - 한계: SGIS 행정동 경계는 2025-07-11 경계 조정(백석동 일대 검암경서동 → 당하동) 이전 기준이라, 그 일대 인구는
 *   검단이 아니라 서해에 더해진다(국가데이터처 연계표).
 *
 * 2026-02-01 화성시 일반구 신설(만세·효행·병점·동탄, 10/7 반영)도 같은 방식이다. 다만 화성시는 그대로 우리 시·군·구
 * 단위로 남고 새 구는 그 아래(gus.ts)라 parentSigunguId 를 둔다. 네 구 모두 행정동 목록으로 정의하고 '나머지' 구는
 * 두지 않는다 — 새 동은 어느 구에서든 생길 수 있어(동탄6~9동·새솔동 전례), 나머지를 두면 다른 구의 새 동이 조용히
 * 엉뚱한 구에 붙는다. 모르는 동이 나오면 합을 내지 않는다(resolveSplitGu). 10/7 확인: SGIS 2024 화성 행정동 29개 =
 * 조례 별표1 구성 29개, 동 인구 합 = 31240 단건 값(1,004,079명), 2018~2023년도 같은 29개 코드.
 */

export interface SgisComposite {
  /** 국가데이터처 한국행정구역분류 코드 — sigungus.ts 의 sgisCode 와 같다 */
  sgisCode: string;
  /** sigungus.ts 의 시·군·구 id — 시 아래 신설 구(parentSigunguId 있음)면 gus.ts 의 구 id */
  sigunguId: string;
  name: string;
  /**
   * 시 아래에 새로 생긴 일반구면 그 시의 id (예: 화성 2026). 시는 그대로 우리 시·군·구 단위로 남으므로 이 신설 구는
   * 시·도 단위 집계(REPLACED_SGIS_GU·compositesInProvince — 시·도 지도·인구 추이·읍면동 안내)에 넣지 않는다.
   * 없으면 시·군·구 자리를 대신하는 신설 구(인천 2026).
   */
  parentSigunguId?: string;
  /** 통째로 들어오는 옛 구 (SGIS 5자리) */
  wholeGu: readonly string[];
  /** 나뉜 옛 구 — 그 행정동 중 dongs 만, 또는 다른 신설 구에 들어가지 않은 나머지 전부(rest) */
  split?: { gu: string; dongs: readonly string[] } | { gu: string; rest: true };
}

/**
 * 2026-07-01 인천 행정체제 개편 — 「인천광역시 제물포구ㆍ영종구 및 검단구 설치 등에 관한 법률」(법률 제20161호),
 * 「인천광역시 서구 명칭 변경에 관한 법률」(법률 제21734호). 행정동 구성: 인천광역시 「행정구역」(2026.7.1 기준)
 */
export const SGIS_COMPOSITES: readonly SgisComposite[] = [
  {
    sgisCode: "23100",
    sigunguId: "jemulpo",
    name: "제물포구",
    wholeGu: ["23020"], // 옛 동구
    // 옛 중구 내륙 — 연안·신포·신흥·도원·율목·동인천·개항
    split: { gu: "23010", dongs: ["23010520", "23010530", "23010540", "23010560", "23010570", "23010580", "23010670"] },
  },
  {
    sgisCode: "23110",
    sigunguId: "yeongjong",
    name: "영종구",
    wholeGu: [],
    // 옛 중구의 나머지 — 영종·영종1·영종2·운서·용유 (2024 기준 5개 동, 운서동은 2026-01-01 운서1·2동)
    split: { gu: "23010", rest: true },
  },
  {
    sgisCode: "23120",
    sigunguId: "seohae",
    name: "서해구",
    wholeGu: [],
    // 옛 서구 16개 동 — 검암경서·연희·가정1~3·석남1~3·가좌1~4·신현원창·청라1~3
    split: {
      gu: "23080",
      dongs: [
        "23080510", "23080531", "23080541", "23080550", "23080560", "23080580", "23080590", "23080600",
        "23080620", "23080630", "23080640", "23080650", "23080730", "23080740", "23080780", "23080790",
      ],
    },
  },
  {
    sgisCode: "23130",
    sigunguId: "geomdan",
    name: "검단구",
    wholeGu: [],
    // 옛 서구의 나머지 — 검단·불로대곡·오류왕길·당하·마전·원당·아라(2024 기준 7개 동)
    split: { gu: "23080", rest: true },
  },

  // 2026-02-01 화성시 일반구 — 「화성시 읍ㆍ면ㆍ동ㆍ리의 명칭 및 관할구역에 관한 조례」(제2494호, 2025.11.12) 별표1.
  // 코드: 국가데이터처 한국행정구역분류 2026.7.10판(31241~31244). 행정동은 SGIS 2024 코드(31240xxx)
  {
    sgisCode: "31241",
    sigunguId: "manse-gu",
    parentSigunguId: "hwaseong",
    name: "만세구",
    wholeGu: [],
    // 우정읍·향남읍·남양읍·마도면·송산면·서신면·팔탄면·장안면·양감면·새솔동
    split: {
      gu: "31240",
      dongs: ["31240130", "31240140", "31240150", "31240350", "31240360", "31240370", "31240380", "31240390", "31240420", "31240670"],
    },
  },
  {
    sgisCode: "31242",
    sigunguId: "hyohaeng-gu",
    parentSigunguId: "hwaseong",
    name: "효행구",
    wholeGu: [],
    // 봉담읍·매송면·비봉면·정남면·기배동
    split: { gu: "31240", dongs: ["31240120", "31240310", "31240330", "31240430", "31240560"] },
  },
  {
    sgisCode: "31243",
    sigunguId: "byeongjeom-gu",
    parentSigunguId: "hwaseong",
    name: "병점구",
    wholeGu: [],
    // 진안동·병점1동·병점2동·반월동·화산동
    split: { gu: "31240", dongs: ["31240520", "31240530", "31240540", "31240550", "31240570"] },
  },
  {
    sgisCode: "31244",
    sigunguId: "dongtan-gu",
    parentSigunguId: "hwaseong",
    name: "동탄구",
    wholeGu: [],
    // 동탄1~9동
    split: {
      gu: "31240",
      dongs: ["31240610", "31240600", "31240620", "31240640", "31240650", "31240700", "31240691", "31240710", "31240720"],
    },
  },
];

const BY_CODE = new Map(SGIS_COMPOSITES.map((c) => [c.sgisCode, c]));

/** 신설 구면 그 정의, 아니면 null */
export function getSgisComposite(sgisCode: string): SgisComposite | null {
  return BY_CODE.get(sgisCode) ?? null;
}

/** 신설 구로 바뀌어 더는 우리 지역 단위가 아닌 옛 구 코드 (통째·나뉜 구 모두) */
export const REPLACED_SGIS_GU: ReadonlySet<string> = new Set(
  SGIS_COMPOSITES.filter((c) => !c.parentSigunguId).flatMap((c) => [...c.wholeGu, ...(c.split ? [c.split.gu] : [])]),
);

/** 이 시·도(SGIS 2자리)의 신설 구 */
export function compositesInProvince(provinceSgisCode: string): SgisComposite[] {
  return SGIS_COMPOSITES.filter((c) => !c.parentSigunguId && c.sgisCode.startsWith(provinceSgisCode));
}

/** 이 시(sigungus.ts id) 아래 신설 구 — 구 지도(generate-province-map-sgis --district)용 */
export function compositesInCity(sigunguId: string): SgisComposite[] {
  return SGIS_COMPOSITES.filter((c) => c.parentSigunguId === sigunguId);
}

/** 이 신설 구들을 만들려면 행정동 단위로 받아야 하는 옛 구 */
export function splitGuOf(composites: readonly SgisComposite[]): string[] {
  return [...new Set(composites.flatMap((c) => (c.split ? [c.split.gu] : [])))];
}

/**
 * 나뉜 옛 구의 행정동 코드(SGIS 응답)를 신설 구별로 나눈다 — sgisCode → 행정동 코드.
 * 정의한 동이 응답에 없거나, 나머지 구가 없는데 배정 안 된 동이 남거나, 나머지 구가 비면 null.
 */
export function resolveSplitGu(gu: string, dongCodes: readonly string[]): Map<string, string[]> | null {
  const present = new Set(dongCodes);
  const out = new Map<string, string[]>();
  const listed = new Set<string>();
  let restCode: string | null = null;
  for (const c of SGIS_COMPOSITES) {
    if (!c.split || c.split.gu !== gu) continue;
    if ("rest" in c.split) {
      if (restCode) return null; // 나머지는 하나만
      restCode = c.sgisCode;
      continue;
    }
    for (const d of c.split.dongs) {
      if (!present.has(d)) return null;
      listed.add(d);
    }
    out.set(c.sgisCode, [...c.split.dongs]);
  }
  const leftover = dongCodes.filter((d) => !listed.has(d));
  if (restCode) {
    if (leftover.length === 0) return null;
    out.set(restCode, leftover);
  } else if (leftover.length > 0) {
    return null; // 어느 신설 구에도 속하지 않는 동 — 정의가 낡았다
  }
  return out.size > 0 ? out : null;
}

/**
 * 신설 구 하나를 이루는 통계 행 — guRows: 시·도 low_search(구 단위), dongRowsByGu: 나뉜 옛 구 low_search(동 단위).
 * 필요한 행이 하나라도 없으면 null.
 */
export function compositeRows<T extends { adm_cd: string }>(
  composite: SgisComposite,
  guRows: readonly T[],
  dongRowsByGu: ReadonlyMap<string, readonly T[]>,
): T[] | null {
  const rows: T[] = [];
  for (const gu of composite.wholeGu) {
    const row = guRows.find((r) => r.adm_cd === gu);
    if (!row) return null;
    rows.push(row);
  }
  if (composite.split) {
    const dongRows = dongRowsByGu.get(composite.split.gu);
    if (!dongRows) return null;
    const assigned = resolveSplitGu(composite.split.gu, dongRows.map((r) => r.adm_cd));
    const mine = assigned?.get(composite.sgisCode);
    if (!mine) return null;
    const mineSet = new Set(mine);
    rows.push(...dongRows.filter((r) => mineSet.has(r.adm_cd)));
  }
  return rows;
}
