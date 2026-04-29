import { NextResponse } from "next/server";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import {
  deriveStatus,
  deriveEventStatus,
  daysUntilDeadline,
  ALWAYS_OPEN,
} from "@/lib/program-status";

/**
 * 데이터 신선도 Cron 점검 (매주 월요일 09:00 KST)
 *
 * - 7일 이내 만료 예정 항목 조기 경고
 * - 현재 모집중 / 마감 현황 요약
 * - Vercel Cron에서 호출 (CRON_SECRET으로 인증)
 */
export async function GET(request: Request) {
  // Vercel Cron 인증
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);

  // 지원사업 점검: 만료 임박 + 현재 상태 요약
  const programItems = PROGRAMS.map((p) => {
    const status = deriveStatus(p.applicationStart, p.applicationEnd);
    const daysLeft = daysUntilDeadline(p.applicationEnd);
    const isAlwaysOpen = p.applicationEnd === ALWAYS_OPEN;
    return {
      id: p.id,
      title: p.title,
      status,
      applicationEnd: isAlwaysOpen ? "상시" : p.applicationEnd,
      daysLeft: isAlwaysOpen ? null : daysLeft,
      expiringSoon: !isAlwaysOpen && daysLeft >= 0 && daysLeft <= 7,
    };
  });

  const programExpiring = programItems.filter((p) => p.expiringSoon);
  const programOpen = programItems.filter((p) => p.status === "모집중");

  // 교육 점검
  const educationItems = EDUCATION_COURSES.map((e) => {
    const status = deriveStatus(e.applicationStart, e.applicationEnd);
    const daysLeft = daysUntilDeadline(e.applicationEnd);
    return {
      id: e.id,
      title: e.title,
      status,
      daysLeft: daysLeft === Infinity ? null : daysLeft,
      expiringSoon: daysLeft !== Infinity && daysLeft >= 0 && daysLeft <= 7,
    };
  });

  // 행사 점검
  const eventItems = EVENTS.map((e) => {
    const status = deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd);
    return { id: e.id, title: e.title, status };
  });

  const report = {
    checkedAt: today,
    programs: {
      total: PROGRAMS.length,
      open: programOpen.length,
      expiringSoon: programExpiring.length,
      expiringItems: programExpiring,
    },
    education: {
      total: EDUCATION_COURSES.length,
      open: educationItems.filter((e) => e.status === "모집중").length,
      expiringSoon: educationItems.filter((e) => e.expiringSoon).length,
    },
    events: {
      total: EVENTS.length,
      open: eventItems.filter((e) => e.status === "접수중").length,
    },
  };

  return NextResponse.json(report);
}
