/**
 * program-status 회귀 테스트 (2026-06-02)
 *
 * 검증 목표:
 *   1) deriveStatus 기본 동작 (모집중/모집예정/마감/상시모집)
 *   2) ★ 9999 페어(공고 미발표) 처리 — B안 핵심:
 *        - deriveStatus는 타입 무변경 정책상 "모집예정"을 반환 (기존 동작 유지)
 *        - isUnannounced가 9999 페어를 정확히 식별
 *        - deriveStatusLabel은 9999 페어를 "공고 발표 예정"(format.ts SSOT)으로 표기
 *   3) end만 9999(상시모집)는 미발표가 아님 → "모집중"·"상시 모집" 유지
 *
 * 배경: deriveStatus가 start=end=9999 페어를 "모집예정"(앰버)으로 오표기 →
 *       StatusBadge·홈 추천 슬롯에 잘못 노출. format.ts SSOT("공고 발표 예정")와 정합 필요.
 */

import { describe, it, expect } from "vitest";
import {
  deriveStatus,
  deriveStatusLabel,
  isUnannounced,
  UNANNOUNCED_LABEL,
  ALWAYS_OPEN,
} from "@/lib/program-status";

const PAST = "2000-01-01";
const FUTURE = "2999-12-31";

describe("deriveStatus 기본 동작", () => {
  it("진행 중 기간이면 모집중", () => {
    expect(deriveStatus(PAST, FUTURE)).toBe("모집중");
  });

  it("시작 전이면 모집예정", () => {
    expect(deriveStatus(FUTURE, FUTURE)).toBe("모집예정");
  });

  it("종료 후면 마감", () => {
    expect(deriveStatus(PAST, PAST)).toBe("마감");
  });

  it("end가 ALWAYS_OPEN이고 시작했으면 상시 모집중", () => {
    expect(deriveStatus(PAST, ALWAYS_OPEN)).toBe("모집중");
  });

  it("end가 ALWAYS_OPEN이고 start만 없으면 모집중", () => {
    expect(deriveStatus(undefined, ALWAYS_OPEN)).toBe("모집중");
  });
});

describe("9999 페어(공고 미발표) — B안", () => {
  it("isUnannounced: start=end=9999면 true", () => {
    expect(isUnannounced(ALWAYS_OPEN, ALWAYS_OPEN)).toBe(true);
  });

  it("isUnannounced: end만 9999(상시)는 false", () => {
    expect(isUnannounced(PAST, ALWAYS_OPEN)).toBe(false);
  });

  it("isUnannounced: start만 9999는 false", () => {
    expect(isUnannounced(ALWAYS_OPEN, FUTURE)).toBe(false);
  });

  it("isUnannounced: 일반 날짜 페어는 false", () => {
    expect(isUnannounced(PAST, FUTURE)).toBe(false);
  });

  it("deriveStatus: 9999 페어는 타입 무변경 정책상 모집예정 유지", () => {
    // ProgramStatus 타입을 건드리지 않기 위해 deriveStatus 자체는 변경하지 않는다.
    expect(deriveStatus(ALWAYS_OPEN, ALWAYS_OPEN)).toBe("모집예정");
  });

  it("deriveStatusLabel: 9999 페어는 '공고 발표 예정'으로 표기 (format.ts SSOT 정합)", () => {
    expect(deriveStatusLabel(ALWAYS_OPEN, ALWAYS_OPEN)).toBe(UNANNOUNCED_LABEL);
    expect(UNANNOUNCED_LABEL).toBe("공고 발표 예정");
  });

  it("deriveStatusLabel: 9999 페어가 아니면 deriveStatus 결과 그대로", () => {
    expect(deriveStatusLabel(PAST, FUTURE)).toBe("모집중");
    expect(deriveStatusLabel(PAST, PAST)).toBe("마감");
    expect(deriveStatusLabel(PAST, ALWAYS_OPEN)).toBe("모집중");
  });
});

// ── 9/27: 연례 창구형 접수 시기 표기 (applicationCycle) ──
import { programStatusLabel, CYCLE_LABEL } from "@/lib/program-status";
import { formatApplicationPeriod } from "@/lib/format";

describe("applicationCycle — 9999 페어 표기", () => {
  it("시기 문구가 있으면 배지 '정기 접수' + 기간 자리엔 시기 문구", () => {
    const p = { status: "모집예정" as const, applicationStart: "9999-12-31", applicationEnd: "9999-12-31", applicationCycle: "매년 12월 시·군·구 접수" };
    expect(programStatusLabel(p)).toBe(CYCLE_LABEL);
    expect(formatApplicationPeriod(p.applicationStart, p.applicationEnd, p.applicationCycle)).toBe("매년 12월 시·군·구 접수");
  });
  it("시기 문구가 없으면 종전대로 '공고 발표 예정'", () => {
    const p = { status: "모집예정" as const, applicationStart: "9999-12-31", applicationEnd: "9999-12-31" };
    expect(programStatusLabel(p)).toBe("공고 발표 예정");
    expect(formatApplicationPeriod(p.applicationStart, p.applicationEnd)).toBe("공고 발표 예정");
  });
  it("실일자가 있으면 시기 문구가 있어도 실제 상태·기간", () => {
    const p = { status: "모집중" as const, applicationStart: "2026-01-01", applicationEnd: "9999-12-31", applicationCycle: "매년 1월" };
    expect(programStatusLabel(p)).toBe("모집중");
    expect(formatApplicationPeriod(p.applicationStart, p.applicationEnd, p.applicationCycle)).toBe("상시 모집");
  });
});

