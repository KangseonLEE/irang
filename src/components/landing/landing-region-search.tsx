"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { analytics } from "@/lib/analytics";
import s from "./landing-region-search.module.css";

/**
 * 랜딩 "어디부터 볼까요?" 검색창 래퍼 (2026-09-06).
 *
 * RegionSearch 는 시·군·구 229건 인덱스(sigungus.ts)를 들고 다녀서 랜딩 초기 번들에
 * 들어가면 안 된다 → 여기서 `next/dynamic({ ssr: false })` 로 분리한다.
 * 부모(quick-start-section)는 Server Component 라 dynamic 을 직접 못 쓴다
 * (Next 16: `ssr: false` 는 Client Component 에서만 — lazy-loading 가이드).
 *
 * 로딩 자리는 실제 입력창과 같은 클래스를 쓰는 더미 input 이라 교체 시 높이 변화가 없다(CLS 0).
 *
 * ⚠️ mounted 게이트를 함께 둔다. `ssr: false` 컴포넌트를 서버에서 그리면 next/dynamic 이
 *    BAILOUT_TO_CLIENT_SIDE_RENDERING 을 던져 SSR HTML 에 그 마커가 남는다 — 6/1 히어로 사고 이후
 *    랜딩 SSR 에 이 마커를 새로 만들지 않는다. 서버·첫 렌더는 우리 placeholder 를 직접 그린다.
 */

/** 히어로 검색바(키워드 전체 검색)와 역할이 다름을 문구로 분명히 한다 */
const PLACEHOLDER = "시·군·구 이름으로 찾기 (예: 가평)";

function SearchPlaceholder() {
  return (
    <div className={s.placeholderWrap} aria-hidden="true">
      <Search size={18} className={s.placeholderIcon} />
      <input
        type="text"
        className={s.placeholderInput}
        placeholder={PLACEHOLDER}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}

/** mount 1회 snapshot만 필요 — 구독 대상 없음 */
function noopSubscribe() {
  return () => {};
}

const RegionSearch = dynamic(
  () => import("@/components/region/region-search").then((m) => m.RegionSearch),
  { ssr: false, loading: () => <SearchPlaceholder /> },
);

export function LandingRegionSearch() {
  // SSR 안전 mounted 플래그 — server snapshot=false / client=true (setState in effect 회피)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!mounted) return <SearchPlaceholder />;

  return (
    <RegionSearch
      placeholder={PLACEHOLDER}
      onNavigate={(href) => analytics.landingCtaClick(`quickstart:search:${href}`)}
    />
  );
}
