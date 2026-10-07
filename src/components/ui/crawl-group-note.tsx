import Link from "next/link";
import { MapPin } from "lucide-react";
import type { CrawlGroupInfo } from "@/lib/crawl-grouping";
import s from "./crawl-group-note.module.css";

/**
 * 칩 구분 값 — 같은 지역 공고가 여러 건이면 지역 이름만으로는 칩이 똑같다(10/6 QA: "서울특별시"×4·"전국"×6).
 * 그룹 멤버가 구분 값을 실어 오면(시·군·구 / 일정 / 마감일) 그걸 붙이고, 없으면 같은 지역 안 순번을 붙인다.
 * 멤버 모양(lib/crawl-grouping CrawlGroupMember)은 지금 id·region·status 뿐 — 구분 값이 추가되면 그대로 읽는다.
 */
type Member = CrawlGroupInfo["others"][number] & {
  sigungu?: string | null;
  /** 교육 일정 시작일 등 사람이 읽는 짧은 구분 문구 */
  detail?: string | null;
  applicationEnd?: string | null;
};

const ALWAYS_OPEN = "9999-12-31";

/** "2026-10-12" → "10.12" */
function mmdd(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return Number.isFinite(m) && Number.isFinite(d) ? `${m}.${d}` : date;
}

function memberDetail(m: Member): string | null {
  if (m.sigungu) return m.sigungu;
  if (m.detail) return m.detail;
  if (m.applicationEnd && m.applicationEnd !== ALWAYS_OPEN) return `~${mmdd(m.applicationEnd)}`;
  return null;
}

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
  const others = group.others as Member[];
  const count = others.length;
  if (count === 0) return null;

  const perRegion = new Map<string, number>();
  for (const m of others) perRegion.set(m.region, (perRegion.get(m.region) ?? 0) + 1);
  const seen = new Map<string, number>();

  return (
    <div className={s.note}>
      <span className={s.label}>
        <MapPin size={13} aria-hidden="true" />
        같은 사업, 다른 지역 {count}곳
      </span>
      <div className={s.chips}>
        {others.map((m) => {
          const nth = (seen.get(m.region) ?? 0) + 1;
          seen.set(m.region, nth);
          const repeated = (perRegion.get(m.region) ?? 0) > 1;
          // 같은 지역이 겹칠 때만 구분 값 — 데이터 값이 없으면 지역 안 순번
          const detail = repeated ? (memberDetail(m) ?? `${nth}`) : null;
          const closed = m.status === "마감";
          return (
            <Link
              key={m.id}
              href={`${basePath}/${m.id}`}
              className={closed ? `${s.chip} ${s.chipClosed}` : s.chip}
            >
              {m.region}
              {detail && <span className={s.chipDetail}>{detail}</span>}
              {closed && <span className={s.closedTag}>마감</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
