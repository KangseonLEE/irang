"use client";

import dynamic from "next/dynamic";

export const CropAreaChart = dynamic(() => import("./crop-area-chart"), {
  ssr: false,
});

export const CropIncomeVarietiesChart = dynamic(
  () => import("./crop-income-varieties-chart"),
  { ssr: false },
);
