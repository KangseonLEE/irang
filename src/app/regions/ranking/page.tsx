// Phase 4·5 재설계 중 — 단일 종합 점수 기반 랭킹은 임시 비활성화.
// 점수 데이터/계산 로직(SETTLEMENT_SCORES)은 src/lib/data/settlement-score.ts에 보존되며
// 차원별·페르소나 점수 시스템으로 전환 예정. 이전 구현은 git history(commit beca7d3) 참조.

import { notFound } from "next/navigation";

export default function RankingPage() {
  notFound();
}
