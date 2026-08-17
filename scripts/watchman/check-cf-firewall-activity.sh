#!/bin/bash
# ═══════════════════════════════════════════
# Cloudflare 차단 약화 감지 (watchman §8-2 CI 이관)
# 사용: bash scripts/watchman/check-cf-firewall-activity.sh          (로컬)
# CI:   bash scripts/watchman/check-cf-firewall-activity.sh --ci     (GitHub Actions)
#
# 배경: 이랑은 CF Custom Rule 4종(ASN 차단·KR 외 catch-all·E2E Skip·ACME Skip)으로
#       KR 외 트래픽을 상시 차단한다(2026-05-14 배포). 이 룰이 정상 동작 중이면
#       24h 동안 반드시 block/challenge 이벤트가 1건 이상 발생한다. 0건은 트래픽이
#       없어서가 아니라 룰 자체가 비활성화됐다는 신호일 가능성이 높다
#       (.claude/agents/reminder-watchman.md §8-2, 103~124행).
#
# 쿼리 재사용: .github/workflows/cf-analytics-diag.yml의
#       firewallEventsAdaptiveGroups 호출 방식(GraphQL query 형태·인증 헤더)을
#       그대로 따른다 — 바퀴 재발명 금지.
# ═══════════════════════════════════════════

set -uo pipefail

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — Cloudflare 차단 약화 감지 (§8-2)"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC') | 모드: $([ "$CI_MODE" = true ] && echo 'CI' || echo '로컬')"
echo "═══════════════════════════════════════════"
echo ""

CRIT=0
WARN=0
report() {
  local grade="$1"
  local item="$2"
  local reason="$3"
  if [ -n "${WATCHMAN_FINDINGS:-}" ]; then
    printf '%s\n' "${grade}|${item}|${reason}" >> "$WATCHMAN_FINDINGS"
  fi
  if [ "$grade" = "🔴" ]; then
    CRIT=$((CRIT + 1))
  elif [ "$grade" = "🟡" ]; then
    WARN=$((WARN + 1))
  fi
}

TARGETS=1

# ── CF 인증 확인 ──
# 토큰 값은 curl 헤더 전달 외에는 절대 출력하지 않는다 (echo·print·finding 어디에도).
if [ -z "${CF_API_TOKEN:-}" ] || [ -z "${CF_ZONE_ID:-}" ]; then
  echo "✗ CF_API_TOKEN 또는 CF_ZONE_ID가 미설정이에요. 점검을 건너뛰어요."
  echo ""
  echo "───────────────────────────────────────────"
  echo "  대상 0개 | 위험 0 | 경고 0"
  echo "───────────────────────────────────────────"
  exit 0
fi

# 최근 24시간 (Free 플랜 Analytics 범위 제한 — cf-analytics-diag.yml과 동일 관례)
SINCE=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-24H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null)
UNTIL=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "▸ 최근 24h firewall 이벤트 (action별)"
echo "  구간: ${SINCE} ~ ${UNTIL}"

Q=$(jq -nc --arg z "$CF_ZONE_ID" --arg s "$SINCE" --arg u "$UNTIL" '{
  query: "query($z:String!,$s:Time!,$u:Time!){viewer{zones(filter:{zoneTag:$z}){firewallEventsAdaptiveGroups(limit:20,filter:{datetime_geq:$s,datetime_leq:$u},orderBy:[count_DESC]){count dimensions{action}}}}}",
  variables: {z:$z,s:$s,u:$u}
}')

RESP=$(curl -sS --max-time 20 https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "$Q" 2>/dev/null)
CURL_STATUS=$?

if [ "$CURL_STATUS" -ne 0 ] || [ -z "$RESP" ]; then
  echo "  ✗ CF GraphQL 요청 실패 (curl exit ${CURL_STATUS})"
  report "🟡" "§8-2 CF 차단 활성도" "CF GraphQL 요청 실패 (curl exit ${CURL_STATUS}) — 네트워크/API 장애 의심, 조회 불가"
  echo ""
  echo "───────────────────────────────────────────"
  echo "  대상 ${TARGETS}개 | 위험 ${CRIT} | 경고 ${WARN}"
  echo "───────────────────────────────────────────"
  exit 0
fi

has_errors=$(echo "$RESP" | jq -e '.errors != null and (.errors | length) > 0' 2>/dev/null)
if [ "$has_errors" = "true" ]; then
  err_msg=$(echo "$RESP" | jq -r '.errors[0].message // "unknown"' 2>/dev/null | head -c 200)
  echo "  ✗ CF GraphQL 에러: ${err_msg}"
  report "🟡" "§8-2 CF 차단 활성도" "CF GraphQL API 에러 — ${err_msg} (토큰 무효 또는 스코프 부족 의심, 값 자체는 비노출)"
  echo ""
  echo "───────────────────────────────────────────"
  echo "  대상 ${TARGETS}개 | 위험 ${CRIT} | 경고 ${WARN}"
  echo "───────────────────────────────────────────"
  exit 0
fi

# action별 분포 출력 (참고용)
echo "$RESP" | jq -r '.data.viewer.zones[0].firewallEventsAdaptiveGroups[]? | "  \(.dimensions.action)\t\(.count)건"' 2>/dev/null

TOTAL=$(echo "$RESP" | jq '[.data.viewer.zones[0].firewallEventsAdaptiveGroups[]?.count] | add // 0' 2>/dev/null)

echo ""
echo "  24h 총 firewall 이벤트(block/challenge 등) → ${TOTAL}건"

if [ "$TOTAL" -eq 0 ]; then
  echo "  ⚠ 0건 — 차단 룰 비활성화 의심"
  report "🟡" "§8-2 CF 차단 활성도" "최근 24h firewall(block/challenge) 이벤트 0건 — 5/14 배포한 CF Custom Rule 4종(ASN 차단·KR 외 catch-all·E2E Skip·ACME Skip)이 살아있는지 확인 권고"
else
  echo "  ✓ ${TOTAL}건 — 정상 (룰 동작 중)"
fi

echo ""
echo "───────────────────────────────────────────"
echo "  대상 ${TARGETS}개 | 위험 ${CRIT} | 경고 ${WARN}"
echo "───────────────────────────────────────────"

if [ $CRIT -eq 0 ] && [ $WARN -eq 0 ]; then
  echo ""
  echo "▸ CF 차단 룰이 정상 동작 중이에요."
  exit 0
fi

echo ""
if [ $CRIT -gt 0 ]; then
  echo "▸ 위험 ${CRIT}건 발견 — \$WATCHMAN_FINDINGS 참고"
  exit 1
fi

echo "▸ 경고 ${WARN}건 발견 — \$WATCHMAN_FINDINGS 참고"
exit 0
