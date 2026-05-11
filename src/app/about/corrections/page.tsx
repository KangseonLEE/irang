import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  FileEdit,
  Calendar,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import s from "../disclaimer/page.module.css";

export const metadata: Metadata = {
  title: "데이터 정정 이력 | 이랑",
  description:
    "이랑 서비스의 데이터 정정 이력을 확인하세요. 발견된 오류와 수정 내역을 투명하게 공개해요.",
  alternates: { canonical: "/about/corrections" },
};

interface CorrectionEntry {
  date: string;
  field: string;
  description: string;
}

const CORRECTIONS: CorrectionEntry[] = [
  {
    date: "2026-05-11",
    field: "Vercel Hobby 한도 대응 — 인프라 보강",
    description:
      "사이트 접근 안정성을 위해 ISR 캐싱 주기를 늘리고, 봇·피싱 경로(.env·.git·wp-admin 등) 차단 미들웨어를 강화했어요. 사용자에게 보이는 변화는 없지만, 페이지 로드가 좀 더 빠르게 유지될 거예요.",
  },
  {
    date: "2026-05-11",
    field: "지역 상세 통계·기후 섹션 간격 정정",
    description:
      "시·도와 시·군·구 상세 페이지에서 통계 카드와 기후 정보 섹션 사이의 간격이 0px이 되어 답답하게 붙어 보이던 부분을 정상화했어요.",
  },
  {
    date: "2026-05-10",
    field: "모바일 지역 상세 UX 개선 — 단일 ⋯ 메뉴 + inline 큰 점수",
    description:
      "모바일에서 시·도와 시·군·구 상세 페이지의 헤더·점수·액션 영역을 깔끔하게 정리했어요. 정착 점수는 hero 안에 큰 숫자로 노출되고, 공유·북마크 등 액션은 단일 ⋯ 메뉴로 통합돼 화면 상단이 답답하지 않아요.",
  },
  {
    date: "2026-05-10",
    field: "시·도 정착 점수에도 산하 시군구 근거 노출",
    description:
      "시·도 페이지의 정착 점수 5차원 카드가 점수만 보여주던 부분을 보강했어요. 이제 산하 시군구의 1만 명당 농가·의료기관·학교·귀농 비율 평균과 5년 인구 변화율 평균을 함께 표시하고, 차원별 점수가 가장 높은 시군구 1~2곳을 칩으로 연결해 어떤 시군구가 시도 평균을 끌어올리는지 한눈에 보이도록 정비했어요.",
  },
  {
    date: "2026-05-10",
    field: "정착 점수 5차원 솔직 표기 함정 일괄 정정",
    description:
      "정착 점수 차원별 해석 카피에 ‘점수 50 미만 시군구가 전국 상위 N%로 표기되던’ 의미 모순을 정정했어요. 이제 점수 50 이상은 ‘전국 상위 N%’, 50 미만은 ‘전국 하위 N%’로 분기 표기하고, 인구 추세 차원처럼 분위 환산이 부적절한 항목은 분위 표기 자체를 빼고 변화율 방향성으로만 카피했어요.",
  },
  {
    date: "2026-05-10",
    field: "시·도/시·군·구 정착 점수 5차원 근거 추가",
    description:
      "시·도와 시·군·구 페이지의 정착 점수가 종합 점수만 보여주던 부분을 보강해, 인구 추세·농가 활성도·의료 인프라·학교 인프라·귀농 활성도 5차원을 카드로 분해하고, 각 카드에 1만 명당 농가 4.2호처럼 원시 수치와 한 줄 해석을 함께 노출했어요. 점수 산출 근거는 /regions/ranking/methodology에서 자세히 확인할 수 있어요.",
  },
  {
    date: "2026-05-10",
    field: "‘페르소나’ → ‘귀농 스타일’ 용어 통일",
    description:
      "사용자에게 노출되던 ‘페르소나’라는 영문식 용어를 ‘귀농 스타일’로 일괄 변경해 첫 진입자도 의미를 즉시 이해할 수 있도록 정비했어요. 내부 코드의 persona 식별자는 그대로 두되, UI 라벨·필터·검색 카피만 자연스러운 한국어로 통일했어요.",
  },
  {
    date: "2026-05-10",
    field: "활성 지역 7종 Top 5 큐레이션 추가",
    description:
      "시·도/시·군·구 페이지에 귀농·귀촌·청년농·귀산촌·스마트팜·치유농업·사회적 농업 7가지 활동별 Top 5 지역을 큐레이션해 노출했어요. 출처가 모호한 ‘추천’ 대신 KOSIS 귀농어귀촌 통계, 농촌진흥청 청년창업농 명단, 치유농업 인증센터 명부 등 공개 데이터를 근거로 구성했어요.",
  },
  {
    date: "2026-05-10",
    field: "시·도 시·군·구 인구 밀도 지도 누락 보정",
    description:
      "시·도 페이지의 시·군·구 인구밀도 지도가 SGIS API 응답이 일부 누락되거나 실패할 때 회색 처리되던 문제를 보정했어요. 이제 정적 인구 시계열(2018~2022) 폴백을 항상 깔고 SGIS 응답이 도착하면 그 위에 덮어쓰는 방식으로 동작해, 어떤 상황에서도 지도가 채워져요.",
  },
  {
    date: "2026-05-10",
    field: "검색 오버레이 보강 + 지역 모바일 히어로 임팩트 강화",
    description:
      "통합 검색 오버레이에 단계별 가이드 6단계 칩과 자주 묻는 질문 5건 섹션을 추가해 첫 진입자 탐색 동선을 강화했어요. 모바일 통합 검색은 background scroll lock도 iOS Safari 호환 패턴으로 보강했어요. 지역 상세 모바일 히어로는 이미지를 60vh 풀와이드 + 하단 그라디언트로 키워 임팩트를 살렸어요.",
  },
  {
    date: "2026-05-10",
    field: "지역 페이지 모바일 레이아웃 개선",
    description:
      "시·도 상세 페이지의 지도가 울릉도(경북) 등 본토에서 떨어진 도서 때문에 viewBox가 커져 본토가 작게 표시되던 문제를 보정했어요. 본토 좌표를 자동 계산해 viewBox를 좁히고, 도서 시·군은 별도 ‘이 지역의 섬’ 칩으로 안내해요. 시·군·구 리스트도 검색(초성 매칭 포함) + 5건 단위 페이지네이션을 추가해 모바일 스크롤 부담을 줄였어요.",
  },
  {
    date: "2026-05-10",
    field: "/programs RSC payload 노출 사고 + 캐시 차단",
    description:
      "iOS Safari로 /programs 접속 시 RSC payload가 본문 텍스트로 노출되며 다운로드 다이얼로그가 발생하던 문제를 즉시 보정했어요. Cloudflare가 RSC variant 응답을 일반 GET 응답으로 잘못 캐시한 게 원인이라, middleware에서 RSC fetch에는 Cache-Control: private, no-store + CDN-Cache-Control: no-store를 강제 적용해 동일 사고 재발을 차단했어요.",
  },
  {
    date: "2026-05-10",
    field: "지원사업 데이터 점검 + 비수기 안내 추가",
    description:
      "/programs 14개 지원사업 sourceUrl 전수 헬스체크(0 broken) + applicationStart/End 정확성 재확인을 마쳤어요. 5월 현재 활성 공고가 2건뿐인 건 1~3월·7~9월에 모집이 집중되는 자연스러운 사이클이라, 사용자 혼란이 없도록 /programs 상단에 모집 시즌 안내 박스를 추가했어요.",
  },
  {
    date: "2026-05-10",
    field: "농촌 소식 — 모집 공고 신청 기간 검증 정비",
    description:
      "교육·행사·지원 카테고리에서 게재일이 최신이라도 신청 기간이 이미 끝난 모집 공고가 노출되던 문제를 보정했어요. 단발 모집 공고 대신 농업교육포털·종합지원센터·박람회 포털 등 상시 정보 페이지 위주로 재구성했고, 활성 모집은 신청 기간이 동적으로 검증되는 /education·/events·/programs 페이지에서 책임지도록 분리했어요.",
  },
  {
    date: "2026-05-09",
    field: "농촌 소식 데이터 2026 갱신 + 마감 공고 자동 숨김",
    description:
      "랜딩 ‘농촌 소식’ 5종 카테고리(뉴스·교육·행사·지원·정책)의 정적 폴백 데이터를 2026년 1~5월 기준 최신 기사·모집 공고로 전면 재작성했어요. 각 항목에 출처별 OG 요약과 썸네일을 정적으로 박아 두었고, 교육·행사 카테고리에서 ‘수료식·신청 종료’ 등 마감 키워드 또는 12개월+ 지난 항목은 자동으로 숨김 처리됩니다.",
  },
  {
    date: "2026-05-09",
    field: "귀농인 인터뷰 인용 정책 정비",
    description:
      "본인 명시 동의 없이 게재되어 있던 인터뷰 본문(이야기·동기·어려움·조언)을 일괄 제거하고, 미동의자의 카드는 원문 기사로 직접 이동하도록 변경했어요. 본인 정정·삭제 요청 채널을 페이지 하단에 명시하고 약관 제4조에 인용 정책을 명문화했어요.",
  },
  {
    date: "2026-04-16",
    field: "지원사업 상태 표시",
    description:
      "Supabase 경로에서 신청 기간 기반 상태 자동 계산(deriveStatus)이 누락되어, 일부 모집중 사업이 '마감'으로 표시되던 문제를 수정했어요.",
  },
  {
    date: "2026-04-12",
    field: "작물 수익 데이터",
    description:
      "농촌진흥청 농산물소득자료집 원본과 비교 검증 후, 일부 작물의 수익 범위 표기를 보정했어요.",
  },
  {
    date: "2026-04-10",
    field: "지원사업 외부 링크",
    description:
      "만료된 도메인(도메인 파킹 전환)과 소프트 404 페이지를 감지하여 14건의 외부 링크를 정정했어요.",
  },
];

export default function CorrectionsPage() {
  return (
    <div className={s.page}>
      <Link href="/about" className={s.backLink}>
        <ArrowLeft size={16} />
        소개 페이지로
      </Link>

      <header className={s.header}>
        <span className={s.badge}>
          <FileEdit size={14} />
          데이터 품질
        </span>
        <h1 className={s.title}>데이터 정정 이력</h1>
        <p className={s.subtitle}>
          이랑은 데이터 오류를 발견하면 즉시 수정하고, 정정 내역을 투명하게
          공개해요.
        </p>
      </header>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Calendar size={18} />
          <h2 className={s.sectionTitle}>최근 정정 내역</h2>
        </div>
        <div className={s.sourceList}>
          {CORRECTIONS.map((entry) => (
            <div key={`${entry.date}-${entry.field}`} className={s.sourceItem}>
              <span className={s.sourceName}>
                {entry.date} · {entry.field}
              </span>
              <span className={s.sourceNote}>{entry.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <MessageSquare size={18} />
          <h2 className={s.sectionTitle}>오류를 발견하셨나요?</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            데이터 오류, 외부 링크 문제, 본인 정보 정정·삭제 요청까지 — 어떤 종류든
            알려주시면 영업일 3일 안에 확인하고 처리해 드려요.
          </p>
          <div className={s.callout}>
            <div>
              <strong>피드백 보내기</strong>
              <a
                href={`mailto:loyal3270@gmail.com?subject=${encodeURIComponent("[이랑] 데이터 정정 요청")}`}
                className={s.calloutPhone}
              >
                loyal3270@gmail.com
              </a>
              <span style={{ display: "block", marginTop: 4 }}>
                메일 제목과 본문에 어느 페이지의 어떤 데이터인지 적어주시면 빠르게 처리돼요.
              </span>
            </div>
          </div>
        </div>
      </section>

      <Link href="/about/disclaimer" className={s.backLink}>
        면책고지 전문 보기 <ArrowRight size={14} />
      </Link>
    </div>
  );
}
