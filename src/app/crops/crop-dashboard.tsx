"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  type RenderableText,
} from "recharts";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import c from "@/components/charts/chart-styles.module.css";
import s from "./crop-dashboard.module.css";

/** 작물 1건의 차트 집계용 사실 — 서버에서 직렬화 전달 (체크리스트 H) */
export interface CropFact {
  id: string;
  /** 작물명 — 차트 버킷 호버 시 작물 목록 툴팁용 */
  name: string;
  /** 이모지 — 작물 목록 툴팁 표시용 (없을 수 있음) */
  emoji?: string;
  category: "식량" | "채소" | "과수" | "특용";
  difficulty: "쉬움" | "보통" | "어려움";
  laborIntensity: "낮음" | "보통" | "높음" | null;
  /** majorRegions를 도 단위로 정규화한 배열 (중복 제거) */
  provinces: string[];
  /** growingSeason 파싱 결과 — 재배 월(1~12). 파싱 실패 시 빈 배열 */
  months: number[];
}

/** 10a당 연소득 비교 차트용 사실 — 서버에서 직렬화 전달 (체크리스트 H) */
export interface CropIncomeFact {
  id: string;
  name: string;
  emoji: string;
  category: "식량" | "채소" | "과수" | "특용";
  difficulty: "쉬움" | "보통" | "어려움";
  /** 10a(1,000㎡)당 연소득(만원) — revenueRange 선두 파싱값 */
  income10a: number;
}

interface CropDashboardProps {
  facts: CropFact[];
  /** 다루는 주산지 도 수 (전체 기준, 하드코딩 금지) */
  totalProvinceCount: number;
  /** 10a당 연소득 파싱 성공 작물 (임산물 등 기준 다른 작물 제외) */
  incomeFacts: CropIncomeFact[];
  /** 기준이 달라 수익 차트에서 제외한 작물명 (각주용) */
  excludedIncomeNames: string[];
}

/** 수익 차트 상위 표시 종수 */
const INCOME_TOP_N = 12;

/** 난이도별 막대 색 — 고소득=고난이도 맥락을 색으로 표현 (David #2) */
const DIFFICULTY_COLORS: Record<string, string> = {
  쉬움: "#3EA088",
  보통: "#1B6B5A",
  어려움: "#D4A843",
};

const BRAND = "#1B6B5A";
const BRAND_MUTED = "rgba(27, 107, 90, 0.22)";
const AMBER = "#d97706";
const GRAY = "#9ca3af";

const CATEGORIES = ["식량", "채소", "과수", "특용"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  식량: "#1B6B5A",
  채소: "#3EA088",
  과수: "#D4A843",
  특용: "#8B7355",
};

const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
const LABORS = ["낮음", "보통", "높음"] as const;

const MONTH_LABELS = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
];

/** 작물 목록 툴팁 최대 표시 개수 (초과 시 "외 N개") */
const TIP_MEMBERS_MAX = 12;

/** 작물명 표시 헬퍼 — "🍅 토마토" 형식 (이모지 없으면 이름만) */
function cropLabel(f: CropFact): string {
  return f.emoji ? `${f.emoji} ${f.name}` : f.name;
}

/* ── Recharts 툴팁 props ── */
interface TipProps {
  active?: boolean;
  payload?: Array<{
    payload: { label: string; count: number; members?: string[] };
    color?: string;
  }>;
}

function CountTooltip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const { label, count, members } = payload[0].payload;
  const shown = members?.slice(0, TIP_MEMBERS_MAX) ?? [];
  const rest = (members?.length ?? 0) - shown.length;
  return (
    <div className={c.tooltip}>
      <p className={c.tooltipLabel}>{label}</p>
      <div className={c.tooltipRow}>
        <span
          className={c.tooltipDot}
          style={{ background: payload[0].color || BRAND }}
        />
        <span>작물 수</span>
        <span className={c.tooltipValue}>{count}종</span>
      </div>
      {shown.length > 0 && (
        <p className={s.tipMembers}>
          {shown.join(" · ")}
          {rest > 0 && ` 외 ${rest}개`}
        </p>
      )}
    </div>
  );
}

/* ── 수익 차트 전용 툴팁 ── */
interface IncomeTipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      income10a: number;
      difficulty: string;
    };
    color?: string;
  }>;
}

function IncomeTooltip({ active, payload }: IncomeTipProps) {
  if (!active || !payload?.length) return null;
  const { label, income10a, difficulty } = payload[0].payload;
  return (
    <div className={c.tooltip}>
      <p className={c.tooltipLabel}>{label}</p>
      <div className={c.tooltipRow}>
        <span
          className={c.tooltipDot}
          style={{ background: payload[0].color || BRAND }}
        />
        <span>10a당 연소득</span>
        <span className={c.tooltipValue}>약 {income10a.toLocaleString()}만 원</span>
      </div>
      <div className={c.tooltipRow}>
        <span>난이도</span>
        <span className={c.tooltipValue}>{difficulty}</span>
      </div>
    </div>
  );
}

export function CropDashboard({
  facts,
  totalProvinceCount,
  incomeFacts,
  excludedIncomeNames,
}: CropDashboardProps) {
  // 인터랙티브: 카테고리 선택 시 나머지 차트 연동 필터 (null = 전체)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 카테고리 분포 (도넛은 항상 전체 기준 — 선택 컨트롤 역할)
  const categoryData = useMemo(
    () =>
      CATEGORIES.map((cat) => {
        const members = facts.filter((f) => f.category === cat);
        return {
          label: cat,
          count: members.length,
          members: members.map(cropLabel),
        };
      }),
    [facts],
  );

  // 선택 카테고리로 필터된 facts (나머지 차트 공통 소스)
  const scoped = useMemo(
    () =>
      selectedCategory
        ? facts.filter((f) => f.category === selectedCategory)
        : facts,
    [facts, selectedCategory],
  );

  // 난이도 분포
  const difficultyData = useMemo(
    () =>
      DIFFICULTIES.map((d) => {
        const members = scoped.filter((f) => f.difficulty === d);
        return { label: d, count: members.length, members: members.map(cropLabel) };
      }),
    [scoped],
  );

  // 노동강도 분포 (미지정 별도 집계)
  const laborData = useMemo(() => {
    const rows: Array<{ label: string; count: number; members: string[] }> =
      LABORS.map((l) => {
        const members = scoped.filter((f) => f.laborIntensity === l);
        return { label: l as string, count: members.length, members: members.map(cropLabel) };
      });
    const unknown = scoped.filter((f) => f.laborIntensity === null);
    if (unknown.length > 0)
      rows.push({ label: "미지정", count: unknown.length, members: unknown.map(cropLabel) });
    return rows;
  }, [scoped]);

  // 지역별 작물 다양성 Top 8
  const regionData = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const f of scoped) {
      for (const p of f.provinces) {
        const arr = map.get(p) ?? [];
        arr.push(cropLabel(f));
        map.set(p, arr);
      }
    }
    return Array.from(map.entries())
      .map(([label, members]) => ({ label, count: members.length, members }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [scoped]);

  // 재배 시기(월별) 분포 — 파싱 성공 작물만 집계
  const { monthData, parsedCount } = useMemo(() => {
    const memberLists: string[][] = Array.from({ length: 12 }, () => []);
    let parsed = 0;
    for (const f of scoped) {
      if (f.months.length === 0) continue;
      parsed += 1;
      for (const m of f.months) memberLists[m - 1].push(cropLabel(f));
    }
    return {
      monthData: MONTH_LABELS.map((m, i) => ({
        label: `${m}월`,
        count: memberLists[i].length,
        members: memberLists[i],
      })),
      parsedCount: parsed,
    };
  }, [scoped]);

  // 10a당 연소득 Top N — 카테고리 필터 연동, 내림차순
  const incomeData = useMemo(() => {
    const filtered = selectedCategory
      ? incomeFacts.filter((f) => f.category === selectedCategory)
      : incomeFacts;
    return [...filtered]
      .sort((a, b) => b.income10a - a.income10a)
      .slice(0, INCOME_TOP_N)
      .map((f) => ({
        label: `${f.emoji} ${f.name}`,
        income10a: f.income10a,
        difficulty: f.difficulty,
      }));
  }, [incomeFacts, selectedCategory]);

  // 요약 스탯
  const easyCount = useMemo(
    () => facts.filter((f) => f.difficulty === "쉬움").length,
    [facts],
  );

  const scopedLabel = selectedCategory ?? "전체";

  return (
    <section className={s.section} aria-label="작물 데이터 대시보드">
      <header className={s.head}>
        <h2 className={s.title}>한눈에 보는 작물</h2>
        <p className={s.subtitle}>
          카테고리를 누르면 아래 차트가 함께 바뀌어요.
        </p>
      </header>

      {/* 1) 요약 스탯 스트립 */}
      <div className={s.statStrip}>
        <div className={s.stat}>
          <span className={s.statValue}>{facts.length}</span>
          <span className={s.statLabel}>전체 작물</span>
        </div>
        <div className={s.stat}>
          <span className={s.statValue}>{CATEGORIES.length}</span>
          <span className={s.statLabel}>카테고리</span>
        </div>
        <div className={s.stat}>
          <span className={s.statValue}>{easyCount}</span>
          <span className={s.statLabel}>초보 추천</span>
        </div>
        <div className={s.stat}>
          <span className={s.statValue}>{totalProvinceCount}</span>
          <span className={s.statLabel}>주산지 도 수</span>
        </div>
      </div>

      {/* 필터 상태 안내 */}
      {selectedCategory && (
        <div className={s.filterBar}>
          <span className={s.filterChip}>{selectedCategory} 작물만</span>
          <button
            type="button"
            className={s.filterReset}
            onClick={() => setSelectedCategory(null)}
          >
            전체 보기
          </button>
        </div>
      )}

      <div className={s.grid}>
        {/* 2) 카테고리 분포 도넛 (인터랙티브 컨트롤) */}
        <div className={s.card}>
          <h3 className={s.cardTitle}>카테고리 분포</h3>
          <p className={s.cardHint}>조각을 누르면 그 카테고리만 봐요.</p>
          <div className={c.chartWrapper} style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius="54%"
                  outerRadius="80%"
                  paddingAngle={3}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {categoryData.map((entry) => {
                    const isSel =
                      selectedCategory === null ||
                      selectedCategory === entry.label;
                    return (
                      <Cell
                        key={entry.label}
                        fill={CATEGORY_COLORS[entry.label]}
                        opacity={isSel ? 0.95 : 0.35}
                        stroke="#fff"
                        strokeWidth={2}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setSelectedCategory((prev) =>
                            prev === entry.label ? null : entry.label,
                          )
                        }
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CountTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* 클릭 가능한 칩 범례 (도넛 조각 대체 입력 — a11y) */}
          <div className={s.chips}>
            {categoryData.map((entry) => {
              const isSel = selectedCategory === entry.label;
              return (
                <button
                  key={entry.label}
                  type="button"
                  className={`${s.chip} ${isSel ? s.chipActive : ""}`}
                  aria-pressed={isSel}
                  onClick={() =>
                    setSelectedCategory((prev) =>
                      prev === entry.label ? null : entry.label,
                    )
                  }
                >
                  <span
                    className={s.chipDot}
                    style={{ background: CATEGORY_COLORS[entry.label] }}
                    aria-hidden="true"
                  />
                  {entry.label}
                  <span className={s.chipCount}>{entry.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3) 난이도 분포 가로 bar — "쉬움" 강조 */}
        <div className={s.card}>
          <h3 className={s.cardTitle}>난이도 분포</h3>
          <p className={s.cardHint}>초보에게 좋은 &lsquo;쉬움&rsquo;을 진하게 표시했어요.</p>
          <ResponsiveContainer width="100%" height={difficultyData.length * 46 + 16}>
            <BarChart
              data={difficultyData}
              layout="vertical"
              margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, "auto"]} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                barSize={26}
                animationDuration={800}
                animationEasing="ease-out"
                label={{ position: "right", fontSize: 13, fontWeight: 700, fill: "#374151" }}
              >
                {difficultyData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={entry.label === "쉬움" ? BRAND : BRAND_MUTED}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4) 노동강도 분포 bar — "낮음" 강조 (직장인 겸업 관점) */}
        <div className={s.card}>
          <h3 className={s.cardTitle}>노동강도 분포</h3>
          <p className={s.cardHint}>겸업에 유리한 &lsquo;낮음&rsquo;을 진하게 표시했어요.</p>
          <ResponsiveContainer width="100%" height={laborData.length * 46 + 16}>
            <BarChart
              data={laborData}
              layout="vertical"
              margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
            >
              <XAxis type="number" hide domain={[0, "auto"]} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 13, fill: "#374151", fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                barSize={26}
                animationDuration={800}
                animationEasing="ease-out"
                label={{ position: "right", fontSize: 13, fontWeight: 700, fill: "#374151" }}
              >
                {laborData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={
                      entry.label === "낮음"
                        ? BRAND
                        : entry.label === "미지정"
                          ? GRAY
                          : BRAND_MUTED
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5) 지역별 작물 다양성 Top 8 — 1위 강조 */}
        <div className={s.card}>
          <h3 className={s.cardTitle}>주산지 다양성</h3>
          <p className={s.cardHint}>작물이 가장 다양한 지역 8곳이에요.</p>
          {regionData.length === 0 ? (
            <p className={s.empty}>주산지 데이터가 없어요.</p>
          ) : (
            <ResponsiveContainer width="100%" height={regionData.length * 34 + 16}>
              <BarChart
                data={regionData}
                layout="vertical"
                margin={{ top: 0, right: 36, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide domain={[0, "auto"]} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  animationDuration={800}
                  animationEasing="ease-out"
                  label={{ position: "right", fontSize: 12, fontWeight: 700, fill: "#374151" }}
                >
                  {regionData.map((entry, i) => (
                    <Cell key={entry.label} fill={i === 0 ? BRAND : BRAND_MUTED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 6) 재배 시기(월별) 막대 */}
        <div className={`${s.card} ${s.cardWide}`}>
          <h3 className={s.cardTitle}>월별 재배 작물</h3>
          <p className={s.cardHint}>
            재배 시기가 겹치는 달이에요. 시기 정보가 분명한 {parsedCount}종만 셌어요.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={monthData}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CountTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                barSize={22}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {monthData.map((entry) => {
                  const max = Math.max(...monthData.map((d) => d.count), 1);
                  return (
                    <Cell
                      key={entry.label}
                      fill={entry.count === max ? AMBER : BRAND}
                      opacity={entry.count === max ? 1 : 0.8}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7) 10a당 연소득 비교 — 난이도 색 + 1위 강조 */}
        <div className={`${s.card} ${s.cardWide}`}>
          <h3 className={s.cardTitle}>10a당 얼마 벌까</h3>
          <p className={s.cardHint}>
            10a(1,000㎡)당 연소득 상위 {INCOME_TOP_N}종이에요. 색은 난이도예요 —
            보통은 진하게, 어려움은 노랗게 표시했어요.
          </p>
          {incomeData.length === 0 ? (
            <p className={s.empty}>이 카테고리는 비교할 수익 데이터가 없어요.</p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={incomeData.length * 34 + 16}
            >
              <BarChart
                data={incomeData}
                layout="vertical"
                margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide domain={[0, "auto"]} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  width={108}
                />
                <Tooltip
                  content={<IncomeTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar
                  dataKey="income10a"
                  radius={[0, 6, 6, 0]}
                  barSize={18}
                  animationDuration={800}
                  animationEasing="ease-out"
                  label={{
                    position: "right",
                    fontSize: 12,
                    fontWeight: 700,
                    fill: "#374151",
                    formatter: (v: RenderableText) =>
                      `${Number(v).toLocaleString()}만`,
                  }}
                >
                  {incomeData.map((entry, i) => (
                    <Cell
                      key={entry.label}
                      fill={DIFFICULTY_COLORS[entry.difficulty] ?? BRAND}
                      opacity={i === 0 ? 1 : 0.88}
                      stroke={i === 0 ? BRAND : "none"}
                      strokeWidth={i === 0 ? 1.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className={s.incomeNote}>
            10a(1,000㎡) 기준 · 임산물 등 기준이 다른 {excludedIncomeNames.length}종은
            제외 · 출처: 농촌진흥청 농업소득자료집 2024·통계청
          </p>
        </div>
      </div>

      <p className={s.scopeNote} aria-live="polite">
        지금 보는 차트 기준: <strong>{scopedLabel}</strong> 작물 {scoped.length}종
      </p>

      <ReferenceNotice text="농촌진흥청·통계청·산림청 데이터를 가공한 참고 자료예요. 작물 수는 등록 기준이며 실제 재배 조건은 지역·품종에 따라 달라요." />
    </section>
  );
}
