"use client";

import dynamic from "next/dynamic";

export const PopulationTrendChart = dynamic(
  () => import("./population-trend-chart"),
  { ssr: false }
);

export const YouthTrendChart = dynamic(
  () => import("./youth-trend-chart"),
  { ssr: false }
);

export const FactorBarChart = dynamic(
  () => import("./factor-bar-chart"),
  { ssr: false }
);

export const SatisfactionDonutChart = dynamic(
  () => import("./satisfaction-donut-chart"),
  { ssr: false }
);
