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
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "var(--muted, #f4f4f5)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <div
        style={{
          width: 200,
          height: 28,
          borderRadius: 8,
          background: "var(--muted, #f4f4f5)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
      <div
        style={{
          width: "100%",
          height: 120,
          borderRadius: 16,
          background: "var(--muted, #f4f4f5)",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    </div>
  );
}
