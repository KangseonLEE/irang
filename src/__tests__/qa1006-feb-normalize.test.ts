/**
 * 10/6 전체 QA 1차 — FE-B 회귀: URL 정규화(normalize) · 목록 필터 공용 규칙(filter-match)
 *
 * - Q4-F1: 필터 UI(FilterShell)는 모든 그룹을 복수 선택(CSV)으로 만드는데, /events·/education·/crops 정규화가
 *   단일 enum 이라 값 2개를 고르면 308 strip 으로 필터가 통째로 풀렸다.
 * - Q2-W1·Q4-W2: q 최소 2자 때문에 1글자 작물(쌀·콩·감·배·무·밤) 검색과 작물 상세 딥링크(`/programs?q=쌀&region=…`)가
 *   검색어를 잃었다. 하이픈·가운뎃점 같은 문장부호도 /events·/crops 에서 strip 됐다.
 * - normalize 의 값 목록은 middleware 번들 때문에 데이터 모듈을 import 하지 못한다 → 데이터 상수와의 일치를 여기서 지킨다
 *   (normalize 누락 → 308 strip 은 5/29·5/30·6/16 세 번 재발한 사고 유형).
 */
import { describe, it, expect } from "vitest";
import {
  normalizeSearchParams,
  LIST_PAGE_NORMALIZE_OPTIONS,
} from "@/lib/search-params/normalize";
import {
  SINGLE_CHAR_CROP_NAMES,
  matchesListQuery,
  parseFilterValues,
} from "@/lib/search-params/filter-match";
import { CROPS, CROP_CATEGORIES, CROP_DIFFICULTIES } from "@/lib/data/crops";
import { EVENT_TYPES, EVENT_REGIONS } from "@/lib/data/events";
import { EDUCATION_REGIONS, EDUCATION_TYPES, EDUCATION_LEVELS } from "@/lib/data/education";
import { REGIONS, SUPPORT_TYPES, AGE_RANGES, PROGRAM_CATEGORIES } from "@/lib/data/programs";

function norm(path: string, query: Record<string, string> | string) {
  const raw = new URLSearchParams(query);
  const { cleaned, changed } = normalizeSearchParams(raw, LIST_PAGE_NORMALIZE_OPTIONS[path]);
  return { cleaned, changed, redirect: raw.toString() !== cleaned.toString() };
}

/** 그룹별 선택지 — 데이터 모듈 상수가 SSOT */
const GROUPS: Record<string, Record<string, readonly string[]>> = {
  "/programs": {
    region: REGIONS,
    supportType: SUPPORT_TYPES,
    category: PROGRAM_CATEGORIES,
    age: AGE_RANGES,
    status: ["모집중", "정기 접수", "모집예정", "마감"],
  },
  "/events": { type: EVENT_TYPES, region: EVENT_REGIONS },
  "/education": { region: EDUCATION_REGIONS, type: EDUCATION_TYPES, level: EDUCATION_LEVELS },
  "/crops": {
    category: CROP_CATEGORIES.filter((c) => c !== "전체"),
    difficulty: CROP_DIFFICULTIES.filter((d) => d !== "전체"),
  },
};

describe("normalize — 목록 4종 복수 선택(CSV)", () => {
  for (const [path, groups] of Object.entries(GROUPS)) {
    for (const [key, options] of Object.entries(groups)) {
      it(`${path} ${key}: 선택지 2개 CSV 가 그대로 통과한다 (308 없음)`, () => {
        const csv = options.slice(0, 2).join(",");
        const { cleaned, redirect } = norm(path, { [key]: csv });
        expect(cleaned.get(key)).toBe(csv);
        expect(redirect).toBe(false);
      });

      it(`${path} ${key}: 선택지 전부를 골라도 잘리지 않는다`, () => {
        const csv = options.join(",");
        const { cleaned, redirect } = norm(path, { [key]: csv });
        expect(cleaned.get(key)).toBe(csv);
        expect(redirect).toBe(false);
      });

      it(`${path} ${key}: 값 하나도 그대로 통과한다 (기존 단일 딥링크 회귀)`, () => {
        for (const opt of options) {
          const { cleaned, redirect } = norm(path, { [key]: opt });
          expect(cleaned.get(key)).toBe(opt);
          expect(redirect).toBe(false);
        }
      });
    }
  }

  it("normalize 의 선택지 = 데이터 모듈 상수, 순서까지 (어긋나면 정상 값이 308 strip 되거나 화면이 만든 URL 이 한 번 더 308)", () => {
    for (const [path, groups] of Object.entries(GROUPS)) {
      const opts = LIST_PAGE_NORMALIZE_OPTIONS[path];
      for (const [key, options] of Object.entries(groups)) {
        const spec = opts.multiValueEnumValidators?.[key];
        expect(spec, `${path} ${key} 는 복수 선택 검증이어야 한다`).toBeDefined();
        const allowed = spec!.enum.filter((v) => v !== "전체");
        // FilterShell 은 선택지 순서로 CSV 를 만든다 — normalize 재조립 순서와 같아야 308 이 안 난다
        expect([...allowed], `${path} ${key}`).toEqual([...options]);
        expect(spec!.maxItems ?? Infinity).toBeGreaterThanOrEqual(options.length);
      }
    }
  });

  it("값 순서는 선택지 순서로 고정 — 역순 CSV 는 재조립 후 308, 결과는 멱등", () => {
    const first = norm("/events", { region: "강원도,경기도" });
    expect(first.cleaned.get("region")).toBe("경기도,강원도");
    expect(first.redirect).toBe(true);
    const second = norm("/events", first.cleaned.toString());
    expect(second.redirect).toBe(false);
    expect(second.changed).toBe(false);
  });

  it("일부만 유효하면 유효한 값만 남긴다 · 전부 무효면 키를 버린다 · 중복은 하나로", () => {
    expect(norm("/education", { type: "온라인,캠핑" }).cleaned.get("type")).toBe("온라인");
    expect(norm("/crops", { category: "바다,하늘" }).cleaned.has("category")).toBe(false);
    expect(norm("/crops", { difficulty: "쉬움,쉬움" }).cleaned.get("difficulty")).toBe("쉬움");
  });

  it("/programs 지역 6곳 이상도 잘리지 않는다 (10/6 전엔 상한 5)", () => {
    const six = REGIONS.slice(1, 7).join(",");
    expect(norm("/programs", { region: six }).cleaned.get("region")).toBe(six);
  });

  it("/crops category=전체 (옛 링크) 는 계속 통과", () => {
    expect(norm("/crops", { category: "전체" }).redirect).toBe(false);
  });
});

describe("normalize — 검색어(q)", () => {
  const LIST_PAGES = ["/programs", "/events", "/education", "/crops"];

  it("SINGLE_CHAR_CROP_NAMES = CROPS 의 1글자 이름 (작물 추가·개명 시 실패)", () => {
    const fromCrops = CROPS.filter((c) => c.name.length === 1).map((c) => c.name);
    expect([...SINGLE_CHAR_CROP_NAMES].sort()).toEqual([...fromCrops].sort());
  });

  for (const path of LIST_PAGES) {
    it(`${path}: 1글자 작물 이름은 통과, 그 밖의 1글자는 strip`, () => {
      for (const name of SINGLE_CHAR_CROP_NAMES) {
        const { cleaned, redirect } = norm(path, { q: name });
        expect(cleaned.get("q"), `${path} q=${name}`).toBe(name);
        expect(redirect).toBe(false);
      }
      for (const q of ["a", "논", "1"]) {
        expect(norm(path, { q }).cleaned.has("q"), `${path} q=${q}`).toBe(false);
      }
    });
  }

  it("작물 상세 딥링크 `/programs?q=쌀&region=전라남도` 가 검색어를 유지한다", () => {
    const { cleaned, redirect } = norm("/programs", { q: "쌀", region: "전라남도" });
    expect(cleaned.get("q")).toBe("쌀");
    expect(cleaned.get("region")).toBe("전라남도");
    expect(redirect).toBe(false);
  });

  for (const path of ["/events", "/crops"]) {
    it(`${path}: 제목에 흔한 문장부호(하이픈·가운뎃점·괄호·마침표)는 통과`, () => {
      for (const q of ["Y-FARM", "귀농·귀촌", "귀농ㆍ귀촌", "스마트팜(수경)", "6차 산업", "K-팜 2026.10"]) {
        expect(norm(path, { q }).cleaned.get("q"), `${path} q=${q}`).toBe(q);
      }
    });

    it(`${path}: 따옴표·꺾쇠·& 는 계속 strip (q abuse 방어)`, () => {
      for (const q of ["<script>", "test'; DROP", 'a"b', "R&D"]) {
        expect(norm(path, { q }).cleaned.has("q"), `${path} q=${q}`).toBe(false);
      }
    });
  }

  it("기존 화이트리스트 회귀 — 정렬·보기·쪽·페르소나·기간·마감 포함", () => {
    expect(norm("/programs", { persona: "family", sort: "recent", view: "table", page: "2", period: "2026-10" }).redirect).toBe(false);
    expect(norm("/events", { includeClosed: "1", sort: "recent", view: "card", page: "3" }).redirect).toBe(false);
    expect(norm("/education", { includeClosed: "1", sort: "deadline", period: "2026-09" }).redirect).toBe(false);
    expect(norm("/crops", { persona: "balanced", sort: "income", view: "table", page: "2" }).redirect).toBe(false);
    expect(norm("/programs", { persona: "hacker" }).cleaned.has("persona")).toBe(false);
    expect(norm("/events", { type: "캠핑" }).cleaned.has("type")).toBe(false);
  });
});

describe("filter-match — 공용 규칙", () => {
  it("parseFilterValues: CSV → 값 목록 (빈 조각·전체·중복 제외)", () => {
    expect(parseFilterValues(undefined)).toEqual([]);
    expect(parseFilterValues("")).toEqual([]);
    expect(parseFilterValues("전체")).toEqual([]);
    expect(parseFilterValues("경기도")).toEqual(["경기도"]);
    expect(parseFilterValues(" 경기도 ,강원도,,경기도")).toEqual(["경기도", "강원도"]);
  });

  it("matchesListQuery: 2글자 이상은 부분 일치(종전), 빈 검색어는 전부 통과", () => {
    expect(matchesListQuery("사과", ["사과·배 재배 교육"])).toBe(true);
    expect(matchesListQuery("스마트", ["경기도 스마트팜 교육"])).toBe(true);
    expect(matchesListQuery("", ["아무거나"])).toBe(true);
    expect(matchesListQuery(undefined, ["아무거나"])).toBe(true);
  });

  it("matchesListQuery: 1글자는 낱말 단위 — '배'는 '재배'·'배추'에 안 걸리고 '사과·배'에는 걸린다", () => {
    expect(matchesListQuery("배", ["사과·배 재배 교육"])).toBe(true);
    expect(matchesListQuery("배", ["딸기 재배 교육", "배추 수확"])).toBe(false);
    expect(matchesListQuery("무", ["무주군 귀농 업무 안내"])).toBe(false);
    expect(matchesListQuery("무", ["작물 목록", "무"])).toBe(true);
    expect(matchesListQuery("쌀", ["쌀(벼) 소득 보전"])).toBe(true);
  });
});
