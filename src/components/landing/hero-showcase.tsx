import Link from "next/link";
import Image from "next/image";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { HeroWordRotator } from "./hero-word-rotator";
import { HeroTiltGrid } from "./hero-tilt-grid";
import s from "./hero-showcase.module.css";

/**
 * 랜딩 히어로 — efusioni.com 문법 번안 (2026-10-01 회장 결재).
 *
 *   도시에서 ────────  {귀농으로} ⋮  새 출발
 *                              지역·작물·지원금을 …
 *   [카드]   [카드↓80]   [카드]
 *   [카드]   [카드↓80]   [카드]
 *
 * - 문장: 왼쪽 고정어 + 가로 선 + 바뀌는 여정어(브랜드 그린) + 세로 점 + 오른쪽 고정어.
 *   바뀌는 단어는 여정 5종이고, 같은 순간 아래 카드 중 그 여정 카드가 강조된다(`HeroWordRotator`).
 * - h1 은 1개. 스크린리더·크롤러는 srOnly 의 완전한 문장을 읽고, 움직이는 시각 줄은 aria-hidden.
 * - 카드 마크업은 서버에서 전부 렌더한다(SSR 내부 링크 6개). 기울기 호버만 client 래퍼가 붙인다.
 * - 이전 히어로(여정 레인 + 배경 슬라이드)는 git 태그 `archive/hero-journey-lanes-2026-10-01` 과
 *   `journey-lanes.*`·`hero-slider.*` 파일로 보관 중이다(렌더만 뺐다).
 */

/** 회전 여정 — "아직 고르는 중"은 문장에 넣지 않는다(카드로만 남는다) */
const ROTATING = JOURNEY_LANES.filter((l) => l.id !== "undecided").map((l) => ({
  id: l.id,
  // 5종 모두 받침(ㄹ 아님)으로 끝나 "으로" 고정 — 레인 이름이 바뀌면 조사를 다시 본다
  word: `${l.label}으로`,
}));

const LEFT_WORD = "도시에서";
const RIGHT_WORD = "새 출발";

/**
 * 나눔명조 400 — 히어로 글자만 서브셋. 로고는 800 이라 @font-face 서술자가 달라 서로 덮지 않는다.
 * 글자는 이 상수들에서 자동으로 모은다 → 카피를 바꿔도 서브셋이 따라온다.
 */
const SERIF_GLYPHS = Array.from(
  new Set([LEFT_WORD, RIGHT_WORD, ...ROTATING.map((r) => r.word)].join("").replace(/\s/g, "")),
).join("");
const SERIF_HREF = `https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400&display=swap&text=${encodeURIComponent(SERIF_GLYPHS)}`;

const SR_SENTENCE = `${LEFT_WORD} ${JOURNEY_LANES.filter((l) => l.id !== "undecided")
  .map((l) => l.label)
  .join("·")}으로 ${RIGHT_WORD}`;

export function HeroShowcase() {
  return (
    <section className={s.hero} aria-labelledby="hero-title" data-hero>
      {/* React 19 가 <head> 로 끌어올린다 — 랜딩에서만 받는다 */}
      <link rel="stylesheet" href={SERIF_HREF} precedence="default" />

      <div className={s.band}>
        <div className={s.head}>
          <h1 id="hero-title" className={s.title}>
            <span className={s.srOnly}>{SR_SENTENCE}</span>
            <span className={s.line} aria-hidden="true">
              <span className={s.left}>{LEFT_WORD}</span>
              <span className={s.rule} />
              <HeroWordRotator words={ROTATING} />
              <span className={s.right}>{RIGHT_WORD}</span>
            </span>
          </h1>
          <p className={s.desc}>
            어떤 시작이든
            <br />
            지역·작물·지원금을
            <br />
            한곳에서 비교해 보세요.
          </p>
        </div>
      </div>

      <HeroTiltGrid className={s.grid}>
        {JOURNEY_LANES.map((lane, i) => (
          <li key={lane.id} className={s.item}>
            <Link
              href={lane.href}
              className={s.card}
              data-hero-card={lane.id}
              data-track={`hero_card:${lane.id}`}
            >
              <span className={s.media} data-tilt>
                <Image
                  src={lane.image}
                  alt={lane.alt}
                  fill
                  sizes="(min-width: 1280px) 325px, (min-width: 768px) 30vw, 46vw"
                  loading={i < 3 ? "eager" : "lazy"}
                  className={s.img}
                />
              </span>
              <span className={s.meta}>
                <span className={s.label}>{lane.label}</span>
                <span className={s.cardDesc}>{lane.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </HeroTiltGrid>
    </section>
  );
}
