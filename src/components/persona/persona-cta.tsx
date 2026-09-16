import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import s from "./persona-cta.module.css";

/** 진단 목적지 — `/assess` 는 여기로 넘기는 리다이렉트 전용 페이지라 홉을 건너뛴다 (9/16) */
const ASSESS_HREF = "/match?mode=assess";

interface Props {
  /**
   * 현재 적용된 페르소나. 목록 페이지는 `searchParams.persona` 를 그대로 넘긴다.
   * 서버에서 prop 으로 받는 이유: `useSearchParams` 를 쓰면 Suspense 없이는 bailout 이
   * 페이지 루트까지 전파돼 SSR 본문이 통째로 사라진다(6/1 홈 히어로 사고). 유입의 61%가
   * Organic Search 라 이 사이트에서 SSR 훼손은 가장 비싼 실수다.
   */
  persona?: string;
  /** GA `assess_entry_click` 의 label — 어느 지면이 도달을 만드는지 가른다 */
  from: string;
  /** 페르소나 정렬을 지원하지 않는 지면(지역 등)의 안내 문구 */
  copy?: string;
}

/**
 * 진단 진입 컨텍스트 배너 (2026-09-16).
 *
 * 배경: 활성 622명 중 진단 화면(/match) 도달 22명(3.5%)이 유일한 병목인데, 랜딩은 유입의
 * 9.4%뿐이고 목록·상세가 3.9배다. 그런데 목록·상세 본문에는 진단 진입이 0개였다.
 * `/crops`·`/programs` 는 이미 `?persona=` 정렬을 지원하므로(normalize 화이트리스트 등록 확인),
 * 진단은 그 persona 를 만들어내는 장치다 — 이미 있는 기능과 생산자를 잇는 한 줄이다.
 *
 * Server Component. 클릭 계측은 `data-assess-entry` + 전역 AssessEntryTracker 가 맡는다.
 */
export function PersonaCta({ persona, from, copy }: Props) {
  const applied = persona ? PERSONA_INDEX.get(persona as PersonaId) : undefined;

  return (
    <div className={s.banner}>
      <div className={s.left}>
        <Compass size={14} className={s.icon} aria-hidden="true" />
        <span className={s.label}>{applied ? "맞춤 정렬 중" : "유형 진단"}</span>
        <span className={s.text}>
          {applied
            ? `${applied.label} 기준으로 정렬했어요`
            : (copy ?? "내 조건에 맞는 순서로 볼까요?")}
        </span>
      </div>
      <Link href={ASSESS_HREF} className={s.cta} data-assess-entry={from}>
        {applied ? "다시 진단하기" : "2분 진단 시작"}
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
