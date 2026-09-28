import { Info } from "lucide-react";
import s from "./reference-notice.module.css";

interface ReferenceNoticeProps {
  text?: string;
  className?: string;
}

/**
 * 참고용 정보 안내 — 데이터 의사결정 페이지 상단에 배치. Server Component.
 *
 * 9/28 회장 결정으로 "자세히 보기"(/about/disclaimer) 링크 제거 — 면책 고지는 푸터에 상존하고,
 * 상세 페이지 상단에서 밖으로 나가는 링크는 본문 진입을 방해한다. 문장만 남긴다.
 */
export function ReferenceNotice({
  text = "이 정보는 공공데이터를 가공한 참고 자료예요. 중요한 결정은 해당 기관에 직접 확인하세요.",
  className,
}: ReferenceNoticeProps) {
  return (
    <div className={`${s.notice} ${className ?? ""}`}>
      <Info size={14} className={s.icon} aria-hidden="true" />
      <p className={s.text}>{text}</p>
    </div>
  );
}
