"use client";

import { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar, { type SearchBarHandle } from "./search-bar";
import SearchTags from "./search-tags";
import s from "./search-group.module.css";

interface SearchGroupProps {
  placeholder?: string;
  /** 모바일(< 640px)에서만 사용할 짧은 placeholder */
  mobilePlaceholder?: string;
  size?: "default" | "large";
  /** 인기 태그 숨김 (히어로 등 간결한 레이아웃용) */
  hideTags?: boolean;
  /** 모바일에서 탭 시 해당 경로로 이동 (인라인 검색 대신) */
  mobileRedirect?: string;
  /** SearchBar 자동 포커스 */
  autoFocus?: boolean;
}

export default function SearchGroup({
  placeholder,
  mobilePlaceholder,
  size = "default",
  hideTags = false,
  mobileRedirect,
  autoFocus = false,
}: SearchGroupProps) {
  const searchBarRef = useRef<SearchBarHandle>(null);
  const router = useRouter();

  const handleTagClick = useCallback((query: string) => {
    searchBarRef.current?.fillQuery(query);
  }, []);

  /**
   * 모바일 검색바 탭 핸들러.
   * 모바일 브라우저는 유저 제스처 체인 밖에서 programmatic focus()로
   * 가상 키보드를 열 수 없음. 유저 탭(제스처) 컨텍스트 내에서 임시 input을
   * 생성·포커스하여 키보드를 먼저 열고, 이후 /search 페이지로 이동하면
   * 키보드가 유지된 상태에서 실제 input으로 포커스가 이전됨.
   */
  const handleMobileSearchTap = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (!mobileRedirect) return;

      const tmpInput = document.createElement("input");
      tmpInput.setAttribute("type", "text");
      tmpInput.setAttribute("inputmode", "search");
      tmpInput.style.position = "absolute";
      tmpInput.style.opacity = "0";
      tmpInput.style.height = "0";
      tmpInput.style.fontSize = "16px"; // iOS 줌 방지
      tmpInput.style.transform = "translateX(-9999px)";
      document.body.appendChild(tmpInput);
      tmpInput.focus();

      router.push(mobileRedirect);

      // 네비게이션 완료 후 임시 input 정리
      setTimeout(() => tmpInput.remove(), 2000);
    },
    [mobileRedirect, router],
  );

  return (
    <div className={s.group}>
      <div className={s.searchBarWrap}>
        <SearchBar
          ref={searchBarRef}
          size={size}
          placeholder={placeholder}
          mobilePlaceholder={mobilePlaceholder}
          autoFocus={autoFocus}
        />
        {mobileRedirect && (
          <Link
            href={mobileRedirect}
            className={s.mobileOverlay}
            onClick={handleMobileSearchTap}
            aria-label="검색 페이지로 이동"
            prefetch={true}
          />
        )}
      </div>
      {!hideTags && <SearchTags onTagClick={handleTagClick} />}
    </div>
  );
}
