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
  ha: "헥타르(hectare). 1ha = 10,000m\u00B2",
  "10a": "10아르(are). 약 1,000m\u00B2 = 약 302평",
};

/** Convenience wrapper using built-in glossary */
export function GlossaryTerm({ term }: { term: string }) {
  const desc = GLOSSARY[term];
  if (!desc) return <span>{term}</span>;
  return <TermTooltip term={term} description={desc} />;
}
