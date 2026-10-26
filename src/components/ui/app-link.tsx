import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * 사이트 공용 링크 — `next/link` 와 같고 **미리 받기(prefetch) 기본값만 끈다** (2026-10-26).
 *
 * 배경: Vercel 무료 한도(Fluid Active CPU) 157% 초과. 로컬 운영 빌드로 재 보니 페이지 1회 열람에
 * 화면에 보이는 링크의 미리 받기가 17~34건 따라붙어 서버 CPU 300~680ms — 페이지 자체 렌더(10~30ms)의
 * 약 20배였다. 하단 탭(/regions·/match·/programs)·검색 조건 목록처럼 동적 화면은 미리 받기마다 함수가 돈다.
 *
 * `prefetch={false}` 여도 데스크탑은 마우스를 올리면 미리 받는다(Next 기본 동작) — 클릭할 링크만 받는다.
 * 꼭 미리 받아야 하는 링크는 `prefetch` 를 명시해 켠다. `next/link` 직접 import 는 린트가 막는다.
 */
export default function AppLink({ prefetch = false, ...rest }: ComponentProps<typeof Link>) {
  return <Link prefetch={prefetch} {...rest} />;
}
