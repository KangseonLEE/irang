/**
 * 귀농 준비 진단 CTA용 일러스트 — 모자 쓴 농부가 체크리스트를 들고 있는 모습
 * 인라인 SVG로 외부 의존 없이 렌더링
 */
export function FarmerIllustration({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 220"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* 배경 원 */}
      <circle cx="100" cy="120" r="90" fill="currentColor" opacity="0.06" />

      {/* 몸통 */}
      <path
        d="M70 155c0-16.6 13.4-30 30-30s30 13.4 30 30v35H70v-35z"
        fill="currentColor"
        opacity="0.18"
      />

      {/* 얼굴 */}
      <circle cx="100" cy="105" r="26" fill="#FDDCB5" />

      {/* 머리카락 */}
      <path
        d="M76 98c0-14 10.7-26 24-26s24 12 24 26c0 2-0.3 3.8-0.8 5.5C121.5 96 111.5 90 100 90s-21.5 6-23.2 13.5c-0.5-1.7-0.8-3.5-0.8-5.5z"
        fill="#5D4037"
      />

      {/* 모자 — 밀짚모자 */}
      <ellipse cx="100" cy="82" rx="34" ry="8" fill="#D4A76A" />
      <path
        d="M82 82c0-12 8-22 18-22s18 10 18 22"
        fill="#E8C07A"
      />
      <path
        d="M80 82.5c0 0 6 2 20 2s20-2 20-2"
        stroke="#C49A5C"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 눈 */}
      <circle cx="92" cy="104" r="2.5" fill="#4A3728" />
      <circle cx="108" cy="104" r="2.5" fill="#4A3728" />

      {/* 미소 */}
      <path
        d="M94 113c2.5 3 9.5 3 12 0"
        stroke="#4A3728"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* 볼 홍조 */}
      <circle cx="87" cy="110" r="4" fill="#F4A0A0" opacity="0.35" />
      <circle cx="113" cy="110" r="4" fill="#F4A0A0" opacity="0.35" />

      {/* 셔츠 / 상의 — 체크패턴 느낌 */}
      <path
        d="M70 155c0-16.6 13.4-30 30-30s30 13.4 30 30v5H70v-5z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d="M100 125v25M85 140h30"
        stroke="white"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* 왼팔 — 체크리스트 들고 있는 손 */}
      <rect x="125" y="130" width="32" height="42" rx="4" fill="white" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />
      {/* 체크리스트 항목들 */}
      <rect x="130" y="137" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <path d="M131 140l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <rect x="138" y="138" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.15" />

      <rect x="130" y="147" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <path d="M131 150l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      <rect x="138" y="148" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.15" />

      <rect x="130" y="157" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <rect x="138" y="158" width="14" height="2.5" rx="1" fill="currentColor" opacity="0.1" />

      {/* 손 */}
      <circle cx="126" cy="148" r="6" fill="#FDDCB5" />

      {/* 새싹 — 오른쪽 하단 */}
      <g transform="translate(55, 170)">
        <path d="M8 20V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
        <path d="M8 14c-5-2-7-7-6-12 5 1 9 5 6 12z" fill="currentColor" opacity="0.2" />
        <path d="M8 10c5-2 7-7 6-12-5 1-9 5-6 12z" fill="currentColor" opacity="0.25" />
      </g>
    </svg>
  );
}
