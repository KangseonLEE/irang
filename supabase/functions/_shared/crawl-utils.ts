/**
 * 크롤링 유틸리티
 * - HTML 파싱, 소프트 404 감지, URL 헬스체크
 * - CLAUDE.md 규칙 8번 "외부 URL 검증은 이중 체크 필수" 준수
 *
 * 크롤 대상:
 *   1. rda.go.kr/young/custom.do — 똑똑!청년농부 (지원사업 + 교육)
 *   2. uni.agrix.go.kr — 농림부 통합 지원사업 (JSON API)
 *
 * ※ returnfarm.com → 도메인 만료(2026년 기준)
 * ※ greenroad.go.kr → 접속 불가
 */

// ─── 소프트 404 감지 키워드 ───

const SOFT_404_KEYWORDS = [
  "찾을 수 없",
  "not found",
  "404",
  "에러",
  "존재하지",
  "서비스를 찾",
  "오류",
  "접근할 수 없",
  "페이지를 찾",
  "페이지 없",
];

/** HTML에서 <title> 추출 */
export function parseHtmlTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : "";
}

/** 소프트 404 여부 판별 (타이틀 기반) */
export function isSoft404(html: string): boolean {
  const title = parseHtmlTitle(html).toLowerCase();
  return SOFT_404_KEYWORDS.some((kw) => title.includes(kw.toLowerCase()));
}

/** URL 헬스 체크 (이중 검증: 상태코드 + 타이틀) */
export async function checkUrlHealth(
  url: string
): Promise<"active" | "broken" | "unverified"> {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return "broken";

    const html = await res.text();
    if (isSoft404(html)) return "broken";

    return "active";
  } catch {
    return "unverified";
  }
}

// ─── 크롤링 대상 정의 ───

export type CrawlTargetType = "rda-listing" | "agrix-api" | "rda-events";

export interface CrawlTarget {
  id: string;
  name: string;
  url: string;
  category: "programs" | "education" | "events";
  type: CrawlTargetType;
  /** POST 요청 시 추가 파라미터 */
  params?: Record<string, string>;
}

export const CRAWL_TARGETS: CrawlTarget[] = [
  {
    id: "rda-programs",
    name: "똑똑!청년농부 지원사업",
    url: "https://www.rda.go.kr/young/custom.do",
    category: "programs",
    type: "rda-listing",
    // 사업 체크박스 → JS에서 세부 카테고리 문자열로 변환하여 전송
    params: {
      search_category: "자금,창업,주거,일자리,농지,네트워크,컨설팅,판로",
      search_ingState: "진행중",
    },
  },
  {
    id: "rda-education",
    name: "똑똑!청년농부 교육과정",
    url: "https://www.rda.go.kr/young/custom.do",
    category: "education",
    type: "rda-listing",
    params: { search_category: "교육", search_ingState: "진행중" },
  },
  {
    id: "agrix-programs",
    name: "농림부 통합 지원사업",
    url: "https://uni.agrix.go.kr/docs7/customizedNew/introduce/IntroduceSaupList.do",
    category: "programs",
    type: "agrix-api",
  },
  {
    id: "rda-events",
    name: "똑똑!청년농부 행사·체험",
    url: "https://www.rda.go.kr/young/custom.do",
    category: "events",
    type: "rda-events",
  },
];

// ─── 크롤 결과 타입 ───

export interface CrawledItem {
  title: string;
  url: string;
  region: string;
  organization: string;
  status: string;
  dateStart?: string;
  dateEnd?: string;
  capacity?: string;
}

// ═══════════════════════════════════════
// 1. RDA 똑똑!청년농부 HTML 파서
// ═══════════════════════════════════════

/**
 * rda.go.kr/young/custom.do POST 요청으로 목록 HTML 가져오기
 *
 * 이 페이지는 전통적 form POST 방식 (AJAX 아님).
 * fn_search() JS가 폼 값을 변환 후 submit → 서버가 HTML로 응답.
 * pKey: "L" = 리스트 뷰, "G" = 카드 뷰
 */
export async function fetchRdaListing(
  params: Record<string, string> = {}
): Promise<CrawledItem[]> {
  const formData = new URLSearchParams({
    cp: "1",
    pKey: "L",       // 리스트 뷰 (테이블 형식)
    search_sort: "",
    search_keyword: "",
    search_area1: "00",  // 00 = 전국
    search_area2: "",
    search_category: "",
    search_ingState: "",
    search_agency: "",
    search_only: "",
    so: "",
    sd: "",
    ed: "",
    sv: "",
    oc: "",
    ob: "",
    sId: "",
    checkedSId: "",
    ...params,
  });

  try {
    const res = await fetch("https://www.rda.go.kr/young/custom.do", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    return parseRdaListingHtml(html);
  } catch (err) {
    console.error("[crawl] RDA listing fetch failed:", err);
    return [];
  }
}

/**
 * RDA 목록 HTML 파싱
 * - 테이블 <tr> 행에서 상태, 카테고리, 지역, 제목, 금액, 마감일, 첨부 추출
 * - 제목 <a> 태그에서 fn_detailView('policy','46753') 패턴으로 상세 URL 생성
 *
 * 실제 테이블 컬럼 (7개):
 *   [0] 진행상태  [1] 유형  [2] 지역  [3] 사업명
 *   [4] 지원금액  [5] 신청마감일  [6] 첨부파일
 */
function parseRdaListingHtml(html: string): CrawledItem[] {
  const items: CrawledItem[] = [];

  // <tbody> 이후의 <tr> 행만 파싱 (thead 제외)
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return items;

  const tbodyHtml = tbodyMatch[1];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowPattern.exec(tbodyHtml)) !== null) {
    const rowHtml = rowMatch[1];

    // <td> 셀 추출
    const cells: string[] = [];
    const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let cellMatch;
    while ((cellMatch = cellPattern.exec(rowHtml)) !== null) {
      cells.push(
        cellMatch[1]
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      );
    }

    // 최소 6개 셀 필요 (상태, 유형, 지역, 제목, 금액, 마감일)
    if (cells.length < 6) continue;

    const status = cells[0]; // 진행중, 예정, 마감
    const region = cells[2];
    const title = cells[3];
    const deadline = cells[5]; // 5번 인덱스 = 신청 마감일 (4번은 지원금액)

    if (!title || title.length < 3) continue;
    // "조회된 데이터가 없습니다" 행 스킵
    if (title.includes("조회된") && title.includes("없습니다")) continue;

    // fn_detailView('policy','46753') 패턴에서 상세 URL 생성
    const detailMatch = rowHtml.match(
      /fn_detailView\s*\(\s*['"](\w+)['"],\s*['"](\d+)['"]\s*\)/
    );
    let detailUrl = "";
    if (detailMatch) {
      const [, typeDv, sId] = detailMatch;
      detailUrl = `https://www.rda.go.kr/young/custom/${typeDv}/view.do?sId=${sId}`;
    }

    // 상태 매핑
    let mappedStatus = "모집중";
    if (status.includes("마감")) mappedStatus = "마감";
    else if (status.includes("예정")) mappedStatus = "모집예정";

    items.push({
      title,
      url: detailUrl,
      region: region || "전국",
      organization: "농촌진흥청",
      status: mappedStatus,
      dateEnd: deadline.match(/\d{4}-\d{2}-\d{2}/)?.[0],
    });
  }

  return items;
}

// ═══════════════════════════════════════
// 2. RDA 행사·체험 크롤러 (키워드 기반)
// ═══════════════════════════════════════

const EVENT_KEYWORDS = ["박람회", "체험", "축제", "설명회", "멘토링", "현장방문", "견학"];

const EVENT_TYPE_MAP: Record<string, string> = {
  박람회: "박람회",
  체험: "일일체험",
  축제: "축제",
  설명회: "설명회",
  멘토링: "멘토링",
  현장방문: "일일체험",
  견학: "일일체험",
};

/**
 * 제목에서 행사 유형 추론
 */
export function inferEventType(title: string): string {
  for (const [kw, type] of Object.entries(EVENT_TYPE_MAP)) {
    if (title.includes(kw)) return type;
  }
  return "설명회";
}

/**
 * RDA에서 행사성 키워드로 검색 → 중복 제거 후 반환
 * 여러 키워드를 순회하며 최대 30건 수집
 */
export async function fetchRdaEvents(): Promise<CrawledItem[]> {
  const allItems: CrawledItem[] = [];
  const seenTitles = new Set<string>();

  for (const keyword of EVENT_KEYWORDS) {
    if (allItems.length >= 30) break;

    const items = await fetchRdaListing({
      search_keyword: keyword,
      search_ingState: "진행중",
    });

    for (const item of items) {
      if (seenTitles.has(item.title)) continue;
      seenTitles.add(item.title);
      allItems.push(item);
    }

    console.log(
      `[crawl] rda-events "${keyword}": ${items.length}건 (누적 ${allItems.length}건)`
    );
  }

  return allItems;
}

// ═══════════════════════════════════════
// 3. uni.agrix.go.kr JSON API 파서
// ═══════════════════════════════════════

interface AgrixResult {
  rno: number;
  sLawseq: number;
  sLawname: string;
  lawPname: string;
  qualifyNm: string;
  fundNm: string;
  chrgkwaNm: string;
  deptOrgn: string;
  reqstpdBeginYm?: string; // "202505"
  reqstpdEndYm?: string;   // "202506"
}

interface AgrixResponse {
  totCnt: number;
  result: AgrixResult[];
  lgvResult?: AgrixResult[];
}

/**
 * uni.agrix.go.kr API에서 지원사업 목록 조회
 *
 * 주의:
 * - saupYear 필수 (사이트에 표시되는 연도만 유효, 보통 현재~1년 전)
 * - concern2="농림축산식품부" 기본값 (지자체: "지자체")
 * - 2026-04 기준 saupYear 최대 2025. 동적으로 현재년-1 사용
 */
export async function fetchAgrixPrograms(
  page = 1,
  pageSize = 30
): Promise<CrawledItem[]> {
  // agrix 사이트는 데이터가 1년 지연될 수 있으므로 현재연도 - 1도 시도
  const currentYear = new Date().getFullYear();
  const yearsToTry = [currentYear, currentYear - 1];

  for (const year of yearsToTry) {
    const formData = new URLSearchParams({
      concern1: "",
      concern2: "농림축산식품부",
      deptOrgn: "",
      saupYear: String(year),
      reqBegYear: "",
      reqBegMonth: "",
      reqEndYear: "",
      reqEndMonth: "",
      searchKeyword: "",
      pageIndex: String(page),
      pageSize: String(pageSize),
    });

    try {
      const res = await fetch(
        "https://uni.agrix.go.kr/docs7/customizedNew/introduce/IntroduceSaupList.do",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: formData.toString(),
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!res.ok) continue;

      const json: AgrixResponse = await res.json();
      const allResults = [...(json.result || []), ...(json.lgvResult || [])];

      if (allResults.length > 0) {
        console.log(`[crawl] agrix: ${year}년 데이터 ${allResults.length}건`);
        return allResults.map((item) => ({
          title: item.sLawname,
          url: `https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=${item.sLawseq}`,
          region: "전국",
          organization: item.chrgkwaNm || "농림축산식품부",
          status: "모집중",
          capacity: item.qualifyNm,
        }));
      }

      console.log(`[crawl] agrix: ${year}년 데이터 없음, 이전 연도 시도`);
    } catch (err) {
      console.error(`[crawl] agrix ${year}년 fetch failed:`, err);
    }
  }

  return [];
}

// ═══════════════════════════════════════
// 공통 유틸
// ═══════════════════════════════════════

/**
 * 제목 기반 deterministic slug 생성
 */
export function crawlSlug(source: string, title: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < title.length; i++) {
    hash ^= title.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `crawl-${source}-${hex}`.slice(0, 50);
}
