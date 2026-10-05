import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getInterviewTeaser } from "@/lib/data/interview-summary";
import s from "./interview-strip.module.css";

/**
 * 랜딩 인터뷰 한 줄 진입점 (2026-10-05 회장 결재 B안).
 *
 * 다크 띠 + 캐러셀 6장(모바일 7.3화면 지점·0.8화면 높이)을 얇은 링크 띠 하나로 줄였다.
 * 근거: GA4 28일 — 랜딩 41명 중 인터뷰 섹션 도달 12명·클릭 0명. 이야기는 작물·지역 상세의
 * "정착한 사람"(components/interview/interview-context-section)이 맥락 안에서 보여 준다.
 *
 * 계측 연속성: 부모 `ScrollReveal trackId="interviews"`(노출)와 이 링크의 `data-track="interviews:view_all"`
 * (클릭, LandingClickTracker)은 그대로 — 2주 뒤 같은 지표로 전/후를 비교한다.
 * 띠 전체가 링크 하나라 터치 대상이 띠 높이(64px+)다. Server Component.
 */
export function InterviewStrip() {
  const { total, faces } = getInterviewTeaser();

  return (
    <section className={s.strip} aria-labelledby="landing-interviews-title" data-interview-strip>
      <Link href="/interviews" className={s.link} data-track="interviews:view_all">
        {faces.length > 0 && (
          <span className={s.faces} aria-hidden="true">
            {faces.map((f) => (
              <Image key={f.id} src={f.image} alt="" width={44} height={44} className={s.face} />
            ))}
          </span>
        )}
        <div className={s.text}>
          <h2 id="landing-interviews-title" className={s.title}>
            {`먼저 떠난 ${total}명의 이야기`}
          </h2>
          <span className={s.more}>
            모두 보기
            <ArrowRight size={16} aria-hidden="true" className={s.moreIcon} />
          </span>
        </div>
      </Link>
    </section>
  );
}
