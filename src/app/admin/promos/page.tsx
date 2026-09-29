/**
 * 어드민 — 홍보 팝업 관리 (2026-09-29 회장 지시)
 *
 * 목록·편집·미리보기가 전부 상호작용이라 화면은 클라이언트에 둔다.
 * 데이터는 `/admin/api/promos` 로만 오간다 — DB 접근은 API 쪽 책임.
 */

import type { Metadata } from "next";
import { PromoAdmin } from "./promo-admin";

export const metadata: Metadata = {
  title: "홍보 관리",
  robots: { index: false, follow: false },
};

export default function AdminPromosPage() {
  return <PromoAdmin />;
}
