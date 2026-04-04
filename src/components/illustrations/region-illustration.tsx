import a from "./illustrations.module.css";

/**
 * 지역탐색 일러스트 — 산과 들판, 작은 집이 있는 풍경
 * SVG transform으로 위치 지정, CSS 애니메이션은 상대적 효과만 적용
 */
export function RegionIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 배경 하늘 */}
      <rect width="400" height="320" rx="16" fill="#E8F5F0" />

      {/* 구름 (위치: cx/cy, 애니메이션: CSS translateX) */}
      <g className={a.cloud1}>
        <ellipse cx="80" cy="60" rx="40" ry="18" fill="#fff" opacity="0.8" />
        <ellipse cx="100" cy="52" rx="28" ry="14" fill="#fff" opacity="0.8" />
      </g>
      <g className={a.cloud2}>
        <ellipse cx="310" cy="45" rx="32" ry="14" fill="#fff" opacity="0.6" />
      </g>

      {/* 뒷산 */}
      <path
        d="M-20 200 Q60 80, 140 160 Q180 200, 220 150 Q280 80, 360 140 Q400 170, 420 160 V320 H-20Z"
        fill="#A7D5C4"
        opacity="0.6"
      />

      {/* 앞산 */}
      <path
        d="M-20 240 Q40 140, 120 200 Q170 240, 230 190 Q300 130, 380 190 Q410 210, 420 200 V320 H-20Z"
        fill="#1B6B5A"
        opacity="0.35"
      />

      {/* 들판 */}
      <path
        d="M0 250 Q100 230, 200 245 Q300 260, 400 240 V320 H0Z"
        fill="#4A9E85"
        opacity="0.4"
      />

      {/* 밭고랑 */}
      <path d="M30 270 Q100 260, 180 268 Q260 276, 370 265" stroke="#1B6B5A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M30 282 Q110 272, 190 280 Q270 288, 370 277" stroke="#1B6B5A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M30 294 Q120 284, 200 292 Q280 300, 370 289" stroke="#1B6B5A" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

      {/* 집 */}
      <g transform="translate(160, 170)">
        <rect x="0" y="20" width="44" height="36" rx="3" fill="#F7F5F0" />
        <path d="M-6 22 L22 2 L50 22Z" fill="#C8860A" />
        <rect x="16" y="36" width="12" height="20" rx="2" fill="#B05A3A" />
        <rect x="5" y="28" width="8" height="8" rx="1" fill="#A7D5C4" />
        <rect x="31" y="28" width="8" height="8" rx="1" fill="#A7D5C4" />
      </g>

      {/* 나무: 바깥 <g>가 위치, 안쪽 <g>가 애니메이션 */}
      <g transform="translate(100, 185)">
        <g className={a.treeSway}>
          <rect x="8" y="20" width="6" height="20" rx="2" fill="#B05A3A" opacity="0.7" />
          <ellipse cx="11" cy="14" rx="14" ry="18" fill="#1B6B5A" opacity="0.6" />
        </g>
      </g>
      <g transform="translate(240, 180)">
        <g className={a.treeSway2}>
          <rect x="6" y="18" width="5" height="18" rx="2" fill="#B05A3A" opacity="0.7" />
          <ellipse cx="9" cy="12" rx="12" ry="16" fill="#4A9E85" opacity="0.7" />
        </g>
      </g>

      {/* 핀 마커: 바깥 <g>가 위치, 안쪽 <g>가 바운스 */}
      <g transform="translate(280, 90)">
        <g className={a.pinBounce}>
          <circle cx="16" cy="16" r="16" fill="#1B6B5A" />
          <circle cx="16" cy="14" r="6" fill="#fff" />
          <path d="M16 22 L12 30 L16 27 L20 30Z" fill="#1B6B5A" />
        </g>
      </g>
    </svg>
  );
}
