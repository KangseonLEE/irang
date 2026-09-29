import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Compass } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PersonaCta } from "@/components/persona/persona-cta";
import { buildLaneCompare } from "@/lib/data/journey-lanes-hub";
import { resolveJourneyLanes } from "@/lib/data/journey-lanes-images";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "어떤 시작이 나에게 맞을까요? — 귀농·귀촌·귀산촌·청년농·스마트팜 비교",
  description:
    "귀농·귀촌·귀산촌·청년농·스마트팜 다섯 가지 시작을 지원사업 수, 진입 난이도, 추세, 초기 투자금으로 나란히 비교해요.",
  alternates: { canonical: "/start" },
};

export default function StartComparePage() {
  const posters = new Map(resolveJourneyLanes().map((l) => [l.id, l]));
  const columns = buildLaneCompare().map((row) => ({
    ...row,
    poster: posters.get(row.id),
  }));
  /* 행 라벨은 **타일 순번 기준 일반 명칭**으로 고정한다.
     첫 열(귀농) 타일의 label 을 그대로 쓰면 "2024년 귀농 인구" 행에 귀촌 인구·귀산촌 가구가
     나란히 오고, "초기 투자금 평균" 행에 귀촌의 "비교할 시·군·구"가 들어온다(9/29 실측).
     레인별 실제 지표명은 각 셀 안에 작은 글씨로 병기한다(선택 화면 타일과 같은 위계). */
  const ROW_LABELS = ["지금 볼 수 있는 지원사업", "진입 난이도", "최근 추세", "규모 · 초기 투자금"];

  return (
    <div className={s.page}>
      <PageHeader
        icon={<Compass size={18} aria-hidden="true" />}
        label="START"
        title="어떤 시작이 나에게 맞을까요?"
        description="다섯 가지 시작을 같은 기준으로 나란히 놓고 골라 보세요."
        count={columns.length}
      />

      {/* 1024+ 비교 표 — 열이 레인, 행이 지표. <1024 는 아래 카드 스택이 담당 */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <caption className={s.srOnly}>다섯 가지 시작 비교표</caption>
          <thead>
            <tr>
              <th scope="col" className={s.rowHead}>
                비교 항목
              </th>
              {columns.map((c) => (
                <th key={c.id} scope="col" className={s.colHead}>
                  <Link href={c.href} className={s.colLink} data-track={`start_compare:${c.id}`}>
                    <span className={s.thumb} aria-hidden="true">
                      {c.poster?.hasImage && (
                        <Image src={c.poster.image} alt="" fill sizes="120px" className={s.thumbImg} />
                      )}
                    </span>
                    <span className={s.colName}>{c.label}</span>
                  </Link>
                  <p className={s.colIntro}>{c.intro}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROW_LABELS.map((rowLabel, i) => (
              <tr key={rowLabel}>
                <th scope="row" className={s.rowHead}>
                  {rowLabel}
                </th>
                {columns.map((c) => (
                  <td key={c.id} className={s.cell}>
                    <span className={s.cellValue}>{c.tiles[i]?.value ?? "—"}</span>
                    <span className={s.cellLabel}>{c.tiles[i]?.label ?? ""}</span>
                    <span className={s.cellSource}>{c.tiles[i]?.source ?? ""}</span>
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th scope="row" className={s.rowHead}>
                대표 작물
              </th>
              {columns.map((c) => (
                <td key={c.id} className={s.cell}>
                  <span className={s.cellValue}>{c.topCrops.join(" · ")}</span>
                  <span className={s.cellSource}>이랑 작물 DB</span>
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row" className={s.rowHead}>
                자세히
              </th>
              {columns.map((c) => (
                <td key={c.id} className={s.cell}>
                  <Link href={c.href} className={s.more} data-track={`start_compare_more:${c.id}`}>
                    자세히 보기 →
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* <1024 — 레인별 카드 스택 */}
      <ul className={s.stack}>
        {columns.map((c) => (
          <li key={c.id} className={s.stackCard}>
            <Link href={c.href} className={s.stackHead} data-track={`start_compare:${c.id}`}>
              <span className={s.thumb} aria-hidden="true">
                {c.poster?.hasImage && (
                  <Image src={c.poster.image} alt="" fill sizes="88px" className={s.thumbImg} />
                )}
              </span>
              <span className={s.stackName}>{c.label}</span>
            </Link>
            <p className={s.colIntro}>{c.intro}</p>
            <ul className={s.tiles}>
              {c.tiles.map((t) => (
                <li key={t.label} className={s.tile}>
                  <span className={s.tileValue}>{t.value}</span>
                  <span className={s.tileLabel}>{t.label}</span>
                  <span className={s.tileSource}>{t.source}</span>
                </li>
              ))}
            </ul>
            <p className={s.stackCrops}>대표 작물 · {c.topCrops.join(" · ")}</p>
            <Link href={c.href} className={s.more} data-track={`start_compare_more:${c.id}`}>
              자세히 보기 →
            </Link>
          </li>
        ))}
      </ul>

      <PersonaCta from="start_compare" copy="어느 쪽인지 고르기 어렵다면 진단부터 해 보세요" />
    </div>
  );
}
