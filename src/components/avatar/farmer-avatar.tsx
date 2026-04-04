import s from "./farmer-avatar.module.css";

interface FarmerAvatarProps {
  /** 이니셜 추출용 이름 (예: "조성수" → "조") */
  name: string;
  /** 고유 그라데이션 생성을 위한 시드 (예: person.id) */
  seed: string;
  /** sm = 카드용(44px), md = 기본(56px), lg = 상세페이지(72px) */
  size?: "sm" | "md" | "lg";
}

/** 시드 문자열 → ���유한 그라데이션 CSS */
function hashToGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 45) % 360;
  return `linear-gradient(135deg, hsl(${h1} 50% 86%) 0%, hsl(${h2} 40% 78%) 100%)`;
}

export function FarmerAvatar({
  name,
  seed,
  size = "md",
}: FarmerAvatarProps) {
  const initial = name.charAt(0);

  return (
    <div
      className={`${s.avatar} ${s[size]}`}
      style={{ background: hashToGradient(seed) }}
      aria-hidden="true"
    >
      <span className={s.initial}>{initial}</span>
    </div>
  );
}
