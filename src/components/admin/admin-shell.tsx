"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_SECTIONS } from "@/lib/admin/config";
import s from "./admin-shell.module.css";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 로그인 페이지에서는 shell 없이 바로 표시
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/admin/api/auth", { method: "DELETE" });
    router.replace("/admin/login");
  }

  return (
    <div className={s.shell}>
      {/* ── 사이드바 (데스크탑) ── */}
      <aside className={s.sidebar}>
        <div className={s.logo}>
          <Link href="/" className={s.logoLink}>
            이랑
          </Link>
          <span className={s.badge}>Admin</span>
        </div>

        <nav className={s.nav}>
          {ADMIN_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const active =
              sec.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(sec.href);
            return (
              <Link
                key={sec.key}
                href={sec.href}
                className={`${s.navItem} ${active ? s.active : ""}`}
              >
                <Icon size={18} />
                <span>{sec.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} className={s.logout}>
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </aside>

      {/* ── 메인 콘텐츠 ── */}
      <main className={s.content}>{children}</main>

      {/* ── 하단 탭바 (모바일) ── */}
      <nav className={s.bottomTabs}>
        {ADMIN_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const active =
            sec.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(sec.href);
          return (
            <Link
              key={sec.key}
              href={sec.href}
              className={`${s.tab} ${active ? s.tabActive : ""}`}
            >
              <Icon size={20} />
              <span className={s.tabLabel}>{sec.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
