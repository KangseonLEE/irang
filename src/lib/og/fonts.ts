/** OG 이미지 전용 폰트 로딩 + 모듈 레벨 캐싱
 *
 * 나눔명조 ExtraBold — 로고 워드마크 전용 ("이랑" 2글자 서브셋)
 * layout.tsx의 --font-logo: "Nanum Myeongjo" 와 동일한 폰트.
 */

type FontData = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal";
};

let cache: FontData[] | null = null;

function extractFontUrl(css: string): string | null {
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  return match ? match[1] : null;
}

export async function getOGFonts(): Promise<FontData[]> {
  if (cache) return cache;

  try {
    // "이랑" 2글자만 서브셋 — layout.tsx와 동일한 파라미터
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@800&display=swap&text=%EC%9D%B4%EB%9E%91",
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

    if (!url) {
      console.warn("[OG fonts] Failed to extract font URL from CSS");
      return [];
    }

    const fontRes = await fetch(url);
    const data = await fontRes.arrayBuffer();

    cache = [
      { name: "Nanum Myeongjo", data, weight: 800, style: "normal" as const },
    ];

    return cache;
  } catch (err) {
    console.warn("[OG fonts] Font loading failed, using fallback:", err);
    return [];
  }
}
