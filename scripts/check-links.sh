#!/bin/bash
# ═══════════════════════════════════════════
# 외부 원문 링크 헬스체크 스크립트
# 사용: npm run check-links
# ═══════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROGRAMS_FILE="$PROJECT_DIR/src/lib/data/programs.ts"
EDUCATION_FILE="$PROJECT_DIR/src/lib/data/education.ts"

# 색상
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — 외부 원문 링크 헬스체크"
echo "  $(date '+%Y-%m-%d %H:%M')"
echo "═══════════════════════════════════════════"
echo ""

TOTAL=0
OK=0
FAIL=0
TIMEOUT=0
RESULTS=""

check_url() {
  local id="$1"
  local url="$2"
  local source="$3"

  TOTAL=$((TOTAL + 1))

  local code
  code=$(curl -o /dev/null -s -w "%{http_code}" --max-time 15 -L "$url" 2>/dev/null || echo "000")

  local domain
  domain=$(echo "$url" | sed 's|https\{0,1\}://\([^/]*\).*|\1|' | sed 's/^www\.//')

  if [ "$code" -ge 200 ] && [ "$code" -lt 400 ]; then
    echo -e "  ${GREEN}✓${NC} ${code} | ${source}/${id} | ${domain}"
    OK=$((OK + 1))
  elif [ "$code" = "000" ]; then
    echo -e "  ${YELLOW}⏱${NC} TIMEOUT | ${source}/${id} | ${domain}"
    TIMEOUT=$((TIMEOUT + 1))
    RESULTS="${RESULTS}\n  ⏱ TIMEOUT: ${source}/${id} — ${url}"
  else
    echo -e "  ${RED}✗${NC} ${code} | ${source}/${id} | ${domain}"
    FAIL=$((FAIL + 1))
    RESULTS="${RESULTS}\n  ✗ ${code}: ${source}/${id} — ${url}"
  fi
}

# ── 지원사업 URL 추출 및 체크 ──
echo -e "${CYAN}▸ 지원사업 (programs)${NC}"

# id와 sourceUrl을 쌍으로 추출
while IFS= read -r line; do
  if echo "$line" | grep -q 'id:'; then
    current_id=$(echo "$line" | sed 's/.*id: "\([^"]*\)".*/\1/')
  fi
  if echo "$line" | grep -q 'sourceUrl:.*http'; then
    url=$(echo "$line" | sed 's/.*sourceUrl: "\([^"]*\)".*/\1/')
    if [ -n "$url" ] && [ "$url" != "" ]; then
      check_url "$current_id" "$url" "programs"
    fi
  fi
done < "$PROGRAMS_FILE"

echo ""

# ── 교육 URL 추출 및 체크 ──
echo -e "${CYAN}▸ 교육 (education)${NC}"

while IFS= read -r line; do
  if echo "$line" | grep -q 'id:'; then
    current_id=$(echo "$line" | sed 's/.*id: "\([^"]*\)".*/\1/')
  fi
  if echo "$line" | grep -q 'url:.*http'; then
    url=$(echo "$line" | sed 's/.*url: "\([^"]*\)".*/\1/')
    if [ -n "$url" ] && [ "$url" != "" ]; then
      check_url "$current_id" "$url" "education"
    fi
  fi
done < "$EDUCATION_FILE"

echo ""

# ── 결과 요약 ──
echo "───────────────────────────────────────────"
echo -e "  총 ${TOTAL}개 | ${GREEN}정상 ${OK}${NC} | ${RED}실패 ${FAIL}${NC} | ${YELLOW}타임아웃 ${TIMEOUT}${NC}"
echo "───────────────────────────────────────────"

if [ $FAIL -gt 0 ] || [ $TIMEOUT -gt 0 ]; then
  echo ""
  echo -e "${RED}▸ 문제 발견:${NC}"
  echo -e "$RESULTS"
  echo ""
  echo "위 링크를 확인하고 src/lib/data/ 파일에서 URL을 수정하세요."
  exit 1
else
  echo ""
  echo -e "${GREEN}▸ 모든 외부 링크가 정상입니다.${NC}"
  exit 0
fi
