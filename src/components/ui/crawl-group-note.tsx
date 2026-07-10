import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CrawlGroupInfo } from "@/lib/crawl-grouping";
import s from "./crawl-group-note.module.css";

/**
 * 크롤 그룹 대표 카드 아래에 붙는 "같은 사업, 다른 지역" 안내.
 * 나머지 지역 공고로 접근할 수 있는 지역 칩(각 공고 상세로 링크)을 노출한다.
 *
 * 카드 전체가 <Link>라 중첩 링크가 되지 않도록, 이 컴포넌트는 카드의 형제로 배치한다.
 */
export function CrawlGroupNote({
  group,
  basePath,
}: {
  group: CrawlGroupInfo;
  basePath: string;
}) {
  const count = group.others.length;
  if (count === 0) return null;

  return (
    <div className={s.note}>
      <span className={s.label}>
        <MapPin size={13} aria-hidden="true" />
        같은 사업, 다른 지역 {count}곳
      </span>
      <div className={s.chips}>
        {group.others.map((m) => (
          <Link
            key={m.id}
            href={`${basePath}/${m.id}`}
            className={`${s.chip}${m.status === "마감" ? ` ${s.chipClosed}` : ""}`}
          >
            {m.region}
            {m.status === "마감" && <span className={s.closedTag}>마감</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
