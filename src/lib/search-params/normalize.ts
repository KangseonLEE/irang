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
      period: /^\d{4}-\d{2}(-\d{2})?$/,
    },
    maxLengths: {
      q: 50,
    },
    numericRanges: {
      page: { min: 1, max: 100 },
    },
  },
  "/programs": {
    allowedKeys: ["region", "age", "supportType", "q", "includeClosed", "period", "view"],
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
      view: ["table", "card"],
      includeClosed: ["1"],
    },
    regexValidators: {
      period: /^\d{4}-\d{2}(-\d{2})?$/,
    },
    maxLengths: {
      q: 50,
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
      period: /^\d{4}-\d{2}(-\d{2})?$/,
    },
    maxLengths: {
      q: 50,
    },
    numericRanges: {
      page: { min: 1, max: 100 },
    },
  },
  "/crops": {
    allowedKeys: ["category", "difficulty", "q"],
    enumValidators: {
      category: ["전체", "식량", "채소", "과수", "특용"],
      difficulty: ["전체", "쉬움", "보통", "어려움"],
    },
    maxLengths: {
      q: 50,
    },
  },
};
