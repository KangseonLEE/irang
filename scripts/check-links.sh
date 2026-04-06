#!/bin/bash
# ═══════════════════════════════════════════
# 외부 원문 링크 헬스체크 스크립트
# 사용: npm run check-links
# CI:   npm run check-links -- --ci  (깨진 링크 발견 시 GitHub Issue 생성)
# ═══════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROGRAMS_FILE="$PROJECT_DIR/src/lib/data/programs.ts"
EDUCATION_FILE="$PROJECT_DIR/src/lib/data/education.ts"

# CI 모드 플래그
CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

# 색상 (CI에서는 비활성화)
if [[ -t 1 ]] && [[ "$CI_MODE" == false ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  CYAN='\033[0;36m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  CYAN=''
  NC=''
fi

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
ISSUE_BODY=""

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
    ISSUE_BODY="${ISSUE_BODY}| \`${source}/${id}\` | TIMEOUT | ${url} |\n"
  else
    echo -e "  ${RED}✗${NC} ${code} | ${source}/${id} | ${domain}"
    FAIL=$((FAIL + 1))
    RESULTS="${RESULTS}\n  ✗ ${code}: ${source}/${id} — ${url}"
    ISSUE_BODY="${ISSUE_BODY}| \`${source}/${id}\` | ${code} | ${url} |\n"
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

  # ── CI 모드: GitHub Issue 자동 생성 ──
  if [ "$CI_MODE" = true ] && command -v gh &> /dev/null; then
    ISSUE_TITLE="🔗 외부 링크 헬스체크 실패 — $(date '+%Y-%m-%d')"

    # 같은 날짜 이슈가 이미 있는지 확인
    EXISTING=$(gh issue list --label "link-check" --state open --json title --jq '.[].title' 2>/dev/null || echo "")
    if echo "$EXISTING" | grep -q "$(date '+%Y-%m-%d')"; then
      echo "ℹ️  오늘자 이슈가 이미 존재합니다. 새 이슈를 생성하지 않습니다."
    else
      BODY="## 외부 원문 링크 헬스체크 실패

**검사일시:** $(date '+%Y-%m-%d %H:%M')
**결과:** 총 ${TOTAL}개 중 실패 ${FAIL}개, 타임아웃 ${TIMEOUT}개

### 문제 링크

| ID | 상태 | URL |
|----|------|-----|
$(echo -e "$ISSUE_BODY")

### 조치 방법

1. 위 URL에 직접 접속하여 상태를 확인하세요
2. 페이지가 완전히 삭제된 경우:
   - \`src/lib/data/programs.ts\` 또는 \`education.ts\`에서 해당 항목에 \`linkStatus: \"broken\"\` 추가
   - 이렇게 하면 **목록에서 자동 숨김** + **상세페이지에서 Google 검색 폴백** 표시
3. URL이 변경된 경우: 새 URL로 업데이트
4. 일시적 장애인 경우: 다음 날 자동 재검사됩니다

### 예시
\`\`\`ts
{
  id: \"prg-001\",
  // ...
  sourceUrl: \"https://...\",
  linkStatus: \"broken\",  // ← 이 줄 추가
}
\`\`\`
"

      gh issue create \
        --title "$ISSUE_TITLE" \
        --body "$BODY" \
        --label "link-check" \
        2>/dev/null && echo "✅ GitHub Issue가 생성되었습니다." || echo "⚠️  Issue 생성 실패 (label이 없거나 권한 부족)"
    fi
  else
    echo "위 링크를 확인하고 src/lib/data/ 파일에서 URL을 수정하세요."
    echo "또는 linkStatus: \"broken\" 을 추가하여 목록에서 숨길 수 있습니다."
  fi

  exit 1
else
  echo ""
  echo -e "${GREEN}▸ 모든 외부 링크가 정상입니다.${NC}"
  exit 0
fi
