import type { Metadata } from "next";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./not-found.module.css";

/**
 * 404 화면 메타 (10/6 2차 QA R2-Q2) — 예전엔 사이트 기본 제목이 나가고, 레이아웃의 canonical "/" 를 물려받아
 * 없는 주소가 홈을 정식 주소로 가리켰다. 제목은 레이아웃 템플릿으로 "… | 이랑", canonical 은 지운다(noindex 는 Next 가 넣는다).
 */
export const metadata: Metadata = {
  title: "페이지를 찾지 못했어요",
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className={s.container}>
      {/* 장식 숫자 — 제목(h1)이 같은 뜻을 말해 보조기기에선 감춘다 */}
      <span className={s.code} aria-hidden="true">404</span>
      {/* 404 화면의 문서 제목 — h1 이 없던 화면이었다 (10/6 QA Q2-X13) */}
      <h1 className={s.title}>
        페이지를 찾지 못했어요
      </h1>
      <p className={s.description}>
        주소가 바뀌었거나 사라진 페이지예요.
      </p>
      <div className={s.actions}>
        <Link href="/" className={s.primaryButton}>
          <Icon icon={Home} size="md" />
          홈으로
        </Link>
        <Link href="/regions" className={s.outlineButton}>
          <Icon icon={ArrowLeft} size="md" />
          지역 비교
        </Link>
      </div>
    </div>
  );
}
