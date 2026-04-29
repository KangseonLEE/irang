import { Suspense } from "react";
import { CostTypeFilter } from "./type-filter";

export default function CostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <CostTypeFilter />
      </Suspense>
      {children}
    </>
  );
}
