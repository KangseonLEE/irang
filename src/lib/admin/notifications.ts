/**
 * 어드민 처리 대기 알림 — 2026-09-03 회장 지시
 * ("어드민에서 봐야 할 알림이 있으면 종 아이콘 개수나 하단 탭 배지로 알려줘")
 *
 * 원칙: **내가 조치해야 사라지는 것만** 센다. 조회수·오늘 피드백처럼 조치해도 안 줄어드는 수치는
 * 배지에 넣지 않는다(상시 빨간 점 = 경보 피로, 8/29 watchman 교훈과 동일).
 *
 * 현재 대상 2종
 *  - 커뮤니티: `pending`(승인 대기) + `hidden`(신고 3건 자동 숨김 → 복구/유지 판단 필요)
 *  - 요청 관리: quick_feedback 중 요청 글의 `status = pending`
 * 테이블이 아직 없거나(마이그레이션 전) Supabase 미설정이면 0으로 조용히 넘어간다 — 알림은
 * 실패해도 어드민 사용을 막지 않는다.
 */

import { getSupabaseAdmin } from "@/lib/supabase";

interface AdminNotificationItem {
  /** ADMIN_SECTIONS.key 와 동일 — 사이드바·탭 배지 매칭 키 */
  key: string;
  label: string;
  count: number;
  href: string;
}

export interface AdminNotifications {
  items: AdminNotificationItem[];
  total: number;
}

const EMPTY: AdminNotifications = { items: [], total: 0 };

/** count 조회 1건 — 실패(테이블 없음·권한)는 0으로 흡수 */
async function safeCount(
  run: () => PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await run();
    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

export async function fetchAdminNotifications(): Promise<AdminNotifications> {
  const sb = getSupabaseAdmin();
  if (!sb) return EMPTY;

  const [pendingNotes, hiddenNotes, pendingRequests] = await Promise.all([
    safeCount(() =>
      sb
        .from("community_notes")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("is_e2e", false),
    ),
    safeCount(() =>
      sb
        .from("community_notes")
        .select("id", { count: "exact", head: true })
        .eq("status", "hidden")
        .eq("is_e2e", false),
    ),
    safeCount(() =>
      sb
        .from("quick_feedback")
        .select("id", { count: "exact", head: true })
        .like("message", "%요청%")
        .eq("status", "pending"),
    ),
  ]);

  const items: AdminNotificationItem[] = [];
  if (pendingRequests > 0) {
    items.push({
      key: "requests",
      label: "처리 대기 요청",
      count: pendingRequests,
      href: "/admin/requests?status=pending",
    });
  }
  if (pendingNotes > 0) {
    items.push({
      key: "community",
      label: "승인 대기 의견",
      count: pendingNotes,
      href: "/admin/community?status=pending",
    });
  }
  if (hiddenNotes > 0) {
    items.push({
      key: "community",
      label: "신고로 숨겨진 의견",
      count: hiddenNotes,
      href: "/admin/community?status=hidden",
    });
  }

  return { items, total: items.reduce((sum, i) => sum + i.count, 0) };
}
