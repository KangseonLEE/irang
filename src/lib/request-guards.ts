import { NextResponse } from "next/server";

/**
 * 공개 POST 의 Content-Type 강제 (2026-10-16 보안 QA ⚪15).
 *
 * `req.json()` 은 Content-Type 을 보지 않는다. 그래서 다른 사이트가 `text/plain` 단순 요청
 * (CORS preflight 가 없는 요청)으로 방문자 브라우저를 통해 우리 API 에 글·로그를 넣을 수 있었다.
 * `application/json` 은 단순 요청이 아니라 교차 출처면 preflight 가 필요하고, 우리는 CORS 를 열지 않는다.
 *
 * 우리 호출처는 전부 `Content-Type: application/json` 을 보낸다(호출처 grep 확인, 10/16).
 * `navigator.sendBeacon` 은 Blob 타입을 지정하지 않으면 text/plain 이 된다 — 새로 쓸 땐
 * `new Blob([json], { type: "application/json" })` 로 보낼 것.
 */
export function isJsonContentType(req: { headers: Headers }): boolean {
  const ct = req.headers.get("content-type") ?? "";
  const mime = ct.split(";")[0]?.trim().toLowerCase();
  return mime === "application/json";
}

export function unsupportedMediaType(): NextResponse {
  return NextResponse.json(
    { error: "Content-Type must be application/json" },
    { status: 415, headers: { "Cache-Control": "private, no-store" } },
  );
}
