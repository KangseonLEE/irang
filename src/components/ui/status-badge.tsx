import s from "./status-badge.module.css";

interface StatusBadgeProps {
  status: string;
}

function getVariant(status: string): string {
  switch (status) {
    case "모집중":
    case "접수중":
      return s.green;
    case "모집예정":
    case "접수예정":
      return s.amber;
    case "마감":
    default:
      return s.gray;
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={getVariant(status)}>{status}</span>;
}
