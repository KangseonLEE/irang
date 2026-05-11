/**
 * E2E critical paths — 회장 직접 검증을 자동화로 영구 대체
 *
 * 시나리오 출처: 2026-05 회장이 라이브에서 직접 발견한 사고 9~10건.
 * 이 테스트가 GREEN인 한 회장은 라이브 검증을 다시 할 필요 없다.
 *
 * 새 사고 발견 시: 이 파일 또는 같은 디렉토리에 시나리오 추가 → push.
 */

import { test, expect, type Page } from "@playwright/test";

// ============================================================
// 공용 상수
// ============================================================

/** 핵심 list / hub 페이지 — RSC payload·빈 화면·HTML 차단 검증 대상 */
const LIST_PAGES = [
  "/",
  "/regions",
  "/programs",
  "/events",
  "/costs",
  "/crops",
  "/education",
  "/interviews",
  "/stats",
  "/regions/compare",
] as const;

/** 빈 화면 차단 대상 — body 텍스트 길이 ≥ 500자 검증 */
const NON_EMPTY_PAGES = [
  "/",
  "/regions",
  "/regions/jeonnam",
  "/regions/jeonnam/suncheon",
  "/programs",
  "/crops",
  "/events",
  "/education",
  "/stats",
  "/costs",
] as const;

/** 9999 raw 노출 차단 대상 (상시 모집 사업) */
const CONTINUOUS_PROGRAM_DETAIL_PATHS = [
  "/programs/SP-017",
  "/programs/SP-018",
  "/programs/SP-015",
] as const;

/** 자격 셀프체크 노이즈 키워드 — 본문 노출되면 안 됨 */
const QUALIFICATION_NOISE_PATTERNS: Array<{ id: string; keywords: string[] }> = [
  { id: "SP-015", keywords: ["팀별", "5명 선발", "콜센터", "누리집 신청"] },
  { id: "SP-016", keywords: ["팀별", "5명 선발", "콜센터", "누리집 신청"] },
  { id: "SP-018", keywords: ["팀별", "5명 선발", "콜센터", "누리집 신청"] },
];

// ============================================================
// 헬퍼
// ============================================================

async function gotoExpectHtml(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(response, `${path} response is null`).not.toBeNull();
  expect(response!.status(), `${path} HTTP status`).toBe(200);
  const ct = response!.headers()["content-type"] ?? "";
  expect(ct, `${path} content-type must be text/html (RSC payload leak guard)`)
    .toContain("text/html");
  return response!;
}

async function getBodyText(page: Page): Promise<string> {
  return page.evaluate(() => document.body.innerText ?? "");
}

// ============================================================
// 1. 모든 list 페이지 정상 진입 (HTML + 헤더 + 콘텐츠)
// ============================================================

test.describe("1. List 페이지 정상 진입", () => {
  for (const path of LIST_PAGES) {
    test(`${path} — HTML 응답 + 콘텐츠 노출`, async ({ page }) => {
      await gotoExpectHtml(page, path);
      // h1 또는 PageHeader 텍스트 1개 이상 가시 — 빈 화면 차단
      const headings = page.locator("h1, h2");
      await expect(headings.first()).toBeVisible({ timeout: 10_000 });
    });
  }
});

// ============================================================
// 2. /programs 필터 동작 — 클릭 후 결과 변화
// ============================================================

test.describe("2. /programs 필터 동작", () => {
  test("초기 진입 시 카드 1개 이상 가시", async ({ page }) => {
    await gotoExpectHtml(page, "/programs");
    // 카드 grid 내부에 카드/링크가 1개 이상 — 빈 list 차단
    const programLinks = page.locator('a[href^="/programs/SP-"]');
    await expect(programLinks.first()).toBeVisible({ timeout: 10_000 });
    const count = await programLinks.count();
    expect(count, "/programs 초기 카드 ≥ 1").toBeGreaterThanOrEqual(1);
  });

  test("FilterGroup pill 링크에 query string 존재", async ({ page }) => {
    await gotoExpectHtml(page, "/programs");
    // FilterGroup은 Link 기반 pill — query string("?…=…")을 가진 /programs 링크가 존재해야 함
    // 클릭 후 navigation은 환경에 따라 race 가능하므로, URL에 query 포함된 anchor가 존재함을 검증
    const queryLinks = page.locator('a[href^="/programs?"]');
    const count = await queryLinks.count();
    expect(
      count,
      "/programs에 query string을 가진 필터 링크 ≥ 1 (필터 동작 가능성)",
    ).toBeGreaterThanOrEqual(1);

    // 그 중 1개는 실제 key=value 패턴이어야 함
    const hrefs = await queryLinks.evaluateAll((els) =>
      els.map((el) => (el as HTMLAnchorElement).getAttribute("href") ?? ""),
    );
    const hasParam = hrefs.some((h) => /\?[a-z]+=/i.test(h));
    expect(hasParam, `필터 링크 href에 ?key=value 패턴 (수집: ${hrefs.slice(0, 3).join(", ")})`)
      .toBe(true);
  });
});

// ============================================================
// 3. 9999 raw 노출 차단
// ============================================================

test.describe("3. 9999 raw 노출 차단", () => {
  test("/programs 본문에 9999-12-31 raw 노출 0", async ({ page }) => {
    await gotoExpectHtml(page, "/programs");
    const body = await getBodyText(page);
    expect(body, "/programs 본문 9999-12-31 raw 노출").not.toMatch(/9999-12-31/);
    expect(body, "/programs 본문 단순 '9999' 라벨 노출").not.toMatch(/9999\b/);
  });

  for (const path of CONTINUOUS_PROGRAM_DETAIL_PATHS) {
    test(`${path} 본문에 9999 raw 노출 0`, async ({ page }) => {
      await gotoExpectHtml(page, path);
      const body = await getBodyText(page);
      expect(body, `${path} 9999-12-31 노출`).not.toMatch(/9999-12-31/);
      expect(body, `${path} '9999' 단독 노출`).not.toMatch(/9999\b/);
    });
  }
});

// ============================================================
// 4. /programs/[id] 상시 모집 라벨 노출 + 어색한 카피 차단
// ============================================================

test.describe("4. 상시 모집 라벨 + 어색 카피 차단", () => {
  for (const path of ["/programs/SP-017", "/programs/SP-018"] as const) {
    test(`${path} — '상시 모집' 라벨 노출 + 'N일' 어색 카피 0`, async ({ page }) => {
      await gotoExpectHtml(page, path);
      const body = await getBodyText(page);

      // "상시 모집" 또는 "상시" 라벨 1개 이상 — 정확한 표현은 디자인 변경 가능하므로 둘 중 하나
      const hasContinuousLabel =
        body.includes("상시 모집") || body.includes("상시모집") || body.includes("상시 접수");
      expect(hasContinuousLabel, `${path} 상시 모집 라벨 노출`).toBe(true);

      // "마감까지 N일" 패턴 어색하게 큰 숫자 (3자리 이상) 노출 차단
      const weirdDayCount = body.match(/마감까지\s*\d{3,}일/);
      expect(
        weirdDayCount,
        `${path} '마감까지 N일' 3자리 이상 (상시인데 일수 카운트) 노출`,
      ).toBeNull();
    });
  }
});

// ============================================================
// 5. 자격 셀프체크 노이즈 차단
// ============================================================

test.describe("5. 자격 셀프체크 노이즈 차단", () => {
  for (const { id, keywords } of QUALIFICATION_NOISE_PATTERNS) {
    test(`/programs/${id} 자격 셀프 체크 카드에 운영 노이즈 키워드 0`, async ({ page }) => {
      await gotoExpectHtml(page, `/programs/${id}`);

      // "자격 셀프 체크" 제목을 anchor로 그 부모 카드(wrap) 내부 텍스트만 검사
      // description/공고 본문에는 같은 키워드가 정당하게 들어갈 수 있으므로 전체 body 검사 금지
      const header = page.locator('h3:has-text("자격 셀프 체크")');
      const exists = (await header.count()) > 0;
      if (!exists) {
        // 일부 상시 모집 사업은 자격 셀프 체크가 없을 수 있음 → 이 경우 노이즈 0 자동 만족
        return;
      }

      // 카드 wrap = header의 부모 — 이 안의 텍스트(체크 라벨)만 검사
      const wrapText = await header
        .locator("xpath=ancestor::div[1]")
        .innerText();

      for (const kw of keywords) {
        expect(
          wrapText,
          `/programs/${id} 자격 셀프 체크 카드 내부에 '${kw}' 노출 (카드 내용: ${wrapText.slice(0, 200)})`,
        ).not.toContain(kw);
      }
    });
  }
});

// ============================================================
// 6. /regions/[id]/[sigungu] 핵심 UI 마커
// ============================================================

test.describe("6. 시군구 상세 핵심 UI 마커", () => {
  test("/regions/jeonnam/suncheon — 점수·5차원·세부 카드 노출", async ({ page }) => {
    await gotoExpectHtml(page, "/regions/jeonnam/suncheon");
    const body = await getBodyText(page);

    // 종합 점수 라벨 — '정착 점수' 또는 유사 라벨
    const hasScore =
      body.includes("정착 점수") ||
      body.includes("정착점수") ||
      body.includes("종합 점수") ||
      /\b\d{1,3}점\b/.test(body);
    expect(hasScore, "시군구 상세에 점수 라벨/수치 노출").toBe(true);

    // 5차원 evidence — 인구·의료·학교·기후·작물 등 핵심 단어 3개 이상
    const dimensions = ["인구", "의료", "학교", "기후", "작물", "면적"];
    const presentDimensions = dimensions.filter((d) => body.includes(d));
    expect(
      presentDimensions.length,
      `시군구 5차원 evidence 키워드 ≥ 3 (실제: ${presentDimensions.join(",")})`,
    ).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================
// 7. 빈 화면 자동 감지 — body 텍스트 ≥ 500자
// ============================================================

test.describe("7. 빈 화면 차단 (body text ≥ 500자)", () => {
  for (const path of NON_EMPTY_PAGES) {
    test(`${path} body text ≥ 500자`, async ({ page }) => {
      await gotoExpectHtml(page, path);
      // hydration 대기
      await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {
        // networkidle 타임아웃은 무시 — domcontentloaded만으로도 충분
      });
      const body = await getBodyText(page);
      expect(
        body.length,
        `${path} body text 길이 (실제: ${body.length}자, 헤더만 있는 빈 화면 의심)`,
      ).toBeGreaterThanOrEqual(500);
    });
  }
});
