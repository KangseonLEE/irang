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
  ])("%s — %s", (file, needle) => {
    expect(read(file)).toContain(needle);
  });
});
