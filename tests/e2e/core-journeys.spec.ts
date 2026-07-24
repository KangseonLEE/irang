/**
 * E2E core journeys — 핵심 3여정 완주 검증
 *
 * 회장 결재(2026-07-24 B안 sprint) 항목 4. 사용자가 실제로 밟는 3개 주요 여정을
 * end-to-end로 완주해 핵심 요소 존재를 assert한다. 외부 신청 URL은 href 존재만
 * 확인(실 fetch 금지 — 봇 차단·rate limit·flaky 회피).
 *
 *   ① 첫 방문 → /assess 진단 완주 → /match 결과 렌더
 *   ② /regions 탐색 → 시군구 상세 → /regions/compare
 *   ③ /programs 검색·필터 → 상세 → 외부 신청 링크 존재
 *
 * 관례: 기존 critical-paths.spec.ts와 동일하게 ./fixtures의 test/expect 사용
 * (GA·GTM 비콘 차단 fixture 자동 적용).
 */

import { test, expect, type Page } from "./fixtures";

async function gotoOk(page: Page, path: string) {
  const res = await page.goto(path, { waitUntil: "domcontentloaded" });
  expect(res, `${path} response null`).not.toBeNull();
  expect(res!.status(), `${path} HTTP status`).toBe(200);
  return res!;
}

// ============================================================
// ① 첫 방문 → /assess 진단 완주 → /match 결과 렌더
// ============================================================

test.describe("여정 ① 진단 완주 → 매칭 결과", () => {
  test("/assess 위저드 완주 후 /match 결과 렌더", async ({ page }) => {
    // 위저드는 스텝마다 400ms transition 가드가 있어 완주에 시간이 걸림 → 여유 부여
    test.setTimeout(90_000);
    await gotoOk(page, "/assess");

    // 위저드는 client 컴포넌트 — hydration 후 옵션 버튼이 나타날 때까지 대기.
    // 옵션 버튼은 위저드 본문(main) 안에만 — Header 검색/메뉴 버튼 제외.
    // 각 스텝의 네비 버튼('이전' back, '처음으로' reset)은 제외해야 초기화 루프에
    // 빠지지 않음. 남는 첫 버튼 = 실제 답변 옵션(A/B/C…).
    const optionSel = () =>
      page
        .locator('main button[type="button"]')
        .filter({ hasNotText: /이전|처음으로/ });
    await expect(optionSel().first()).toBeVisible({ timeout: 15_000 });

    // 완주 — 트랙 → 인구통계 → 진단 문항 순으로 자동 진행되며 결과 화면에서 종료.
    const resultMarker = page.getByText(/다시 진단하기/);
    let reached = false;
    for (let i = 0; i < 45; i++) {
      if (await resultMarker.isVisible().catch(() => false)) {
        reached = true;
        break;
      }
      const options = optionSel();
      const count = await options.count();
      if (count === 0) {
        // 전환 중일 수 있음 — 잠깐 대기 후 재확인
        await page.waitForTimeout(300);
        continue;
      }
      await options.first().click();
      // 스텝 transition 가드(400ms)보다 길게 대기해 클릭 유실 없이 1스텝씩 진행
      await page.waitForTimeout(480);
    }

    expect(reached, "위저드가 결과 화면에 도달").toBe(true);
    // 결과 핵심 요소: 총점 표기 + 상세 분석(추천 근거) 섹션 + 맞춤 지역 CTA
    await expect(page.getByText(/총점\s*\d+점/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/상세 분석/)).toBeVisible({ timeout: 10_000 });

    // '맞춤 지역 찾기' → /match deep link (진단 결과를 매칭으로 이어받음)
    const matchCta = page.getByRole("link", { name: /맞춤 지역 찾기/ });
    await expect(matchCta).toBeVisible();
    await matchCta.click();

    // /match 페이지가 진단 파라미터를 받아 매칭 위저드/게이트웨이를 정상 렌더
    // (experience·lifestyle 파라미터 → match 모드 진입). h1 + 콘텐츠 존재 검증.
    await page.waitForURL(/\/match(\?|$)/, { timeout: 10_000 });
    await expect(page.locator("main h1").first()).toBeVisible({ timeout: 10_000 });
    // 매칭 위저드/게이트웨이가 인터랙티브하게 렌더됨 (옵션 버튼 ≥ 1)
    await expect(
      page.locator('main button[type="button"]').first(),
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ============================================================
// ② /regions 탐색 → 시군구 상세 → /regions/compare
// ============================================================

test.describe("여정 ② 지역 탐색 → 시군구 상세 → 비교", () => {
  test("/regions → 시/도 → 시군구 상세 → /regions/compare 완주", async ({ page }) => {
    // 허브 진입
    await gotoOk(page, "/regions");
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // 시/도 페이지 (구표기 SSOT — jeonnam)
    await gotoOk(page, "/regions/jeonnam");
    // 시군구 링크 1개 이상 (탐색 가능). 지도 SVG·데스크탑 전용 리스트 등 숨겨진
    // 링크가 섞이므로 :visible로 실제 보이는 링크만 대상 (모바일에서 첫 링크가
    // 숨겨질 수 있음).
    const sigunguLinks = page.locator('a[href^="/regions/jeonnam/"]:visible');
    await expect(sigunguLinks.first()).toBeVisible({ timeout: 10_000 });
    expect(await sigunguLinks.count(), "전남 시군구 링크 ≥ 1").toBeGreaterThanOrEqual(1);

    // 실제 클릭으로 시군구 상세 진입
    await sigunguLinks.first().click();
    await page.waitForURL(/\/regions\/jeonnam\/[^/]+$/, { timeout: 10_000 });
    // 상세 핵심 마커: 정착 점수 수치 노출. 모바일에선 데스크탑용 숨김 노드가 섞여
    // getByText().first()가 숨김 요소를 잡을 수 있으므로, main textContent 기준으로
    // 점수 존재를 검증 (visibility 무관).
    await expect(page.locator("main")).toContainText(/\d{1,3}점/, {
      timeout: 10_000,
    });

    // 지역 비교 페이지
    await gotoOk(page, "/regions/compare");
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10_000 });
    // 비교 셀렉터(지역 선택 UI) 존재 — 보이는 인터랙티브 요소 1개 이상
    // (모바일에선 숨김 노드가 섞이므로 :visible로 실제 보이는 것만 대상)
    const compareUi = page.locator(
      "main button:visible, main input:visible, main select:visible",
    );
    await expect(compareUi.first()).toBeVisible({ timeout: 10_000 });
  });
});

// ============================================================
// ③ /programs 검색·필터 → 상세 → 외부 신청 링크
// ============================================================

test.describe("여정 ③ 지원사업 검색·필터 → 상세 → 외부 링크", () => {
  test("/programs 필터 후 상세 진입 + 외부 원문 링크 href 존재", async ({ page }) => {
    await gotoOk(page, "/programs");

    // 필터 적용 상태로도 카드가 남는 조합 — 마감 포함 전체 목록
    await gotoOk(page, "/programs?includeClosed=1");
    const programLinks = page.locator(
      'a[href^="/programs/"]:not([href^="/programs/roadmap"])',
    );
    await expect(programLinks.first()).toBeVisible({ timeout: 10_000 });
    expect(await programLinks.count(), "/programs 카드 ≥ 1").toBeGreaterThanOrEqual(1);

    // 상세 진입 (실제 클릭)
    await programLinks.first().click();
    await page.waitForURL(/\/programs\/[^/]+$/, { timeout: 10_000 });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });

    // 외부 신청/원문 링크: target=_blank 외부 http anchor href 존재 (fetch 안 함)
    const externalLinks = page.locator(
      'a[target="_blank"][href^="http"]',
    );
    expect(
      await externalLinks.count(),
      "지원사업 상세에 외부 원문/신청 링크 ≥ 1",
    ).toBeGreaterThanOrEqual(1);
    // href가 실제 http(s) URL인지 (빈/상대경로 아님)
    const href = await externalLinks.first().getAttribute("href");
    expect(href, "외부 링크 href 형식").toMatch(/^https?:\/\/.+/);
  });
});
