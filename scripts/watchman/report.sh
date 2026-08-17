#!/bin/bash
# ═══════════════════════════════════════════
# watchman 검사 결과 취합·보고 (aggregator)
# 사용: WATCHMAN_FINDINGS=/tmp/f.txt bash scripts/watchman/report.sh [--ci]
#
# 개별 검사 스크립트(scripts/watchman/check-*.sh|ts)는 이슈를 직접 만들지 않는다.
# 각자 `등급|항목|근거` 1행씩을 $WATCHMAN_FINDINGS 파일에 append하고,
# 이 스크립트가 전부 모아 **하나의** GitHub Issue로 발행한다.
# (검사마다 이슈를 만들면 하루 5개씩 쌓여 회장 화면이 노이즈로 덮인다)
#
# 배경: 8/4 www 인증서 갱신 실패가 세션 부재로 13일 방치된 사고.
#       감시 항목이 없어서가 아니라 실행 주체가 사람 세션이라 공백이 생겼다.
#       세션과 무관한 스케줄 워크플로로 감시를 승격하는 이관 작업의 종착점.
# ═══════════════════════════════════════════

set -uo pipefail

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

FINDINGS_FILE="${WATCHMAN_FINDINGS:-}"

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — watchman 감시 결과 취합"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC')"
echo "═══════════════════════════════════════════"
echo ""

if [ -z "$FINDINGS_FILE" ]; then
  echo "⚠️  WATCHMAN_FINDINGS 환경변수가 없어요. 취합할 대상을 못 찾았어요."
  exit 1
fi

# 파일 부재 = 발견 사항 0건 (검사 스크립트는 이상 없으면 아무것도 쓰지 않는다)
if [ ! -s "$FINDINGS_FILE" ]; then
  echo "✅ 감시 결과: 액션 필요 없음"
  echo "   (SSR 무결성 · write 활성도 · fallback 비율 · 스케줄 워크플로 · CF 차단 · 정정 이력 · 모집 사이클 · 의존성 전부 정상)"
  exit 0
fi

CRIT=$(grep -c '^🔴' "$FINDINGS_FILE" || true)
WARN=$(grep -c '^🟡' "$FINDINGS_FILE" || true)
INFO=$(grep -c '^⚪' "$FINDINGS_FILE" || true)

echo "▸ 발견 사항 — 🔴 ${CRIT}건 · 🟡 ${WARN}건 · ⚪ ${INFO}건"
echo ""

# ── 등급별 사람용 출력 ──
for grade in "🔴" "🟡" "⚪"; do
  rows=$(grep "^${grade}" "$FINDINGS_FILE" || true)
  [ -z "$rows" ] && continue
  case "$grade" in
    "🔴") echo "  【즉시 액션】" ;;
    "🟡") echo "  【확인 필요】" ;;
    "⚪") echo "  【참고】" ;;
  esac
  while IFS='|' read -r g item reason; do
    [ -z "${item:-}" ] && continue
    echo "   ${g} ${item} — ${reason}"
  done <<< "$rows"
  echo ""
done

# ⚪만 있으면 이슈를 만들지 않는다 (참고 등급은 알림 가치가 없다)
if [ "$CRIT" -eq 0 ] && [ "$WARN" -eq 0 ]; then
  echo "▸ ⚪ 참고 항목만 있어요. 이슈는 만들지 않아요."
  exit 0
fi

# ── 이슈 본문 테이블 ──
ISSUE_ROWS=""
while IFS='|' read -r g item reason; do
  [ -z "${item:-}" ] && continue
  ISSUE_ROWS="${ISSUE_ROWS}| ${g} | ${item} | ${reason} |\n"
done < "$FINDINGS_FILE"

if [ "$CI_MODE" = true ] && command -v gh &> /dev/null; then
  # 열린 watchman 이슈가 있으면 새로 만들지 않는다.
  # (미해결 항목이 있는 동안 매일 이슈가 새로 쌓이는 것을 막는다 — data-freshness.yml 검증된 패턴)
  OPEN_COUNT=$(gh issue list --label "watchman" --state open --json number --jq length 2>/dev/null || echo "0")

  if [ "$OPEN_COUNT" != "0" ]; then
    echo "ℹ️  열린 watchman 이슈가 이미 ${OPEN_COUNT}건 있어요. 새 이슈를 만들지 않아요."
    echo "    (미해결 항목 정리 후 이슈를 닫으면 다음 실행에서 새로 보고해요)"
  else
    TITLE_PREFIX="🛡️ watchman 감시 이상"
    [ "$CRIT" -gt 0 ] && TITLE_PREFIX="🛡️ watchman 감시 이상 🔴"
    BODY="## watchman 감시 결과

**점검일시:** $(date -u '+%Y-%m-%d %H:%M UTC')
**결과:** 🔴 즉시 액션 ${CRIT}건 · 🟡 확인 필요 ${WARN}건 · ⚪ 참고 ${INFO}건

| 등급 | 항목 | 근거 |
|------|------|------|
$(echo -e "$ISSUE_ROWS")

### 이 이슈는 왜 자동으로 생겼나

기존에 이 항목들은 reminder-watchman이 **화·금 세션에서 수동 실행**하는 구조였어요.
8/4 www 인증서 갱신 실패가 세션 부재로 **13일간 방치**된 사고 이후, 실행 주체를
사람 세션에서 스케줄 워크플로로 옮겼어요. 세션이 없어도 감시가 돌아요.

### 조치 방법

- [ ] 위 표의 🔴 항목 우선 처리
- [ ] 🟡 항목은 근거 데이터 확인 후 조치 또는 임계 조정 판단
- [ ] 처리 후 **이 이슈를 닫아 주세요** — 열려 있는 동안은 중복 이슈를 만들지 않아요

### 등급 기준

| 등급 | 의미 |
|------|------|
| 🔴 | 즉시 액션 — 라이브 영향 또는 데이터 무결성 위험 |
| 🟡 | 확인 필요 — 근거 확인 후 판단 |
| ⚪ | 참고 — 추세 관찰만 |

### 참고

- 검사 스크립트: \`scripts/watchman/check-*.sh|ts\`
- 워크플로: \`.github/workflows/watchman-ci.yml\`
- 항목 정의: \`.claude/agents/reminder-watchman.md\`
- 러너는 미국 리전이라 Cloudflare KR 외 차단으로 403·503이 정상 범위예요.
  라이브 페이지 검사는 e2e 우회 경로(UA + secret 헤더)를 써요.

> 🤖 이 Issue는 GitHub Actions(watchman-ci)에 의해 자동 생성되었어요."

    gh issue create \
      --title "${TITLE_PREFIX} — $(date -u '+%Y-%m-%d')" \
      --body "$BODY" \
      --label "watchman" \
      --assignee "KangseonLEE" \
      2>/dev/null && echo "✅ GitHub Issue를 만들었어요." || echo "⚠️  Issue 생성 실패 (label 없음 또는 권한 부족)"
  fi
fi

echo ""
echo "───────────────────────────────────────────"
echo "  발견 ${CRIT}🔴 / ${WARN}🟡 / ${INFO}⚪"
echo "───────────────────────────────────────────"

# 🔴만 exit 1 — 🟡·⚪는 알림만 (cert-expiry.sh와 동일 원칙)
if [ "$CRIT" -gt 0 ]; then
  exit 1
fi
exit 0
