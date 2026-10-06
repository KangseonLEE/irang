/**
 * 의료기관 유형 칩 → 심평원 종별(clCdNm) 묶음 (10/6 QA1). 칩끼리 겹치지 않는다.
 *
 * 종전 포함 매칭은 "병원" 칩에 종합병원·요양병원·치과병원·한방병원이, "의원" 칩에 치과의원·한의원이
 * 섞였다. 목록에 없는 종별(조산원 등)은 "전체"에서만 보인다.
 * `"use client"` 모듈(medical-modal)에서는 컴포넌트만 내보낸다는 규칙(9/17) 때문에 따로 둔다.
 */
const TYPE_GROUPS: Readonly<Record<string, readonly string[]>> = {
  상급종합: ["상급종합"],
  종합병원: ["종합병원"],
  병원: ["병원", "요양병원", "정신병원"],
  의원: ["의원"],
  한방: ["한방병원", "한의원"],
  치과: ["치과병원", "치과의원"],
  보건: ["보건소", "보건지소", "보건진료소", "보건의료원"],
};

/** 항목 종별이 칩(필터 값)에 속하는가 — 묶음에 없는 값은 포함 매칭으로 */
export function matchesMedicalType(itemType: string, filterValue: string): boolean {
  const group = TYPE_GROUPS[filterValue];
  return group ? group.includes(itemType.trim()) : itemType.includes(filterValue);
}
