"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import s from "./modals.module.css";

interface TrendItem {
  year: number;
  population: number;
  householdCount: number;
  agingRate: number;
}

interface PopulationModalProps {
  provinceShortName: string;
  population: {
    population: number;
    householdCount: number;
    agingRate: number;
  } | null;
  sgisCode: string;
  density: number | null;
}

export function PopulationModal({
  population,
  sgisCode,
  density,
}: PopulationModalProps) {
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrend() {
      try {
        const res = await fetch(
          `/api/population-trend?sgisCode=${sgisCode}&years=10`
        );
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) {
          setTrendData(json.data || []);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTrend();
    return () => {
      cancelled = true;
    };
  }, [sgisCode]);

  if (!population) return null;

  return (
    <div className={s.modalContent}>
      {/* 현재 통계 */}
      <div className={s.statGrid}>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>총 인구</span>
          <span className={s.statItemValue}>
            {population.population.toLocaleString()}명
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>세대수</span>
          <span className={s.statItemValue}>
            {population.householdCount.toLocaleString()}세대
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>고령화율 (65+)</span>
          <span className={s.statItemValue}>{population.agingRate}%</span>
        </div>
        {density !== null && (
          <div className={s.statItem}>
            <span className={s.statItemLabel}>인구밀도</span>
            <span className={s.statItemValue}>
              {density.toLocaleString()}명/km²
            </span>
          </div>
        )}
      </div>

      {/* 추이 그래프 */}
      <div className={s.chartSection}>
        <h4 className={s.chartTitle}>최근 10년 인구 추이</h4>
        {loading ? (
          <div className={s.chartPlaceholder}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div className={s.inlineSpinner} />
              <span>인구 추이 데이터를 불러오는 중...</span>
            </div>
          </div>
        ) : error || trendData.length === 0 ? (
          <div className={s.chartPlaceholder}>
            인구 추이 데이터를 불러올 수 없습니다.
          </div>
        ) : (
          <div className={s.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  yAxisId="pop"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 10000 ? `${Math.round(v / 10000)}만` : v.toLocaleString()
                  }
                  width={50}
                />
                <YAxis
                  yAxisId="rate"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                  width={40}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const v = Number(value);
                    if (name === "인구")
                      return [`${v.toLocaleString()}명`, name];
                    if (name === "고령화율") return [`${v}%`, name];
                    return [String(value), name];
                  }}
                  labelFormatter={(label) => `${label}년`}
                />
                <Legend />
                <Line
                  yAxisId="pop"
                  type="monotone"
                  dataKey="population"
                  name="인구"
                  stroke="#1b6b5a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="rate"
                  type="monotone"
                  dataKey="agingRate"
                  name="고령화율"
                  stroke="#e67e22"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 귀농 인사이트 */}
      <div className={s.insight}>
        <h4 className={s.insightTitle}>귀농 관점</h4>
        <p className={s.insightText}>
          {population.agingRate >= 20
            ? `고령화율 ${population.agingRate}%로 젊은 귀농인에 대한 지역 환영도가 높고, 지원 정책이 활발한 편이에요.`
            : `고령화율 ${population.agingRate}%로 비교적 젊은 인구 구성을 보이며, 다양한 연령층과 교류가 가능해요.`}
        </p>
      </div>

      <p className={s.source}>출처: SGIS 통계지리정보서비스</p>
    </div>
  );
}
