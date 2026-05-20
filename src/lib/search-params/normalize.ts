/**
 * Search params 정규화 유틸 — 봇 abuse 방어 (middleware용)
 *
 * 배경: list 페이지(/events 등)는 searchParams 사용으로 Next.js dynamic SSR.
 * Vercel CDN이 자동 캐싱 안 함. Cloudflare Cache Rule이 1차 방어선이지만
 * cache key는 기본 query string 포함 → 봇이 매번 random query 보내면
 * 무한 cache miss → Vercel Function 호출 → CPU 소모.
 *
 * 해결: middleware에서 알 수 없는 param/값을 cleaned URL로 308 redirect.
 * canonical URL만 Cloudflare cache 채워짐 → cache pollution 방지.
 *
 * 주의: Next.js 16의 `redirect()`는 Server Component에서 meta refresh 태그
 * 삽입만 함 (HTTP 307 X). 봇은 meta refresh 무시. 따라서 middleware에서
 * NextResponse.redirect()로 실제 HTTP 308을 보내야 효과 있음.
 *
 * 한계: redirect 자체도 middleware invocation. 진정한 효과는 Cloudflare
 * Cache Rule의 cache key를 "ignore query string"으로 변경하는 것
 * (David 수동 작업). 이 코드는 defense in depth + cache pollution 방지용.
 */

export type RawSearchParams = URLSearchParams;

interface NormalizeOptions {
  /** 허용된 param key 목록 (이 목록 외엔 제거) */
  allowedKeys: readonly string[];
  /** key별 enum 검증 (값이 enum에 없으면 제거) */
  enumValidators?: Record<string, readonly string[]>;
  /** key별 정규식 검증 (매치 안 되면 제거) */
  regexValidators?: Record<string, RegExp>;
  /** key별 최대 길이 (초과 시 잘라냄) */
  maxLengths?: Record<string, number>;
  /** key별 최소 길이 (미만 시 제거 — q 길이 1자 같은 abuse 차단) */
  minLengths?: Record<string, number>;
  /** key별 숫자 범위 (벗어나면 제거) */
  numericRanges?: Record<string, { min: number; max: number }>;
}

interface NormalizeResult {
  cleaned: URLSearchParams;
  changed: boolean;
}

/**
 * URLSearchParams → 정규화된 결과.
 *
 * - allowedKeys 외 key는 제거
 * - enum/regex 검증 실패 시 제거
 * - 길이 초과 시 자르기
 * - 숫자 범위 벗어나면 제거
 * - 빈 문자열은 제거
 * - 중복 key는 첫 번째만
 */
export function normalizeSearchParams(
  raw: URLSearchParams,
  options: NormalizeOptions,
): NormalizeResult {
  const cleaned = new URLSearchParams();
  const seen = new Set<string>();
  let changed = false;

  for (const [key, value] of raw) {
    // 빈 문자열 제거
    if (value === "") {
      changed = true;
      continue;
    }

    // 알려지지 않은 key 제거
    if (!options.allowedKeys.includes(key)) {
      changed = true;
      continue;
    }

    // 중복 key (이미 처리됨)
    if (seen.has(key)) {
      changed = true;
      continue;
    }

    // Enum 검증
    if (options.enumValidators?.[key]) {
      if (!options.enumValidators[key].includes(value)) {
        changed = true;
        continue;
      }
    }

    // Regex 검증
    if (options.regexValidators?.[key]) {
      if (!options.regexValidators[key].test(value)) {
        changed = true;
        continue;
      }
    }

    // 숫자 범위 검증
    if (options.numericRanges?.[key]) {
      const n = Number(value);
      const { min, max } = options.numericRanges[key];
      if (!Number.isInteger(n) || n < min || n > max) {
        changed = true;
        continue;
      }
      cleaned.set(key, String(n));
      seen.add(key);
      continue;
    }

    // 최소 길이 검증 (q 1자 같은 abuse 차단)
    if (options.minLengths?.[key] && value.length < options.minLengths[key]) {
      changed = true;
      continue;
    }

    // 길이 제한
    if (options.maxLengths?.[key] && value.length > options.maxLengths[key]) {
      cleaned.set(key, value.slice(0, options.maxLengths[key]));
      seen.add(key);
      changed = true;
      continue;
    }

    cleaned.set(key, value);
    seen.add(key);
  }

  return { cleaned, changed };
}

/**
 * 경로별 정규화 옵션 정의.
 * middleware에서 pathname으로 매칭해 사용.
 */
export const LIST_PAGE_NORMALIZE_OPTIONS: Record<string, NormalizeOptions> = {
  "/events": {
    allowedKeys: ["type", "region", "q", "period", "includeClosed", "view", "page"],
    enumValidators: {
      type: ["일일체험", "팜스테이", "박람회", "설명회", "멘토링", "축제"],
      region: [
        "전국",
        "서울특별시",
        "경기도",
        "강원도",
        "충청북도",
        "충청남도",
        "전라북도",
        "전라남도",
        "경상북도",
        "경상남도",
        "제주특별자치도",
      ],
      view: ["table", "card"],
      includeClosed: ["1"],
    },
    regexValidators: {
      // codex 권고 (5/7): YYYY-MM 만 허용 (앱 실제 사용 형식과 일치)
      period: /^\d{4}-(0[1-9]|1[0-2])$/,
      // codex 권고 (5/7) q abuse 방어: 한글·영숫자·공백만 (특수문자 차단)
      q: /^[가-힣a-zA-Z0-9\s]+$/,
    },
    minLengths: {
      // codex 권고 (5/7) q abuse 방어: 1자 검색 차단
      q: 2,
    },
    maxLengths: {
      // codex 권고 (5/7): 50 → 30 단축 (cache pollution 차단)
      q: 30,
    },
    numericRanges: {
      page: { min: 1, max: 100 },
    },
  },
  "/programs": {
    // codex 권고 (5/7): page 추가 (table view client-side pagination)
    // 2026-05-13: persona 추가 (Phase 6 B3 explain UI inline 진입 + /crops·/programs 페르소나 칩 sprint)
    // 2026-05-20: category 추가 (Sprint P chip 5종 — 누락 시 308 strip으로 deep link 100% 무력화)
    allowedKeys: ["region", "age", "supportType", "category", "q", "includeClosed", "period", "view", "page", "persona"],
    enumValidators: {
      region: [
        "전국",
        "서울특별시",
        "경기도",
        "강원도",
        "충청북도",
        "충청남도",
        "전라북도",
        "전라남도",
        "경상북도",
        "경상남도",
        "제주특별자치도",
      ],
      supportType: ["보조금", "융자", "교육", "현물", "컨설팅"],
      age: ["19~29세", "30~39세", "40~49세", "50~59세", "60~69세", "70~79세"],
      category: ["settlement", "youth", "facility", "healing", "social"],
      view: ["table", "card"],
      includeClosed: ["1"],
      persona: ["family", "farmYouth", "elderRural", "commuter", "balanced"],
    },
    regexValidators: {
      period: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    minLengths: {
      // codex 권고 (5/7) q abuse 방어: 1자 검색 차단
      q: 2,
    },
    maxLengths: {
      // codex 권고 (5/7): 50 → 30 단축 (cache pollution 차단)
      q: 30,
    },
    numericRanges: {
      page: { min: 1, max: 100 },
    },
  },
  "/education": {
    allowedKeys: ["region", "type", "level", "q", "period", "includeClosed", "view", "page"],
    enumValidators: {
      region: [
        "전국",
        "서울특별시",
        "경기도",
        "강원도",
        "충청북도",
        "충청남도",
        "전라북도",
        "전라남도",
        "경상북도",
        "경상남도",
        "제주특별자치도",
      ],
      type: ["온라인", "오프라인", "혼합"],
      level: ["입문", "초급", "중급", "심화"],
      view: ["table", "card"],
      includeClosed: ["1"],
    },
    regexValidators: {
      period: /^\d{4}-(0[1-9]|1[0-2])$/,
    },
    minLengths: {
      // codex 권고 (5/7) q abuse 방어: 1자 검색 차단
      q: 2,
    },
    maxLengths: {
      // codex 권고 (5/7): 50 → 30 단축 (cache pollution 차단)
      q: 30,
    },
    numericRanges: {
      page: { min: 1, max: 100 },
    },
  },
  "/crops": {
    // 2026-05-13: persona 추가 (Phase 6 B3 explain UI inline + 페르소나 칩 sprint)
    allowedKeys: ["category", "difficulty", "q", "persona"],
    enumValidators: {
      category: ["전체", "식량", "채소", "과수", "특용"],
      difficulty: ["전체", "쉬움", "보통", "어려움"],
      persona: ["family", "farmYouth", "elderRural", "commuter", "balanced"],
    },
    regexValidators: {
      // codex 권고 (5/7) q abuse 방어: 한글·영숫자·공백만
      q: /^[가-힣a-zA-Z0-9\s]+$/,
    },
    minLengths: {
      q: 2,
    },
    maxLengths: {
      q: 30,
    },
  },
  "/regions": {
    // 활성 지역 카테고리 토글 (2026-05-10 추가) — 알 수 없는 값은 308로 cleaned
    allowedKeys: ["active"],
    enumValidators: {
      active: [
        "jeonin",
        "gwichon",
        "youthFarm",
        "gwisanchon",
        "smartFarm",
        "healing",
        "socialFarm",
      ],
    },
  },
  /* ── 2026-05-11 추가: B안 (Hobby 유지) cache pollution 차단 강화 ──
     12h Vercel 데이터에서 cache 0%로 식별된 라우트 3종. 모두 ?tab=/?type= 의존
     dynamic SSR이라 봇 random query 시 cache miss → Function 호출 폭증.
     normalize 등록 → 알 수 없는 query 즉시 308 cleaned, cache pollution 차단. */
  "/stats": {
    // 5탭: farming, village, youth, mountain, smartfarm
    allowedKeys: ["tab"],
    enumValidators: {
      tab: ["farming", "village", "youth", "mountain", "smartfarm"],
    },
  },
  "/costs": {
    // 5유형: farming, village, youth, forestry, smartfarm (CostTypeId)
    allowedKeys: ["type"],
    enumValidators: {
      type: ["farming", "village", "youth", "forestry", "smartfarm"],
    },
  },
  "/programs/roadmap": {
    // 5대 정부사업 진입 가이드 탭 — gov-roadmap.ts의 GOV_PROGRAMS id와 동기화
    // (return-farming/youth-startup/farmland-bank/forest-village/smart-farm)
    allowedKeys: ["tab"],
    enumValidators: {
      tab: [
        "return-farming",
        "youth-startup",
        "farmland-bank",
        "forest-village",
        "smart-farm",
      ],
    },
  },
  /* ── 2026-05-14 추가: 5/14 페르소나 칩 사고 패턴 재발 방지 ──
     normalize 미등록 페이지는 봇 random query → cache pollution 위험 + 정상 query
     누락 시 308 strip 사고 (5/14 lessons). selector·deep-link 페이지 3종 등록. */
  "/regions/compare": {
    // regions: "{provinceId}[:{sigunguId}]" CSV (최대 3개) — 라이브에서 다양 → regex 약화
    // stations: backward compat 숫자 CSV (e.g., "108,119,259")
    // crop: 작물 id (선택), tab: climate/infra/suitability
    allowedKeys: ["regions", "stations", "crop", "tab"],
    enumValidators: {
      tab: ["climate", "infra", "suitability"],
    },
    regexValidators: {
      // provinceId 또는 provinceId:sigunguId, CSV (최대 3개)
      regions: /^[a-z-]+(?::[a-z0-9-]+)?(?:,[a-z-]+(?::[a-z0-9-]+)?){0,2}$/,
      // station number CSV (최대 3개)
      stations: /^\d{2,4}(?:,\d{2,4}){0,2}$/,
      // 작물 id: 영숫자·하이픈
      crop: /^[a-z0-9-]+$/,
    },
    maxLengths: {
      regions: 80,
      stations: 30,
      crop: 30,
    },
  },
  "/regions/ranking": {
    // dim: 5차원 / sido: shortName / persona: 5종 / w: "20-15-15-35-15" 형식
    allowedKeys: ["dim", "sido", "persona", "w"],
    enumValidators: {
      dim: ["populationTrend", "farmActivity", "medical", "school", "returnFarm"],
      persona: ["family", "farmYouth", "elderRural", "commuter", "balanced"],
      sido: [
        "강원", "경기", "경남", "경북", "광주", "대구", "대전",
        "부산", "서울", "세종", "울산", "인천", "전남", "전북",
        "제주", "충남", "충북",
      ],
    },
    regexValidators: {
      // 5개 정수(0~100) 하이픈 구분 — 합이 100인지는 페이지 내 검증
      w: /^(\d{1,3})-(\d{1,3})-(\d{1,3})-(\d{1,3})-(\d{1,3})$/,
    },
  },
  "/crops/compare": {
    // ids: 작물 id CSV (최대 4개) / tab: summary/economy/cultivation/prosCons
    allowedKeys: ["ids", "tab"],
    enumValidators: {
      tab: ["summary", "economy", "cultivation", "prosCons"],
    },
    regexValidators: {
      // 작물 id CSV (영숫자·하이픈, 최대 4개)
      ids: /^[a-z0-9-]+(?:,[a-z0-9-]+){0,3}$/,
    },
    maxLengths: {
      ids: 100,
    },
  },
  /* ── 2026-05-14 D1: 인터뷰 카테고리 필터 (6종 enum) ──
     회장 결재 옵션 B — 외부 큐레이션 15건 (D2~D5) 대비 필터 인프라 선시동.
     5/11 site-wide 308 lessons — enum validator 정확하지 않으면 정상 query strip.
     5/14 페르소나 칩 사고 lessons — normalize 미등록 deep link는 normalize 후 효력 상실. */
  "/interviews": {
    allowedKeys: ["type"],
    enumValidators: {
      type: ["farming", "rural", "youth", "mountain", "smartfarm", "healing"],
    },
  },
};
