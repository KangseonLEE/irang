"use client";

import { useRef, type FormEvent, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { isComposingEvent } from "@/lib/ime";
import s from "./hero-search-form.module.css";

/**
 * 랜딩 검색 폼 (2026-10-01 A안) — 히어로 본문과 스크롤 후 하단 고정 바가 함께 쓴다.
 *
 * - **JS 없이도 동작하는 GET 폼**(`/search?q=`). 클라이언트 코드는 계측과 빈 검색·IME 가드만 얹는다.
 *   검색 로그(search_logs)는 /search 페이지가 1회 적재하므로 여기서는 GA `search` 이벤트만 보낸다
 *   (search-bar.tsx navigateToSearch 와 같은 분담).
 * - 한글 조합 중 Enter 는 막는다(9/7 배추→고구마 사고 가드). 조합이 끝난 다음 Enter 로 제출된다.
 * - `useSearchParams` 를 쓰지 않는다 → 랜딩 SSR bailout 0 유지(6/1 교훈).
 */
interface HeroSearchFormProps {
  /** hero = 히어로 큰 입력 / dock = 하단 고정 바 안 작은 입력 */
  variant: "hero" | "dock";
  /** label·input id 충돌 방지용 접두 */
  idPrefix: string;
}

/** 375 에서도 잘리지 않는 길이 — 예시를 붙이면 모바일에서 말줄임된다(10/1 실측) */
const PLACEHOLDER = "지역·작물·지원사업 검색";

export function HeroSearchForm({ variant, idPrefix }: HeroSearchFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = `${idPrefix}-q`;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const q = inputRef.current?.value.trim() ?? "";
    if (q.length === 0) {
      e.preventDefault();
      inputRef.current?.focus();
      return;
    }
    analytics.search(q);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isComposingEvent(e)) {
      e.preventDefault();
      return;
    }
    // 하단 바 안에서 Esc = 입력 해제(포커스를 놓아 바가 다시 숨을 수 있게)
    if (e.key === "Escape" && variant === "dock") {
      e.currentTarget.blur();
    }
  };

  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={`${s.form} ${variant === "hero" ? s.hero : s.dock}`}
      onSubmit={onSubmit}
    >
      <label htmlFor={inputId} className={s.srOnly}>
        검색어
      </label>
      <Search className={s.icon} size={variant === "hero" ? 20 : 18} aria-hidden="true" />
      <input
        ref={inputRef}
        id={inputId}
        name="q"
        type="search"
        required
        autoComplete="off"
        enterKeyHint="search"
        maxLength={60}
        placeholder={PLACEHOLDER}
        className={s.input}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className={s.submit} data-track={`${variant === "hero" ? "hero" : "hero_dock"}:search_submit`}>
        검색
      </button>
    </form>
  );
}
