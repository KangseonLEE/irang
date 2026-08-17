"use client";

import dynamic from "next/dynamic";

/**
 * recharts를 직접 import하는 모달만 지연 로드한다 (번들 다이어트 2026-08-17).
 *
 * PopulationModal·ReturnFarmModal은 recharts를 정적 import하는 유일한 모달이라,
 * 이 둘을 region-stats·sigungu-stats에서 정적으로 끌면 recharts(약 330KB raw /
 * 96KB gzip)가 시·도 69개 + 전국 시군구 페이지의 **초기 JS**에 eager로 들어간다.
 * 실측 비교: /regions/jeonnam eager 2,147KB(recharts 포함) vs
 * /crops/grape eager 1,747KB(charts-lazy 적용으로 recharts 제외).
 *
 * 공용 Modal은 닫힘 상태에서 null을 반환하므로(components/ui/modal.tsx) children이
 * 마운트되지 않는다 → 사용자가 카드를 클릭해 모달을 처음 열 때 청크를 받는다.
 * LCP·CLS 영향 0.
 *
 * ⚠️ recharts를 쓰지 않는 모달(AreaModal·MedicalModal·SchoolModal·FarmHouseholdModal)은
 * 여기 추가하지 말 것 — 청크만 쪼개져 요청 수가 늘고 이득이 없다.
 * 차트 컴포넌트 자체의 지연 로드는 `@/components/charts/lazy`를 쓴다.
 */

export const PopulationModal = dynamic(
  () => import("./population-modal").then((m) => m.PopulationModal),
  { ssr: false },
);

export const ReturnFarmModal = dynamic(
  () => import("./return-farm-modal").then((m) => m.ReturnFarmModal),
  { ssr: false },
);
