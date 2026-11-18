/**
 * §6 의존성 보안 — 회장이 기한을 정해 보류한 공지(advisory) 판정. check-repo-signals.ts 가 쓴다(테스트가 import).
 *
 * 임계값을 올리면 새 취약점까지 가려진다. 대신 '공지 1건 + 기한'만 보류하고, 패키지에서 닿는
 * high·critical 공지가 전부 보류 목록 안일 때만 그 패키지를 세지 않는다. 기한이 지나면 저절로 다시 울린다.
 */

export interface AuditAck {
  /** GitHub advisory URL (npm audit via[].url) */
  advisory: string;
  /** 이 날(KST, 포함)까지 보류 */
  until: string;
  reason: string;
}

export interface AuditVia {
  url?: string;
  severity?: string;
}

export interface AuditVuln {
  severity?: string;
  via?: (string | AuditVia)[];
}

/**
 * 2026-11-18 회장 B안 — @sentry/nextjs 빌드 플러그인(@rollup/plugin-commonjs) 경유 picomatch ReDoS.
 * 빌드 때 우리 경로 패턴에만 쓰여 사용자 요청이 닿지 않는다. 고치려면 @sentry/nextjs 10 → 11 메이저 업그레이드라
 * 12/1 M7 판정 뒤 정기 점검에서 올린다. 기한이 지나면 §6 🟡 가 다시 뜬다.
 */
export const AUDIT_ACKS: AuditAck[] = [
  {
    advisory: "https://github.com/advisories/GHSA-fc5q-39xc-vjpf",
    until: "2026-12-15",
    reason: "picomatch ReDoS — @sentry/nextjs 빌드 플러그인 경유, 12/1 판정 뒤 Sentry 11 업그레이드",
  },
];

const SERIOUS = new Set(["high", "critical"]);

/** 패키지에서 닿는 high·critical 공지 URL 전부 */
function seriousAdvisories(name: string, vulns: Record<string, AuditVuln>, seen = new Set<string>()): Set<string> {
  const out = new Set<string>();
  if (seen.has(name)) return out;
  seen.add(name);
  for (const v of vulns[name]?.via ?? []) {
    if (typeof v === "string") {
      for (const u of seriousAdvisories(v, vulns, seen)) out.add(u);
    } else if (v.url && SERIOUS.has(v.severity ?? "")) {
      out.add(v.url);
    } else if (!v.url && SERIOUS.has(v.severity ?? "")) {
      out.add("(url 없는 공지)"); // 판정 불가 → 보류하지 않는다
    }
  }
  return out;
}

/** 보류 대상 패키지 — 닿는 high·critical 공지가 1건 이상이고 전부 유효한 보류 목록 안 */
export function ackedPackages(vulns: Record<string, AuditVuln>, acks: AuditAck[], today: string): Set<string> {
  const active = new Set(acks.filter((a) => a.until >= today).map((a) => a.advisory));
  const out = new Set<string>();
  for (const name of Object.keys(vulns)) {
    const adv = seriousAdvisories(name, vulns);
    if (adv.size > 0 && [...adv].every((u) => active.has(u))) out.add(name);
  }
  return out;
}
