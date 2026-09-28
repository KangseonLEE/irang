import { describe, it, expect } from "vitest";
import { isSearchShortcut, detectMac, shortcutLabel } from "@/lib/hooks/use-search-shortcut";

describe("통합검색 단축키 (9/29)", () => {
  it("mac 은 ⌘K 로 열린다", () => {
    expect(isSearchShortcut({ key: "k", metaKey: true }, true)).toBe(true);
    expect(isSearchShortcut({ key: "K", metaKey: true }, true)).toBe(true); // Shift 동반 대문자
  });

  it("윈도우·리눅스는 Ctrl+K 로 열린다 (Win+K 는 OS 가 선점)", () => {
    expect(isSearchShortcut({ key: "k", ctrlKey: true }, false)).toBe(true);
  });

  it("mac 에서 Ctrl+K, 그 외에서 ⌘K 는 무시한다", () => {
    expect(isSearchShortcut({ key: "k", ctrlKey: true }, true)).toBe(false);
    expect(isSearchShortcut({ key: "k", metaKey: true }, false)).toBe(false);
    expect(isSearchShortcut({ key: "j", metaKey: true }, true)).toBe(false);
    expect(isSearchShortcut({ key: "k" }, true)).toBe(false);
  });

  it("IME 조합 중에는 무시한다", () => {
    expect(isSearchShortcut({ key: "k", metaKey: true, isComposing: true }, true)).toBe(false);
    expect(isSearchShortcut({ key: "k", ctrlKey: true, keyCode: 229 }, false)).toBe(false);
  });

  it("플랫폼 판정과 표기", () => {
    expect(detectMac({ platform: "MacIntel", userAgent: "" })).toBe(true);
    expect(detectMac({ platform: "Win32", userAgent: "" })).toBe(false);
    expect(shortcutLabel(false, true)).toBe(""); // 마운트 전 — 폭만 예약
    expect(shortcutLabel(true, true)).toBe("⌘K");
    expect(shortcutLabel(true, false)).toBe("Ctrl K");
  });
});
