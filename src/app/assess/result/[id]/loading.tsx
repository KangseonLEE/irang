import { Skeleton } from "@/components/ui/skeleton";

export default function AssessResultLoading() {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        alignItems: "center",
      }}
    >
      <Skeleton variant="circle" width={80} height={80} />
      <Skeleton width={200} height={28} radius={8} />
      <Skeleton width="100%" height={120} radius={16} />
    </div>
  );
}
