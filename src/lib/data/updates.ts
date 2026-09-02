/**
 * 서비스 업데이트 소식 — "이렇게 개선됐어요"
 *
 * /about/corrections(정정 이력)가 "틀린 걸 바로잡은 기록"이라면, 여기는
 * "무엇이 좋아졌는지"를 사용자 언어로 적는 곳이다.
 *
 * 작성 규칙
 * - 커밋 메시지를 그대로 옮기지 않는다. 사용자가 화면에서 체감하는 변화만 1~2문장.
 * - 내부 리팩터링(공용 컴포넌트 추출·CSS 통합 등)처럼 화면이 그대로인 변경은 싣지 않는다.
 * - `date` 내림차순(최신 우선)을 유지한다. 계약 테스트(`src/__tests__/updates.test.ts`)가 강제한다.
 * - `id`는 `YYYYMMDD-slug` 고정. 랜딩 배너의 "이미 본 소식" 판정 키로 쓰이므로 한 번 정하면 바꾸지 않는다.
 */

export type UpdateTag = "기능" | "개선" | "수정" | "데이터";

export interface UpdateItem {
  /** `YYYYMMDD-slug` — 랜딩 배너 localStorage 키로 쓰여 변경 금지 */
  id: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** 사용자 언어의 짧은 제목 */
  title: string;
  /** 랜딩 배너(모바일 한 줄)용 더 짧은 제목 — 없으면 title 을 말줄임 */
  short?: string;
  /** 무엇이 좋아졌는지 1~2문장 */
  summary: string;
  /** 바로 확인할 수 있는 화면 경로 */
  href?: string;
  tag: UpdateTag;
  /**
   * 이전/이후 화면 — 모든 항목 필수, 항상 두 장(회장 9/2 "항상 이전·이후 비교"). 파일은 `public/updates/`,
   * 이전 화면은 해당 커밋 직전을 worktree 로 띄워 캡처(`next dev --webpack`, Playwright bypassCSP).
   * frame: mobile = 390×640 @2x(780×1280) · desktop = 1280×800 @1.5x(1920×1200)
   */
  media: {
    before: string;
    after: string;
    frame: "mobile" | "desktop";
    /** 두 화면의 차이를 한 문장으로 (스크린리더·캡션 공용) */
    caption: string;
  };
}

/**
 * 날짜 단위 공지 머리말 — 카카오톡 PC 업데이트 공지 구조(태그라인 제목 → 인사말 → 기능별 소제목·이미지 → 마무리)를
 * 따른다(회장 9/2). 톤: "~싶을 때가 있죠 / 이제 ~할 수 있어요". 날짜에 항목이 있어도 머리말이 없으면 날짜만 표시.
 */
export interface ReleaseNote {
  /** 제목 태그라인 (이모지 1개 허용) */
  tagline: string;
  /** 인사말 1~2문장 */
  intro: string;
}

export const RELEASES: Record<string, ReleaseNote> = {
  "2026-09-02": {
    tagline: "지역 찾기는 가볍게, 의견은 자유롭게 🔍",
    intro:
      "지도를 한참 눌러 보다가 원하는 시·군·구를 못 찾은 적 있죠. 이번 업데이트는 지역을 찾는 길을 짧게 만들고, 궁금한 걸 남길 자리를 마련했어요.",
  },
  "2026-08-31": {
    tagline: "진단 결과, 한쪽으로 쏠리지 않게 ⚖️",
    intro: "어떤 답을 해도 비슷한 유형이 나오면 믿기 어렵죠. 유형 진단의 계산 방식을 손봤어요.",
  },
  "2026-08-30": {
    tagline: "농사 시기는 한눈에, 비교는 더 빠르게 🌱",
    intro:
      "언제 씨를 뿌리고 언제 거두는지 한 장에서 보고 싶을 때가 있죠. 재배 캘린더와 지역 비교를 중심으로 다듬었어요.",
  },
  "2026-08-29": {
    tagline: "정부 사업 안내, 원문 그대로 다시 확인 ✅",
    intro: "지원사업은 조건 한 줄이 달라지면 결과가 달라지죠. 안내 문구를 원문과 하나하나 대조했어요.",
  },
};

/** 날짜 종결 인사 — 페이지 맨 아래 한 번 */
export const RELEASE_SIGNOFF = "이랑 팀 드림";

export const UPDATES: UpdateItem[] = [
  {
    id: "20260902-community-notes",
    date: "2026-09-02",
    title: "지역·작물·지원사업에 한 줄 의견을 남길 수 있어요",
    short: "한 줄 의견을 남길 수 있어요",
    summary:
      "이 지역 겨울은 어떤지, 이 작물은 손이 많이 가는지 먼저 살아 본 분에게 묻고 싶을 때가 있죠. 이제 상세 페이지 맨 아래에서 로그인 없이 한 줄 의견을 남기고, 다른 분 의견에 공감을 누를 수 있어요. 광고나 연락처가 담긴 글은 검토 단계에서 걸러져 게시되지 않아요.",
    href: "/regions/gyeongbuk/yeongju",
    tag: "기능",
    media: {
      before: "/updates/community-notes-before.webp",
      after: "/updates/community-notes-after.webp",
      frame: "mobile",
      caption: "이전엔 행사 카드에서 페이지가 끝났고, 지금은 그 아래에 한 줄 의견을 남기는 자리가 있어요",
    },
  },
  {
    id: "20260902-region-search",
    date: "2026-09-02",
    title: "지역 탐색에 검색창이 생겼어요",
    short: "지역 검색창이 생겼어요",
    summary:
      "지도를 눌러 시·도부터 좁혀 들어가는 게 번거로울 때가 있죠. 이제 검색창에 '순천'이나 '홍천'을 적으면 바로 그 시·군·구로 갈 수 있고, 시·도를 고르면 시·군·구 목록이 옆에 펼쳐져 이름이 헷갈릴 때도 눈으로 찾을 수 있어요.",
    href: "/regions",
    tag: "기능",
    media: {
      before: "/updates/region-search-before.webp",
      after: "/updates/region-search-after.webp",
      frame: "mobile",
      caption: "이전엔 통계 칩과 안내 카드 아래로 내려가야 지도가 보였고, 지금은 검색창이 첫 화면에 있어요",
    },
  },
  {
    id: "20260902-region-layout",
    date: "2026-09-02",
    title: "지역 찾기 화면을 다시 짰어요",
    summary:
      "넓은 화면에서 지도 옆이 텅 비어 아쉬웠죠. 이제 검색과 지도를 한 카드에 묶어 맨 위로 올리고, 오른쪽에 확인 가능한 정보와 지금 활발한 지역을 함께 보여드려요. 흩어져 있던 숫자 칩도 카드 안으로 들어왔어요.",
    href: "/regions",
    tag: "개선",
    media: {
      before: "/updates/region-layout-before.webp",
      after: "/updates/region-layout-after.webp",
      frame: "desktop",
      caption: "넓은 화면에서 지도 옆 빈 공간에 정보 카드와 활성 지역을 배치했어요",
    },
  },
  {
    id: "20260902-search-keyboard",
    date: "2026-09-02",
    title: "검색 목록을 키보드로 넘겨도 안 놓쳐요",
    summary:
      "화살표로 검색 결과를 내리다 보면 선택한 항목이 목록 밖으로 사라질 때가 있었죠. 이제 고른 항목을 따라 목록이 함께 움직이고, 맨 위로 돌아오면 안내 문구까지 다시 보여요.",
    tag: "개선",
    media: {
      before: "/updates/search-keyboard-before.webp",
      after: "/updates/search-keyboard-after.webp",
      frame: "desktop",
      caption: "화살표를 스무 번 눌렀을 때 — 이전엔 목록이 맨 위에 멈춰 있었고, 지금은 고른 항목(서울 강서구)을 따라 내려와요",
    },
  },
  {
    id: "20260902-compare-spacing",
    date: "2026-09-02",
    title: "지역 비교 화면 간격을 되돌렸어요",
    summary:
      "지역 비교에서 차트와 표가 딱 붙어 답답하게 보이던 부분이 있었죠. 원래 간격으로 되돌려 섹션이 또렷하게 구분돼요.",
    href: "/regions/compare",
    tag: "수정",
    media: {
      before: "/updates/compare-spacing-before.webp",
      after: "/updates/compare-spacing-after.webp",
      frame: "desktop",
      caption: "붙어 있던 차트·요약·수치 표 사이에 원래 간격이 돌아왔어요",
    },
  },
  {
    id: "20260831-assess-bias",
    date: "2026-08-31",
    title: "유형 진단 결과 쏠림을 바로잡았어요",
    summary:
      "어떻게 답해도 '귀농형'이 나오기 쉬웠던 점수 계산을 다시 맞췄어요. 청년농·반귀농처럼 다른 유형도 답변에 맞게 제대로 나와요. 그동안 자동 점검이 만든 가짜 응답이 통계에 섞여 있던 것도 함께 걷어냈어요.",
    href: "/assess",
    tag: "수정",
    media: {
      before: "/updates/assess-bias-before.webp",
      after: "/updates/assess-bias-after.webp",
      frame: "mobile",
      caption: "같은 답변(만 39세 이하·지원 혜택·1년 이내 등)으로 이전엔 귀농형, 지금은 청년농형이 나와요",
    },
  },
  {
    id: "20260830-crop-calendar",
    date: "2026-08-30",
    title: "재배 캘린더에서 파종·재배·수확이 나뉘어요",
    summary:
      "작물마다 한 덩어리로만 보이던 재배 시기를 파종·정식, 재배·관리, 수확 세 구간으로 나눠 보여드려요. 진한 정도로 구간을 구분하고, 행을 누르면 난이도·소득·주요 재배지와 '지금 8월 · 수확 중' 같은 현재 시기 안내가 함께 펼쳐져요.",
    href: "/crops",
    tag: "기능",
    media: {
      before: "/updates/crop-calendar-before.webp",
      after: "/updates/crop-calendar-after.webp",
      frame: "desktop",
      caption: "이전엔 작물마다 한 덩어리 막대였고, 지금은 파종·재배·수확이 진하기로 나뉘어요",
    },
  },
  {
    id: "20260830-programs-always",
    date: "2026-08-30",
    title: "상시 모집 사업을 따로 모았어요",
    summary:
      "마감이 없거나 일 년 내내 받는 사업이 기간 한정 공고와 섞여 있어서 '상시·연중' 탭을 따로 만들었어요. 진행·예정 탭에는 마감이 정해진 공고만 마감 가까운 순으로 보여요.",
    href: "/programs",
    tag: "개선",
    media: {
      before: "/updates/programs-always-before.webp",
      after: "/updates/programs-always-after.webp",
      frame: "desktop",
      caption: "이전엔 진행·예정 / 마감 임박 두 탭이었고, 지금은 상시·연중 탭이 따로 있어요",
    },
  },
  {
    id: "20260830-compare-speed",
    date: "2026-08-30",
    title: "지역 비교 인프라 탭이 훨씬 빨라졌어요",
    summary:
      "의료·학교 정보를 부를 때마다 15~29초씩 기다려야 했는데, 자료를 미리 받아 두는 방식으로 바꿔 1초 남짓이면 열려요. 기상청·심평원 자료를 불러오지 못하던 문제도 함께 풀렸어요.",
    href: "/regions/compare",
    tag: "개선",
    media: {
      before: "/updates/compare-speed-before.webp",
      after: "/updates/compare-speed-after.webp",
      frame: "desktop",
      caption: "이전엔 의료기관 수를 불러오지 못하거나 15초 넘게 기다려야 했고, 지금은 1초 남짓이면 표가 채워져요",
    },
  },
  {
    id: "20260830-compare-loading",
    date: "2026-08-30",
    title: "지역을 바꾸면 진행 중인 게 보여요",
    summary:
      "비교할 지역을 바꿀 때 화면이 멈춘 것처럼 보이지 않도록 불러오는 중 표시를 넣었어요. 지역을 바꿔도 보던 위치가 그대로 유지돼서 다시 스크롤을 내릴 일이 없어요.",
    href: "/regions/compare",
    tag: "개선",
    media: {
      before: "/updates/compare-loading-before.webp",
      after: "/updates/compare-loading-after.webp",
      frame: "desktop",
      caption: "시·군·구를 바꾼 직후 — 이전엔 화면이 그대로여서 멈춘 것처럼 보였고, 지금은 '불러오는 중' 표시가 떠요",
    },
  },
  {
    id: "20260830-select-search",
    date: "2026-08-30",
    title: "선택 창에서 바로 검색할 수 있어요",
    summary:
      "시·군·구, 작물, 요청 종류를 고르는 자리에 뜨던 휴대폰 기본 팝업을 이랑 화면에 맞는 선택 창으로 바꿨어요. 글자를 적어 바로 찾을 수 있고 키보드로도 고를 수 있어요.",
    tag: "개선",
    media: {
      before: "/updates/select-search-before.webp",
      after: "/updates/select-search-after.webp",
      frame: "mobile",
      caption: "이전엔 휴대폰 기본 선택 상자였고, 지금은 검색창이 달린 이랑 스타일 목록이 열려요",
    },
  },
  {
    id: "20260830-programs-added",
    date: "2026-08-30",
    title: "지원사업 12건을 새로 올렸어요",
    summary:
      "안동·진안·옥천·장수·의성·고령·괴산의 귀농인의 집, 주택수리비, 정착지원금 공고를 원문에서 신청 기간을 직접 확인해 등록했어요. 연령 상한이 없는 사업이 '19~99세'처럼 보이던 표기도 '만 19세 이상'으로 바로잡았어요.",
    href: "/programs",
    tag: "데이터",
    media: {
      before: "/updates/programs-added-before.webp",
      after: "/updates/programs-added-after.webp",
      frame: "mobile",
      caption: "마감 포함 전체 검색 결과가 36건에서 48건으로 늘었어요",
    },
  },
  {
    id: "20260829-gov-guide",
    date: "2026-08-29",
    title: "정부 사업 가이드를 전부 다시 확인했어요",
    summary:
      "청년창업농·귀산촌·농지은행·스마트팜·귀농 종합 지원 다섯 사업의 자격·한도·신청처를 부처 원문과 하나씩 대조해 고쳤어요. 근거를 찾지 못한 숫자는 지웠고, 끊긴 출처 링크는 공식 페이지로 바꿨어요.",
    href: "/programs/roadmap",
    tag: "데이터",
    media: {
      before: "/updates/gov-guide-before.webp",
      after: "/updates/gov-guide-after.webp",
      frame: "desktop",
      caption: "청년창업농 자격 요건 — '가구 소득 130%'가 건강보험료 기준으로, '교육 100시간'이 우대 항목으로 바뀌었어요",
    },
  },
];

/**
 * 가장 최근 소식의 id — 랜딩 배너가 "이미 본 소식"인지 판정하는 기준값.
 * (localStorage `irang:lastSeenUpdate` 와 비교)
 */
export const LATEST_UPDATE_ID: string = UPDATES[0].id;

/* ── 날짜 단위 공지(release) 파생 — /about/updates 목록 행 + /about/updates/[date] 상세 (9/2 회장: 목록 → 클릭 시 페이지 이동) ── */

export interface Release {
  /** `YYYY-MM-DD` — 상세 URL 세그먼트 */
  date: string;
  note?: ReleaseNote;
  /** 그날의 항목들 (UPDATES 순서 유지) */
  items: UpdateItem[];
}

/** 이미 최신순인 UPDATES를 날짜별로 묶는다 (순서 유지) */
export const RELEASE_GROUPS: Release[] = UPDATES.reduce<Release[]>((groups, item) => {
  const last = groups[groups.length - 1];
  if (last && last.date === item.date) last.items.push(item);
  else groups.push({ date: item.date, note: RELEASES[item.date], items: [item] });
  return groups;
}, []);

export function getRelease(date: string): Release | undefined {
  return RELEASE_GROUPS.find((r) => r.date === date);
}

/** 목록 행 제목 — 머리말 태그라인, 없으면 첫 항목 제목 (+ 외 N건) */
export function releaseTitle(release: Release): string {
  if (release.note) return release.note.tagline;
  const [first, ...rest] = release.items;
  return rest.length > 0 ? `${first.title} 외 ${rest.length}건` : first.title;
}

/** "2026-09-02" → "2026년 9월 2일" (Date 파싱 없이 문자열만 — 시간대 함정 회피) */
export function formatReleaseDate(date: string): string {
  const [y, m, day] = date.split("-");
  return `${y}년 ${Number(m)}월 ${Number(day)}일`;
}
