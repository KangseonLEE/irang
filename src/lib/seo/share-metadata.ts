import type { Metadata } from "next";

/**
 * 공유 카드 메타(openGraph + twitter) SSOT (10/3 — `/start` 전용 헬퍼를 승격).
 *
 * 페이지가 `openGraph` 를 정의하면 레이아웃의 `openGraph` 는 **통째로 대체**된다(얕은 병합 — Next 16 generate-metadata
 * "Merging"). 제목·설명만 넣으면 og:image·site_name·locale 이 사라지고, `twitter` 를 안 정하면 레이아웃의 사이트 기본
 * 제목이 그대로 남는다(10/3 QA: /stats·/start·/programs/roadmap·/events/[id]·작물·지역 상세). 그래서 페이지는 이 함수로
 * 둘을 함께 정한다.
 *
 * 헬퍼 두 개 — 둘 다 쓴다:
 * - `shareMetadata` — 공유 카드(openGraph·twitter)만. 제목은 **공유 카드에 그대로 나갈 문자열**(" | 이랑" 포함)을 받는다.
 *   문서 제목·설명·canonical 은 페이지가 따로 정한다(검색 결과용 제목이 공유 제목과 다른 상세 페이지 등).
 * - `pageMetadata` — 문서 제목·설명·canonical·공유 카드 한 벌. 제목은 **접미 없이** 받아 문서 제목엔 레이아웃 템플릿이,
 *   공유 카드엔 이 함수가 " | 이랑" 을 붙인다. 두 제목이 같은 값에서 나와 "| 이랑 | 이랑"·사이트 기본 카드가 생기지 않는다.
 */
const SITE_NAME = "이랑";

/**
 * 레이아웃 제목 템플릿(`"%s | 이랑"`, src/app/layout.tsx)과 같은 접미.
 * 문서 제목(`metadata.title`)에는 템플릿이 붙이므로 **쓰지 않는다** — 직접 붙이면 "… | 이랑 | 이랑"(10/6 QA Q2-W2).
 * 공유 카드 제목(og:title·twitter:title)은 템플릿을 거치지 않으니 pageMetadata 가 붙인다.
 */
const SITE_TITLE_SUFFIX = " | 이랑";

const SITE_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  // 레이아웃 기본 OG 이미지 alt 와 같은 문구 (10/6 "귀농" 복원)
  alt: "이랑 — 귀농·귀촌 정보 큐레이션 포탈",
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
 * 페이지 metadata 한 벌 — 문서 제목·설명·canonical·공유 카드를 **같은 값에서** 만든다 (10/6 QA Q2-W2·W3).
 *
 * - `title` 은 접미 없이 받는다. 문서 제목은 레이아웃 템플릿이 " | 이랑" 을 붙이고, 공유 카드 제목에는 여기서 붙인다.
 * - 공유 카드를 안 정한 페이지는 레이아웃의 사이트 기본 카드(og:title "이랑 — …", og:url 없음)가 그대로 나갔다.
 * - 라우트에 `opengraph-image` 파일이 있어도 여기서 싣는 images 가 그것을 덮는다(10/6 dev 실측) — 라우트 전용 카드를 쓰려면
 *   `image` 로 그 경로(`/…/opengraph-image`)를 넘긴다(작물·지역·진단 결과 상세가 그렇게 한다).
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  /** 접미 없는 페이지 제목 */
  title: string;
  description: string;
  /** canonical·og:url — metadataBase 기준 경로 */
  path: string;
  image?: ShareImage;
}): Pick<Metadata, "title" | "description" | "alternates" | "openGraph" | "twitter"> {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...shareMetadata({ title: `${title}${SITE_TITLE_SUFFIX}`, description, path, image }),
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
