"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 라우트 전환 시 스크롤을 최상단으로 이동시키는 컴포넌트.
 * layout.tsx가 아닌 template.tsx에 배치하여 매 라우트마다 리마운트됩니다.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
