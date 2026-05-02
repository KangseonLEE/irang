"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DataSource } from "@/components/ui/data-source";
import s from "./modals.module.css";

interface TrendItem {
  year: number;
  returnFarmPerson: number;
  returnFarmHousehold: number;
  returnRuralPerson: number;
}

interface ReturnFarmModalProps {
  returnFarm: {
    returnFarmPerson: number;
    returnFarmHousehold: number;
    returnRuralPerson: number;
    year: number;
  };
  regionCode: string;
  sigunguName: string;
}

const COLOR_FARM = "#1b6b5a";
const COLOR_RURAL = "#e67e22";

export function ReturnFarmModal({
  returnFarm,
  regionCode,
  sigunguName,
}: ReturnFarmModalProps) {
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchTrend() {
      try {
        const res = await fetch(
          `/api/return-farm-trend?regionCode=${regionCode}&years=10`,
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
  }, [regionCode]);

  const totalMovers =
    returnFarm.returnFarmPerson + returnFarm.returnRuralPerson;
  const farmRatio =
    totalMovers > 0
      ? Math.round((returnFarm.returnFarmPerson / totalMovers) * 100)
      : 0;

  return (
    <div className={s.modalContent}>
      {/* 현재 통계 */}
      <div className={s.statGrid}>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>귀농인</span>
          <span className={s.statItemValue}>
            {returnFarm.returnFarmPerson.toLocaleString()}명
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>귀농가구</span>
          <span className={s.statItemValue}>
            {returnFarm.returnFarmHousehold.toLocaleString()}가구
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>귀촌인</span>
          <span className={s.statItemValue}>
            {returnFarm.returnRuralPerson.toLocaleString()}명
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>귀농 비율</span>
          <span className={s.statItemValue}>{farmRatio}%</span>
        </div>
      </div>

      {/* 추이 그래프 */}
      <div className={s.chartSection}>
        <h4 className={s.chartTitle}>최근 10년 귀농·귀촌 추이</h4>
        {loading ? (
          <div className={s.chartPlaceholder}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div className={s.inlineSpinner} />
              <span>추이 데이터를 불러오는 중...</span>
            </div>
          </div>
        ) : error || trendData.length === 0 ? (
          <div className={s.chartPlaceholder}>
            <p>KOSIS 통계 서비스가 일시 장애 상태예요.</p>
            <p>잠시 후 다시 시도해 주세요.</p>
          </div>
        ) : (
          <div className={s.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="gradFarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_FARM} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLOR_FARM} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRural" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLOR_RURAL}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLOR_RURAL}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 10000
                      ? `${(v / 10000).toFixed(1)}만`
                      : v >= 1000
                        ? `${(v / 1000).toFixed(1)}천`
                        : String(v)
                  }
                  width={45}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const v = Number(value);
                    if (name === "귀농인")
                      return [`${v.toLocaleString()}명`, name];
                    if (name === "귀촌인")
                      return [`${v.toLocaleString()}명`, name];
                    return [String(value), name];
                  }}
                  labelFormatter={(label) => `${label}년`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="returnFarmPerson"
                  name="귀농인"
                  stroke={COLOR_FARM}
                  strokeWidth={2}
                  fill="url(#gradFarm)"
                  dot={{ r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="returnRuralPerson"
                  name="귀촌인"
                  stroke={COLOR_RURAL}
                  strokeWidth={2}
                  fill="url(#gradRural)"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 인사이트 */}
      <div className={s.insight}>
        <h4 className={s.insightTitle}>귀농 관점</h4>
        <p className={s.insightText}>
          {returnFarm.returnRuralPerson > returnFarm.returnFarmPerson * 3
            ? `${sigunguName}은 귀촌인이 귀농인보다 ${Math.round(returnFarm.returnRuralPerson / returnFarm.returnFarmPerson)}배 많아요. 농업보다 전원생활 목적의 이주가 많은 지역이에요.`
            : returnFarm.returnFarmPerson > returnFarm.returnRuralPerson
              ? `${sigunguName}은 귀촌보다 귀농 비율이 높아요. 실제 영농을 시작하려는 분들이 많이 찾는 지역이에요.`
              : `${sigunguName}은 귀농과 귀촌이 균형 있게 이뤄지고 있어요. 영농과 전원생활 모두 가능한 지역이에요.`}
        </p>
      </div>

      <DataSource source={`KOSIS 귀농어·귀촌인 통계 (${returnFarm.year}년)`} />
    </div>
  );
}
