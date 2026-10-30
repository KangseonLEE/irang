#!/usr/bin/env bash
# sync-crawl Edge Function 타깃 1개 실행 + 성패 판정 (sync-data.yml · greendaero-reconcile.yml 공용, 2026-10-30)
#
#   bash scripts/sync/crawl-target.sh <target> [refresh:true|false]
#   env: SUPABASE_URL, CRON_SECRET
#
# 판정은 2026-09-29·10/3 규칙 그대로:
#   1) 응답 없음·2xx 아님 → 실패. 400 "Unknown target" 은 Edge Function 재배포 누락 신호.
#   2) 2xx 여도 본문 ok:false → 실패 (원천 수집 실패·총건수>0 인데 0건·upsert 실패).
set -u

target="${1:?target}"
refresh="${2:-false}"
case "$refresh" in true|false) ;; *) echo "::error::refresh 는 true|false — '$refresh'"; exit 2 ;; esac
: "${SUPABASE_URL:?SUPABASE_URL}"
: "${CRON_SECRET:?CRON_SECRET}"

# 그린대로는 200건 페이지를 최대 3회 받아오므로 여유를 둔다
response=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/sync-crawl" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json" \
  -d "{\"target\": \"${target}\", \"refresh\": ${refresh}}" \
  --max-time 150) || true

http_code=$(printf '%s\n' "$response" | tail -1)
body=$(printf '%s\n' "$response" | sed '$d')

echo "HTTP Status: $http_code"
echo "Response: $body"

case "$http_code" in
  2*) ;;
  "") echo "::error::${target}: 응답 없음 (타임아웃 추정)"; exit 1 ;;
  400)
    echo "::error::${target}: HTTP 400 — 배포본에 타깃이 없을 수 있습니다. 'supabase functions deploy sync-crawl' 확인"
    exit 1
    ;;
  *) echo "::error::${target}: HTTP $http_code"; exit 1 ;;
esac

if printf '%s' "$body" | grep -q '"ok":false'; then
  echo "::error::${target}: 수집/적재 실패 — $body"
  exit 1
fi

# 그린대로 교육은 원천 상태 대조 결과(reconciled)를 요약해 둔다 — 로그에서 바로 보이게
if printf '%s' "$body" | grep -q '"reconciled"'; then
  n=$(printf '%s' "$body" | grep -o '"reason":"[^"]*"' | wc -l | tr -d ' ')
  echo "원천 대조: ${n}행 정정"
  printf '%s' "$body" | grep -o '"slug":"[^"]*","from":"[^"]*","patch":{[^}]*},"reason":"[^"]*","to":"[^"]*"' | sed 's/^/  /'
fi
