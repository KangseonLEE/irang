/**
 * 결과가 적을 때 "마감 포함" 전환을 유도하는 안내 배너
 * - includeClosed가 false이고 결과가 threshold 이하일 때 표시
 * - 세 목록 페이지(지원사업·교육·행사)에서 공통 사용
 */

import Link from "next/link";
import { Info } from "lucide-react";
import s from "./include-closed-hint.module.css";

interface IncludeClosedHintProps {
  /** 현재 필터 결과 수 */
  resultCount: number;
  /** 현재 includeClosed 상태 */
  includeClosed: boolean;
  /** 이 수 이하일 때 표시 (기본 2) */
  threshold?: number;
  /** 링크 basePath (예: "/programs") */
  basePath: string;
  /** 현재 URL 필터 파라미터들 */
  currentFilters: Record<string, string | undefined>;
  /** 항목 종류 라벨 (기본: "지원사업") */
  itemLabel?: string;
}

function buildUrl(
  basePath: string,
  filters: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && key !== "includeClosed") {
      params.set(key, value);
    }
  }
  params.set("includeClosed", "1");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function IncludeClosedHint({
  resultCount,
  includeClosed,
  threshold = 2,
  basePath,
  currentFilters,
  itemLabel = "지원사업",
}: IncludeClosedHintProps) {
  // includeClosed가 이미 true이거나, 결과가 충분하면 표시하지 않음
  if (includeClosed || resultCount > threshold) return null;

  const href = buildUrl(basePath, currentFilters);

  return (
    <div className={s.hint} role="status">
      <div className={s.iconWrap}>
        <Info size={18} />
      </div>
      <div className={s.body}>
        <p className={s.text}>
          {resultCount === 0
            ? `현재 모집 중인 ${itemLabel}이 없습니다.`
            : `현재 모집 중인 ${itemLabel}이 ${resultCount}건뿐입니다.`}
          {" "}마감된 항목도 함께 보면 지난 공고를 참고하거나 하반기 재공고를 미리 확인할 수 있습니다.
        </p>
      </div>
      <Link href={href} className={s.action}>
        마감 포함 보기
      </Link>
    </div>
  );
}
