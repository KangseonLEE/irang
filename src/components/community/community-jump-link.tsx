import { MessageSquareText } from "lucide-react";
import s from "./community-jump-link.module.css";

/**
 * 상단에서 의견란으로 보내는 한 줄 (2026-09-17).
 *
 * 작성 UI 는 상세 페이지 맨 아래에 이미 항상 떠 있지만, 실측하면 모바일 375 기준
 * 작물 6.4화면 · 시·도 8.9화면 · 시·군·구 7.3화면 아래다(문서 69~85% 지점).
 * 45일간 작성 1건인 건 쓸 말이 없어서가 아니라 **거기까지 가는 사람이 없어서**로 보인다.
 *
 * 섹션을 위로 올리는 방법도 검토했지만, 의견란이 재배·통계 같은 핵심 정보보다
 * 앞에 오는 건 더 나쁘다 — 위치는 두고 **위에서 건너뛸 길**을 준다.
 *
 * 순수 앵커라 JS 없이 동작하고 데스크탑·모바일 차이가 없다. 계측은
 * `data-community-jump` + 전역 AssessEntryTracker 위임.
 */
export function CommunityJumpLink({ from }: { from: string }) {
  return (
    <a href="#community-notes" className={s.link} data-community-jump={from}>
      <MessageSquareText size={14} className={s.icon} aria-hidden="true" />
      한마디 남기기
    </a>
  );
}
