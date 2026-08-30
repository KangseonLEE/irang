/**
 * 지역 비교 탭 id — 서버(page.tsx)와 클라이언트(compare-tabs.tsx)가 함께 쓰는 plain 모듈.
 * compare-tabs.tsx가 "use client"가 되면서(8/30 모바일 탭 스크롤) 거기서 export한 상수를 서버가 import하면
 * 클라이언트 참조가 되어 `TAB_IDS.includes is not a function`이 난다 → 상수는 여기로 분리.
 */
export const TAB_IDS = ["climate", "infra", "suitability"] as const;
export type TabId = (typeof TAB_IDS)[number];
