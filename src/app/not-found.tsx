import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={s.container}>
      <span className={s.code}>404</span>
      <h2 className={s.title}>
        페이지를 찾지 못했어요
      </h2>
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
