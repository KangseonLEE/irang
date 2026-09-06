import Link from "next/link";
import { DisclaimerBadge } from "@/components/ui/disclaimer-badge";
import { NAV_ITEMS } from "@/lib/data/navigation";
import s from "./footer.module.css";

/** 메뉴 SSOT 라벨 — 푸터가 독자 라벨을 들고 있다가 드리프트하는 것 방지 */
const NAV_LABELS = new Map(NAV_ITEMS.map((item) => [item.href, item.label]));

// 핵심 진입점 11개 — 노출 구성·순서는 기존 그대로 두고 라벨만 SSOT 에서 가져온다.
const serviceHrefs = [
  "/regions",
  "/crops",
  "/guide",
  "/costs",
  "/match",
  "/interviews",
  "/programs",
  "/education",
  "/events",
  "/stats",
  "/about",
];

const serviceLinks = serviceHrefs.map((href) => ({
  href,
  label: NAV_LABELS.get(href) ?? href,
}));

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
              <Link href="/about/updates" className={s.legalLink}>
                업데이트 소식
              </Link>
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
