import { NextResponse } from "next/server";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { EVENTS } from "@/lib/data/events";
import { deriveStatus, deriveEventStatus } from "@/lib/program-status";

/**
 * 데이터 신선도 Cron 점검 (매주 월요일 09:00 KST)
 *
 * - 지원사업/교육/행사의 상태 불일치 감지
 * - 7일 이내 만료 예정 항목 조기 경고
 * - Vercel Cron에서 호출 (CRON_SECRET으로 인증)
 */
export async function GET(request: Request) {
  // Vercel Cron 인증
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // 지원사업 점검
  const programIssues = PROGRAMS.map((p) => {
    const derived = deriveStatus(p.applicationStart, p.applicationEnd);
    return {
      id: p.id,
      title: p.title,
      hardcoded: p.status,
      derived,
      match: p.status === derived,
      expiringSoon:
        p.applicationEnd && p.applicationEnd <= sevenDaysLater && p.applicationEnd >= today,
    };
  }).filter((p) => !p.match || p.expiringSoon);

  // 교육 점검
  const educationIssues = EDUCATION_COURSES.map((e) => {
    const derived = deriveStatus(e.applicationStart ?? "", e.applicationEnd ?? "");
    return {
      id: e.id,
      title: e.title,
      hardcoded: e.status,
      derived,
      match: e.status === derived,
    };
  }).filter((e) => !e.match);

  // 행사 점검
  const eventIssues = EVENTS.map((e) => {
    const derived = deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd);
    return {
      id: e.id,
      title: e.title,
      hardcoded: e.status,
      derived,
      match: e.status === derived,
    };
  }).filter((e) => !e.match);

  const totalIssues =
    programIssues.length + educationIssues.length + eventIssues.length;

  const report = {
    checkedAt: today,
    totalIssues,
    programs: {
      total: PROGRAMS.length,
      mismatches: programIssues.filter((p) => !p.match).length,
      expiringSoon: programIssues.filter((p) => p.expiringSoon).length,
      items: programIssues,
    },
    education: {
      total: EDUCATION_COURSES.length,
      mismatches: educationIssues.length,
      items: educationIssues,
    },
    events: {
      total: EVENTS.length,
      mismatches: eventIssues.length,
      items: eventIssues,
    },
  };

  return NextResponse.json(report);
}
