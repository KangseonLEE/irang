/**
 * PATCH /admin/api/requests — 요청 상태 변경
 *
 * Body: { id: number, status: "pending" | "done" | "rejected" }
 */

import { NextRequest, NextResponse } from "next/server";
import { updateRequestStatus } from "@/lib/admin/queries";
import type { RequestStatus } from "@/lib/admin/types";

const VALID_STATUSES: RequestStatus[] = ["pending", "done", "rejected"];

export async function PATCH(request: NextRequest) {
  let body: { id?: number; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, status } = body;

  if (!id || typeof id !== "number") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  if (!status || !VALID_STATUSES.includes(status as RequestStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  const ok = await updateRequestStatus(id, status as RequestStatus);

  if (!ok) {
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
