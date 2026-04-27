"use client";

import { Suspense, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, FileText, GraduationCap, CalendarDays, BookOpen, ArrowLeft, TrendingUp, MessageSquarePlus, Building2, Users, BookMarked, LandPlot, ExternalLink } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { searchAll, hasExactMatch, POPULAR_TAGS, type SearchItem } from "@/lib/data/search-index";
import { highlightMatch } from "@/lib/highlight-match";
import { logSearch } from "@/lib/supabase";
import SearchPageSearchBar from "@/components/search/search-page-search-bar";
import s from "./page.module.css";

const TYPE_META: Record<
  SearchItem["type"],
  { label: string; icon: typeof MapPin }
> = {
  region: { label: "지역", icon: MapPin },
  crop: { label: "작물", icon: Sprout },
  program: { label: "지원사업", icon: FileText },
  education: { label: "교육", icon: GraduationCap },
  event: { label: "체험·행사", icon: CalendarDays },
  guide: { label: "가이드·정보", icon: BookOpen },
  center: { label: "지자체 센터", icon: Building2 },
  interview: { label: "귀농인 이야기", icon: Users },
  glossary: { label: "용어", icon: BookMarked },
  land: { label: "농지·토지", icon: LandPlot },
};

/** 결과가 없을 때 폴백용 기본 순서 */
const DEFAULT_TYPE_ORDER: SearchItem["type"][] = ["region", "crop", "program", "education", "event", "guide", "center", "interview", "glossary", "land"];

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageFallback() {
  return (
    <div className={s.page}>
      <div className={s.searchWrap}>
        <SearchPageSearchBar />
      </div>
      <div className={s.emptyQuery}>
        <Search size={40} className={s.emptyIcon} />
        <h1 className={s.emptyTitle}>통합 검색</h1>
        <p className={s.emptyDesc}>검색 결과를 불러오는 중이에요...</p>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const results = useMemo(() => searchAll(query), [query]);

  // 관련도 기반 동적 섹션 순서 — searchAll 결과 순서에서 도출
  const grouped = useMemo(() => {
    const seen = new Set<SearchItem["type"]>();
    const order: SearchItem["type"][] = [];
    for (const r of results) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        order.push(r.type);
      }
    }
    const sectionOrder = order.length > 0 ? order : DEFAULT_TYPE_ORDER;

    return sectionOrder
      .map((type) => ({
        type,
        items: results.filter((r) => r.type === type),
      }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  const totalCount = results.length;

  // 검색어가 있을 때 로그 기록 (동일 검색어 중복 방지)
  const loggedRef = useRef("");
  useEffect(() => {
    if (query && query !== loggedRef.current) {
      loggedRef.current = query;
      logSearch(query, totalCount);
    }
  }, [query, totalCount]);

  // 최근 검색어 (localStorage — 날짜 포함 형식 호환)
  const recentSearches = useMemo(() => {
    if (typeof window === "undefined") return [] as { query: string; date: string }[];
    try {
      const raw = localStorage.getItem("irang-recent-searches");
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Array<string | { query: string; date: string }>;
      return parsed.slice(0, 10).map((item) =>
        typeof item === "string" ? { query: item, date: "" } : item,
      );
    } catch {
      return [];
    }
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [query]); // query 변경 시 다시 읽음

  return (
    <div className={s.page}>
      {/* 검색바 */}
      <div className={s.searchWrap}>
        <SearchPageSearchBar />
      </div>

      {/* 결과 헤더 */}
      {query ? (
        <div className={s.resultHeader}>
          <h1 className={s.resultTitle}>
            &lsquo;{query}&rsquo; 검색 결과
          </h1>
          <p className={s.resultCount}>
            총 <strong>{totalCount}</strong>건
          </p>
        </div>
      ) : (
        <div className={s.emptyQuery}>
          <Search size={40} className={s.emptyIcon} />
          <h1 className={s.emptyTitle}>통합 검색</h1>
          <p className={s.emptyDesc}>
            지역, 작물, 지원사업을 한번에 검색하세요.
          </p>

          {/* 인기 검색어 — 검색 결과가 있는 태그만 표시 */}
          {(() => {
            const validTags = POPULAR_TAGS.filter((tag) => searchAll(tag.query).length > 0);
            if (validTags.length === 0) return null;
            return (
              <div className={s.popularSection}>
                <h2 className={s.popularTitle}>
                  <TrendingUp size={16} />
                  다른 사람들이 많이 찾는 검색어
                </h2>
                <div className={s.popularTags}>
                  {validTags.map((tag) => (
                    <Link
                      key={tag.label}
                      href={`/search?q=${encodeURIComponent(tag.query)}`}
                      className={s.popularTag}
                    >
                      {tag.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div className={s.recentSection}>
              <h2 className={s.recentTitle}>최근 검색어</h2>
              <div className={s.recentTags}>
                {recentSearches.map((r) => (
                  <Link
                    key={r.query}
                    href={`/search?q=${encodeURIComponent(r.query)}`}
                    className={s.recentTag}
                  >
                    <Search size={12} />
                    {r.query}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 빠른 탐색 */}
          <div className={s.quickLinks}>
            <h2 className={s.quickLinksTitle}>바로 탐색하기</h2>
            <div className={s.quickLinksGrid}>
              <Link href="/regions" className={s.quickLink}>
                <MapPin size={16} />
                지역 비교
              </Link>
              <Link href="/crops" className={s.quickLink}>
                <Sprout size={16} />
                작물 정보
              </Link>
              <Link href="/programs" className={s.quickLink}>
                <FileText size={16} />
                지원사업
              </Link>
              <Link href="/education" className={s.quickLink}>
                <GraduationCap size={16} />
                교육
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 결과 섹션 */}
      {query && grouped.length > 0 && (
        <div className={s.sections}>
          {grouped.map((group) => {
            const meta = TYPE_META[group.type];
            const Icon = meta.icon;
            return (
              <section key={group.type} className={s.section}>
                <h2 className={s.sectionTitle}>
                  <Icon size={18} className={s.sectionIcon} />
                  {meta.label}
                  <span className={s.sectionCount}>{group.items.length}</span>
                  {group.type === "program" && (
                    <span className={s.sectionHint}>모집중·모집예정만</span>
                  )}
                </h2>
                <div className={s.grid}>
                  {group.items.map((item) => {
                    const inner = (
                      <>
                        <span className={s.cardIcon}>{item.icon}</span>
                        <div className={s.cardContent}>
                          <span className={s.cardTitle}>
                            {highlightMatch(item.title, query, s.highlight)}
                          </span>
                          <span className={s.cardSubtitle}>
                            {highlightMatch(item.subtitle, query, s.highlight)}
                          </span>
                        </div>
                        {item.external && (
                          <span className={s.externalBadge}>
                            <ExternalLink size={12} aria-hidden="true" />
                            외부
                          </span>
                        )}
                        {item.badge && (
                          <span className={s.cardBadge}>{item.badge}</span>
                        )}
                      </>
                    );

                    return item.external ? (
                      <a
                        key={`${item.type}-${item.id}`}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.card}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={item.href}
                        className={s.card}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* 정확히 일치하는 항목 없음 안내 — 연관 결과는 있지만 exact match 없을 때 */}
      {query && query.trim().length >= 2 && totalCount > 0 && !hasExactMatch(query, results) && (
        <div className={s.noExactMatch}>
          <div className={s.noExactMatchContent}>
            <p className={s.noExactMatchText}>
              &lsquo;{query}&rsquo;에 정확히 일치하는 항목이 없어요
            </p>
            <p className={s.noExactMatchHint}>
              연관 결과를 표시하고 있어요. 원하는 정보가 없다면 추가를 요청해 주세요.
            </p>
          </div>
          <a
            href={`https://tally.so/r/9qv8lp?keyword=${encodeURIComponent(query.trim())}`}
            target="_blank"
            rel="noopener noreferrer"
            className={s.noExactMatchBtn}
          >
            <MessageSquarePlus size={16} />
            항목 추가 요청
          </a>
        </div>
      )}

      {/* 결과 없음 */}
      {query && totalCount === 0 && (
        <div className={s.noResult}>
          <p className={s.noResultText}>
            &lsquo;{query}&rsquo;에 대한 검색 결과가 없습니다.
          </p>
          <p className={s.noResultHint}>
            다른 키워드로 검색하거나, 아래 메뉴에서 직접 탐색해 보세요.
          </p>
          <div className={s.noResultLinks}>
            <Link href="/regions" className={s.noResultLink}>
              <MapPin size={16} /> 지역 비교
            </Link>
            <Link href="/crops" className={s.noResultLink}>
              <Sprout size={16} /> 작물 정보
            </Link>
            <Link href="/programs" className={s.noResultLink}>
              <FileText size={16} /> 지원사업
            </Link>
          </div>
          <a
            href="https://tally.so/r/9qv8lp"
            target="_blank"
            rel="noopener noreferrer"
            className={s.requestLink}
          >
            <MessageSquarePlus size={16} />
            찾는 정보가 없나요? 정보 추가 요청하기
          </a>
        </div>
      )}

      {/* 뒤로가기 */}
      <Link href="/" className={s.backLink}>
        <ArrowLeft size={16} />
        홈으로 돌아가기
      </Link>
    </div>
  );
}
