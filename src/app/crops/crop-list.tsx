import Image from "next/image";
import Link from "next/link";
import dt from "@/components/ui/data-table.module.css";
import s from "./crop-list.module.css";
import { getCropImageSrc } from "@/lib/crop-image";
import type { CropDifficulty } from "@/lib/data/crops";

/** 목록(table) 뷰 1행 데이터 — 서버에서 CROPS + CROP_DETAILS 조인 */
export interface CropRow {
  id: string;
  name: string;
  emoji: string;
  category: string;
  difficulty: CropDifficulty;
  growingSeason: string;
  /** CROP_DETAILS.income.laborIntensity, 없으면 null */
  laborIntensity: "낮음" | "보통" | "높음" | null;
  /** majorRegions 상위 2~3개 join, 없으면 "" */
  majorRegions: string;
}

/** 난이도별 배지 색 클래스 — 쉬움(초록)·보통(앰버)·어려움(회색) */
function difficultyClass(difficulty: CropDifficulty): string {
  switch (difficulty) {
    case "쉬움":
      return s.diffEasy;
    case "보통":
      return s.diffMedium;
    case "어려움":
      return s.diffHard;
    default:
      return s.diffMedium;
  }
}

/** 노동강도별 색 클래스 — 낮음(초록)·보통(앰버)·높음(회색) */
function laborClass(intensity: CropRow["laborIntensity"]): string {
  switch (intensity) {
    case "낮음":
      return s.laborLow;
    case "보통":
      return s.laborMid;
    case "높음":
      return s.laborHigh;
    default:
      return "";
  }
}

interface CropListProps {
  rows: CropRow[];
}

/**
 * 작물 목록(table) 뷰 — Server Component.
 * /programs program-list 테이블 패턴 준용. 모바일은 stacked card 전환(@media 격리).
 */
export function CropList({ rows }: CropListProps) {
  return (
    <div className={dt.wrap}>
      <table className={`${dt.table} ${s.table}`}>
        <thead>
          <tr>
            <th>작물</th>
            <th>카테고리</th>
            <th>난이도</th>
            <th>재배 시기</th>
            <th>노동강도</th>
            <th>주산지</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className={dt.clickableRow}>
              <td className={dt.titleCell} data-label="작물">
                <Link
                  href={`/crops/${c.id}`}
                  className={`${dt.titleLink} ${dt.rowLink} ${s.nameLink}`}
                >
                  <Image
                    src={getCropImageSrc(c.id)}
                    alt={c.name}
                    width={40}
                    height={40}
                    className={s.thumb}
                  />
                  {c.name}
                </Link>
              </td>
              <td className={dt.muted} data-label="카테고리">
                {c.category}
              </td>
              <td data-label="난이도">
                <span className={`${s.tag} ${difficultyClass(c.difficulty)}`}>
                  {c.difficulty}
                </span>
              </td>
              <td className={dt.muted} data-label="재배 시기">
                {c.growingSeason}
              </td>
              <td data-label="노동강도">
                {c.laborIntensity ? (
                  <span className={`${s.tag} ${laborClass(c.laborIntensity)}`}>
                    {c.laborIntensity}
                  </span>
                ) : (
                  <span className={dt.muted}>—</span>
                )}
              </td>
              <td className={dt.muted} data-label="주산지">
                {c.majorRegions || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
