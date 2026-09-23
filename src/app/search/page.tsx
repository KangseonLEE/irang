"use client";

import { Suspense, useMemo, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, FileText, GraduationCap, CalendarDays, BookOpen, ArrowLeft, TrendingUp, Building2, Users, BookMarked, LandPlot, ChevronDown, ChevronUp } from "lucide-react";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { searchAll, hasExactMatch, buildSearchAnswer, buildCropPanel, buildRelatedSearches, resolveSearchDisplay, getNoResultHintItems, getNoResultSuggestions, POPULAR_TAGS, type SearchItem } from "@/lib/data/search-index";
import { findTypoCandidates } from "@/lib/typo-correct";
import { logSearch } from "@/lib/supabase";
import { analytics } from "@/lib/analytics";
import { withJosa } from "@/lib/format";
import { RequestButton } from "@/components/feedback/request-modal";
import SearchPageSearchBar from "@/components/search/search-page-search-bar";
import { ResultCard } from "@/components/search/result-card";
import { SearchAnswerCard } from "@/components/search/search-answer-card";
import { CropKnowledgePanel } from "@/components/search/crop-knowledge-panel";
import s from "./page.module.css";

/** 답변 카드와 중복되는 synthetic guide 카드인지 판별 — 그룹 노출에서 제외 */
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
  interview: { label: "정착 이야기", icon: Users },
  glossary: { label: "용어", icon: BookMarked },
  land: { label: "농지·토지", icon: LandPlot },
};

/** 결과가 없을 때 폴백용 기본 순서 */
const DEFAULT_TYPE_ORDER: SearchItem["type"][] = ["region", "crop", "program", "education", "event", "guide", "center", "interview", "glossary", "land"];

/**
 * 섹션별 초기 노출 개수 — 이 값 초과 시 "더보기 N건" 버튼 표시.
 * region·crop은 동음이의어/유사 작물이 많아 6개, 그 외는 4개. glossary·guide는 짧은 카드라 5개.
 */
const INITIAL_LIMIT: Record<SearchItem["type"], number> = {
  region: 6,
  crop: 6,
  program: 4,
  education: 4,
  event: 4,
  center: 4,
  interview: 4,
  glossary: 5,
  guide: 5,
  land: 4,
};

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
        <p className={s.emptyTitle} role="status">통합 검색</p>
        <p className={s.emptyDesc}>검색 결과를 불러오는 중이에요...</p>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const rawResults = useMemo(() => searchAll(query), [query]);

  // 자동 대체 (2026-09-23) — 원 검색어가 0건이고 검색어 안에 실재 작물·지역명이 들어 있으면
  // ("가시오이" → 오이) 그 결과를 바로 보여주고 상단 한 줄로 알린다. 네이버("~로 검색하시겠습니까?")·
  // 다음("이것을 찾으시나요?")·아마존("대신 ~을 검색")과 Baymard 원칙(대안이 하나면 자동 적용 + 안내,
  // 여럿이면 선택지) 그대로. 큰 박스에 알약 하나 띄우는 UI 는 회장 기각.
  const fallback = useMemo(() => {
    if (!query || rawResults.length > 0) return null;
    const terms = getNoResultSuggestions(query);
    for (const term of terms) {
      if (searchAll(term).length > 0) return { term, others: terms.filter((x) => x !== term) };
    }
    return null;
  }, [query, rawResults]);
  const effectiveQuery = fallback?.term ?? query;
  const results = useMemo(
    () => (fallback ? searchAll(fallback.term) : rawResults),
    [fallback, rawResults],
  );

  // 답변 카드 (Featured Snippet) — intent 감지 시 결과 위에 구조화된 답 노출
  const answer = useMemo(() => (effectiveQuery ? buildSearchAnswer(effectiveQuery) : null), [effectiveQuery]);

  // 지식 패널 (Knowledge Panel) — 답변 카드가 없을 때만(=bare 작물 엔티티)
  const panel = useMemo(() => (effectiveQuery && !answer ? buildCropPanel(effectiveQuery) : null), [effectiveQuery, answer]);

  // 연관 검색어 (Related Searches) — 결과 하단 탐색 확장
  const relatedSearches = useMemo(() => (effectiveQuery ? buildRelatedSearches(effectiveQuery) : []), [effectiveQuery]);

  // 답변/패널이 있으면 중복 카드를 목록에서 제외 — 단 히트 수에는 그 카드들을 포함
  // ("참깨"처럼 작물 카드 1건뿐인 검색이 패널에 흡수돼 "총 0건·결과 없음"으로 보이던 8/29 사고)
  const { displayResults, hitCount } = useMemo(
    () => resolveSearchDisplay(results, answer, panel),
    [results, answer, panel],
  );

  // 관련도 기반 동적 섹션 순서 — searchAll 결과 순서에서 도출
  const grouped = useMemo(() => {
    const seen = new Set<SearchItem["type"]>();
    const order: SearchItem["type"][] = [];
    for (const r of displayResults) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        order.push(r.type);
      }
    }
    const sectionOrder = order.length > 0 ? order : DEFAULT_TYPE_ORDER;

    return sectionOrder
      .map((type) => ({
        type,
        items: displayResults.filter((r) => r.type === type),
      }))
      .filter((g) => g.items.length > 0);
  }, [displayResults]);

  // 헤더 건수·빈 상태·오타 보정·검색 로그 전부 이 값을 기준으로 — 목록 길이(displayResults)가 아님
  const totalCount = hitCount;

  // 섹션별 펼침 상태 — query를 상태에 묶어 쿼리 변경 시 자동 초기화
  // (React 공식 권장 패턴: state in render 비교로 useEffect 회피)
  const [expandedState, setExpandedState] = useState<{ query: string; flags: Record<string, boolean> }>({
    query,
    flags: {},
  });
  const expanded = expandedState.query === query ? expandedState.flags : {};
  const toggleExpanded = (type: string) => {
    setExpandedState((prev) => {
      const flags = prev.query === query ? prev.flags : {};
      return { query, flags: { ...flags, [type]: !flags[type] } };
    });
  };

  // 검색어가 있을 때 로그 기록 (동일 검색어 중복 방지)
  const loggedRef = useRef("");
  useEffect(() => {
    if (query && query !== loggedRef.current) {
      loggedRef.current = query;
      // 대체 결과를 보여줘도 로그는 원 검색어 0건으로 — admin '결과 없는 검색어'가 작물 추가 신호다
      logSearch(query, fallback ? 0 : totalCount);
      if (fallback) analytics.searchFallbackShown(query, fallback.term);
    }
  }, [query, totalCount, fallback]);

  // ── 오타 보정 — 0건일 때만 후보 추출 ──
  // (a) 자모 레벤슈타인: 작물·지역 사전 기반, 클라이언트 즉시 계산
  const typoCandidates = useMemo(() => {
    if (!query || totalCount > 0) return [] as string[];
    return findTypoCandidates(query.trim().toLowerCase());
  }, [query, totalCount]);

  // (b) 네이버 errata: 한/영 키 오타 변환, /api/search-errata 프록시 호출
  // — 결과를 query와 한 쌍으로 묶어 stale 표시 방지
  const [errataPair, setErrataPair] = useState<{ query: string; value: string }>({
    query: "",
    value: "",
  });
  useEffect(() => {
    if (!query || totalCount > 0) return;
    const q = query.trim();
    if (q.length < 2 || q.length > 50) return;
    const controller = new AbortController();
    fetch(`/api/search-errata?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : { errata: "" }))
      .then((data: { errata?: string }) => {
        if (controller.signal.aborted) return;
        const errata = data?.errata?.trim() ?? "";
        setErrataPair({
          query: q,
          value: errata && errata !== q ? errata : "",
        });
      })
      .catch(() => {
        // 네트워크 오류 — 무음
      });
    return () => controller.abort();
  }, [query, totalCount]);

  // 자모 + errata 합치고 중복 제거 (errata는 현재 query 매칭 시에만 사용)
  const suggestions = useMemo(() => {
    const merged: string[] = [];
    const seen = new Set<string>();
    // (0) 검색어에 포함된 실재 작물·지역명 — "가시오이" → 오이 (2026-09-23). 가장 확실한 의도라 맨 앞.
    for (const c of totalCount === 0 && query ? getNoResultSuggestions(query) : []) {
      if (!seen.has(c)) {
        seen.add(c);
        merged.push(c);
      }
    }
    for (const c of typoCandidates) {
      if (!seen.has(c)) {
        seen.add(c);
        merged.push(c);
      }
    }
    const errata =
      errataPair.query === query.trim() && totalCount === 0
        ? errataPair.value
        : "";
    if (errata && !seen.has(errata)) {
      seen.add(errata);
      merged.push(errata);
    }
    return merged.slice(0, 4);
  }, [typoCandidates, errataPair, query, totalCount]);

  // 결과 0건 안내 힌트 — 아직 작물이 없는 검색어를 가까운 실재 작물로 (2026-09-14)
  const noResultHintItems = useMemo(
    () => (query && totalCount === 0 ? getNoResultHintItems(query) : []),
    [query, totalCount],
  );

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
      {/* 뒤로가기 */}
      <Link href="/" className={s.backLink}>
        <ArrowLeft size={16} />
        홈으로 돌아가기
      </Link>

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
          {!fallback && (
            <p className={s.resultCount}>
              총 <strong>{totalCount}</strong>건
            </p>
          )}
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

      {/* 자동 대체 안내 — 원 검색어 0건, 포함된 실재 이름의 결과를 대신 표시 (네이버·다음 한 줄 패턴) */}
      {query && fallback && (
        <div className={s.fallbackNotice} role="status">
          <span>
            &lsquo;{query}&rsquo;{withJosa(query, "은").slice(query.length)} 아직 없어요. 대신{" "}
            <Link href={`/search?q=${encodeURIComponent(fallback.term)}`} className={s.fallbackTerm}>
              {fallback.term}
            </Link>{" "}
            결과 <strong>{totalCount}</strong>건이에요.
          </span>
          {fallback.others.length > 0 && (
            <span className={s.fallbackOthers}>
              다른 뜻:{" "}
              {fallback.others.map((o) => (
                <Link key={o} href={`/search?q=${encodeURIComponent(o)}`} className={s.fallbackTerm}>
                  {o}
                </Link>
              ))}
            </span>
          )}
          <RequestButton
            keyword={query.trim()}
            pageName="통합 검색"
            label={`'${query}' 정보 요청하기`}
            className={s.fallbackRequest}
            iconSize={14}
          />
        </div>
      )}

      {/* 답변 카드 (Featured Snippet) — intent 감지 시 결과 최상단 */}
      {query && answer && (
        <div className={s.answerWrap}>
          <SearchAnswerCard answer={answer} />
        </div>
      )}

      {/* 지식 패널 (Knowledge Panel) — 단일 작물 엔티티 검색 시 */}
      {query && panel && (
        <div className={s.answerWrap}>
          <CropKnowledgePanel panel={panel} />
        </div>
      )}

      {/* 정확히 일치하는 항목 없음 안내 — 결과 위에 배치 (긍정 톤, 2026-05-22) */}
      {query && !fallback && !answer && !panel && query.trim().length >= 2 && totalCount > 0 && !hasExactMatch(effectiveQuery, results) && (
        <div className={s.noExactMatch}>
          <div className={s.noExactMatchContent}>
            <p className={s.noExactMatchText}>
              &lsquo;{effectiveQuery}&rsquo; 관련 검색 결과예요
            </p>
            <p className={s.noExactMatchHint}>
              결과 중 더 필요한 정보가 있다면 정보 추가를 요청해 주세요.
            </p>
          </div>
          <RequestButton
            keyword={query.trim()}
            pageName="통합 검색"
            label="정보 추가 요청하기"
            className={s.noExactMatchBtn}
          />
        </div>
      )}

      {/* 결과 섹션 */}
      {query && grouped.length > 0 && (
        <div className={s.sections}>
          {grouped.map((group) => {
            const meta = TYPE_META[group.type];
            const Icon = meta.icon;
            const limit = INITIAL_LIMIT[group.type] ?? 4;
            const isExpanded = expanded[group.type] === true;
            const overflow = group.items.length - limit;
            const visibleItems = isExpanded ? group.items : group.items.slice(0, limit);

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
                  {visibleItems.map((item) => (
                    <ResultCard
                      key={`${item.type}-${item.id}`}
                      item={item}
                      query={effectiveQuery}
                      highlightCls={s.highlight}
                    />
                  ))}
                </div>
                {overflow > 0 && (
                  <button
                    type="button"
                    className={s.expandToggle}
                    onClick={() => toggleExpanded(group.type)}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? (
                      <>
                        접기
                        <ChevronUp size={14} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        더보기 {overflow}건
                        <ChevronDown size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* 결과 없음 */}
      {query && totalCount === 0 && (
        <div className={s.noResult}>
          <p className={s.noResultText}>
            &lsquo;{query}&rsquo;에 대한 검색 결과가 없어요.
          </p>
          <p className={s.noResultHint}>
            <span className={s.tipClause}>철자가 맞는지 확인하거나,</span>{" "}
            <span className={s.tipClause}>더 짧은 키워드로 검색해 보세요.</span>
          </p>

          {/* 오타 보정 제안 — 자모 후보 + 네이버 errata 합본 */}
          {suggestions.length > 0 && (
            <div className={s.suggestSection}>
              <p className={s.suggestTitle}>이것을 찾으시나요?</p>
              <div className={s.suggestList}>
                {suggestions.map((sug) => (
                  <Link
                    key={sug}
                    href={`/search?q=${encodeURIComponent(sug)}`}
                    className={s.suggestLink}
                  >
                    {sug}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <RequestButton
            keyword={query.trim()}
            pageName="통합 검색"
            label="정보 추가 요청하기"
            className={s.requestLink}
          />

          {/* 아직 작물이 없는 검색어 — 가까운 실재 작물을 카드로 안내 (힌트, 요청 버튼 아래) */}
          {noResultHintItems.length > 0 && (
            <div className={s.hintSection}>
              <p className={s.suggestTitle}>이런 작물은 어때요?</p>
              <div className={s.grid}>
                {noResultHintItems.map((item) => (
                  <ResultCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    query={effectiveQuery}
                    highlightCls={s.highlight}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 연관 검색어 — 결과가 있을 때 하단에 탐색 확장 */}
      {query && totalCount > 0 && relatedSearches.length > 0 && (
        <div className={s.relatedSection}>
          <h2 className={s.relatedTitle}>
            <TrendingUp size={16} aria-hidden="true" />
            함께 찾는 검색어
          </h2>
          <div className={s.relatedTags}>
            {relatedSearches.map((rq) => (
              <Link
                key={rq}
                href={`/search?q=${encodeURIComponent(rq)}`}
                className={s.relatedTag}
              >
                <Search size={12} aria-hidden="true" />
                {rq}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
