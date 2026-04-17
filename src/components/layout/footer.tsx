import Link from "next/link";
import { DisclaimerBadge } from "@/components/ui/disclaimer-badge";
import s from "./footer.module.css";

const serviceLinks = [
  { href: "/regions", label: "지역 탐색" },
  { href: "/programs", label: "지원사업 검색" },
  { href: "/education", label: "귀농 교육" },
  { href: "/events", label: "체험·행사" },
  { href: "/crops", label: "작물 정보" },
  { href: "/interviews", label: "귀농인 이야기" },
  { href: "/about", label: "서비스 소개" },
  { href: "/match", label: "귀농 적합도 진단" },
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
            <p className={s.brandSlogan}>귀농을 꿈꾸는 모든 이들의 시작점</p>
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

          {/* Data Sources — 데스크탑에서만 표시 */}
          <div className={s.dataSourceGroup}>
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

        {/* Divider + Disclaimer */}
        <div className={s.disclaimer}>
          <p className={s.disclaimerText}>
            본 서비스의 정보는 참고용이며, 실제 지원사업 신청 시 해당 기관의
            원문을 반드시 확인하세요.
          </p>
          <div className={s.bottomRow}>
            <span>&copy; 2026 이랑. All rights reserved.</span>
            <div className={s.legalLinks}>
              <DisclaimerBadge />
              <Link href="/about/corrections" className={s.legalLink}>
                정정 이력
              </Link>
              <Link href="/terms" className={s.legalLink}>
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
