import { CROPS } from "@/lib/data/crops";
import { CROP_INCOME_SURVEY, incomeManwon } from "@/lib/data/crop-income-source";

/**
 * /crops FAQPage JSON-LD 답변 — 데이터에서 만든다 (2026-10-10).
 *
 * 종전엔 문장이 손으로 박혀 있었다: 소득 숫자 3개는 crops.ts 와 연동 없는 복사본(갱신 때 드리프트), 첫 답은
 * "쌀, 고구마, 감자 등 밭작물이 난이도가 낮아" — 쌀은 난이도 '보통'인 논작물이라 데이터와 어긋났다.
 */

/** 난이도 '쉬움' 작물을 분류별로 묶어 답한다 */
export function beginnerCropsAnswer(): string {
  const easy = CROPS.filter((c) => c.difficulty === "쉬움");
  const byCategory = new Map<string, string[]>();
  for (const c of easy) byCategory.set(c.category, [...(byCategory.get(c.category) ?? []), c.name]);
  const groups = [...byCategory.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([category, names]) => `${category} ${names.length}종(${names.slice(0, 4).join("·")}${names.length > 4 ? " 등" : ""})`);
  return `난이도 '쉬움'으로 분류한 작물은 ${easy.length}종이에요. ${groups.join(", ")}이에요. 작물별 재배 환경과 소득은 상세 페이지에서 비교할 수 있어요.`;
}

/** 소득 예시 — 원표(crop-income-source.ts) 품목을 그대로 인용한다 */
const INCOME_EXAMPLES: { label: string; item: string }[] = [
  { label: "딸기(수경)", item: "딸기(수경)" },
  { label: "사과", item: "사과" },
  { label: "고구마", item: "고구마" },
];

export function cropIncomeAnswer(): string {
  const parts = INCOME_EXAMPLES.map(({ label, item }) => `${label} 약 ${incomeManwon(item).toLocaleString("ko-KR")}만 원`);
  return `농촌진흥청 ${CROP_INCOME_SURVEY.surveyYear}년도 농산물 소득 조사 기준, 10a당 ${parts.join(", ")} 수준이에요. 작물별 상세 소득은 이랑에서 비교할 수 있어요.`;
}
