/**
 * 공용 포맷 유틸리티
 * - 지역 통계, 모달 등에서 공통으로 사용하는 포맷 함수
 */

/** 인구수를 "123,456명" 형식으로 포맷 (정확한 숫자 표시) */
export function formatPopulation(pop: number): string {
  return `${pop.toLocaleString()}명`;
}

/** 서울 면적 기준 상수 (km²) */
export const SEOUL_AREA_KM2 = 605;

/**
 * 작물 수익 문자열을 1,000평 환산 라벨로 변환.
 *
 * 입력 예시:
 *  - "10a당 약 1,259만 원 (시설재배 기준)"
 *  - "10a당 약 95~125만 원 (가을~봄감자 기준)"
 *  - "10a당 약 548~705만 원 (노지~시설재배 기준)"
 *  - "1ha당 약 4,000~8,000만 원 (추정, 공식 소득통계 미등재)"
 *  - "10a당 약 563만 원 (4년근 1기작 합계, 연평균 약 141만 원)"
 *
 * 환산 규칙:
 *  - 1ha = 10 × 10a → 10a로 환산: ÷ 10
 *  - 1,000평 ≈ 33a (10a × 3.3) → 10a당 N만원 × 3.3 ≈ 1,000평당 수익
 *  - range "N~M" → 평균 (N+M)/2 사용
 *
 * 파싱 실패 시 { value: null, label: 원본 } 반환.
 */
export function convertToPyeongLabel(revenueRange: string): {
  value: number | null;
  label: string;
} {
  if (!revenueRange) return { value: null, label: revenueRange };

  // 단위 판정: "1ha당" → 10으로 나눠 10a 기준으로 통일
  const isHectare = /1\s*ha\s*당/.test(revenueRange);
  const isAre = /10\s*a\s*당/.test(revenueRange);
  if (!isHectare && !isAre) {
    return { value: null, label: revenueRange };
  }

  // 첫 번째 숫자 또는 "숫자~숫자" 패턴 추출 (콤마 제거 후)
  // 예: "약 1,259만 원" → 1259, "약 95~125만 원" → 95~125
  // "(연평균 약 141만 원)" 등 괄호 안 보조 수치는 제외하기 위해
  // "10a당" 또는 "1ha당" 직후의 첫 "약 N만 원" 패턴만 매칭한다.
  const headPattern = isHectare
    ? /1\s*ha\s*당[^\d]*?([\d,]+)(?:\s*~\s*([\d,]+))?\s*만\s*원/
    : /10\s*a\s*당[^\d]*?([\d,]+)(?:\s*~\s*([\d,]+))?\s*만\s*원/;
  const m = revenueRange.match(headPattern);
  if (!m) return { value: null, label: revenueRange };

  const lo = Number(m[1].replace(/,/g, ""));
  const hi = m[2] ? Number(m[2].replace(/,/g, "")) : lo;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { value: null, label: revenueRange };
  }

  // 10a 기준 평균 만원
  const avgPer10a = isHectare ? (lo + hi) / 2 / 10 : (lo + hi) / 2;
  // 1,000평 ≈ 33a → 10a × 3.3
  const per1000Pyeong = Math.round(avgPer10a * 3.3);

  // 천 단위 콤마
  const formatted = per1000Pyeong.toLocaleString();
  return {
    value: per1000Pyeong,
    label: `1,000평당 약 ${formatted}만원`,
  };
}

/** "2026-05-15" → "2026. 5. 15 (금)" */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()} (${dayNames[d.getDay()]})`;
}

/** "2026-05-15" ~ "2026-05-20" → formatted range (같은 달이면 간략 표시) */
export function formatDateRange(start: string, end: string | null): string {
  if (!end) return formatDate(start);
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    return `${s.getFullYear()}. ${s.getMonth() + 1}. ${s.getDate()} ~ ${e.getDate()} (${dayNames[e.getDay()]})`;
  }
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}
