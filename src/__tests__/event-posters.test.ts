/**
 * 행사 포스터(A안, 2026-10-08) 계약 테스트
 *
 * 1) EVENT_POSTERS 의 키는 실제 행사 id, 주소는 https·쿼리 없음, 크기·확인일 형식
 * 2) 포스터마다 next.config.ts images.remotePatterns 에 **그 파일 하나만** 여는 줄이 있다
 *    — 빠지면 next/image 가 400 을 내 카드가 빈 칸이 되고, 디렉터리째 열면 남의 CDN 이미지가 우리 최적화 한도로 변환된다
 * 3) getEventImage — 포스터 > 마을 사진 > 시·도 그림, allowPoster:false 면 포스터를 건너뛴다
 * 4) 출처 한 줄 — 보이는 이미지 종류에 맞춰 문장이 바뀐다
 * 5) 랜딩 '직접 가 보는 농촌' 카드는 글자를 사진 위에 얹으므로 포스터를 쓰지 않는다
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { EVENT_POSTERS } from "@/lib/data/event-posters";
import { EVENTS } from "@/lib/data/events";
import { eventImageCreditNote, getEventImage } from "@/lib/events/event-image";

interface ParsedPattern {
  hostname?: string;
  pathname?: string;
  search?: string;
}

/** next.config.ts 의 remotePatterns 배열을 글자로 읽어 객체마다 hostname·pathname·search 를 꺼낸다 */
function readRemotePatterns(): ParsedPattern[] {
  const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
  const start = config.indexOf("remotePatterns:");
  const end = config.indexOf("qualities:", start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  const block = config.slice(start, end);
  const objects = block.match(/\{[^{}]*\}/g) ?? [];
  const field = (obj: string, key: string) => obj.match(new RegExp(`${key}:\\s*"([^"]*)"`))?.[1];
  return objects.map((obj) => ({
    hostname: field(obj, "hostname"),
    pathname: field(obj, "pathname"),
    search: field(obj, "search"),
  }));
}

/** Next remotePatterns 와일드카드(`**` 여러 단, `*` 한 단)를 정규식으로 */
function globToRegExp(glob: string): RegExp {
  const escaped = glob.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*")}$`);
}

const STATIC_EVENT_IDS = new Set(EVENTS.map((e) => e.id));

describe("EVENT_POSTERS 데이터", () => {
  const entries = Object.entries(EVENT_POSTERS);

  it("적어도 한 건 있고, 키는 전부 실제 행사 id", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [id] of entries) expect(STATIC_EVENT_IDS.has(id), id).toBe(true);
  });

  it("주소는 https·쿼리 없음, 크기는 양의 정수, 확인일은 YYYY-MM-DD, 출처는 비어 있지 않다", () => {
    for (const [id, poster] of entries) {
      const url = new URL(poster.url);
      expect(url.protocol, id).toBe("https:");
      expect(url.search, id).toBe("");
      expect(Number.isInteger(poster.width) && poster.width > 0, id).toBe(true);
      expect(Number.isInteger(poster.height) && poster.height > 0, id).toBe(true);
      expect(poster.checkedAt, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(poster.credit.trim().length, id).toBeGreaterThan(0);
    }
  });

  it("포스터마다 next.config remotePatterns 에 그 파일 하나만 여는 줄이 있다", () => {
    const patterns = readRemotePatterns();
    for (const [id, poster] of entries) {
      const url = new URL(poster.url);
      const matched = patterns.filter(
        (p) =>
          p.hostname !== undefined &&
          globToRegExp(p.hostname).test(url.hostname) &&
          globToRegExp(p.pathname ?? "**").test(url.pathname),
      );
      expect(matched.length, `${id} — next.config.ts images.remotePatterns 에 ${url.hostname}${url.pathname} 를 넣는다`).toBeGreaterThan(0);
      for (const p of matched) {
        // 와일드카드 없이 정확한 파일 경로, 쿼리 문자열 금지
        expect(p.pathname, id).toBe(url.pathname);
        expect(p.hostname, id).toBe(url.hostname);
        expect(p.search, id).toBe("");
      }
    }
  });
});

describe("getEventImage — 포스터 우선순위", () => {
  const withPoster = EVENTS.find((e) => EVENT_POSTERS[e.id]);
  const withoutPoster = EVENTS.find((e) => !EVENT_POSTERS[e.id]);

  it("포스터가 있으면 마을 사진보다 먼저, 출처·alt·crop16x10 를 싣는다", () => {
    expect(withPoster).toBeDefined();
    const poster = EVENT_POSTERS[withPoster!.id];
    const img = getEventImage({
      ...withPoster!,
      imageUrl: "https://www.greendaero.go.kr/svc/common/board/img/att-abc.do",
    });
    expect(img.kind).toBe("poster");
    expect(img.src).toBe(poster.url);
    expect(img.isPhoto).toBe(true);
    expect(img.alt).toBe(`${withPoster!.title} 홍보 이미지`);
    expect(img.credit).toBe(`이미지: ${poster.credit}`);
    expect(img.crop16x10).toBe(poster.crop16x10 === true);
  });

  it("allowPoster:false 면 포스터를 건너뛰고 마을 사진 → 시·도 그림", () => {
    const photo = getEventImage(
      { ...withPoster!, imageUrl: "https://www.greendaero.go.kr/svc/common/board/img/att-abc.do" },
      { allowPoster: false },
    );
    expect(photo.kind).toBe("photo");
    const illustration = getEventImage({ ...withPoster!, imageUrl: undefined }, { allowPoster: false });
    expect(illustration.kind).toBe("illustration");
    expect(illustration.isPhoto).toBe(false);
    expect(illustration.credit).toBeUndefined();
  });

  it("포스터가 없는 행사·id 없는 호출은 종전대로", () => {
    expect(withoutPoster).toBeDefined();
    expect(getEventImage({ ...withoutPoster!, imageUrl: undefined }).kind).toBe("illustration");
    expect(getEventImage({ region: "경기도", title: "t" }).kind).toBe("illustration");
  });
});

describe("eventImageCreditNote — 목록 아래 출처 한 줄", () => {
  const poster = EVENTS.find((e) => EVENT_POSTERS[e.id])!;
  const plain = EVENTS.find((e) => !EVENT_POSTERS[e.id])!;
  const photo = { ...plain, imageUrl: "https://www.greendaero.go.kr/svc/common/board/img/att-abc.do" };
  const drawing = { ...plain, imageUrl: undefined };

  it("외부 원본이 하나도 없으면 문장 없음", () => {
    expect(eventImageCreditNote([drawing])).toBeNull();
    expect(eventImageCreditNote([])).toBeNull();
  });

  it("마을 사진만 / 포스터만 / 섞임 + 그림", () => {
    expect(eventImageCreditNote([photo])).toBe("마을 사진은 그린대로(농림축산식품부) 공고에서 가져왔어요.");
    expect(eventImageCreditNote([poster])).toBe("행사 포스터는 주최 측 누리집에서 가져왔어요.");
    expect(eventImageCreditNote([photo, { ...poster, imageUrl: undefined }, drawing])).toBe(
      "마을 사진은 그린대로(농림축산식품부) 공고에서 가져왔어요. 행사 포스터는 주최 측 누리집에서 가져왔어요. 사진이 없는 곳은 시·도 그림으로 대신해요.",
    );
  });
});

describe("랜딩 '직접 가 보는 농촌' 카드", () => {
  it("포스터를 쓴다(10/8 회장) — 포스터 카드는 흐린 바탕 + 본문 위 틀에 잘리지 않게, 글자를 포스터 위에 얹지 않는다", () => {
    const src = readFileSync(join(process.cwd(), "src/components/landing/discover-section.tsx"), "utf8");
    const calls = src.match(/getEventImage\([^)]*\)/g) ?? [];
    expect(calls.length).toBeGreaterThan(0);
    for (const call of calls) expect(call).not.toContain("allowPoster: false");
    const tabs = readFileSync(join(process.cwd(), "src/components/landing/discover-tabs.tsx"), "utf8");
    expect(tabs).toContain('kind === "poster"');
    expect(tabs).toContain("s.posterFrame");
    const css = readFileSync(join(process.cwd(), "src/components/landing/discover-section.module.css"), "utf8");
    expect(css).toMatch(/\.posterImage\s*\{[^}]*object-fit:\s*contain/);
  });
});

describe("16:10 을 채우는 포스터의 이미지 크기 (10/8 — 640px 를 1,044px 로 늘려 흐려지던 것)", () => {
  it("채우는 배너만 배율(aspect ÷ 1.6), 잘리지 않게 놓는 포스터·사진은 1", async () => {
    const { posterCoverFactor } = await import("@/lib/events/event-image");
    const banner = getEventImage({ id: "evt-004", title: "케이팜", region: "경기도" });
    expect(banner.kind).toBe("poster");
    expect(banner.crop16x10).toBe(true);
    expect(posterCoverFactor(banner)).toBeCloseTo(2560 / 824 / 1.6, 1);
    const poster = getEventImage({ id: "evt-001", title: "Y-FARM", region: "경기도" });
    expect(posterCoverFactor(poster)).toBe(1); // 잘리지 않게(contain) — 틀 폭이면 충분
    expect(posterCoverFactor(getEventImage({ title: "마을", region: "강원도" }))).toBe(1);
  });

  it("sizes 의 각 길이에 배율을 곱한다(미디어 조건은 그대로)", async () => {
    const { scaleSizes } = await import("@/lib/events/event-image");
    expect(scaleSizes("(min-width: 1024px) 296px, calc(78vw - 24px)", 1.94)).toBe(
      "(min-width: 1024px) calc(296px * 1.94), calc(calc(78vw - 24px) * 1.94)",
    );
    expect(scaleSizes("300px", 1)).toBe("300px");
    // 미디어 조건이 and 로 이어져도, 길이에 쉼표가 든 함수(min·max)가 있어도 항목이 깨지지 않는다
    expect(scaleSizes("(min-width: 640px) and (max-width: 1023px) 45vw, min(300px, 90vw)", 2)).toBe(
      "(min-width: 640px) and (max-width: 1023px) calc(45vw * 2), calc(min(300px, 90vw) * 2)",
    );
    expect(
      scaleSizes("(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 48px) / 2), 300px", 1.5),
    ).toBe(
      "(max-width: 639px) calc(calc(100vw - 32px) * 1.5), (max-width: 1023px) calc(calc((100vw - 48px) / 2) * 1.5), calc(300px * 1.5)",
    );
  });
});
