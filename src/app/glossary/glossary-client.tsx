"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, SearchX } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { Icon } from "@/components/ui/icon";
import type { GlossaryCategory, GlossaryEntry } from "@/lib/data/glossary";
import s from "./page.module.css";

// ── 한글 초성 추출 ──

const CHOSUNG_LIST = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

/** 초성 인덱스 바에 표시할 대표 초성 (쌍자음 제외) */
const INDEX_CHOSUNG = [
  "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
] as const;

/** 쌍자음 → 대표 초성 매핑 */
const DOUBLE_TO_SINGLE: Record<string, string> = {
  "ㄲ": "ㄱ",
  "ㄸ": "ㄷ",
  "ㅃ": "ㅂ",
  "ㅆ": "ㅅ",
  "ㅉ": "ㅈ",
};

function getChosung(str: string): string {
  const code = str.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return str[0]?.toUpperCase() ?? "#";
  return CHOSUNG_LIST[Math.floor(code / 588)] ?? "#";
}

/** 대표 초성을 반환 (쌍자음 → 단자음으로 통합) */
function getRepresentativeChosung(str: string): string {
  const cho = getChosung(str);
  return DOUBLE_TO_SINGLE[cho] ?? cho;
}

// ── 컴포넌트 ──

interface GlossaryClientProps {
  entries: GlossaryEntry[];
  categoryLabels: Record<GlossaryCategory, string>;
}

export function GlossaryClient({ entries, categoryLabels }: GlossaryClientProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GlossaryCategory | "all">("all");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  // 필터링된 엔트리
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      // 카테고리 필터
      if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
      // 검색어 필터
      if (q) {
        const haystack = [e.term, e.shortDesc, ...(e.aliases ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [entries, query, selectedCategory]);

  // 초성별 그룹핑
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryEntry[]>();
    for (const entry of filtered) {
      const cho = getRepresentativeChosung(entry.term);
      const list = map.get(cho) ?? [];
      list.push(entry);
      map.set(cho, list);
    }
    // 초성 순서로 정렬
    const sorted = new Map(
      [...map.entries()].sort(([a], [b]) => {
        const ia = INDEX_CHOSUNG.indexOf(a as typeof INDEX_CHOSUNG[number]);
        const ib = INDEX_CHOSUNG.indexOf(b as typeof INDEX_CHOSUNG[number]);
        // 한글 초성이 아닌 경우 뒤로
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      }),
    );
    return sorted;
  }, [filtered]);

  // 현재 필터에서 존재하는 초성 집합
  const activeChosung = useMemo(() => new Set(grouped.keys()), [grouped]);

  const handleReset = useCallback(() => {
    setQuery("");
    setSelectedCategory("all");
  }, []);

  const handleChosungClick = useCallback((cho: string) => {
    const el = document.getElementById(`chosung-${cho}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.focus();
    }
  }, []);

  const toggleExpand = useCallback((slug: string) => {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const scrollToSlug = useCallback(
    (slug: string, opts?: { moveFocus?: boolean }) => {
      // 펼치기
      setExpandedSlug(slug);
      // DOM 업데이트 후 스크롤
      requestAnimationFrame(() => {
        const el = document.getElementById(slug);
        if (!el) return;
        // 관련 용어 버튼은 지금 접히는 카드 안에 있다 — 누른 버튼이 사라지면 포커스가 BODY 로 떨어져
        // 다음 Tab 이 문서 처음부터 시작했다(10/6 R2-Q3 F5). 옮겨 간 용어의 펼침 버튼으로 넘긴다.
        // 스크롤은 아래 한 번만 — 포커스 스크롤과 겹치지 않게 preventScroll
        if (opts?.moveFocus) el.querySelector<HTMLElement>("h3 button")?.focus({ preventScroll: true });
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
    [],
  );

  /** 관련 용어로 이동 — 지금 필터(카테고리·검색어)에 안 보이는 용어면 필터부터 푼다(해시 이동과 같은 처리) */
  const goToRelated = useCallback(
    (slug: string) => {
      // 없는 용어면 아무것도 하지 않는다 — 펼침 상태만 바뀌면 지금 카드가 접히고 포커스를 잃는다
      if (!entries.some((e) => e.slug === slug)) return;
      if (!filtered.some((e) => e.slug === slug)) {
        setSelectedCategory("all");
        setQuery("");
      }
      scrollToSlug(slug, { moveFocus: true });
    },
    [entries, filtered, scrollToSlug],
  );

  // ── URL 해시(#slug)로 직접 이동: 툴팁 "자세히" 링크 + 검색 결과 클릭 지원 ──
  const navigateToHash = useCallback(() => {
    const raw = window.location.hash.slice(1); // "#slug" → "slug"
    if (!raw) return;
    // 한글 해시는 브라우저가 percent-encode할 수 있으므로 디코딩
    const hash = decodeURIComponent(raw);

    const target = entries.find((e) => e.slug === hash);
    if (!target) return;

    // 카테고리 필터가 걸려 있으면 해제 (해당 용어가 보이도록)
    setSelectedCategory("all");
    setQuery("");

    // DOM 업데이트 후 스크롤 + 확장
    requestAnimationFrame(() => {
      scrollToSlug(hash);
    });
  }, [entries, scrollToSlug]);

  // pathname 변경 시 (검색 결과에서 클릭하여 /glossary#slug로 진입)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    navigateToHash();
  }, [pathname, navigateToHash]);

  // 같은 페이지 내 해시 변경
  useEffect(() => {
    window.addEventListener("hashchange", navigateToHash);
    return () => window.removeEventListener("hashchange", navigateToHash);
  }, [navigateToHash]);

  const categories = Object.entries(categoryLabels) as [GlossaryCategory, string][];

  return (
    <>
      {/* 검색 */}
      <div className={s.searchBar}>
        <Icon icon={Search} size="lg" className={s.searchIcon} />
        <input
          type="search"
          className={s.searchInput}
          placeholder="용어를 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="용어 검색"
        />
      </div>

      {/* 카테고리 필터 칩 */}
      <div className={s.filterChips} role="group" aria-label="카테고리 필터">
        <button
          type="button"
          className={selectedCategory === "all" ? s.chipSelected : s.chipDefault}
          onClick={() => setSelectedCategory("all")}
          aria-pressed={selectedCategory === "all"}
        >
          전체
        </button>
        {categories.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={selectedCategory === key ? s.chipSelected : s.chipDefault}
            onClick={() => setSelectedCategory(key)}
            aria-pressed={selectedCategory === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 초성 인덱스 바 */}
      <nav className={s.chosungBar} aria-label="초성 색인">
        {INDEX_CHOSUNG.map((cho) => (
          <button
            key={cho}
            type="button"
            className={activeChosung.has(cho) ? s.chosungBtn : s.chosungBtnDisabled}
            onClick={() => handleChosungClick(cho)}
            aria-disabled={!activeChosung.has(cho)}
            tabIndex={activeChosung.has(cho) ? 0 : -1}
          >
            {cho}
          </button>
        ))}
      </nav>

      {/* 용어 리스트 */}
      {filtered.length === 0 ? (
        <div className={s.emptyState}>
          <Icon icon={SearchX} size="2xl" className={s.emptyIcon} />
          <p className={s.emptyTitle}>검색 결과가 없어요</p>
          <p className={s.emptyDesc}>
            다른 검색어를 입력하거나 필터를 변경해 보세요.
          </p>
          <button type="button" className={s.emptyResetBtn} onClick={handleReset}>
            전체 보기
          </button>
        </div>
      ) : (
        /* 10/6 QA(axe aria-required-children, critical): 예전엔 `div[role=list]` 직계가 <section> 이라 목록 구조가 깨졌다.
           초성 묶음은 제목(h2)이 이끄는 구획이라 목록 역할 없이 둔다.
           용어 카드는 APG 아코디언 — 제목(h3) 안의 버튼이 펼침을 맡는다. 카드 전체가 role=button 이던 때는
           펼친 뒤 안쪽 "관련 용어" 버튼이 버튼 속 버튼(nested-interactive)이 되고 h3 도 버튼에 묻혀 제목으로 읽히지 않았다. */
        <div>
          {[...grouped.entries()].map(([cho, items]) => (
            <section
              key={cho}
              className={s.termGroup}
              id={`chosung-${cho}`}
              tabIndex={-1}
              aria-label={`초성 ${cho} 그룹`}
            >
              <h2 className={s.termGroupHeading}>{cho}</h2>
              {items.map((entry) => {
                const isExpanded = expandedSlug === entry.slug;
                const panelId = `${entry.slug}-desc`;
                return (
                  <div key={entry.slug} id={entry.slug} className={isExpanded ? s.termCardExpanded : s.termCard}>
                    <h3 className={s.termHeading}>
                      <button
                        type="button"
                        className={s.termToggle}
                        onClick={() => toggleExpand(entry.slug)}
                        aria-expanded={isExpanded}
                        aria-controls={isExpanded ? panelId : undefined}
                      >
                        <span className={s.termCardHeaderText}>
                          <span className={s.termName}>{entry.term}</span>
                          <span className={s.termShortDesc}>{entry.shortDesc}</span>
                        </span>
                        <span className={s.categoryBadge}>
                          {categoryLabels[entry.category]}
                        </span>
                        <Icon
                          icon={ChevronDown}
                          size="lg"
                          className={isExpanded ? s.termExpandIconOpen : s.termExpandIcon}
                        />
                      </button>
                    </h3>

                    {isExpanded && (
                      <div id={panelId} className={s.termBody}>
                        <p className={s.termLongDesc}>{entry.longDesc}</p>
                        {entry.related && entry.related.length > 0 && (
                          <div className={s.termRelated}>
                            <span>관련 용어:</span>
                            {entry.related.map((slug) => (
                              <button
                                key={slug}
                                type="button"
                                className={s.termRelatedLink}
                                onClick={() => goToRelated(slug)}
                              >
                                {slug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}

      {/* 결과 수 스크린리더 알림 */}
      <div aria-live="polite" className={s.srOnly}>
        용어 {filtered.length}개가 표시됐어요.
      </div>
    </>
  );
}
