/**
 * sync-crawl 수집 중단(disabled) 타깃 — 2026-10-06 agrix 중단
 *
 * agrix 사업지침이 농업e지로 이관돼 상세 주소(lawFullView.do)가 응답하지 않고, 목록은 2026 0건·2025 폴백은
 * 전부 마감이다. 게다가 refresh=true 실행이면 mapAgrixItem 이 DB 에서 고친 원문 주소를 옛 주소로 되돌린다.
 * 그래서 타깃을 끄되, sync-data.yml matrix 가 타깃 id 를 직접 부르므로 목록에서 지우지는 않는다
 * (지우면 매일 HTTP 400 "Unknown target" → 워크플로 빨강).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CRAWL_TARGETS,
  selectCrawlTargets,
} from "../../supabase/functions/_shared/crawl-utils";

describe("selectCrawlTargets — 중단 타깃 처리", () => {
  it("agrix-programs 는 2026-10-06 부터 중단 상태", () => {
    const agrix = CRAWL_TARGETS.find((t) => t.id === "agrix-programs");
    expect(agrix?.disabled?.since).toBe("2026-10-06");
    expect(agrix?.disabled?.reason).toMatch(/농업e지/);
  });

  it("all 실행은 중단 타깃을 빼고 나머지를 전부 돈다", () => {
    const { run, disabled } = selectCrawlTargets("all");
    expect(run.map((t) => t.id)).not.toContain("agrix-programs");
    expect(run).toHaveLength(CRAWL_TARGETS.filter((t) => !t.disabled).length);
    expect(disabled).toEqual([]);
  });

  it("중단 타깃 단독 호출은 실행 목록이 비고 disabled 로 돌아온다 (원천 요청·DB 쓰기 없음)", () => {
    const { run, disabled } = selectCrawlTargets("agrix-programs");
    expect(run).toEqual([]);
    expect(disabled.map((t) => t.id)).toEqual(["agrix-programs"]);
  });

  it("살아 있는 타깃 단독 호출은 그 타깃 하나만", () => {
    const { run, disabled } = selectCrawlTargets("rda-programs");
    expect(run.map((t) => t.id)).toEqual(["rda-programs"]);
    expect(disabled).toEqual([]);
  });

  it("모르는 id 는 둘 다 비어 호출부가 400 을 낸다", () => {
    expect(selectCrawlTargets("nope")).toEqual({ run: [], disabled: [] });
  });

  it("중단 사유 문구에 'error' 가 없다 — 워크플로가 본문의 error 를 실패로 볼 수 있어서", () => {
    for (const t of CRAWL_TARGETS.filter((x) => x.disabled)) {
      expect(JSON.stringify(t.disabled).toLowerCase()).not.toContain("error");
    }
  });
});

describe("sync-data.yml matrix ↔ CRAWL_TARGETS", () => {
  it("워크플로가 부르는 타깃 id 는 전부 함수 목록에 있다 (없으면 매일 HTTP 400)", () => {
    const yml = readFileSync(
      resolve(__dirname, "../../.github/workflows/sync-data.yml"),
      "utf8",
    );
    const block = yml.split(/\n\s*matrix:\s*\n/)[1] ?? "";
    const ids = [...block.matchAll(/^\s+-\s+([a-z0-9-]+)\s*$/gm)]
      .map((m) => m[1])
      // matrix 다음 steps 블록의 "- name:" 같은 항목은 형식이 달라 위 정규식에 걸리지 않는다
      .filter((id) => !id.includes(":"));
    expect(ids.length).toBeGreaterThan(0);
    const known = new Set(CRAWL_TARGETS.map((t) => t.id));
    for (const id of ids) expect(known.has(id), id).toBe(true);
  });
});
