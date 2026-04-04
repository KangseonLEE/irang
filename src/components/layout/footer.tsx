import Link from "next/link";
import { MessageSquare } from "lucide-react";
import s from "./footer.module.css";

const FEEDBACK_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL ?? "";

const serviceLinks = [
  { href: "/regions", label: "지역 탐색" },
  { href: "/programs", label: "지원사업 검색" },
  { href: "/education", label: "귀농 교육" },
  { href: "/events", label: "체험·행사" },
  { href: "/crops", label: "작물 정보" },
  { href: "/interviews", label: "귀농인 이야기" },
  { href: "/about", label: "서비스 소개" },
  { href: "/match", label: "맞춤 추천" },
];

const dataSources = [
  "기상청 ASOS",
  "통계청 KOSIS · SGIS",
  "농림축산식품부",
  "건강보험심사평가원",
  "교육부 NEIS",
  "농촌진흥청 RDA",
];

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.grid}>
          {/* Brand */}
          <div>
            <h3 className={s.brandTitle}>이랑</h3>
            <p className={s.brandDesc}>
              귀농을 꿈꾸는
              <br />
              모든 이의 시작점
            </p>
            <p className={s.brandEmail}>
              contact@irang.app
            </p>
          </div>

          {/* Service Links */}
          <div>
            <h4 className={s.sectionTitle}>서비스</h4>
            <ul className={s.linkList}>
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={s.serviceLink}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className={s.sectionTitle}>데이터 출처</h4>
            <ul className={s.linkList}>
              {dataSources.map((source) => (
                <li key={source} className={s.sourceItem}>
                  {source}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feedback CTA */}
        {FEEDBACK_URL && (
          <div className={s.feedbackBar}>
            <p className={s.feedbackText}>
              이랑을 더 좋게 만들 수 있도록 의견을 들려주세요.
            </p>
            <a
              href={FEEDBACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={s.feedbackButton}
            >
              <MessageSquare size={16} aria-hidden="true" />
              피드백 보내기
            </a>
          </div>
        )}

        {/* Divider + Disclaimer */}
        <div className={s.disclaimer}>
          <p className={s.disclaimerText}>
            본 서비스의 정보는 참고용이며, 실제 지원사업 신청 시 해당 기관의
            원문을 반드시 확인하세요.
          </p>
          <div className={s.bottomRow}>
            <span>&copy; 2026 이랑. All rights reserved.</span>
            <div className={s.legalLinks}>
              <Link href="#" className={s.legalLink}>
                개인정보처리방침
              </Link>
              <Link href="#" className={s.legalLink}>
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
