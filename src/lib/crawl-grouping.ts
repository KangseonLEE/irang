/**
 * 크롤 row 동일 모사업 그룹핑 (dedup)
 *
 * 배경 (2026-07-09 회장 결재):
 * sync-data.yml 일일 크롤이 support_programs·education_courses에 crawl-* row를 적재한다.
 * 하나의 모사업(예: "청년농업인 영농정착지원사업 2차")이 시·군별 공고로 쪼개져
 * 지역만 다른 카드가 6~7건 반복 노출되는 문제가 있다.
 *
 * 이 유틸은 제목을 정규화(연도·차수·지역·기관·괄호 부가어·공고 동작어 제거)해
 * 동일 모사업 크롤 row를 하나의 그룹으로 묶고, 대표 1건 + "외 N개 지역" 정보를 부착한다.
 *
 * - 정적 SP-*·ED-* 및 rda-* API row는 그룹핑 대상에서 제외 (id가 "crawl"로 시작하는 row만).
 * - /programs·/education 목록 양쪽이 동일 유틸을 공유한다.
 */

import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

type RowStatus = "모집중" | "모집예정" | "마감";

/** 그룹 대표 카드에 부착되는 나머지 지역 멤버 (다른 지역 공고 접근용) */
export interface CrawlGroupMember {
  id: string;
  region: string;
  status: RowStatus;
}

/** 크롤 그룹 정보 — 대표 row의 crawlGroup 필드로 부착된다. */
export interface CrawlGroupInfo {
  /** 그룹 전체 항목 수 (대표 포함). 항상 2 이상 */
  size: number;
  /** 대표를 제외한 나머지 멤버 (표시·접근 순서로 정렬됨) */
  others: CrawlGroupMember[];
}

/** groupCrawlRows가 다룰 수 있는 최소 형태 */
export interface CrawlGroupable {
  id: string;
  title: string;
  region: string;
  status: RowStatus;
  applicationEnd: string;
  createdAt?: string;
  crawlGroup?: CrawlGroupInfo;
}

// ─── 정규화 사전 ──────────────────────────────────────────────

/** 지역 토큰 — 제목에 박힌 시·도/시·군·구 이름 제거용. 긴 토큰 우선. */
const REGION_TOKENS: string[] = buildRegionTokens();

function buildRegionTokens(): string[] {
  const set = new Set<string>();
  for (const p of PROVINCES) {
    if (p.name) set.add(p.name);
    if (p.shortName) set.add(p.shortName);
  }
  for (const g of SIGUNGUS) {
    if (g.name && g.name.length >= 2) set.add(g.name);
    if (g.shortName && g.shortName.length >= 2) set.add(g.shortName);
  }
  // 긴 토큰부터 제거해야 "전라남도"가 "전라"+"남도"로 쪼개지지 않는다.
  return [...set].sort((a, b) => b.length - a.length);
}

/** 기관 접두/접미 토큰 — 사업명 앞뒤에 붙는 주관 기관명 제거용. 긴 토큰 우선. */
const ORG_TOKENS: string[] = [
  "도농업기술원",
  "농업기술원",
  "농업기술센터",
  "미래농업교육원",
  "농업교육원",
  "농업대학교",
  "농업대학",
  "기술원",
  "교육원",
  "군청",
  "도청",
  "시청",
];

/**
 * 공고 동작어·수식어 노이즈 — 같은 사업이 지역마다 다른 동작어로 게재되므로 제거.
 * 긴 토큰이 먼저 지워지도록 정렬 순서 유지 (예: "사업대상자" → "대상자"보다 먼저).
 */
const NOISE_TOKENS: string[] = [
  "사업대상자",
  "사업", // generic 접미 — "영농정착지원사업" vs "영농정착지원 사업대상자" 수렴용
  "교육생",
  "수강생",
  "참가자",
  "대상자",
  "신청접수",
  "신규신청",
  "추가모집",
  "모집공고",
  "모집안내",
  "선발안내",
  "신청안내",
  "일정변경",
  "수요조사",
  "역량강화",
  "모집",
  "선발",
  "신청",
  "접수",
  "안내",
  "공고",
  "알림",
  "공모",
  "개최",
  "참여",
  "계획",
  "배정",
  "선정",
  "추진",
  "점검",
  "이행",
  "의무",
  "신규",
  "연장",
];

/** 조사·연결어 — 정규화 마지막에 제거 */
const CONNECTOR_RE = /및|으로|에서|하는|합니다|바랍니다|과제|관련|위한|또는/g;

/**
 * 초-일반 stem 블록리스트 — 정규화 후 이 값이 되면 그룹핑하지 않는다.
 * 서로 다른 사업이 우연히 같은 일반 명사로 수렴하는 오그룹을 차단.
 */
const GENERIC_STEMS = new Set<string>([
  "교육",
  "교육과정",
  "농업인교육",
  "과정",
  "지원",
  "지원사업",
  "농업교육",
]);

/**
 * 제목을 모사업 그룹 키로 정규화한다.
 *
 * 처리 순서:
 *  1. `(...)`·`[...]` 부가 설명 내용 제거 (예: "(4~5차)", "(예정)")
 *  2. `「」『』【】《》〈〉` 브래킷은 사업명을 감싸므로 내용은 남기고 기호만 공백 치환
 *  3. 연도·월·날짜·상/하반기 제거
 *  4. 차수·기수·회차 제거 (제N차, N차, N~M차, N기 …)
 *  5. 지역명·기관명 제거
 *  6. 공고 동작어 노이즈 제거
 *  7. 조사·기호·공백 전부 제거 후 반복 명사(교육교육 등) 축약
 *
 * 정규화 결과 길이가 너무 짧으면(< 4바이트) 빈 문자열을 반환해 그룹핑에서 제외한다.
 */
export function normalizeCrawlTitle(title: string): string {
  if (!title) return "";
  let t = title;

  // 1. 괄호·대괄호 부가 설명 내용 제거
  t = t.replace(/\([^)]*\)/g, " ").replace(/\[[^\]]*\]/g, " ");
  // 2. 사업명 래핑 브래킷 기호만 제거 (내용 보존)
  t = t.replace(/[「」『』【】《》〈〉]/g, " ");
  // 3. 연도·날짜·월·상하반기
  t = t.replace(/20\d{2}\s*년?/g, " ");
  t = t.replace(/\d{4}\.\s*\d{1,2}\.?\s*\d{0,2}\.?/g, " ");
  t = t.replace(/\d{1,2}\s*월/g, " ");
  t = t.replace(/상반기|하반기/g, " ");
  // 4. 차수·기수·회차 (숫자 범위 포함)
  t = t.replace(/제?\s*\d+\s*[~\-]?\s*\d*\s*(차|기수|기|회차|회)/g, " ");
  // 5. 지역명·기관명 제거 (긴 토큰 우선)
  for (const token of REGION_TOKENS) t = t.split(token).join(" ");
  for (const token of ORG_TOKENS) t = t.split(token).join(" ");
  // 6. 공고 동작어 노이즈 제거 (긴 토큰 우선)
  for (const token of NOISE_TOKENS) t = t.split(token).join(" ");
  // 7-a. 조사·연결어
  t = t.replace(CONNECTOR_RE, " ");
  // 7-b. 남은 기호·공백 전부 제거
  t = t.replace(/[\s·,./~\-—:!*"'()[\]<>=+&＀-￯]/g, "");
  t = t.replace(/[^가-힣0-9A-Za-z]/g, "");
  // 7-c. 반복 명사 축약 (예: "기술교육교육" → "기술교육")
  t = t.replace(/(교육|과정|사업|모집|공고)\1+/g, "$1");

  if (t.length < 4 || GENERIC_STEMS.has(t)) return "";
  return t;
}

/** id가 크롤 유래인지 판정 */
export function isCrawlRow(id: string): boolean {
  return typeof id === "string" && id.startsWith("crawl");
}

/**
 * 그룹 대표 선정.
 * - 활성(마감 아님) 멤버가 있으면 그 중에서 (모집중 우선 → 마감 임박순).
 * - 활성 멤버가 없으면(전부 마감) 최신 등록순(createdAt desc → applicationEnd desc).
 */
function pickRepresentative<T extends CrawlGroupable>(members: T[]): T {
  const active = members.filter((m) => m.status !== "마감");
  if (active.length > 0) {
    return [...active].sort((a, b) => {
      const ar = a.status === "모집중" ? 0 : 1;
      const br = b.status === "모집중" ? 0 : 1;
      if (ar !== br) return ar - br;
      const ae = a.applicationEnd || "9999-12-31";
      const be = b.applicationEnd || "9999-12-31";
      return ae.localeCompare(be);
    })[0];
  }
  return [...members].sort((a, b) => {
    const ac = a.createdAt ?? "";
    const bc = b.createdAt ?? "";
    if (ac !== bc) return bc.localeCompare(ac);
    return (b.applicationEnd || "").localeCompare(a.applicationEnd || "");
  })[0];
}

/** 나머지 멤버 표시 순서 — 활성 우선, 그 안에서 마감 임박순. */
function sortMembersForDisplay<T extends CrawlGroupable>(members: T[]): T[] {
  return [...members].sort((a, b) => {
    const rank = (s: RowStatus) => (s === "모집중" ? 0 : s === "모집예정" ? 1 : 2);
    const ra = rank(a.status);
    const rb = rank(b.status);
    if (ra !== rb) return ra - rb;
    const ae = a.applicationEnd || "9999-12-31";
    const be = b.applicationEnd || "9999-12-31";
    return ae.localeCompare(be);
  });
}

/**
 * 크롤 row를 동일 모사업 그룹으로 묶는다.
 *
 * - id가 "crawl"로 시작하지 않는 row(정적·API)는 그룹핑 대상에서 제외하고 그대로 통과.
 * - 그룹 크기가 1이면 그룹핑하지 않고 원본 그대로 반환.
 * - 그룹 크기가 2 이상이면 대표 1건만 남기고 crawlGroup 정보를 부착.
 * - 원본 배열의 상대 순서를 보존한다(대표는 그룹 최초 등장 위치에 배치).
 */
export function groupCrawlRows<T extends CrawlGroupable>(rows: T[]): T[] {
  // 1. 버킷 구성 (그룹핑 대상만 stem 키, 나머지는 고유 키)
  const keyOf = (r: T): string => {
    if (!isCrawlRow(r.id)) return `__uniq__${r.id}`;
    const stem = normalizeCrawlTitle(r.title);
    return stem ? `stem__${stem}` : `__uniq__${r.id}`;
  };

  const buckets = new Map<string, T[]>();
  for (const r of rows) {
    const k = keyOf(r);
    const bucket = buckets.get(k);
    if (bucket) bucket.push(r);
    else buckets.set(k, [r]);
  }

  // 2. 그룹(크기≥2) 버킷의 대표 계산
  const repByKey = new Map<string, T>();
  for (const [k, members] of buckets) {
    if (members.length < 2) continue;
    const rep = pickRepresentative(members);
    const others = sortMembersForDisplay(members.filter((m) => m.id !== rep.id));
    repByKey.set(k, {
      ...rep,
      crawlGroup: {
        size: members.length,
        others: others.map((m) => ({
          id: m.id,
          region: m.region,
          status: m.status,
        })),
      },
    });
  }

  // 3. 원본 순서 보존하며 출력. 그룹은 최초 등장 위치에 대표 1건만.
  const emitted = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const k = keyOf(r);
    const members = buckets.get(k)!;
    if (members.length < 2) {
      out.push(r);
      continue;
    }
    if (!emitted.has(k)) {
      emitted.add(k);
      out.push(repByKey.get(k)!);
    }
    // 그룹의 나머지 멤버는 스킵
  }

  return out;
}
