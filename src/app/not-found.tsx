import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={s.container}>
      {/* 장식 숫자 — 제목(h1)이 같은 뜻을 말한다. 연한 색이라 글자로 읽히면 대비 미달(1.35:1) */}
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
