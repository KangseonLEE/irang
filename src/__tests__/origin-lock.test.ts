/**
 * 오리진 잠금 판정 고정 (2026-10-16 보안 QA 🔴1).
 *
 * 기본은 꺼짐 — 환경변수를 넣기 전에는 지금 동작이 한 줄도 바뀌지 않아야 한다.
 * 켜는 순서(log → enforce)와 예외(ACME·운영 외 호스트)를 판정 함수 수준에서 고정한다.
 */

import { describe, expect, it } from "vitest";
import {
  constantTimeEqual,
  countryForGeoBlock,
  decideOriginLock,
  isOriginLockEnforced,
  isProductionHost,
  originLockMode,
} from "@/lib/origin-lock";
import { getClientIp } from "@/lib/client-ip";

const SECRET = "a".repeat(32) + "b".repeat(32);
const OFF = {};
const LOG = { mode: "log", secret: SECRET };
const ENFORCE = { mode: "enforce", secret: SECRET };

const prod = (edgeHeader: string | null, pathname = "/about", host = "irangfarm.com") => ({
  host,
  pathname,
  edgeHeader,
});

describe("originLockMode", () => {
  it("미설정·알 수 없는 값은 off", () => {
    expect(originLockMode(OFF)).toBe("off");
    expect(originLockMode({ mode: "on", secret: SECRET })).toBe("off");
    expect(originLockMode({ mode: "ENFORCE ", secret: SECRET })).toBe("enforce");
  });

  it("시크릿이 비어 있으면 enforce 라도 off — 설정 실수로 사이트 전체가 403 이 되지 않는다", () => {
    expect(originLockMode({ mode: "enforce", secret: "" })).toBe("off");
    expect(originLockMode({ mode: "enforce", secret: "   " })).toBe("off");
    expect(decideOriginLock(prod(null), { mode: "enforce", secret: "" })).toEqual({
      action: "pass",
      reason: "off",
    });
  });
});

describe("decideOriginLock", () => {
  it("off(기본): 헤더가 없어도 통과", () => {
    expect(decideOriginLock(prod(null), OFF).action).toBe("pass");
  });

  it("log: 불일치는 log, 일치는 pass", () => {
    expect(decideOriginLock(prod(null), LOG)).toEqual({ action: "log", reason: "mismatch" });
    expect(decideOriginLock(prod("wrong"), LOG).action).toBe("log");
    expect(decideOriginLock(prod(SECRET), LOG)).toEqual({ action: "pass", reason: "ok" });
  });

  it("enforce: 불일치는 block, 일치는 pass", () => {
    expect(decideOriginLock(prod(null), ENFORCE)).toEqual({ action: "block", reason: "mismatch" });
    expect(decideOriginLock(prod(SECRET.slice(0, -1)), ENFORCE).action).toBe("block");
    expect(decideOriginLock(prod(SECRET + "x"), ENFORCE).action).toBe("block");
    expect(decideOriginLock(prod(SECRET), ENFORCE).action).toBe("pass");
    // www·포트·대소문자
    expect(decideOriginLock(prod(null, "/", "WWW.irangfarm.com:443"), ENFORCE).action).toBe("block");
  });

  it("ACME 챌린지 경로는 enforce 에서도 검사하지 않는다 (인증서 자기잠금 방지)", () => {
    expect(
      decideOriginLock(prod(null, "/.well-known/acme-challenge/tok123"), ENFORCE),
    ).toEqual({ action: "pass", reason: "exempt-path" });
    // 다른 .well-known 은 예외 아님
    expect(decideOriginLock(prod(null, "/.well-known/security.txt"), ENFORCE).action).toBe("block");
  });

  it("운영 호스트가 아닌 요청(미리보기 alias·localhost·dev 터널)은 검사하지 않는다", () => {
    for (const host of ["irang-abc.vercel.app", "localhost:3000", "dev.irangfarm.com", null]) {
      expect(decideOriginLock(prod(null, "/about", host as string), ENFORCE)).toEqual({
        action: "pass",
        reason: "non-production-host",
      });
    }
  });
});

describe("constantTimeEqual", () => {
  it("값이 같을 때만 true — 길이가 달라도·접두가 같아도 false", () => {
    expect(constantTimeEqual(SECRET, SECRET)).toBe(true);
    expect(constantTimeEqual("", SECRET)).toBe(false);
    expect(constantTimeEqual(SECRET.slice(0, 10), SECRET)).toBe(false);
    expect(constantTimeEqual(SECRET + "\0", SECRET)).toBe(false);
    expect(constantTimeEqual("abc", "abd")).toBe(false);
  });
});

describe("국가 판정 — enforce + 운영 호스트에서만 cf-ipcountry 를 신뢰", () => {
  it("off·log: 지금 동작 그대로 — 헤더가 없으면 null(차단하지 않음)", () => {
    expect(countryForGeoBlock("irangfarm.com", null, OFF)).toBeNull();
    expect(countryForGeoBlock("irangfarm.com", null, LOG)).toBeNull();
    expect(countryForGeoBlock("irangfarm.com", "US", OFF)).toBe("US");
    expect(countryForGeoBlock("irangfarm.com", "KR", LOG)).toBe("KR");
  });

  it("enforce + 운영 호스트: 헤더가 없으면 XX(= KR 외)", () => {
    expect(countryForGeoBlock("irangfarm.com", null, ENFORCE)).toBe("XX");
    expect(countryForGeoBlock("irangfarm.com", "  ", ENFORCE)).toBe("XX");
    expect(countryForGeoBlock("irangfarm.com", "KR", ENFORCE)).toBe("KR");
  });

  it("enforce 라도 운영 외 호스트는 지금 동작 (로컬·미리보기가 갑자기 503 이 되지 않는다)", () => {
    expect(countryForGeoBlock("localhost:3000", null, ENFORCE)).toBeNull();
  });

  it("isOriginLockEnforced / isProductionHost", () => {
    expect(isOriginLockEnforced("irangfarm.com", ENFORCE)).toBe(true);
    expect(isOriginLockEnforced("irangfarm.com", LOG)).toBe(false);
    expect(isOriginLockEnforced("x.vercel.app", ENFORCE)).toBe(false);
    expect(isProductionHost("www.irangfarm.com")).toBe(true);
    expect(isProductionHost("evil-irangfarm.com")).toBe(false);
  });
});

describe("getClientIp", () => {
  const withEnv = (env: Record<string, string | undefined>, fn: () => void) => {
    const prev = { m: process.env.ORIGIN_LOCK_MODE, s: process.env.ORIGIN_LOCK_SECRET };
    process.env.ORIGIN_LOCK_MODE = env.mode;
    process.env.ORIGIN_LOCK_SECRET = env.secret;
    try {
      fn();
    } finally {
      if (prev.m === undefined) delete process.env.ORIGIN_LOCK_MODE;
      else process.env.ORIGIN_LOCK_MODE = prev.m;
      if (prev.s === undefined) delete process.env.ORIGIN_LOCK_SECRET;
      else process.env.ORIGIN_LOCK_SECRET = prev.s;
    }
  };
  const req = (h: Record<string, string>) => ({ headers: new Headers(h) });

  it("x-vercel-forwarded-for → x-real-ip → x-forwarded-for 첫 값 순", () => {
    withEnv({}, () => {
      expect(
        getClientIp(req({ "x-vercel-forwarded-for": "1.1.1.1, 9.9.9.9", "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" })),
      ).toBe("1.1.1.1");
      expect(getClientIp(req({ "x-real-ip": "2.2.2.2", "x-forwarded-for": "3.3.3.3" }))).toBe("2.2.2.2");
      expect(getClientIp(req({ "x-real-ip": "", "x-forwarded-for": " 3.3.3.3 , 4.4.4.4" }))).toBe("3.3.3.3");
      expect(getClientIp(req({}))).toBe("unknown");
    });
  });

  it("잠금 enforce 전에는 cf-connecting-ip 를 믿지 않는다(직접 접속으로 위조 가능)", () => {
    withEnv({ mode: "log", secret: SECRET }, () => {
      expect(getClientIp(req({ host: "irangfarm.com", "cf-connecting-ip": "6.6.6.6", "x-real-ip": "2.2.2.2" }))).toBe("2.2.2.2");
    });
  });

  it("enforce + 운영 호스트면 cf-connecting-ip 우선", () => {
    withEnv({ mode: "enforce", secret: SECRET }, () => {
      expect(getClientIp(req({ host: "irangfarm.com", "cf-connecting-ip": "6.6.6.6", "x-real-ip": "2.2.2.2" }))).toBe("6.6.6.6");
      expect(getClientIp(req({ host: "x.vercel.app", "cf-connecting-ip": "6.6.6.6", "x-real-ip": "2.2.2.2" }))).toBe("2.2.2.2");
    });
  });
});
