/**
 * 작물 목록(/crops) 거르기·줄 세우기·빈 결과 문구 — page.tsx 에서 분리해 회귀 테스트가 직접 부른다
 * (Next 의 page 파일은 컴포넌트·metadata 외 export 를 둘 수 없다).
 *
 * 10/6 QA 반영:
 * - Q4-F1 카테고리·난이도 복수 선택(CSV) — 그룹 안은 합집합, 그룹 사이는 교집합. 이전엔 값 하나만 비교해
 *   두 개를 고르면(normalize 308 strip 으로) 필터가 통째로 풀렸다.
 * - Q4-W3 "기본 균등"(balanced) 페르소나 — 모든 작물이 같은 3점이라 4점 이상만 남기면 빈 목록이 됐다.
 *   균등은 거르지 않고 일반 정렬을 따른다.
 * - Q2-W1·Q4-W2 1글자 검색어(작물 이름) — 낱말 단위로 맞춘다(`matchesListQuery`).
 */
import {
  CROP_CATEGORIES,
  CROP_DIFFICULTIES,
  sortCrops,
  type CropCategory,
  type CropDifficulty,
  type CropInfo,
  type CropSortKey,
} from "@/lib/data/crops";
import { rankCropsForPersona } from "@/lib/data/persona-fit";
import type { PersonaId } from "@/lib/data/personas";
import { matchesListQuery, parseFilterValues } from "@/lib/search-params/filter-match";

/** 페르소나 모드에서 목록에 남기는 최소 적합 점수 */
const PERSONA_MIN_SCORE = 4;

/** 필터 선택지 ("전체" 제외) — FilterShell 옵션과 URL 값 검증이 같은 목록을 쓴다 */
export const CATEGORY_OPTIONS: CropCategory[] = CROP_CATEGORIES.filter((c) => c !== "전체");
export const DIFFICULTY_OPTIONS: CropDifficulty[] = CROP_DIFFICULTIES.filter((d) => d !== "전체");

/** URL 값(CSV) → 선택지 안의 값만, 선택지 순서로 (middleware 를 안 거친 값도 칩·필터가 같은 결과) */
export function selectedOptions<T extends string>(options: readonly T[], raw: string | undefined): T[] {
  const values = parseFilterValues(raw);
  return options.filter((opt) => values.includes(opt));
}

/** 적합도로 거르고 줄 세우는 페르소나 — 균등(balanced)은 작물 간 차이를 매기지 않아 제외 */
export function scoringPersonaOf(persona: PersonaId | undefined): PersonaId | undefined {
  return persona && persona !== "balanced" ? persona : undefined;
}

interface CropListOptions {
  categories: readonly CropCategory[];
  difficulties: readonly CropDifficulty[];
  query: string;
  persona?: PersonaId;
  sort: CropSortKey;
}

/**
 * 목록에 보일 작물 — 카테고리·난이도·검색어(이름 + 설명)로 거른 뒤
 * 적합도 페르소나면 4점 이상을 점수순으로, 아니면(균등 포함) 고른 정렬로.
 */
export function filterCropList(crops: readonly CropInfo[], options: CropListOptions): CropInfo[] {
  const { categories, difficulties, query } = options;
  const filtered = crops.filter(
    (c) =>
      (categories.length === 0 || categories.includes(c.category)) &&
      (difficulties.length === 0 || difficulties.includes(c.difficulty)) &&
      matchesListQuery(query, [c.name, c.description]),
  );
  const persona = scoringPersonaOf(options.persona);
  if (persona) {
    return rankCropsForPersona(filtered, persona)
      .filter((r) => r.score >= PERSONA_MIN_SCORE)
      .map((r) => r.crop);
  }
  return sortCrops(filtered, options.sort);
}

/** 빈 결과 안내 — 어떤 조건 때문에 비었는지 그대로 말한다(10/6: 페르소나로 비었는데 "'전체' 카테고리에 등록된 작물이 없어요") */
export function cropListEmptyMessage({
  query,
  categories,
  difficulties,
  personaLabel,
}: {
  query: string;
  categories: readonly string[];
  difficulties: readonly string[];
  /** 적합도로 거른 페르소나의 이름(균등이면 넘기지 않는다) */
  personaLabel?: string;
}): string {
  if (query) return `'${query}' 검색 결과가 없어요`;
  const category = categories.length > 0 ? `'${categories.join("·")}' 카테고리` : "";
  const difficulty = difficulties.length > 0 ? `'${difficulties.join("·")}' 난이도` : "";
  if (personaLabel) {
    const scope = [category, difficulty].filter(Boolean).join("·");
    return scope
      ? `${scope}에서 '${personaLabel}' 유형에 잘 맞는 작물이 없어요`
      : `'${personaLabel}' 유형에 잘 맞는 작물이 없어요`;
  }
  if (category && difficulty) return `${category}의 ${difficulty} 작물이 없어요`;
  if (category) return `${category}에 등록된 작물이 없어요`;
  if (difficulty) return `${difficulty} 작물이 없어요`;
  return "등록된 작물이 없어요";
}
