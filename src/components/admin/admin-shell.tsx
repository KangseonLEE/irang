"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ExternalLink } from "lucide-react";
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
    <div className={s.shell} data-admin-shell="">
      {/* ── 사이드바 (데스크탑) ── */}
      <aside className={s.sidebar}>
        <div className={s.logo}>
          <Link href="/" className={s.logoLink} target="_blank" rel="noopener">
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

      {/* ── 상단바 (모바일) — 사이드바가 숨는 폭에서 사이트 이동·로그아웃 진입점 (9/2 회장 요청) ── */}
      <header className={s.topBar}>
        <div className={s.topBarBrand}>
          <span className={s.topBarTitle}>이랑</span>
          <span className={s.badge}>Admin</span>
        </div>
        <div className={s.topBarActions}>
          <Link
            href="/"
            className={s.topBarLink}
            target="_blank"
            rel="noopener"
            aria-label="이랑 사이트 새 탭에서 열기"
          >
            사이트
            <ExternalLink size={14} aria-hidden="true" />
          </Link>
          <button type="button" onClick={handleLogout} className={s.topBarLogout} aria-label="로그아웃">
            <LogOut size={16} aria-hidden="true" />
          </button>
        </div>
      </header>

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
