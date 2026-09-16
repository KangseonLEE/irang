import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/components/seo/json-ld";

describe("JSON-LD 직렬화 — script 문맥 탈출 차단", () => {
  it("</script> 가 태그를 닫지 못한다", () => {
    const out = serializeJsonLd({ name: "</script><img src=x onerror=alert(1)>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<img");
    expect(out).toContain("\\u003c");
  });

  it("이스케이프해도 JSON 파서는 원문을 복원한다", () => {
    const data = { name: "밭 <이랑> & 고랑", nested: { q: "a</script>b" } };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it("일반 데이터는 그대로 통과한다", () => {
    expect(JSON.parse(serializeJsonLd({ "@type": "WebSite", name: "이랑" }))).toEqual({
      "@type": "WebSite",
      name: "이랑",
    });
  });
});
