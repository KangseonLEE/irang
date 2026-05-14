import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  FileEdit,
  Calendar,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
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
    date: "2026-05-14",
    field: "헤더 메뉴 4그룹 재편 + 진입 경로 누락 8건 보강 (B Sprint D1~D4)",
    description:
      "이랑 헤더 메뉴를 ‘탐색·준비·실행·자료’ 4그룹으로 정돈하고, 그동안 헤더·전체 메뉴·푸터에서 누락돼 있던 진입 경로 8건을 한 번에 보강했어요. 헤더 ‘준비’ 그룹에는 5단계 귀농 로드맵·주제별 가이드(50대·1인·실패 사례 등)·귀농 적합도 진단 등 7개 항목이 모이고, ‘실행’ 그룹은 지원사업·정부사업 가이드·교육·체험 행사로 묶었어요. 같은 4그룹 구조가 전체 메뉴(/more)와 모바일 더보기 페이지에도 일관되게 적용되고, 푸터 ‘서비스’ 섹션에도 귀농 로드맵·비용 가이드·통계 등 핵심 진입점이 균형 있게 노출돼요. URL 자체는 변하지 않아 기존 즐겨찾기와 검색 색인은 그대로 유지돼요.",
  },
  {
    date: "2026-05-14",
    field: "GSC 색인 일시 차단 정상화 — verified bot 화이트리스트 룰 추가",
    description:
      "5월 14일 새벽 2:30에 적용된 클라우드 데이터센터 봇 차단 룰이 구글 검색 색인 봇(Googlebot)도 함께 차단하던 문제를 약 12시간 만에 정상화했어요. Googlebot이 구글 클라우드(GCP) IP를 사용하는데, 차단 룰의 평가 순서가 ‘검증된 봇(verified bot)’ 체크보다 먼저 와서 막혀 있었어요. 검증된 봇(Googlebot·Bingbot·Slackbot·KakaoTalk 미리보기 등)을 모든 차단 룰보다 먼저 통과시키는 화이트리스트 룰을 최상단에 추가해 정상화했고, 사용자에게 보이는 화면 변화는 없지만 검색 색인 갱신이 다시 정상 진행돼요.",
  },
  {
    date: "2026-05-14",
    field: "검색 노출 보강 — 페이지 종류 표지(schema) 강화",
    description:
      "구글·네이버 등 검색 엔진이 이랑의 각 페이지가 어떤 정보를 담고 있는지 더 정확히 인식하도록, 페이지 종류 표지(구조화 데이터 schema)를 8종으로 정리·확장했어요. 지원사업 26건은 ‘정부 서비스(GovernmentService)’, 시·도와 시·군·구 222곳은 ‘행정 구역(Place)’, 본인 동의를 받은 인터뷰는 ‘기사(Article)’, 가이드 5종은 ‘How-To/Article’로 표지를 달았어요. /about·/about/disclaimer·/about/corrections·/terms·/more·/guide/track-compare·/guide/shelter·/regions/centers 8개 안내 페이지에는 경로 표지(BreadcrumbList)를 추가하고, /about에는 운영 주체 표지(Organization)와 정정 이력·면책 고지로의 직접 연결을 보강했어요. 사용자에게 보이는 화면 변화는 /about 운영 정보 카드 두 줄(정정 이력·면책 고지) 추가뿐이지만, 검색 결과에서의 노출 형태가 점진적으로 풍부해질 거예요.",
  },
  {
    date: "2026-05-14",
    field: "지원사업 6건 신규 추가 — 7월 모집 시즌 대비",
    description:
      "7월 귀농인의 집·임대형 스마트팜·청년농 모집 시즌이 곧 시작돼서, 6/15로 잡혀 있던 큐레이션 스프린트를 한 달 앞당겨 6건을 정식으로 등록했어요. 예산군 임대형 스마트팜(9월 모집), 청년농업인 아이디어 사업화 공모(R&D), 후계농업경영인 일반 선발(만 49세 이하 5억원 융자), 고성·논산 귀농인의 집(체류형), 제주 신규농업인 현장실습(1:1 매칭)이에요. 각 사업의 출처 URL은 HTTP 200·본문 키워드·중복 검색을 모두 통과한 뒤에 등록했고, 페르소나 추천 매핑(농업 본업·가족 정착·노년 귀촌·반귀농)도 함께 반영했어요. 본래 후보였던 보은군 임대형 스마트팜은 1차 모집이 작년 12월에 이미 종료된 상태라 보류했어요.",
  },
  {
    date: "2026-05-14",
    field: "E2E 자동 검증 11시간 끊김 정상화",
    description:
      "사이트가 자동으로 매 배포마다 도는 회장 직접 검증 시나리오(E2E)가 5월 14일 새벽부터 11시간 동안 봇 차단 룰에 막혀 돌지 못했어요. 이랑 자체 테스트가 보내는 요청을 따로 식별할 수 있도록 식별 토큰을 붙이고, 그 토큰만 차단 룰에서 제외되도록 정리해 자동 검증을 다시 정상 가동했어요. 사용자에게 보이는 변화는 없지만, 페이지 회귀를 더 빨리 잡을 수 있게 됐어요.",
  },
  {
    date: "2026-05-14",
    field: "작물 비교 페이지 v2 패턴 통일",
    description:
      "/crops/compare 화면을 /regions/compare와 같은 검색·카드 패턴으로 통일했어요. 상단 작물 셀렉터에 검색 input과 dropdown 카드 grid를 도입해 39개 작물을 카테고리별로 빠르게 찾고 한 번에 4개까지 비교할 수 있어요. 비교 영역은 요약·소득·재배·장단점 4개 탭으로 분리해 URL(`?tab=...`)로 공유 가능하고, 소득 카드는 단일 핵심 수치(평균 순소득 등)와 비교 인사이트가 함께 보이는 토스 스타일로 정리했어요. 모바일 640px 분기점에서 셀렉터와 페이지 레이아웃이 1px 어긋나 보이던 부분도 함께 보정했어요.",
  },
  {
    date: "2026-05-13",
    field: "진단 결과에 작물·지원사업 더 보기 버튼 추가",
    description:
      "귀농 적합도 진단 결과 화면(/match·/assess) 안에 ‘내 스타일 작물 더 보기’, ‘내 스타일 지원사업 더 보기’ 버튼을 새로 달았어요. 진단으로 산출된 스타일 그대로 작물·지원사업 목록 페이지에 들어가서 같은 기준의 추천 결과를 이어 볼 수 있도록 경로를 정비했어요. 스타일이 ‘기본 균등’(아직 답을 충분히 안 하신 경우)일 때는 추천 자체가 약하므로 버튼을 숨겨요.",
  },
  {
    date: "2026-05-13",
    field: "귀농 스타일 진입 경로 일원화 + ‘청년 영농’ 라벨 정정",
    description:
      "작물·지원사업 페이지 메뉴에 잠깐 추가됐던 ‘귀농 스타일’ 칩(5종)을 다시 거뒀어요. 사용자가 자기 스타일을 직접 추측해 고르는 흐름이 진단 결과 추천과 어긋나서, 진단(/match)에서 산출된 스타일로 자연스럽게 추천 카드를 보는 경로로 일원화했어요. ‘농업 본업’ 라벨은 다른 스타일과 구분이 약해 ‘청년 영농’으로 정정했고, 산식·결과·진단 결과 화면 모두 같은 표기로 통일했어요. 추가로 청년 영농 등 5종 페르소나 deep link(`?persona=...`)가 일부 페이지에서 308로 잘려 추천 화면이 안 켜지던 부분도 함께 바로잡았어요.",
  },
  {
    date: "2026-05-13",
    field: "‘귀농 스타일 가중치’ 슬라이더 신설 (Phase 6 B1)",
    description:
      "귀농 스타일 맞춤 모드에 인구·농가·의료·학교·귀농 5차원 비중을 직접 끌어 옮기는 슬라이더를 추가했어요. 합계는 자동으로 100이 맞춰지고, 조정값은 주소창에 `?w=20-15-15-35-15` 형식으로 따라붙어요. 그 URL을 그대로 공유하면 상대도 같은 비중으로 같은 순위를 봐요. 마지막 조정값은 자동으로 기억돼서 다음 방문에도 복원되고, ‘기본값 복원’ 버튼으로 언제든 스타일 기본 가중치로 되돌릴 수 있어요. 산식 페이지(/regions/ranking/methodology)에 사용법 안내를 함께 보강했고, URL ↔ 라이브러리 ↔ UI가 따로 깨지지 않도록 회귀 테스트 24건을 추가했어요.",
  },
  {
    date: "2026-05-13",
    field: "추천 카드에 ‘왜 추천?’ 근거 펼침 추가 (Phase 6 B3)",
    description:
      "작물·지원사업 추천 카드에 점수가 어떻게 매겨졌는지 그 자리에서 바로 펼쳐 볼 수 있는 ‘왜 추천?’ 영역을 추가했어요. 카테고리·난이도·연령 요건 같은 기본 사유와 개별 항목 보정 사유까지 모두 노출돼요. 시군구 추천 카드에는 5차원 점수 막대를 inline으로 함께 보여드려요. 같은 산식이 /match·/crops·/programs·/regions/ranking 추천 자리에 일관되게 적용되도록 정비했고, 회귀 테스트 17건을 추가해 점수와 사유가 함께 흔들리지 않도록 묶었어요.",
  },
  {
    date: "2026-05-13",
    field: "귀농 스타일 추천 매핑 정식 마감 (Phase 6 A안)",
    description:
      "진단 답변에서 도출한 귀농 스타일이 시군구뿐 아니라 작물·지원사업까지 자동 추천하도록 매핑을 마무리했어요. 작물 39종과 지원사업 19건에 카테고리·난이도·연령 요건 기반 1~5점 적합도와 예외 보정을 부여하고, 점수 4 이상만 추천 카드에 노출해요. /match·/crops·/programs·/regions/ranking/methodology 4곳에서 같은 산식이 쓰이고, 데이터가 흔들리면 즉시 알 수 있도록 회귀 테스트 51개를 추가했어요. 산식 근거는 /regions/ranking/methodology에서 자세히 확인할 수 있어요.",
  },
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
      <BreadcrumbJsonLd items={[
        { name: "서비스 소개", href: "/about" },
        { name: "정정 이력", href: "/about/corrections" },
      ]} />
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
