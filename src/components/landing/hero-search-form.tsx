"use client";

import type { KeyboardEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import s from "./hero-search-form.module.css";

/**
 * 랜딩 검색 입구 (2026-10-02 회장: "검색창을 누르면 바로 통합검색으로") — 히어로 본문과
 * 스크롤 후 하단 고정 바(1024+)가 함께 쓴다.
 *
 * 입력창 **모양의 링크**(`<a href="/search">`)다. 실제 입력은 /search 빈 화면(검색 홈)이 받는다 —
 * 그 화면의 검색 바가 마운트 시 포커스를 가져간다(autoFocus).
 *
 * 왜 진짜 input 이 아니라 링크인가
 * - JS 없이도 /search 로 간다(SSR <a>). 크롤러·하이드레이션 전 탭도 동작.
 * - **탭 vs 스크롤 구분을 브라우저에 맡긴다** — 네이티브 링크는 손가락이 움직여 스크롤이 되면 click 을
 *   보내지 않는다. 9/7 사고(pointerdown 에서 열어 스크롤 시작만으로 이동)가 구조적으로 생기지 않는다.
 * - **포커스만으로는 이동하지 않는다**(WCAG 3.2.1, 9/29 박제) — Tab 으로 들어오면 포커스 링만,
 *   Enter(링크 기본)·Space(아래 핸들러)로 이동한다. input 이었다면 onFocus 이동을 피할 수 없었다.
 * - 계측은 LandingClickTracker 가 `data-track` 을 잡는다: `hero:search_open` / `hero_dock:search_open`.
 */
interface HeroSearchFormProps {
  /** hero = 히어로 큰 입구 / dock = 하단 고정 바 안 작은 입구 */
  variant: "hero" | "dock";
}

/** 375 에서도 잘리지 않는 길이 — 예시를 붙이면 모바일에서 말줄임된다(10/1 실측) */
const PLACEHOLDER = "지역·작물·지원사업 검색";

export function HeroSearchForm({ variant }: HeroSearchFormProps) {
  // 링크의 기본 활성 키는 Enter 뿐 — 입력창처럼 보이는 입구라 Space 도 받는다(페이지 스크롤 대신 이동)
  const onKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  return (
    <Link
      href="/search"
      className={`${s.form} ${variant === "hero" ? s.hero : s.dock}`}
      aria-label="통합검색 열기"
      data-track={`${variant === "hero" ? "hero" : "hero_dock"}:search_open`}
      onKeyDown={onKeyDown}
    >
      <Search className={s.icon} size={variant === "hero" ? 20 : 18} aria-hidden="true" />
      <span className={s.input} aria-hidden="true">
        {PLACEHOLDER}
      </span>
      <span className={s.submit} aria-hidden="true">
        검색
      </span>
    </Link>
  );
}
