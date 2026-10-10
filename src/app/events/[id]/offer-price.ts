/**
 * 비용 문구 → Offer 가격. 금액이 적혀 있으면 그 금액(여럿이면 가장 큰 값 — 조건 없이 내는 값)을 쓰고,
 * 금액 없이 '무료'만 있을 때만 0 으로 둔다. 10/10: "사전등록 시 무료 (현장 일반 5,000원)"이
 * '무료' 포함만 보고 price 0 으로 나가 검색 결과에 무료 행사처럼 보였다(evt-004).
 */
export function offerPrice(cost: string): { price?: string; description?: string } {
  const amounts = [...cost.matchAll(/(\d[\d,]*)\s*(만\s*)?원/g)].map(
    (m) => Number(m[1].replace(/,/g, "")) * (m[2] ? 10000 : 1),
  );
  if (amounts.length > 0) return { price: String(Math.max(...amounts)), description: cost };
  if (cost.includes("무료")) return { price: "0" };
  return {};
}
