/**
 * URL 경로 → 한글 페이지 이름 변환
 *
 * 피드백 위젯, 어드민 대시보드에서 사용.
 * 데이터 파일에서 slug 매핑을 자동 생성하므로 수동 관리 불필요.
 */

import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { CROPS } from "@/lib/data/crops";
import { interviews } from "@/lib/data/landing";

// ── 정적 경로 ──

const PAGE_NAMES: Record<string, string> = {
  "/": "메인",
  "/regions": "지역 정보",
  "/regions/compare": "지역 비교",
  "/regions/centers": "귀농지원센터",
  "/crops": "작물 정보",
  "/crops/compare": "작물 비교",
  "/education": "귀농 교육",
  "/education/therapy": "치유농업 교육",
  "/events": "체험 행사",
  "/programs": "지원사업",
  "/programs/roadmap": "지원사업 로드맵",
  "/interviews": "귀농인 인터뷰",
  "/stats": "귀농·귀촌 통계",
  "/costs": "비용 가이드",
  "/assess": "유형 진단",
  "/match": "매칭",
  "/search": "통합 검색",
  "/glossary": "용어 사전",
  "/more": "더보기",
  "/guide": "가이드",
  "/guide/shelter": "농촌체류형 쉼터",
  "/guide/track-compare": "트랙 비교",
  "/guides": "가이드 목록",
  "/guides/preparation": "귀농 준비",
  "/guides/budget-50s": "50대 귀농 예산",
  "/guides/solo-farming": "혼자 귀농하기",
  "/guides/failure-cases": "귀농 실패 사례",
  "/guides/beginner-crops": "초보 작물 가이드",
  "/about": "소개",
  "/terms": "이용약관",
};

// ── 데이터 기반 slug 매핑 (자동 생성) ──

const SLUG_MAP: Record<string, string> = {};

// 시도
for (const p of PROVINCES) {
  SLUG_MAP[p.id] = p.shortName;
}

// 시군구
for (const sg of SIGUNGUS) {
  SLUG_MAP[sg.id] = sg.shortName;
}

// 작물
for (const c of CROPS) {
  SLUG_MAP[c.id] = c.name;
}

// 인터뷰
for (const iv of interviews) {
  SLUG_MAP[iv.id] = iv.name;
}

function slugToKorean(slug: string): string {
  return SLUG_MAP[slug] ?? slug;
}

/** 경로를 읽기 좋은 한글 페이지 이름으로 변환 */
export function getPageName(path: string): string {
  // 정확히 매칭되는 정적 경로
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];

  // 접두사 매칭 → 하위 slug 변환
  for (const [prefix, name] of Object.entries(PAGE_NAMES)) {
    if (prefix !== "/" && path.startsWith(prefix + "/")) {
      const segments = path.slice(prefix.length + 1).split("/");
      const translated = segments.map(slugToKorean).join(" > ");
      return `${name} > ${translated}`;
    }
  }

  return path;
}
