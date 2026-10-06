import { ExternalLink, Map, TreePine } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./land-check-box.module.css";

interface LinkItem {
  name: string;
  href: string;
  desc: string;
  icon: typeof Map;
}

const LINKS: LinkItem[] = [
  {
    name: "토지이음",
    href: "https://www.eum.go.kr/",
    desc: "필지 주소로 용도지역·건폐율·개발규제 조회",
    icon: Map,
  },
  {
    // 2026-10-06 재검증: 옛 https://gis.kofpi.or.kr/ 는 404(KOFPI 자기 메뉴의 gis/main.do 도 404).
    // 실제 열리는 서비스는 /dad_user/ — 200, title "임업정보 다드림", 본문 "필지별 산림정보 서비스".
    // 옛 라벨 "숲에ON (산림청 GIS)"은 산림청·KOFPI 메뉴에서 확인되지 않아 목적지 이름으로 정정.
    name: "임업정보 다드림 (한국임업진흥원)",
    href: "https://gis.kofpi.or.kr/dad_user/",
    desc: "필지 단위 산림정보·임산물 소득 조회",
    icon: TreePine,
  },
];

/**
 * 필지·임지 확인 — 외부 공식 포털 딥링크 허브.
 * 이랑은 필지 단위 GIS를 자체 제공하지 않으므로, 사용자를
 * 토지이음·임업정보 다드림으로 안내한다.
 */
export function LandCheckBox() {
  return (
    <div className={s.wrap}>
      <p className={s.lead}>
        용도지역·건폐율이나 임지 GIS는 공식 포털에서 직접 확인해 보세요.
      </p>
      <div className={s.grid}>
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={s.card}
            aria-label={`${link.name} 새 창에서 열기`}
          >
            <span className={s.iconBox} aria-hidden="true">
              <Icon icon={link.icon} size="md" />
            </span>
            <div className={s.body}>
              <span className={s.titleRow}>
                {link.name}
                <ExternalLink
                  size={14}
                  aria-hidden="true"
                  className={s.external}
                />
              </span>
              <p className={s.desc}>{link.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
