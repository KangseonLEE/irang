/**
 * 개인정보 처리방침 /privacy (2026-10-17 시행, 보안 QA 🟡9).
 *
 * - 페이지가 h1 하나·공유 메타·색인 허용으로 렌더된다
 * - 진입점(푸터·약관·오류 화면)과 사이트맵에 연결돼 있다
 * - 처리방침이 적은 브라우저 저장 키·외부 서비스가 코드에 실제로 있다 — 코드에서 사라지면(또는 이름이 바뀌면)
 *   이 테스트가 깨져 문장을 같이 고치게 한다
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import PrivacyPage, { metadata } from "@/app/privacy/page";

const SRC = join(process.cwd(), "src");
const read = (p: string) => readFileSync(join(SRC, p), "utf8");

describe("/privacy 페이지", () => {
  const html = renderToStaticMarkup(<PrivacyPage />);

  it("h1 하나, 시행일, 연락처", () => {
    expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
    expect(html).toContain("개인정보 처리방침");
    expect(html).toContain("시행일: 2026년 10월 17일");
    expect(html).toContain("mailto:loyal3270@gmail.com");
  });

  it("사실 문장 — 성능 추적·로그인 기록 정리·쿠키·해시·외부 요청·국외 이전 칸", () => {
    expect(html).toContain("페이지 이동의 약 10%");
    expect(html).toContain("다음 로그인 시도가 있을 때 24시간 지난 기록을 함께 지워요");
    expect(html).toContain("요청할 때마다 이랑 서버로 함께 가고");
    expect(html).toContain("되돌리기 어려운 해시(비공개 키를 섞은 SHA-256)");
    expect(html).not.toContain("암호화한");
    expect(html).toContain("jsDelivr");
    expect(html).toContain("이전 방법:");
    expect(html).toContain("보유 기간:");
    expect(html.match(/이전 국가:/g)?.length).toBe(7);
    // Supabase 국가는 상수 하나로 — 회장 확인 뒤 채운다
    expect(read("app/privacy/page.tsx").match(/SUPABASE_DATA_COUNTRY = "/g)?.length).toBe(1);
  });

  it("오류 보고 안내 앵커가 있다 (오류 화면 링크 대상)", () => {
    expect(html).toContain('id="error-report"');
    expect(html).toContain('id="collect"');
  });

  it("공유 메타 헬퍼 사용 · noindex 아님", () => {
    expect(metadata.alternates?.canonical).toBe("/privacy");
    expect(metadata.robots).toBeUndefined();
    expect(read("app/privacy/page.tsx")).toMatch(/\bpageMetadata\(/);
  });

  it("'~합니다' 톤을 쓰지 않는다", () => {
    const text = html.replace(/<[^>]+>/g, " ");
    expect(text).not.toMatch(/합니다|입니다/);
  });
});

describe("진입점·사이트맵", () => {
  it("푸터·약관·오류 화면이 /privacy 로 연결된다", () => {
    expect(read("components/layout/footer.tsx")).toContain('href="/privacy"');
    expect(read("app/terms/page.tsx")).toContain('href="/privacy"');
    expect(read("components/error/page-error.tsx")).toContain('href="/privacy#error-report"');
  });

  it("사이트맵 core 에 /privacy", () => {
    expect(read("app/sitemap.ts")).toContain('page("/privacy"');
  });
});

describe("처리방침에 적은 사실이 코드에 있다", () => {
  it.each([
    ["components/search/search-bar.tsx", '"irang-recent-searches"'],
    ["components/search/search-bar.tsx", "MAX_RECENT = 10"],
    ["lib/diagnosis/history.ts", '"irang_assess_history"'],
    ["lib/diagnosis/history.ts", "HISTORY_MAX_ITEMS = 5"],
    ["components/landing/promo-popup.tsx", "irang:promo:"],
    ["lib/analytics-gate.ts", '"irang-internal"'],
    ["lib/admin/login-throttle.ts", "RETENTION_MS = 24 * 60 * 60_000"],
    ["app/api/search-log/route.ts", "insert({ query: trimmed, result_count: count })"],
    ["components/error/error-report-button.tsx", "showName: false"],
    ["components/error/error-report-button.tsx", "isEmailRequired: false"],
    ["instrumentation-client.ts", "maskAllInputs: true"],
    // Sentry 성능 추적 — 오류와 무관하게 이동의 10% (처리방침 6항)
    ["instrumentation-client.ts", "tracesSampleRate: REPORTABLE ? 0.1 : 0"],
    ["instrumentation-client.ts", "replaysOnErrorSampleRate: REPORTABLE ? 0.1 : 0"],
    ["../sentry.server.config.ts", "tracesSampleRate: IS_PUBLIC_PRODUCTION ? 0.1 : 0"],
    ["../sentry.edge.config.ts", "tracesSampleRate: IS_PUBLIC_PRODUCTION ? 0.1 : 0"],
    // 로그인 시도 기록은 다음 시도 때 정리(정기 삭제 없음, 3항)
    ["lib/admin/login-throttle.ts", '.lt("attempted_at", new Date(now - RETENTION_MS).toISOString())'],
    // 운영자 표식 쿠키를 서버가 읽는다(4항)
    ["lib/internal-traffic.ts", "INTERNAL_TRAFFIC_COOKIE"],
    // IP 해시 = salt 섞은 SHA-256 (2·8항)
    ["lib/community/ip-hash.ts", 'createHash("sha256").update(`${ip}|${salt}`)'],
    // 브라우저가 직접 불러오는 제3자 (6항)
    ["app/layout.tsx", "cdn.jsdelivr.net"],
    ["components/youth-cases/youth-case-cards.tsx", "img.youtube.com"],
    // quick_feedback 저장 칸 (1항)
    ["app/api/quick-feedback/route.ts", "persona: safePersona,"],
    ["app/api/quick-feedback/route.ts", "recommendation_id: safeRecommendationId,"],
  ])("%s — %s", (file, needle) => {
    expect(read(file)).toContain(needle);
  });
});
