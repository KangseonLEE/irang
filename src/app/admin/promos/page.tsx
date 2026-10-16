/**
 * 어드민 — 홍보 팝업 관리 (2026-09-29 회장 지시)
 *
 * 목록·편집·미리보기가 전부 상호작용이라 화면은 클라이언트에 둔다.
 * 데이터는 `/admin/api/promos` 로만 오간다 — DB 접근은 API 쪽 책임.
 */

import type { Metadata } from "next";
import { PromoAdmin } from "./promo-admin";
import { requireAdminPage } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "홍보 관리",
  robots: { index: false, follow: false },
};

export default async function AdminPromosPage() {
  await requireAdminPage(); // 미들웨어와 별개의 2차 인가 — 데이터 조회보다 먼저 (보안 QA 🟡5)
  return <PromoAdmin />;
}
