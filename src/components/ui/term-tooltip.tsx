import s from "./term-tooltip.module.css";

interface TermTooltipProps {
  term: string;
  description: string;
}

export function TermTooltip({ term, description }: TermTooltipProps) {
  return (
    <span className={s.wrapper} tabIndex={0}>
      <span className={s.term}>{term}</span>
      <span className={s.tooltip} role="tooltip">
        {description}
      </span>
    </span>
  );
}

const GLOSSARY: Record<string, string> = {
  // 면적 단위
  ha: "헥타르(hectare). 1ha = 10,000m² = 약 3,025평",
  "10a": "10아르(are). 약 1,000m² = 약 302평",
  // 농업 유형
  노지: "비닐하우스·온실 없이 야외 노천에서 재배하는 방식",
  시설재배: "비닐하우스·유리온실 등 시설 안에서 재배하는 방식",
  스마트팜: "IoT·자동화 기술로 온도·습도·양분을 원격 제어하는 농장",
  전업농: "농업을 주된 직업으로 하는 농가 (농업 소득 50% 이상)",
  겸업농: "농업 외 다른 직업을 겸하는 농가",
  // 귀농·귀촌 제도
  영농정착지원금: "귀농 초기 3년간 월 최대 100만 원 지원하는 정부 보조금",
  체류형귀농: "1~6개월 농촌에 살아보며 귀농 적합성을 확인하는 프로그램",
  귀농: "도시에서 농촌으로 이주하여 농업에 종사하는 것",
  귀촌: "도시에서 농촌으로 이주하되, 농업 외 직업에 종사하는 것",
};

/** Convenience wrapper using built-in glossary */
export function GlossaryTerm({ term }: { term: string }) {
  const desc = GLOSSARY[term];
  if (!desc) return <span>{term}</span>;
  return <TermTooltip term={term} description={desc} />;
}
