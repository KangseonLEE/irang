import a from "./illustrations.module.css";

/**
 * 지원사업 일러스트 — 서류, 동전, 체크마크가 있는 지원 장면
 * SVG transform으로 위치 지정, CSS 애니메이션은 상대적 효과만 적용
 */
export function ProgramIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 배경 */}
      <rect width="400" height="320" rx="16" fill="#F0F4FF" />

      {/* 장식 원형 패턴 */}
      <circle cx="50" cy="50" r="30" fill="#1B6B5A" opacity="0.06" />
      <circle cx="350" cy="270" r="45" fill="#C8860A" opacity="0.06" />
      <circle cx="340" cy="50" r="20" fill="#1B6B5A" opacity="0.08" />

      {/* 메인 문서 */}
      <g transform="translate(80, 50)">
        <rect x="8" y="8" width="140" height="180" rx="12" fill="#000" opacity="0.05" />
        <rect x="0" y="0" width="140" height="180" rx="12" fill="#fff" />
        <rect x="0" y="0" width="140" height="180" rx="12" stroke="#E5E7EB" strokeWidth="1.5" fill="none" />
        <rect x="0" y="0" width="140" height="36" rx="12" fill="#1B6B5A" />
        <rect x="0" y="18" width="140" height="18" fill="#1B6B5A" />
        <rect x="16" y="12" width="60" height="4" rx="2" fill="#fff" opacity="0.8" />
        <rect x="16" y="20" width="40" height="3" rx="1.5" fill="#fff" opacity="0.5" />
        <rect x="16" y="48" width="108" height="4" rx="2" fill="#E5E7EB" />
        <rect x="16" y="60" width="90" height="4" rx="2" fill="#E5E7EB" />
        <rect x="16" y="72" width="100" height="4" rx="2" fill="#E5E7EB" />
        <rect x="16" y="84" width="70" height="4" rx="2" fill="#E5E7EB" />
        {/* 체크리스트 */}
        <rect x="16" y="104" width="12" height="12" rx="3" fill="#1B6B5A" opacity="0.15" />
        <path d="M19 110 L22 113 L26 107" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="34" y="107" width="70" height="4" rx="2" fill="#D1D5DB" />
        <rect x="16" y="124" width="12" height="12" rx="3" fill="#1B6B5A" opacity="0.15" />
        <path d="M19 130 L22 133 L26 127" stroke="#1B6B5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="34" y="127" width="60" height="4" rx="2" fill="#D1D5DB" />
        <rect x="16" y="144" width="12" height="12" rx="3" fill="#C8860A" opacity="0.15" />
        <rect x="34" y="147" width="80" height="4" rx="2" fill="#D1D5DB" />
        {/* 도장 */}
        <g transform="translate(85, 100)">
          <circle cx="22" cy="22" r="22" fill="#1B6B5A" opacity="0.1" />
          <circle cx="22" cy="22" r="16" fill="none" stroke="#1B6B5A" strokeWidth="2" opacity="0.3" />
          <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1B6B5A" opacity="0.4">OK</text>
        </g>
      </g>

      {/* 동전 스택 */}
      <g transform="translate(270, 120)">
        <ellipse cx="40" cy="140" rx="36" ry="12" fill="#C8860A" opacity="0.2" />
        <ellipse cx="40" cy="130" rx="36" ry="12" fill="#F5C542" opacity="0.5" />
        <rect x="4" y="118" width="72" height="12" fill="#F5C542" opacity="0.5" />
        <ellipse cx="40" cy="118" rx="36" ry="12" fill="#F5C542" opacity="0.7" />
        <rect x="4" y="106" width="72" height="12" fill="#F5C542" opacity="0.7" />
        <ellipse cx="40" cy="106" rx="36" ry="12" fill="#F5C542" opacity="0.85" />
        <rect x="4" y="94" width="72" height="12" fill="#F5C542" opacity="0.85" />
        <ellipse cx="40" cy="94" rx="36" ry="12" fill="#F5C542" />
        <ellipse cx="40" cy="94" rx="26" ry="8" fill="#C8860A" className={a.coinShine} />
        <text x="40" y="98" textAnchor="middle" fontSize="12" fontWeight="700" fill="#C8860A" opacity="0.5">{"\u20A9"}</text>
      </g>

      {/* 작은 문서 */}
      <g transform="translate(240, 40)">
        <rect x="0" y="0" width="80" height="60" rx="8" fill="#fff" />
        <rect x="0" y="0" width="80" height="60" rx="8" stroke="#E5E7EB" strokeWidth="1" fill="none" />
        <rect x="10" y="10" width="40" height="3" rx="1.5" fill="#1B6B5A" opacity="0.4" />
        <rect x="10" y="18" width="60" height="3" rx="1.5" fill="#E5E7EB" />
        <rect x="10" y="26" width="50" height="3" rx="1.5" fill="#E5E7EB" />
        <rect x="10" y="38" width="24" height="12" rx="4" fill="#1B6B5A" opacity="0.15" />
        <text x="22" y="47" textAnchor="middle" fontSize="7" fontWeight="600" fill="#1B6B5A" opacity="0.6">신청</text>
      </g>

      {/* 체크 배지: 바깥 위치, 안쪽 펄스 */}
      <g transform="translate(310, 180)">
        <g className={a.checkPulse}>
          <circle cx="24" cy="24" r="24" fill="#1B6B5A" />
          <path d="M14 24 L21 31 L34 17" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* 화살표 */}
      <path d="M230 160 Q250 150, 265 155" stroke="#1B6B5A" strokeWidth="2" strokeDasharray="4 3" opacity="0.3" fill="none" markerEnd="url(#arrowGreen)" />
      <defs>
        <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6Z" fill="#1B6B5A" opacity="0.3" />
        </marker>
      </defs>

      {/* 별: 바깥 위치, 안쪽 깜빡임 */}
      <g transform="translate(180, 260)">
        <g className={a.starTwinkle}>
          <path d="M8 0 L10 6 L16 8 L10 10 L8 16 L6 10 L0 8 L6 6Z" fill="#F5C542" />
        </g>
      </g>
      <g transform="translate(340, 100)">
        <g className={a.starTwinkle2}>
          <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5Z" fill="#C8860A" />
        </g>
      </g>
    </svg>
  );
}
