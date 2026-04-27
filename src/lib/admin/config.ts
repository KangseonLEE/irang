/**
 * 어드민 네비게이션 설정
 *
 * 새 섹션 추가 시:
 * 1. 이 배열에 항목 추가
 * 2. src/app/admin/{key}/page.tsx 폴더 생성
 * → 사이드바·하단탭이 자동 반영
 */

import {
  LayoutDashboard,
  MessageSquareText,
  Search,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

export interface AdminSection {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { key: "overview", label: "대시보드", icon: LayoutDashboard, href: "/admin" },
  {
    key: "feedback",
    label: "피드백",
    icon: MessageSquareText,
    href: "/admin/feedback",
  },
  { key: "search", label: "검색 분석", icon: Search, href: "/admin/search" },
  {
    key: "assessments",
    label: "진단 결과",
    icon: ClipboardCheck,
    href: "/admin/assessments",
  },
];
