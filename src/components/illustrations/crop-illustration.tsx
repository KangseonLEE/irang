import a from "./illustrations.module.css";

/**
 * 작물정보 일러스트 — 다양한 작물이 자라는 생동감 있는 장면
 * SVG transform으로 위치 지정, CSS 애니메이션은 상대적 효과만 적용
 */
export function CropIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 배경 */}
      <rect width="400" height="320" rx="16" fill="#FFF8EE" />

      {/* 태양 */}
      <circle cx="330" cy="60" r="32" fill="#F5C542" opacity="0.7" />
      <circle cx="330" cy="60" r="22" fill="#F5C542" />

      {/* 흙 바닥 */}
      <path d="M0 230 Q100 220, 200 228 Q300 236, 400 225 V320 H0Z" fill="#D4A76A" opacity="0.35" />
      <path d="M0 250 Q150 240, 250 248 Q350 256, 400 245 V320 H0Z" fill="#C8860A" opacity="0.2" />

      {/* 왼쪽: 딸기 식물 — 바깥 위치, 안쪽 흔들림 */}
      <g transform="translate(50, 100)">
        <g className={a.treeSway}>
          <path d="M30 130 Q28 90, 35 60 Q38 40, 30 20" stroke="#4A9E85" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M30 80 Q15 60, 8 45" stroke="#4A9E85" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M32 65 Q48 45, 58 35" stroke="#4A9E85" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="5" cy="42" rx="14" ry="8" fill="#1B6B5A" transform="rotate(-30, 5, 42)" />
          <ellipse cx="60" cy="32" rx="14" ry="8" fill="#1B6B5A" transform="rotate(20, 60, 32)" opacity="0.8" />
          <circle cx="30" cy="14" r="16" fill="#E85D4A" />
          <circle cx="30" cy="12" r="5" fill="#F08070" opacity="0.6" />
          <circle cx="6" cy="34" r="8" fill="#E85D4A" opacity="0.8" />
        </g>
      </g>

      {/* 중앙: 배추 — 바깥 위치, 안쪽 성장 */}
      <g transform="translate(170, 140)">
        <g className={a.plantGrow}>
          <ellipse cx="30" cy="60" rx="28" ry="45" fill="#4A9E85" opacity="0.7" />
          <ellipse cx="30" cy="55" rx="22" ry="38" fill="#5CB896" opacity="0.8" />
          <ellipse cx="30" cy="50" rx="16" ry="30" fill="#A7D5C4" opacity="0.9" />
          <ellipse cx="30" cy="46" rx="10" ry="20" fill="#D4EDDA" />
        </g>
      </g>

      {/* 오른쪽: 벼 — 바깥 위치, 안쪽 흔들림 */}
      <g transform="translate(290, 90)">
        <g className={a.treeSway2}>
          <line x1="20" y1="140" x2="18" y2="60" stroke="#C8860A" strokeWidth="3" strokeLinecap="round" />
          <line x1="40" y1="140" x2="38" y2="50" stroke="#C8860A" strokeWidth="3" strokeLinecap="round" />
          <line x1="60" y1="140" x2="62" y2="65" stroke="#C8860A" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="16" cy="55" rx="5" ry="8" fill="#F5C542" />
          <ellipse cx="12" cy="65" rx="4" ry="6" fill="#F5C542" opacity="0.8" />
          <ellipse cx="36" cy="44" rx="5" ry="8" fill="#F5C542" />
          <ellipse cx="32" cy="54" rx="4" ry="6" fill="#F5C542" opacity="0.8" />
          <ellipse cx="64" cy="60" rx="5" ry="8" fill="#F5C542" />
          <ellipse cx="60" cy="70" rx="4" ry="6" fill="#F5C542" opacity="0.8" />
          <path d="M18 90 Q5 80, 0 70" stroke="#4A9E85" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 80 Q55 70, 62 60" stroke="#4A9E85" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* 물뿌리개 (위치는 SVG transform, 물방울은 cx/cy 기반) */}
      <g transform="translate(130, 60)">
        <rect x="0" y="8" width="28" height="22" rx="4" fill="#5BB0D0" opacity="0.8" />
        <rect x="28" y="14" width="16" height="4" rx="2" fill="#5BB0D0" opacity="0.6" />
        <circle cx="48" cy="16" r="6" fill="none" stroke="#5BB0D0" strokeWidth="2" opacity="0.6" />
        <circle cx="50" cy="28" r="2" fill="#5BB0D0" className={a.waterDrop} />
        <circle cx="44" cy="32" r="1.5" fill="#5BB0D0" className={a.waterDrop} style={{ animationDelay: "0.4s" }} />
        <circle cx="54" cy="34" r="1.5" fill="#5BB0D0" className={a.waterDrop} style={{ animationDelay: "0.8s" }} />
      </g>

      {/* 새싹 — 바깥 위치, 안쪽 성장 */}
      <g transform="translate(250, 210)">
        <g className={a.plantGrow}>
          <path d="M10 20 Q10 10, 16 5 Q12 12, 10 20" fill="#1B6B5A" opacity="0.5" />
          <path d="M10 20 Q10 10, 4 5 Q8 12, 10 20" fill="#4A9E85" opacity="0.5" />
          <line x1="10" y1="20" x2="10" y2="28" stroke="#1B6B5A" strokeWidth="1.5" opacity="0.5" />
        </g>
      </g>
    </svg>
  );
}
