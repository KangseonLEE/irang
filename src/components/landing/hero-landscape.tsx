/**
 * HeroLandscape — 히어로 배경 레이어
 * 추상적 언덕 레이어 + 장식 요소들 (텍스트 뒤에 깔리는 배경)
 */
export function HeroLandscape({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="h1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="h2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="h3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="sunGlow" cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#F5E6B8" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F5E6B8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 먼 산맥 — 부드럽고 추상적 */}
      <path
        d="M-100 580 C200 380,400 440,600 400 C800 360,1000 300,1200 380 C1350 420,1500 390,1540 410 V900 H-100Z"
        fill="url(#h1)"
      />

      {/* 중간 언덕 */}
      <path
        d="M-100 640 C150 500,350 560,550 520 C750 480,950 430,1150 500 C1300 540,1450 510,1540 530 V900 H-100Z"
        fill="url(#h2)"
      />

      {/* 앞 언덕 */}
      <path
        d="M-100 720 C200 620,450 680,650 650 C850 620,1050 590,1250 640 C1380 670,1500 650,1540 660 V900 H-100Z"
        fill="url(#h3)"
      />

      {/* 해 글로우 */}
      <circle cx="1100" cy="250" r="160" fill="url(#sunGlow)" />
      <circle cx="1100" cy="250" r="40" fill="#fff" opacity="0.08" />

      {/* ── 이랑 곡선 (밭고랑) — 전면 ── */}
      <g stroke="#fff" strokeWidth="1" opacity="0.06" fill="none">
        <path d="M0 760 C360 740,720 745,1080 735 C1260 730,1440 738,1440 738" />
        <path d="M0 785 C360 768,720 772,1080 764 C1260 760,1440 766,1440 766" />
        <path d="M0 810 C360 796,720 800,1080 793 C1260 790,1440 795,1440 795" />
        <path d="M0 835 C360 824,720 827,1080 822 C1260 819,1440 823,1440 823" />
        <path d="M0 860 C360 852,720 854,1080 850 C1260 848,1440 851,1440 851" />
      </g>
    </svg>
  );
}

/**
 * HeroElements — 텍스트 주변 장식 요소들
 * 절대 위치로 텍스트 영역 주위에 흩뿌려지는 오브젝트
 */
export function HeroElements({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* 농가 — 우측 */}
      <svg className="heroEl heroElHouse" viewBox="0 0 80 70" fill="none" width="80" height="70">
        <rect x="10" y="30" width="60" height="34" rx="3" fill="rgba(255,255,255,0.15)" />
        <path d="M4 32 L40 6 L76 32Z" fill="rgba(255,255,255,0.2)" />
        <rect x="30" y="40" width="16" height="24" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="14" y="36" width="12" height="10" rx="1.5" fill="rgba(255,255,255,0.25)" />
        <rect x="52" y="36" width="12" height="10" rx="1.5" fill="rgba(255,255,255,0.25)" />
        <rect x="58" y="14" width="8" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
      </svg>

      {/* 나무 1 — 좌측 */}
      <svg className="heroEl heroElTree1" viewBox="0 0 44 72" fill="none" width="44" height="72">
        <rect x="18" y="44" width="8" height="28" rx="3" fill="rgba(255,255,255,0.12)" />
        <ellipse cx="22" cy="30" rx="20" ry="28" fill="rgba(255,255,255,0.1)" />
        <ellipse cx="22" cy="24" rx="15" ry="20" fill="rgba(255,255,255,0.07)" />
      </svg>

      {/* 나무 2 — 좌하단 */}
      <svg className="heroEl heroElTree2" viewBox="0 0 36 60" fill="none" width="36" height="60">
        <rect x="14" y="36" width="7" height="24" rx="3" fill="rgba(255,255,255,0.1)" />
        <ellipse cx="18" cy="24" rx="16" ry="24" fill="rgba(255,255,255,0.08)" />
        <ellipse cx="18" cy="20" rx="11" ry="16" fill="rgba(255,255,255,0.06)" />
      </svg>

      {/* 침엽수 — 우하단 */}
      <svg className="heroEl heroElPine" viewBox="0 0 32 64" fill="none" width="32" height="64">
        <rect x="13" y="42" width="6" height="22" rx="2" fill="rgba(255,255,255,0.1)" />
        <path d="M16 4 L28 42 H4Z" fill="rgba(255,255,255,0.08)" />
        <path d="M16 14 L24 42 H8Z" fill="rgba(255,255,255,0.06)" />
      </svg>

      {/* 새들 */}
      <svg className="heroEl heroElBirds" viewBox="0 0 80 30" fill="none" width="80" height="30">
        <g stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" strokeLinecap="round" fill="none">
          <path d="M8 18 Q14 10 20 15 Q26 10 32 18" />
          <path d="M44 12 Q49 6 54 10 Q59 6 64 12" />
          <path d="M56 22 Q60 17 64 20 Q68 17 72 22" />
        </g>
      </svg>
    </div>
  );
}
