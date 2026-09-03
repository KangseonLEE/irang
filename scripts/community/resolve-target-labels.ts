/**
 * community-pending.yml 전용 — pending.json 의 (target_type, target_id) 를 한글 이름으로 해석해
 * `{"crop/eggplant": "가지", ...}` 맵을 stdout 에 JSON 으로 출력한다 (2026-09-03 회장 지시).
 *
 * CI는 node_modules 없이 `npx tsx` 로 실행하므로 외부 패키지 의존이 없어야 한다.
 * → `@/lib/community/target-label` 은 crops·regions·sigungus(순수 TS)만 import 한다.
 * 지원사업 제목은 supabase 의존이라 CI에서 해석하지 않는다(원본 SP-id 표기 유지).
 *
 * 사용: npx tsx scripts/community/resolve-target-labels.ts pending.json > labels.json
 */

import { readFileSync } from "node:fs";
import { resolveTargetLabel } from "@/lib/community/target-label";
import { isNoteTargetType } from "@/lib/community/types";

const file = process.argv[2];
if (!file) {
  console.error("usage: resolve-target-labels.ts <pending.json>");
  process.exit(1);
}

interface Row {
  target_type?: string;
  target_id?: string;
}

const rows: Row[] = JSON.parse(readFileSync(file, "utf8"));
const map: Record<string, string> = {};

for (const row of rows) {
  const { target_type: type, target_id: id } = row;
  if (!type || !id || !isNoteTargetType(type)) continue;
  map[`${type}/${id}`] = resolveTargetLabel(type, id);
}

process.stdout.write(JSON.stringify(map));
