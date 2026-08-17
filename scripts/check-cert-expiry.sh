#!/bin/bash
# ═══════════════════════════════════════════
# SSL 인증서 만료·도달성 점검
# 사용: npm run check-cert
# CI:   bash scripts/check-cert-expiry.sh --ci  (이상 발견 시 GitHub Issue 생성)
#
# 배경: Vercel origin 인증서 만료 → Cloudflare 526 → ACME 검증 트래픽도 차단 →
#       자동 갱신 영구 불가(자기잠금). 만료 "전에" 잡는 것이 유일한 방어선.
#       2026-07-24 apex 전면 다운 / 2026-08-17 www 13일 잠복 사고 대응.
# ═══════════════════════════════════════════

set -uo pipefail

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

# 점검 대상 호스트
HOSTS=("irangfarm.com" "www.irangfarm.com")

# 임계값 (일)
WARN_DAYS=21
CRIT_DAYS=10

PROBLEMS=""
ISSUE_ROWS=""
CRIT=0
WARN=0

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — SSL 인증서 만료·도달성 점검"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC')"
echo "═══════════════════════════════════════════"
echo ""

for host in "${HOSTS[@]}"; do
  # ── 1. HTTPS 도달성 ──
  # CF는 KR 외 트래픽을 차단하므로 403/503은 정상(러너는 미국). 526만이 origin 인증서 장애 신호.
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 \
    -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" \
    "https://${host}/" 2>/dev/null || echo "000")

  # ── 2. 인증서 만료일 ──
  # NOTE: Cloudflare 프록시(orange cloud) 뒤라 여기서 보이는 건 CF 엣지 인증서다.
  #       Vercel origin 인증서는 밖에서 직접 볼 수 없고, 만료 시 526으로만 드러난다.
  #       따라서 D-N 임계는 엣지 인증서 감시용이고, origin 감시의 핵심은 아래 526 판정이다.
  #       origin 만료일 직접 확인은 `npx vercel certs ls` (로컬 인증 필요).
  not_after=$(echo | openssl s_client -connect "${host}:443" -servername "${host}" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

  if [ -z "$not_after" ]; then
    echo "  ✗ ${host} | 인증서 조회 실패 (TLS 핸드셰이크 불가) | HTTP ${code}"
    PROBLEMS="${PROBLEMS}\n  ✗ ${host}: TLS 핸드셰이크 실패 (HTTP ${code})"
    ISSUE_ROWS="${ISSUE_ROWS}| \`${host}\` | TLS 핸드셰이크 실패 | HTTP ${code} |\n"
    CRIT=$((CRIT + 1))
    continue
  fi

  expiry_epoch=$(date -d "$not_after" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$not_after" +%s 2>/dev/null || echo 0)
  now_epoch=$(date +%s)
  days_left=$(( (expiry_epoch - now_epoch) / 86400 ))

  # ── 3. 526 판정 — origin 인증서 장애 (최우선) ──
  if [ "$code" = "526" ]; then
    echo "  ✗ ${host} | HTTP 526 — origin 인증서 무효 | 엣지 인증서 D-${days_left}"
    PROBLEMS="${PROBLEMS}\n  ✗ ${host}: HTTP 526 (origin 인증서 무효 — 자동 갱신 자기잠금 상태)"
    ISSUE_ROWS="${ISSUE_ROWS}| \`${host}\` | **HTTP 526** — origin 인증서 무효 | 수동 DNS-01 복구 필요 |\n"
    CRIT=$((CRIT + 1))
    continue
  fi

  # ── 4. 만료 임박 판정 ──
  if [ "$days_left" -lt "$CRIT_DAYS" ]; then
    echo "  ✗ ${host} | D-${days_left} (임계 ${CRIT_DAYS}일 미만) | HTTP ${code}"
    PROBLEMS="${PROBLEMS}\n  ✗ ${host}: 만료 D-${days_left} — 즉시 갱신 확인 필요"
    ISSUE_ROWS="${ISSUE_ROWS}| \`${host}\` | 만료 D-${days_left} | ${not_after} |\n"
    CRIT=$((CRIT + 1))
  elif [ "$days_left" -lt "$WARN_DAYS" ]; then
    echo "  ⚠ ${host} | D-${days_left} (경고 ${WARN_DAYS}일 미만) | HTTP ${code}"
    PROBLEMS="${PROBLEMS}\n  ⚠ ${host}: 만료 D-${days_left} — 자동 갱신 진행 여부 확인 권고"
    ISSUE_ROWS="${ISSUE_ROWS}| \`${host}\` | 만료 D-${days_left} | ${not_after} |\n"
    WARN=$((WARN + 1))
  else
    echo "  ✓ ${host} | D-${days_left} | HTTP ${code}"
  fi
done

echo ""
echo "───────────────────────────────────────────"
echo "  대상 ${#HOSTS[@]}개 | 위험 ${CRIT} | 경고 ${WARN}"
echo "───────────────────────────────────────────"

if [ $CRIT -eq 0 ] && [ $WARN -eq 0 ]; then
  echo ""
  echo "▸ 모든 인증서가 정상이에요."
  exit 0
fi

echo ""
echo "▸ 문제 발견:"
echo -e "$PROBLEMS"
echo ""

if [ "$CI_MODE" = true ] && command -v gh &> /dev/null; then
  ISSUE_TITLE="🔐 SSL 인증서 점검 이상 — $(date -u '+%Y-%m-%d')"
  EXISTING=$(gh issue list --label "cert-expiry" --state open --json title --jq '.[].title' 2>/dev/null || echo "")
  if echo "$EXISTING" | grep -q "$(date -u '+%Y-%m-%d')"; then
    echo "ℹ️  오늘자 이슈가 이미 존재해요. 새 이슈를 만들지 않아요."
  else
    BODY="## SSL 인증서 점검 이상

**점검일시:** $(date -u '+%Y-%m-%d %H:%M UTC')
**결과:** 위험 ${CRIT}건 / 경고 ${WARN}건

| 호스트 | 상태 | 비고 |
|--------|------|------|
$(echo -e "$ISSUE_ROWS")

### 왜 급한가

Vercel origin 인증서가 만료되면 Cloudflare가 **526**을 반환해요. 이때 Let's Encrypt의
ACME HTTP-01 검증 트래픽도 함께 죽어서 **자동 갱신이 영구 불가**해지는 자기잠금 구조예요.
만료 전에 잡지 못하면 수동 DNS-01 복구 외에는 방법이 없어요.

### 복구 절차 (526이 이미 떴을 때)

1. \`npx vercel certs issue <호스트> --challenge-only\` 로 TXT 챌린지 값 확보
2. Cloudflare DNS에 \`_acme-challenge.<서브도메인>\` TXT 레코드 추가
3. \`npx vercel certs issue <호스트>\` 재실행
4. \`curl -o /dev/null -w \"%{http_code}\" https://<호스트>/\` 로 200 확인
5. TXT 레코드 삭제 (1회용)

### 참고

- Cloudflare Custom Rule 중 \`/.well-known/acme-challenge/\` Skip 룰(Order First)이
  살아 있어야 HTTP-01 자동 갱신이 동작해요
- 러너는 미국 리전이라 CF의 KR 외 차단으로 403·503이 나올 수 있어요. 그건 정상이고,
  **526만이 origin 인증서 장애 신호**예요
"
    gh issue create \
      --title "$ISSUE_TITLE" \
      --body "$BODY" \
      --label "cert-expiry" \
      --assignee "KangseonLEE" \
      2>/dev/null && echo "✅ GitHub Issue를 만들었어요." || echo "⚠️  Issue 생성 실패 (label 없음 또는 권한 부족)"
  fi
fi

# 위험(만료 임박·526)만 exit 1 — 경고는 알림만
if [ $CRIT -gt 0 ]; then
  exit 1
fi
exit 0
