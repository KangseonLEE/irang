import Link from "next/link";
import { DisclaimerBadge } from "@/components/ui/disclaimer-badge";
import s from "./footer.module.css";

// 헤더 4그룹 IA(지역·작물 / 가이드 / 신청 / 자료실)에 맞춰 핵심 진입점 노출
const serviceLinks = [
  // 지역·작물
  { href: "/regions", label: "지역 탐색" },
  { href: "/crops", label: "작물 정보" },
  // 가이드
  { href: "/guide", label: "정착 로드맵" },
  { href: "/costs", label: "비용 가이드" },
  { href: "/match", label: "농촌 정착 적합도 진단" },
  { href: "/interviews", label: "정착 이야기" },
  // 신청
  { href: "/programs", label: "지원사업" },
  { href: "/education", label: "정착 교육" },
  { href: "/events", label: "체험·행사" },
  // 자료실
  { href: "/stats", label: "통계" },
  { href: "/about", label: "서비스 소개" },
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
          {/* Brand + 문의 */}
          <div>
            <h3 className={s.brandTitle}>이랑</h3>
            <p className={s.brandSlogan}>농촌 정착을 꿈꾸는 모든 이들의 시작점</p>
            <ul className={s.brandContact}>
              <li>
                <a
                  href="mailto:loyal3270@gmail.com"
                  className={s.brandContactLink}
                >
                  loyal3270@gmail.com
                </a>
              </li>
            </ul>
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
