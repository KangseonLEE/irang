import type { Thing, WithContext } from "schema-dts";

/**
 * JSON-LD 구조화 데이터 렌더러.
 *
 * `<script type="application/ld+json">` 태그를 렌더링한다.
 * Next.js App Router의 `<head>` 내부 또는 `<body>` 어디에나 배치 가능.
 *
 * schema-dts 타입은 `query-input` 등 일부 schema.org 속성을 정의하지 않으므로,
 * 타입 파라미터 `T`는 호출부에서의 문서화 용도로만 사용하고
 * 런타임 데이터는 유연한 Record 형태로 받는다.
 *
 * @example
 * ```tsx
 * <JsonLd<WebSite>
 *   data={{
 *     "@context": "https://schema.org",
 *     "@type": "WebSite",
 *     name: "이랑",
 *   }}
 * />
 * ```
 */
export function JsonLd<T extends Thing = Thing>({
  data,
}: {
  data: WithContext<T> | Record<string, unknown>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
