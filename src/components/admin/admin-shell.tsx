"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ExternalLink, Bell } from "lucide-react";
import { ADMIN_SECTIONS } from "@/lib/admin/config";
import { INTERNAL_TRAFFIC_FLAG } from "@/lib/analytics-gate";
import type { AdminNotifications } from "@/lib/admin/notifications";
import s from "./admin-shell.module.css";

/** 배지 숫자 표기 — 99 초과는 99+ (탭 폭 보호) */
function badgeText(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  // ── 운영자 브라우저 GA 제외 (9/4) ──
  // /admin 에 들어온 브라우저는 운영자 것이므로 플래그를 심어 이후 모든 페이지에서
  // gtag.js 로드를 막는다(analytics-gate). 현재 페이지 로드에는 ga-disable 로 즉시 적용.
  useEffect(() => {
    try {
      window.localStorage.setItem(INTERNAL_TRAFFIC_FLAG, "1");
      const id = process.env.NEXT_PUBLIC_GA_ID;
      if (id) (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
    } catch {
      // 스토리지 차단 환경 — 다음 방문에 다시 시도
    }
  }, []);

  // ── 처리 대기 알림 (9/3 회장 지시) ──
  // 화면 이동마다 + 60초마다 재조회 → 승인·반려 직후 배지가 바로 줄어든다.
  const [noti, setNoti] = useState<AdminNotifications>({ items: [], total: 0 });
  const [panelOpen, setPanelOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // 알림 조회는 "외부 시스템 구독" — 화면 이동마다 + 60초마다 폴링해 승인·반려 직후 배지가 줄어든다.
  useEffect(() => {
    if (isLogin) return;
    let alive = true;
    const load = () => {
      fetch("/admin/api/notifications", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: AdminNotifications | null) => {
          if (alive && data) setNoti(data);
        })
        .catch(() => {
          /* 알림 실패는 조용히 무시 — 어드민 사용을 막지 않는다 */
        });
    };
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [isLogin, pathname]);

  useEffect(() => {
    if (!panelOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!bellRef.current?.contains(e.target as Node)) setPanelOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [panelOpen]);

  /** 섹션별 대기 건수 합 (같은 섹션에 항목이 여러 개면 합산) */
  const countFor = (key: string) =>
    noti.items.filter((i) => i.key === key).reduce((sum, i) => sum + i.count, 0);

  const bell = (
    <div className={s.bellWrap} ref={bellRef}>
      <button
        type="button"
        className={s.bell}
        onClick={() => setPanelOpen((v) => !v)}
        aria-label={noti.total > 0 ? `처리 대기 ${noti.total}건` : "처리 대기 없음"}
        aria-expanded={panelOpen}
      >
        <Bell size={18} aria-hidden="true" />
        {noti.total > 0 && <span className={s.bellCount}>{badgeText(noti.total)}</span>}
      </button>
      {panelOpen && (
        <div className={s.bellPanel} role="dialog" aria-label="처리 대기 알림">
          {noti.items.length === 0 ? (
            <p className={s.bellEmpty}>처리할 알림이 없어요</p>
          ) : (
            <ul className={s.bellList}>
              {noti.items.map((item) => (
                <li key={`${item.key}-${item.label}`}>
                  <Link
                    href={item.href}
                    className={s.bellItem}
                    onClick={() => setPanelOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className={s.bellItemCount}>{badgeText(item.count)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );

  // 로그인 페이지에서는 shell 없이 바로 표시 (훅 순서를 지키기 위해 조기 반환은 훅 뒤)
  if (isLogin) {
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
          {bell}
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
                {countFor(sec.key) > 0 && (
                  <span className={s.navCount} aria-label={`처리 대기 ${countFor(sec.key)}건`}>
                    {badgeText(countFor(sec.key))}
                  </span>
                )}
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
          {bell}
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
              <span className={s.tabIconWrap}>
                <Icon size={20} />
                {countFor(sec.key) > 0 && (
                  <span className={s.tabCount} aria-label={`처리 대기 ${countFor(sec.key)}건`}>
                    {badgeText(countFor(sec.key))}
                  </span>
                )}
              </span>
              <span className={s.tabLabel}>{sec.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
