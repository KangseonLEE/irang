import { splitSentences } from "@/lib/format";

export interface EligibilityItem {
  label: string;
  detail: string;
}

/**
 * `eligibilityDetail` 을 자격 체크 항목으로 파싱.
 *
 * 문장 분리는 `splitSentences` 가 맡는다 (2026-09-28 QA) — 종전의 "마침표로 무조건 자르기" 는
 * 소수점·도메인을 문장 끝으로 오인해 **사용자에게 잘린 라벨**을 그대로 보여 줬다:
 *   "…과수전업농육성대상자(과원 0" + "3ha 이상…"(0.3ha 절단·괄호 불균형)
 *   "농업e지(www" + "kr) 온라인 전용 — 오프라인 접수 불가"
 * `splitSentences` 는 괄호 깊이·숫자 뒤 마침표·도메인을 문장 경계에서 제외한다.
 *
 * 제외 키워드(자격이 아닌 정보):
 * - 신청 방법: "신청", "누리집", "포털", "콜센터", "고객센터", "온라인 전용", "오프라인 접수"
 * - 선발·구성: "선발", "선정", "구성", "팀별", "약 N명", "연간 약"
 * - 교육·체류 안내: "교육기간", "체류", "과정 운영", "월 ~월"
 * - 마감·일자 미정: "공고 시 확정", "예정 — 정확", "발표 시 확정"
 * - 접수 안내·문의처: "접수 기간", "접수 시기", "접수는", "담당 부서", "문의", "확인해야"
 */
const EXCLUDE_PATTERN =
  /(신청|누리집|포털|콜센터|고객센터|선발|선정|팀별|구성|약 \d+명|연간 약|교육기간|체류하|과정 운영|공고 시 확정|발표 시 확정|예정 — 정확|월 과정|개월 과정|개월 간|개월간|접수 기간|접수 시기|접수는|접수했|온라인 전용|오프라인 접수|담당 부서|문의|확인해야)/;

export function parseEligibilityItems(detail: string): EligibilityItem[] {
  return splitSentences(detail)
    .map((part) => part.trim().replace(/\.$/, "")) // 끝 마침표만 제거 (라벨은 문장 그대로)
    .filter((label) => label.length >= 5) // URL fragment("or", "kr") 등 짧은 잔여 제외
    .filter((label) => /[가-힣]/.test(label)) // 한글 없는 영문/숫자 단편 제외
    .filter((label) => !EXCLUDE_PATTERN.test(label))
    .filter((label) => !/^만 \d+세/.test(label)) // "만 N세 이상…" — 연령 자동 항목과 중복
    .map((label) => ({ label, detail: "" }));
}
