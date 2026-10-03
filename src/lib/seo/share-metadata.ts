import type { Metadata } from "next";

/**
 * 공유 카드 메타(openGraph + twitter) SSOT (10/3 — `/start` 전용 헬퍼를 승격).
 *
 * 페이지가 `openGraph` 를 정의하면 레이아웃의 `openGraph` 는 **통째로 대체**된다(얕은 병합 — Next 16 generate-metadata
 * "Merging"). 제목·설명만 넣으면 og:image·site_name·locale 이 사라지고, `twitter` 를 안 정하면 레이아웃의 사이트 기본
 * 제목이 그대로 남는다(10/3 QA: /stats·/start·/programs/roadmap·/events/[id]·작물·지역 상세). 그래서 페이지는 이 함수로
 * 둘을 함께 정한다.
 */
const SITE_NAME = "이랑";

const SITE_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "이랑 — 농촌 정착 정보 큐레이션 포탈",
};

interface ShareImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export function shareMetadata({
  title,
  description,
  path,
  image = SITE_OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  /** 없으면 사이트 기본 OG 이미지 */
  image?: ShareImage;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

/**
 * 외부 원본 사진을 공유 카드에 쓸 때 — 이미지 최적화 경로로 1200px 로 줄인다.
 * 그린대로 살아보기 원본은 5472px·7MB 라 그대로 걸면 메신저·SNS 미리보기 용량 한도를 넘는다.
 * `w`·`q` 는 next.config `images.deviceSizes`·`qualities` 에 있는 값이어야 한다(아니면 400).
 */
export function optimizedShareImage(src: string, alt: string): ShareImage {
  return {
    url: `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=70`,
    width: 1200,
    alt,
  };
}
