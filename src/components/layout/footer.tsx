import Link from "next/link";

const serviceLinks = [
  { href: "/regions", label: "지역 비교" },
  { href: "/programs", label: "지원사업 검색" },
  { href: "/crops", label: "작물 정보" },
];

const dataSources = [
  "통계청 KOSIS",
  "농림축산식품부",
  "귀농귀촌종합센터",
  "기상청 기후 데이터",
  "건강보험심사평가원",
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-neutral-800 pb-20 text-neutral-300 md:pb-0">
      <div className="mx-auto max-w-screen-xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white">이랑</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              귀농을 꿈꾸는
              <br />
              모든 이의 시작점
            </p>
            <p className="mt-4 text-xs text-neutral-500">
              contact@irang.app
            </p>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-sm font-semibold text-white">서비스</h4>
            <ul className="mt-3 space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="text-sm font-semibold text-white">데이터 출처</h4>
            <ul className="mt-3 space-y-2">
              {dataSources.map((source) => (
                <li key={source} className="text-sm text-neutral-400">
                  {source}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider + Disclaimer */}
        <div className="mt-10 border-t border-neutral-700 pt-6">
          <p className="text-xs leading-relaxed text-neutral-500">
            본 서비스의 정보는 참고용이며, 실제 지원사업 신청 시 해당 기관의
            원문을 반드시 확인하세요.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; 2026 이랑. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="#" className="transition-colors hover:text-neutral-300">
                개인정보처리방침
              </Link>
              <Link href="#" className="transition-colors hover:text-neutral-300">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
