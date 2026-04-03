"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Sprout, FileText, ArrowLeft } from "lucide-react";
import { searchAll, type SearchItem } from "@/lib/data/search-index";
import SearchGroup from "@/components/search/search-group";
import s from "./page.module.css";

const TYPE_META: Record<
  SearchItem["type"],
  { label: string; icon: typeof MapPin }
> = {
  region: { label: "지역", icon: MapPin },
  crop: { label: "작물", icon: Sprout },
  program: { label: "지원사업", icon: FileText },
};

const TYPE_ORDER: SearchItem["type"][] = ["region", "crop", "program"];

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
        <SearchGroup size="default" placeholder="지역, 작물, 지원사업 검색" />
      </div>
      <div className={s.emptyQuery}>
        <Search size={40} className={s.emptyIcon} />
        <h1 className={s.emptyTitle}>통합 검색</h1>
        <p className={s.emptyDesc}>검색 결과를 불러오는 중입니다...</p>
      </div>
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const results = useMemo(() => searchAll(query), [query]);

  const grouped = useMemo(
    () =>
      TYPE_ORDER.map((type) => ({
        type,
        items: results.filter((r) => r.type === type),
      })).filter((g) => g.items.length > 0),
    [results]
  );

  const totalCount = results.length;

  return (
    <div className={s.page}>
      {/* 검색바 */}
      <div className={s.searchWrap}>
        <SearchGroup size="default" placeholder="지역, 작물, 지원사업 검색" />
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
                </h2>
                <div className={s.grid}>
                  {group.items.map((item) => (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={item.href}
                      className={s.card}
                    >
                      <span className={s.cardIcon}>{item.icon}</span>
                      <div className={s.cardContent}>
                        <span className={s.cardTitle}>{item.title}</span>
                        <span className={s.cardSubtitle}>{item.subtitle}</span>
                      </div>
                      {item.badge && (
                        <span className={s.cardBadge}>{item.badge}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
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
