"use client";

import dynamic from "next/dynamic";

export const LazyClimateRadar = dynamic(
  () => import("./climate-radar"),
  { ssr: false },
);

export const LazyPopulationBars = dynamic(
  () => import("./population-bars"),
  { ssr: false },
);
