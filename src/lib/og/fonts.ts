/** OG 이미지 전용 폰트 로딩 + 모듈 레벨 캐싱
 *
 * 1) 나눔명조 ExtraBold — 로고 워드마크 전용 ("이랑" 2글자 서브셋)
 * 2) Noto Sans KR — 한글 본문용 (귀농 유형명, 지역명 등 필요 글자 서브셋)
 */

type FontData = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal";
};

let logoCache: FontData[] | null = null;
let bodyCache: FontData[] | null = null;

function extractFontUrl(css: string): string | null {
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  return match ? match[1] : null;
}

async function fetchGoogleFont(
  family: string,
  weight: FontData["weight"],
  text: string
): Promise<FontData | null> {
  try {
    const encoded = encodeURIComponent(text);
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap&text=${encoded}`,
      {
        headers: {
          // woff 포맷 요청 (Satori는 woff2 미지원)
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko",
        },
      }
    );

    const css = await cssRes.text();
    const url = extractFontUrl(css);
    if (!url) return null;

    const fontRes = await fetch(url);
    const data = await fontRes.arrayBuffer();

    return { name: family.replace(/\+/g, " "), data, weight, style: "normal" };
  } catch {
    return null;
  }
}

/** 로고 전용 폰트 (나눔명조 ExtraBold, "이랑" 2글자) */
export async function getOGFonts(): Promise<FontData[]> {
  if (logoCache) return logoCache;

  const font = await fetchGoogleFont("Nanum+Myeongjo", 800, "이랑");
  logoCache = font ? [font] : [];
  return logoCache;
}

/**
 * 결과 카드용 한글 폰트 — 로고 + 본문 (Noto Sans KR 700)
 *
 * 서브셋 범위: 귀농 유형명, 지역명, 고정 문구에 사용되는 글자만 포함
 */
const BODY_SUBSET = [
  "나의귀농준비결과추천지역",             // 고정 문구
  "주말농부형스마트팜전원생활청년창업",     // 유형명
  "서울인천경기강원충남북전대구부산울광주세종제주", // 지역 shortName
  "도시와의균형을찾는당신",               // 유형 tagline 일부
  "기술로업미래열어가",                   // tagline 일부
  "자연속에새삶꿈꾸",                     // tagline 일부
  "·",                                   // 구분자
].join("");

export async function getOGFontsWithBody(): Promise<FontData[]> {
  const logo = await getOGFonts();

  if (bodyCache) return [...logo, ...bodyCache];

  const font = await fetchGoogleFont("Noto+Sans+KR", 700, BODY_SUBSET);
  bodyCache = font ? [font] : [];
  return [...logo, ...bodyCache];
}

/**
 * 적합도 진단 결과 OG용 한글 폰트
 * 차원 라벨, 티어 이름, 점수 등 진단 결과에 필요한 글자 서브셋
 */
let assessCache: FontData[] | null = null;

const ASSESS_SUBSET = [
  // 고정 문구
  "나의귀농적합도진단결과총점40",
  // 차원 라벨
  "동기마인드셋재정준비도가족생활환경경험역량적응력성향",
  // 티어 이름
  "씨앗을품은단계가능이자라나새싹든하게된모종랑일굴",
  // 숫자 및 기호
  "0123456789/%·점",
  // 로고
  "이랑",
  // irang.info
  "irang.info",
].join("");

export async function getOGFontsForAssess(): Promise<FontData[]> {
  const logo = await getOGFonts();

  if (assessCache) return [...logo, ...assessCache];

  const font = await fetchGoogleFont("Noto+Sans+KR", 700, ASSESS_SUBSET);
  assessCache = font ? [font] : [];
  return [...logo, ...assessCache];
}
