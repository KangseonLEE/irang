import type { Metadata } from "next";

/**
 * `/start`·`/start/<id>` 공유 카드 메타 (10/3 QA — 두 화면의 og:title·description 이 사이트 기본값이었다).
 *
 * 페이지가 `openGraph` 를 정의하면 레이아웃의 `openGraph` 는 **통째로 대체**된다(얕은 병합 — Next 16 generate-metadata
 * "Merging"). 그래서 제목·설명만 넣으면 og:image·site_name·locale 이 사라진다(/stats 실측). 사이트 기본 OG 이미지와
 * 사이트 정보를 함께 다시 싣는다. `twitter` 도 레이아웃 값(사이트 기본 제목)이 남지 않게 같이 정한다.
 */
const SITE_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "이랑 — 농촌 정착 정보 큐레이션 포탈",
};

export function startShareMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "ko_KR",
      siteName: "이랑",
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE_OG_IMAGE.url],
    },
  };
}
