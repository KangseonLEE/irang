#!/bin/bash
# ═══════════════════════════════════════════
# 주요 페이지 SSR/prerender 무결성 점검 (watchman §13 CI 이관)
# 사용: bash scripts/watchman/check-ssr-integrity.sh          (로컬, KR)
# CI:   bash scripts/watchman/check-ssr-integrity.sh --ci     (GitHub Actions, e2e 우회)
#
# 배경: 2026-06-03 사고 — 홈 `/`의 히어로 검색창(useSearchParams)이 Suspense 경계
#       없이 있어 페이지 전체가 CSR로 bailout → 히어로 h1·헤드라인이 SSR HTML에서
#       통째로 누락. 사용자(JS 실행)는 정상이라 발견이 지연됐고, 네이버 색인이
#       5%(19/373)에서 정체. crawler 전용 사각지대였다.
#       이 스크립트는 .claude/agents/reminder-watchman.md §13(300~338행)의 수동 점검을
#       CI로 이관한 것 — 검사 대상·판정 기준·false positive 방지 원칙은 그 문서를 따른다.
#
# 검사 3종:
#   1. §13 SSR/h1 무결성 — 핵심 페이지 h1 개수·SSR 크기·BAILOUT 마커 허용치
#   2. sitemap URL 수 급감 — /sitemap/{core,regions,content}.xml <loc> 합계
#   3. robots noindex 회귀 — User-agent:* 전체 차단 + 페이지 noindex meta
#      (2026-05-18 dev 서브도메인 사고의 prod 회귀 감시)
#
# 러너 리전 주의: 이 CI 러너는 미국 리전이라 Cloudflare가 KR 외 트래픽을 차단한다.
#   일반 UA로는 403이 뜬다. 따라서 --ci 모드에서는 반드시 2026-07-26에 검증된
#   e2e 우회 경로(UA `irang-e2e/1.0` + 헤더 `x-irang-e2e-secret`)를 쓴다.
#   스푸핑한 Yeti UA는 verified bot이 아니라서 차단되므로 절대 쓰지 않는다
#   (watchman.md §13의 Yeti 예시는 로컬 KR 전용 검증법이다).
# ═══════════════════════════════════════════

set -uo pipefail

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

BASE_URL="https://irangfarm.com"

BROWSER_UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
# playwright.config.ts와 동일한 UA 토큰 — 2026-07-26 검증된 CF Skip 룰 경로.
E2E_UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 irang-e2e/1.0"

if [ "$CI_MODE" = true ]; then
  if [ -z "${E2E_SECRET:-}" ]; then
    echo "✗ --ci 모드인데 E2E_SECRET 환경변수가 미설정이에요. GitHub Secrets 확인이 필요해요." >&2
    exit 1
  fi
fi

# ── 점검 대상 페이지 (path, SSR 하한 바이트, BAILOUT 마커 허용 개수) ──
# 하한값은 2026-08-17 KR 실측치의 약 55~60%. BAILOUT 허용치는 같은 날 실측한
# 마커 occurrence 수(grep -o 기준, 검색창 Suspense boundary가 스트리밍 마커를
# 여러 번 방출하는 구조라 line 수(grep -c)가 아니라 occurrence 수로 잰다) —
# 홈 3개·guide 2개가 정상, 그 외 페이지는 0개가 정상.
PAGE_PATHS=("" "regions" "crops" "programs" "costs" "guide" "education" "events" "interviews")
PAGE_MIN_BYTES=(120000 145000 120000 65000 95000 120000 80000 50000 180000)
PAGE_MAX_BAILOUT=(3 0 0 0 0 2 0 0 0)

SITEMAP_FILES=("core" "regions" "content")
SITEMAP_FLOOR=340

TARGETS=0
CRIT=0
WARN=0
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — 주요 페이지 SSR/prerender 무결성 점검 (§13)"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC') | 모드: $([ "$CI_MODE" = true ] && echo 'CI(e2e 우회)' || echo '로컬(KR)')"
echo "═══════════════════════════════════════════"
echo ""

# WATCHMAN_FINDINGS 미설정이면 append를 건너뛰고 stdout만 (로컬 실행 대응)
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

# 페이지/사이트맵/robots 공통 fetch. stdout으로 HTTP 상태코드만 반환, 본문은 out_file에 저장.
# NOTE: E2E_SECRET 값은 헤더로만 전달하고, 어떤 echo/print에도 노출하지 않는다.
fetch() {
  local url="$1"
  local out_file="$2"
  if [ "$CI_MODE" = true ]; then
    curl -s -o "$out_file" -w "%{http_code}" --max-time 15 \
      -A "$E2E_UA" \
      -H "x-irang-e2e: playwright" \
      -H "x-irang-e2e-secret: ${E2E_SECRET}" \
      "$url" 2>/dev/null || echo "000"
  else
    curl -s -o "$out_file" -w "%{http_code}" --max-time 15 \
      -A "$BROWSER_UA" \
      "$url" 2>/dev/null || echo "000"
  fi
}

# ── 1. §13 SSR/h1 무결성 ──
echo "▸ 1. SSR/h1 무결성"
IDX=0
while [ $IDX -lt ${#PAGE_PATHS[@]} ]; do
  path="${PAGE_PATHS[$IDX]}"
  floor="${PAGE_MIN_BYTES[$IDX]}"
  max_bail="${PAGE_MAX_BAILOUT[$IDX]}"
  label="/${path}"
  url="${BASE_URL}/${path}"
  TARGETS=$((TARGETS + 1))

  out_file="${TMPDIR}/page_${IDX}.html"
  code=$(fetch "$url" "$out_file")

  if [ "$code" = "526" ]; then
    echo "  ✗ ${label} | HTTP 526 — origin 장애 의심 | SSR 판정 보류"
    report "🔴" "§13 SSR 무결성" "${label} HTTP 526(origin 인증서/장애 의심) — SSR 판정 보류, check-cert-expiry.sh 확인 필요"
    IDX=$((IDX + 1))
    continue
  fi

  if [ "$CI_MODE" = true ] && [ "$code" = "403" ]; then
    echo "  ⚠ ${label} | HTTP 403 (e2e 우회 실패) | SSR 판정 skip"
    report "🟡" "§13 SSR 무결성" "${label} e2e 우회했는데도 HTTP 403 — CF 룰/E2E_SECRET 확인 필요, SSR 판정 skip"
    IDX=$((IDX + 1))
    continue
  fi

  if [ "$code" != "200" ]; then
    echo "  ⚠ ${label} | HTTP ${code} | SSR 판정 skip"
    report "🟡" "§13 SSR 무결성" "${label} HTTP ${code} (200 아님) — SSR 판정 보류"
    IDX=$((IDX + 1))
    continue
  fi

  size=$(wc -c < "$out_file" | tr -d ' ')
  h1=$(grep -o "<h1" "$out_file" | wc -l | tr -d ' ')
  bail=$(grep -o "BAILOUT_TO_CLIENT_SIDE_RENDERING" "$out_file" | wc -l | tr -d ' ')

  echo "  ${label} → ${size}B / h1 ${h1}개 / bailout ${bail}개 (하한 ${floor}B, bailout 허용 ${max_bail}개)"

  if [ "$h1" -eq 0 ]; then
    report "🔴" "§13 SSR 무결성" "${label} h1 0개 (기준 1개 이상), SSR ${size}B"
  fi

  if [ "$size" -lt "$floor" ]; then
    report "🔴" "§13 SSR 무결성" "${label} SSR ${size}B (하한 ${floor}B 미만) — CSR bailout 신호"
  fi

  if [ "$bail" -gt "$max_bail" ]; then
    report "🟡" "§13 SSR 무결성" "${label} BAILOUT_TO_CLIENT_SIDE_RENDERING 마커 ${bail}개 (허용 ${max_bail}개 초과) — 위치(검색창 vs 본문) 확인 필요"
  fi

  # noindex meta 회귀 (§ 로봇 회귀와 별개로 페이지 단위 검사)
  meta=$(grep -Eoi '<meta[[:space:]]+name="robots"[[:space:]]+content="[^"]*"' "$out_file" || true)
  if echo "$meta" | grep -qi "noindex"; then
    report "🔴" "robots noindex 회귀" "${label} HTML에 <meta name=\"robots\" content=\"...noindex...\"> 존재 — prod 색인 차단 회귀 의심 (5/18 dev 서브도메인 사고 재발 패턴)"
    echo "  ✗ ${label} | noindex meta 발견"
  fi

  IDX=$((IDX + 1))
done
echo ""

# ── 2. sitemap URL 수 급감 ──
echo "▸ 2. sitemap URL 수"
TARGETS=$((TARGETS + 1))
TOTAL_LOC=0
SITEMAP_OK=true
for id in "${SITEMAP_FILES[@]}"; do
  out_file="${TMPDIR}/sitemap_${id}.xml"
  url="${BASE_URL}/sitemap/${id}.xml"
  code=$(fetch "$url" "$out_file")

  if [ "$code" != "200" ]; then
    echo "  ⚠ /sitemap/${id}.xml | HTTP ${code} — 개수 집계 skip"
    report "🟡" "sitemap URL 수" "/sitemap/${id}.xml HTTP ${code} (200 아님) — 집계 보류"
    SITEMAP_OK=false
    continue
  fi

  loc=$(grep -o "<loc>" "$out_file" | wc -l | tr -d ' ')
  echo "  /sitemap/${id}.xml → loc ${loc}개"
  TOTAL_LOC=$((TOTAL_LOC + loc))
done

if [ "$SITEMAP_OK" = true ]; then
  echo "  합계 → ${TOTAL_LOC}개 (하한 ${SITEMAP_FLOOR}개)"
  if [ "$TOTAL_LOC" -lt "$SITEMAP_FLOOR" ]; then
    report "🔴" "sitemap URL 수" "sitemap 합계 ${TOTAL_LOC}개 (하한 ${SITEMAP_FLOOR}개 미만) — URL 급감 의심"
  fi
fi
echo ""

# ── 3. robots noindex 회귀 (전체 차단) ──
echo "▸ 3. robots.txt 전체 차단 회귀"
TARGETS=$((TARGETS + 1))
robots_file="${TMPDIR}/robots.txt"
code=$(fetch "${BASE_URL}/robots.txt" "$robots_file")

if [ "$code" != "200" ]; then
  echo "  ⚠ /robots.txt | HTTP ${code} — 판정 skip"
  report "🟡" "robots noindex 회귀" "/robots.txt HTTP ${code} (200 아님) — 판정 보류"
else
  # User-agent: * 블록(첫 문단)만 추출해서 Allow: / 존재 여부 확인.
  # robots.ts의 dev/preview 분기는 { userAgent: "*", disallow: "/" }만 반환 —
  # 즉 Allow: / 없이 Disallow: / 만 있는 상태가 곧 "전체 차단" 회귀 신호다.
  # (GPTBot 등 개별 AI 크롤러 전용 Disallow: / 블록은 User-agent: * 블록이 아니므로 무관)
  block=$(awk 'BEGIN{f=0} /^User-Agent:[[:space:]]*\*/{f=1} f{print} f && /^[[:space:]]*$/{exit}' "$robots_file")
  if echo "$block" | grep -qiE '^Allow:[[:space:]]*/[[:space:]]*$'; then
    echo "  ✓ User-agent:* 블록에 Allow: / 확인 — 정상"
  else
    echo "  ✗ User-agent:* 블록에 Allow: / 없음 — 전체 차단 의심"
    report "🔴" "robots noindex 회귀" "robots.txt User-agent:* 블록에 Allow: / 없음 — 전체 차단(disallow /) 회귀 의심 (5/18 dev 서브도메인 사고 prod 재발 패턴)"
  fi
fi
echo ""

echo "───────────────────────────────────────────"
echo "  대상 ${TARGETS}개 | 위험 ${CRIT} | 경고 ${WARN}"
echo "───────────────────────────────────────────"

if [ $CRIT -eq 0 ] && [ $WARN -eq 0 ]; then
  echo ""
  echo "▸ 모든 페이지가 정상이에요."
  exit 0
fi

echo ""
if [ $CRIT -gt 0 ]; then
  echo "▸ 위험 ${CRIT}건 발견 — \$WATCHMAN_FINDINGS 참고"
  exit 1
fi

echo "▸ 경고 ${WARN}건 발견 — \$WATCHMAN_FINDINGS 참고"
exit 0
