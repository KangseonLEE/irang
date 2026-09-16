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
/**
 * JSON-LD 직렬화 — `<script>` 문맥 탈출 문자를 유니코드 이스케이프한다 (2026-09-16 보안 점검).
 *
 * `JSON.stringify` 결과를 그대로 script 안에 넣으면, 데이터에 `</script>` 가 섞이는 순간
 * 태그가 닫히고 뒤가 HTML 로 해석된다. 현재 JSON-LD 입력은 큐레이션된 정적·DB 데이터라
 * 실제 주입 경로는 없지만, 앞으로 사용자 생성 문자열(커뮤니티·검색어)이 한 번이라도
 * 섞이면 즉시 XSS 가 된다 — 입력을 믿는 대신 출력에서 끊는다.
 *
 * `<`·`>`·`&` 를 이스케이프해도 JSON 파서는 동일한 문자열로 복원한다.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd<T extends Thing = Thing>({
  data,
}: {
  data: WithContext<T> | Record<string, unknown>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd(data),
      }}
    />
  );
}
