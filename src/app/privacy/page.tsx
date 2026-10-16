import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  ListChecks,
  Clock,
  EyeOff,
  Cookie,
  MessageSquareWarning,
  Server,
  UserCheck,
  ShieldCheck,
  Mail,
  Info,
} from "lucide-react";
import { pageMetadata } from "@/lib/seo/share-metadata";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import s from "../about/disclaimer/page.module.css";

/**
 * 개인정보 처리방침 (2026-10-17 시행, 보안 QA 🟡9 — 실제 처리 항목에 비해 공지가 약관 한 줄뿐이었다).
 *
 * 문장은 코드에서 확인한 사실만 쓴다. 항목을 바꾸는 코드 변경(새 write 엔드포인트·새 저장 키·새 외부 서비스)이
 * 생기면 이 페이지도 같이 고친다 — 근거 위치는 각 표 위 주석.
 *
 * 레이아웃은 이용약관·면책고지와 같은 모듈(about/disclaimer/page.module.css)을 그대로 쓴다.
 * 표는 sourceList/sourceItem(모바일 세로 쌓기 → 640+ 가로) 패턴.
 */

const CONTACT_EMAIL = "loyal3270@gmail.com";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "개인정보 처리방침",
    description:
      "이랑이 처리하는 정보의 항목·목적·보관 기간, 브라우저 저장 정보, 처리 위탁, 이용자 권리를 안내해요.",
    path: "/privacy",
  }),
};

interface Row {
  name: string;
  detail: string;
}

/*
 * 근거: search_logs — src/app/api/search-log/route.ts insert({ query, result_count })
 *       quick_feedback — src/app/api/quick-feedback/route.ts fullPayload
 *       assessment_results — src/app/api/assess/route.ts fullPayload
 *       community_notes·likes·reports — src/lib/community/queries.ts, supabase/migrations/20260902_community_notes.sql
 *       api_fallback_log — supabase/migrations/20260526_api_fallback_log.sql, recordApiFallback 호출처
 *       admin_login_attempts — src/lib/admin/login-throttle.ts
 */
const COLLECTED: Row[] = [
  {
    name: "검색어",
    detail:
      "검색창에 입력한 검색어, 결과 건수, 검색 시각을 남겨요. 결과가 없는 검색어를 찾아 정보를 보강하는 데 써요.",
  },
  {
    name: "의견·정보 요청",
    detail:
      "만족도, 추천 평가(좋아요·아쉬워요)와 평가한 추천 항목·페르소나, 요청 종류·분류, 직접 적은 내용, 보낸 화면 이름을 남겨요. 서비스 개선과 정보 추가에 써요.",
  },
  {
    name: "진단 결과",
    detail:
      "진단 답변, 추천된 유형·지역·작물·지원사업, 고른 연령대(선택), 들어온 경로(이전 페이지 주소 또는 유입 표시값), 브라우저 정보(User-Agent)를 남겨요. 결과 링크로 다시 보기·공유와 진단 개선에 써요. 결과 링크를 아는 사람은 같은 결과를 볼 수 있어요.",
  },
  {
    name: "현장 이야기",
    detail:
      "남긴 글, 닉네임(선택), 브라우저 정보, IP 주소의 되돌리기 어려운 해시(비공개 키를 섞은 SHA-256) 값을 남겨요. 글은 검토 뒤 닉네임과 함께 공개돼요. 공감·신고는 같은 해시 값과 신고 사유(선택)만 남겨 중복을 막아요.",
  },
  {
    name: "장애 기록",
    detail:
      "저장이 실패하거나 대체 처리로 넘어간 경우에 한해 요청 주소, 화면 이름, 브라우저 정보를 남겨 원인을 찾는 데 써요.",
  },
  {
    name: "관리자 로그인 시도",
    detail:
      "관리자 화면 로그인을 시도하면 IP 주소의 해시 값과 시각을 남겨 무차별 대입을 막아요.",
  },
];

/*
 * 근거: login-throttle.ts RETENTION_MS(24시간), 그 외 테이블은 자동 삭제 규칙 없음(마이그레이션·코드 전수 확인).
 * 진단 결과 기록은 브라우저 저장 — src/lib/diagnosis/history.ts HISTORY_MAX_ITEMS = 5.
 */
const RETENTION: Row[] = [
  {
    name: "관리자 로그인 시도",
    detail:
      "다음 로그인 시도가 있을 때 24시간 지난 기록을 함께 지워요. 정기 삭제 작업은 따로 없어서, 그 사이 시도가 없으면 기록이 남아 있을 수 있어요.",
  },
  {
    name: "검색어·의견·진단 결과·현장 이야기·장애 기록",
    detail:
      "따로 정한 보관 기간이 없어요. 서비스를 운영하는 동안 보관하고, 삭제를 요청하면 지체 없이 지워요. 서비스를 종료하면 함께 지워요.",
  },
  {
    name: "브라우저에 저장한 정보",
    detail:
      "이 기기의 브라우저에만 남고 이랑 서버로 보내지 않아요. 브라우저의 사이트 데이터 삭제로 언제든 지울 수 있어요.",
  },
];

/*
 * 근거(키 이름): search-bar.tsx RECENT_KEY(최대 10건), diagnosis/history.ts HISTORY_STORAGE_KEY(최대 5건),
 *   guide/checklist-interactive.tsx guide-checklist-step-*, persona-score-picker.tsx irang-persona,
 *   weight-customizer.tsx irang:ranking:weights:*, recommendation-thumbs.tsx thumbs:*,
 *   updates-banner.tsx irang:lastSeenUpdate, promo-popup.tsx irang:promo:*, inapp-banner.tsx(sessionStorage),
 *   internal-traffic.ts·analytics-gate.ts irang-internal(쿠키·localStorage, 운영자 브라우저 표식 1년)
 */
const BROWSER_STORAGE: Row[] = [
  { name: "최근 검색어", detail: "검색창 아래에 보여 줄 최근 검색어(최대 10개)와 날짜예요." },
  {
    name: "이전 진단 결과",
    detail: "최근 진단 결과 5건(답변·추천 결과·저장 시각)이에요. 결과를 다시 보는 데 써요.",
  },
  {
    name: "화면 설정",
    detail:
      "정착 가이드 체크리스트 진행 상태, 고른 페르소나, 순위 가중치, 추천 평가 표시, 업데이트 소식 확인 여부예요.",
  },
  {
    name: "닫기 기억",
    detail:
      "홍보 팝업 '오늘 하루 보지 않기'(날짜), 인앱 브라우저 안내 닫기(창을 닫으면 사라져요)예요.",
  },
  {
    name: "운영자 표식 쿠키",
    detail:
      "운영자 브라우저에만 붙이는 표식(irang-internal)이에요. 쿠키라서 요청할 때마다 이랑 서버로 함께 가고, 서버는 이 표식을 보고 방문 통계와 저장 기록에서 운영자 접속을 빼요. 일반 이용자에게는 만들지 않아요.",
  },
];

/**
 * Supabase 프로젝트 리전 — 코드·응답 헤더로는 알 수 없어 회장 확인 뒤 채운다(대시보드 → Project Settings → General).
 * 예: "대한민국(서울)", "일본(도쿄)", "미국(버지니아)".
 */
const SUPABASE_DATA_COUNTRY = "업체 데이터센터 소재국";

interface Processor {
  name: string;
  /** 맡기는 일과 전달되는 정보 */
  task: string;
  /** 이전 국가 */
  country: string;
}

/*
 * 근거: vercel.json regions icn1, src/app/layout.tsx Analytics·SpeedInsights·GoogleAnalytics,
 *   src/instrumentation-client.ts·sentry.server/edge.config.ts(tracesSampleRate 0.1, 오류 리플레이 10%),
 *   src/lib/supabase.ts, src/app/api/search-errata/route.ts(네이버 errata — 서버 호출, 검색어만),
 *   kakao-share-button.tsx 등(카카오 JS SDK — t1.kakaocdn.net)
 */
const PROCESSORS: Processor[] = [
  {
    name: "Vercel",
    country: "미국 (서버 실행은 서울 지역)",
    task:
      "사이트 호스팅과 서버 실행이에요. 접속 기록(IP·요청 주소·브라우저 정보)이 남을 수 있어요. 방문 페이지·성능 통계(Vercel Web Analytics·Speed Insights)도 맡겨요.",
  },
  {
    name: "Cloudflare",
    country: "미국",
    task: "사이트 앞단의 전송·보안이에요. 접속 IP를 보고 해외·자동화 접속을 막아요.",
  },
  {
    name: "Supabase",
    country: SUPABASE_DATA_COUNTRY,
    task: "위 '처리하는 정보'를 보관하는 데이터베이스와 홍보 이미지 저장소예요.",
  },
  {
    name: "Google Analytics",
    country: "미국",
    task:
      "방문 통계예요. 본 페이지, 누른 메뉴, 검색어 같은 이용 기록과 기기·브라우저 정보가 쿠키로 수집돼요.",
  },
  {
    name: "Sentry",
    country: "미국",
    task:
      "오류·성능 기록이에요. 오류가 나면 화면 주소, 브라우저 정보, 오류 내용을 받아요. 그중 일부(10%)는 화면 재현 기록이 붙는데, 글자·입력값·이미지는 가린 채 보내요. 오류와 무관하게 페이지 이동의 약 10%도 성능 기록으로 보내는데, 여기엔 화면 주소(검색어가 든 주소 포함)와 브라우저 정보가 담겨요. '관리자에게 알리기'로 보낸 내용도 여기에 저장돼요.",
  },
  {
    name: "네이버",
    country: "대한민국",
    task:
      "검색 결과가 없을 때 철자 교정 제안을 받으려고 검색어만 이랑 서버에서 네이버 검색 API로 보내요. 이용자의 IP나 브라우저 정보는 보내지 않아요.",
  },
  {
    name: "카카오",
    country: "대한민국",
    task:
      "카카오톡 공유 버튼이 있는 화면에서 카카오 공유 스크립트를 불러와요. 공유 버튼을 누르면 공유할 페이지 정보가 카카오로 전달돼요.",
  },
];

export default function PrivacyPage() {
  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "개인정보 처리방침", href: "/privacy" }]} />
      <Link href="/terms" className={s.backLink}>
        <ArrowLeft size={16} />
        이용약관으로
      </Link>

      <header className={s.header}>
        <span className={s.badge}>
          <Lock size={14} />
          개인정보 처리방침
        </span>
        <h1 className={s.title}>개인정보 처리방침</h1>
        <p className={s.subtitle}>
          이랑은 회원가입 없이 쓰는 서비스예요. 이용하면서 어떤 정보가 어디에 남는지 정리했어요.
        </p>
      </header>

      <section className={s.section} id="collect">
        <div className={s.sectionHeader}>
          <ListChecks size={18} />
          <h2 className={s.sectionTitle}>1. 처리하는 정보와 목적</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            아래 기능을 쓸 때만 해당 정보를 이랑 데이터베이스에 남겨요. 쓰지 않은 기능의 정보는
            남지 않아요.
          </p>
          <ul className={s.sourceList}>
            {COLLECTED.map((row) => (
              <li key={row.name} className={s.sourceItem}>
                <span className={s.sourceName}>{row.name}</span>
                <span>{row.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={s.section} id="not-collected">
        <div className={s.sectionHeader}>
          <EyeOff size={18} />
          <h2 className={s.sectionTitle}>2. 남기지 않는 정보</h2>
        </div>
        <div className={s.sectionBody}>
          <ul className={s.list}>
            <li>
              이름·전화번호·주소·생년월일을 묻지 않아요. 회원가입과 로그인이 없어요.
            </li>
            <li>
              IP 주소는 원래 값을 저장하지 않아요. 중복 방지가 필요한 곳(현장 이야기, 관리자 로그인)에는
              되돌리기 어려운 해시(비공개 키를 섞은 SHA-256) 값만 남겨요. 과다 요청 제한을 위해 서버 메모리에서 잠시 쓰는 IP는
              저장하지 않아요.
            </li>
            <li>자동화 테스트와 운영자 접속은 방문 통계에서 빼요.</li>
          </ul>
        </div>
      </section>

      <section className={s.section} id="retention">
        <div className={s.sectionHeader}>
          <Clock size={18} />
          <h2 className={s.sectionTitle}>3. 보관 기간과 파기</h2>
        </div>
        <div className={s.sectionBody}>
          <ul className={s.sourceList}>
            {RETENTION.map((row) => (
              <li key={row.name} className={s.sourceItem}>
                <span className={s.sourceName}>{row.name}</span>
                <span>{row.detail}</span>
              </li>
            ))}
          </ul>
          <p>
            지울 때는 데이터베이스에서 해당 행을 삭제해요. 처리 위탁 업체에 남은 기록은 각 업체의
            보관 정책에 따라 지워져요.
          </p>
        </div>
      </section>

      <section className={s.section} id="storage">
        <div className={s.sectionHeader}>
          <Cookie size={18} />
          <h2 className={s.sectionTitle}>4. 브라우저에 저장하는 정보</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            편의를 위해 아래 정보를 이 기기의 브라우저 저장소에 남겨요. 운영자 표식 쿠키를 빼면 이랑
            서버로 보내지 않아요.
          </p>
          <ul className={s.sourceList}>
            {BROWSER_STORAGE.map((row) => (
              <li key={row.name} className={s.sourceItem}>
                <span className={s.sourceName}>{row.name}</span>
                <span>{row.detail}</span>
              </li>
            ))}
          </ul>
          <p>
            방문 통계(Google Analytics)는 자체 쿠키를 써요. 브라우저 설정에서 쿠키·사이트 데이터를
            막거나 지울 수 있고, 그래도 이랑의 정보를 보는 데는 문제가 없어요. 다만 최근 검색어·이전
            진단 결과 같은 기록은 사라져요.
          </p>
        </div>
      </section>

      <section className={s.section} id="error-report">
        <div className={s.sectionHeader}>
          <MessageSquareWarning size={18} />
          <h2 className={s.sectionTitle}>5. 오류 화면의 &lsquo;관리자에게 알리기&rsquo;</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            오류 화면에서 &lsquo;관리자에게 알리기&rsquo;를 누르고 보내면 아래 정보가 오류 기록 서비스(Sentry)로
            전달돼요. 보내지 않으면 아무것도 전달되지 않아요.
          </p>
          <ul className={s.list}>
            <li>직접 적은 상황 설명</li>
            <li>이메일 주소 — 적은 경우에만, 답변을 드리는 데만 써요</li>
            <li>화면 캡처 — 데스크탑에서 화면 공유를 허락하고 첨부한 경우에만. 보내기 전에 지우거나 가릴 수 있어요</li>
            <li>오류가 난 화면 주소, 이전 페이지 주소, 브라우저 정보, 화면 크기, 오류 내용</li>
          </ul>
        </div>
      </section>

      <section className={s.section} id="outsourcing">
        <div className={s.sectionHeader}>
          <Server size={18} />
          <h2 className={s.sectionTitle}>6. 처리 위탁과 국외 이전</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            서비스를 운영하려고 아래 업체의 서비스를 써요. 해외 업체에는 이용 과정에서 네트워크로
            정보가 전송돼요.
          </p>
          <ul className={s.sourceList}>
            {PROCESSORS.map((row) => (
              <li key={row.name} className={s.sourceItem}>
                <span className={s.sourceName}>{row.name}</span>
                <span>
                  {row.task} 이전 국가: {row.country}.
                </span>
              </li>
            ))}
          </ul>
          <ul className={s.list}>
            <li>이전 방법: 서비스를 이용할 때 네트워크로 그때그때 전송돼요.</li>
            <li>보유 기간: 각 업체의 보관 정책을 따라요.</li>
          </ul>
          <p>
            본문 글꼴(jsDelivr), 언론사 기사 썸네일, YouTube 썸네일, 홍보 이미지(Supabase 저장소)는
            브라우저가 그 서버에서 직접 불러와요. 이때 IP 주소와 브라우저 정보가 그 서버로 전달돼요.
          </p>
          <p>
            위 위탁 외에는 이용자 정보를 다른 회사나 기관에 팔거나 제공하지 않아요. 법령에 따라
            요청받은 경우는 예외예요.
          </p>
        </div>
      </section>

      <section className={s.section} id="rights">
        <div className={s.sectionHeader}>
          <UserCheck size={18} />
          <h2 className={s.sectionTitle}>7. 이용자의 권리</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            내 정보의 열람·정정·삭제·처리 정지를 요청할 수 있어요. 로그인이 없어 이랑이 이용자를
            알아볼 수 없으니, 요청할 때 남긴 글의 내용·닉네임, 진단 결과 링크, 검색한 날짜처럼 해당
            기록을 찾을 수 있는 정보를 함께 알려 주세요.
          </p>
          <p>
            요청은{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${s.backLink} ${s.inlineLink}`}>
              {CONTACT_EMAIL}
            </a>
            으로 보내 주세요. 확인한 뒤 지체 없이 처리하고 결과를 알려 드려요.
          </p>
        </div>
      </section>

      <section className={s.section} id="safety">
        <div className={s.sectionHeader}>
          <ShieldCheck size={18} />
          <h2 className={s.sectionTitle}>8. 안전하게 지키는 방법</h2>
        </div>
        <div className={s.sectionBody}>
          <ul className={s.list}>
            <li>검색어·의견·진단 결과·현장 이야기는 브라우저가 아니라 이랑 서버를 거쳐 저장해요.</li>
            <li>IP 주소는 되돌리기 어려운 해시(비공개 키를 섞은 SHA-256) 값으로만 남겨요.</li>
            <li>관리자 화면은 비밀번호로 보호하고, 로그인 시도 횟수를 제한해요.</li>
          </ul>
        </div>
      </section>

      <section className={s.section} id="contact">
        <div className={s.sectionHeader}>
          <Mail size={18} />
          <h2 className={s.sectionTitle}>9. 개인정보 보호 책임자</h2>
        </div>
        <div className={s.sectionBody}>
          <ul className={s.sourceList}>
            <li className={s.sourceItem}>
              <span className={s.sourceName}>책임자</span>
              <span>이랑 운영자</span>
            </li>
            <li className={s.sourceItem}>
              <span className={s.sourceName}>연락처</span>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`${s.backLink} ${s.inlineLink}`}>
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
          <p>
            개인정보 침해로 도움이 필요하면 아래 기관에도 상담할 수 있어요.
          </p>
          <ul className={s.list}>
            <li>개인정보침해신고센터 (국번 없이 118)</li>
            <li>개인정보분쟁조정위원회 (1833-6972)</li>
            <li>대검찰청 (국번 없이 1301)</li>
            <li>경찰청 (국번 없이 182)</li>
          </ul>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeader}>
          <Info size={18} />
          <h2 className={s.sectionTitle}>10. 방침 변경</h2>
        </div>
        <div className={s.sectionBody}>
          <p>
            처리하는 정보가 바뀌면 이 페이지를 고치고 시행일을 함께 바꿔요.
          </p>
          <p className={s.sourceNote}>시행일: 2026년 10월 17일</p>
        </div>
      </section>
    </div>
  );
}
