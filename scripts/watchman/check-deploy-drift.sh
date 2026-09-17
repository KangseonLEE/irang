#!/bin/bash
# ═══════════════════════════════════════════
# 푸시 ↔ 배포 불일치 감시 (watchman §16)
# 사용: bash scripts/watchman/check-deploy-drift.sh          (로컬)
# CI:   bash scripts/watchman/check-deploy-drift.sh --ci     (GitHub Actions)
#
# 배경: 2026-09-16 보안 수정 커밋(782e311)이 푸시·CI·E2E 를 전부 통과하고도
#       Vercel 웹훅 유실로 **13시간 동안 배포되지 않았다**. 더 나쁜 건 그동안
#       CI 가 초록이었다는 것 — E2E 는 라이브(옛 빌드)를 검증하고 통과했다.
#       "커밋했다"와 "라이브에 있다" 사이에 감시가 하나도 없었다.
#
# 판정: origin/main 최신 커밋에 대응하는 배포가 있는가.
#   - 배포 있음 + success            → ✓
#   - 배포 있음 + failure/error      → 🔴 (빌드 깨짐)
#   - 배포 없음 + 커밋 30분 미만     → ✓ (배포 진행 중일 수 있음)
#   - 배포 없음 + 30분~6시간         → 🟡
#   - 배포 없음 + 6시간 초과         → 🔴 (웹훅 유실·연동 끊김)
#
# GitHub deployments API 를 쓰는 이유: 웹훅이 유실되면 **기록 자체가 안 생긴다** —
# 바로 그 부재가 우리가 잡으려는 신호다. Vercel 토큰 없이도 돈다.
# ═══════════════════════════════════════════

set -uo pipefail

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

REPO="KangseonLEE/irang"
WARN_AFTER_MIN=30
CRIT_AFTER_MIN=360

CRIT=0
WARN=0
report() {
  local grade="$1" item="$2" reason="$3"
  if [ -n "${WATCHMAN_FINDINGS:-}" ]; then
    printf '%s\n' "${grade}|${item}|${reason}" >> "$WATCHMAN_FINDINGS"
  fi
  if [ "$grade" = "🔴" ]; then CRIT=$((CRIT + 1)); elif [ "$grade" = "🟡" ]; then WARN=$((WARN + 1)); fi
}

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — 푸시 ↔ 배포 불일치 감시 (§16)"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC') | 모드: $([ "$CI_MODE" = true ] && echo 'CI' || echo '로컬')"
echo "═══════════════════════════════════════════"
echo ""

if ! command -v gh &> /dev/null; then
  echo "✗ gh CLI가 없어요. 점검을 건너뛰어요."
  echo "대상 0개 | 위험 0 | 경고 0"
  exit 0
fi
if [ -z "${GH_TOKEN:-}" ] && ! gh auth status &> /dev/null; then
  echo "✗ gh 인증이 안 돼 있어요. 점검을 건너뛰어요."
  echo "대상 0개 | 위험 0 | 경고 0"
  exit 0
fi

# origin/main 최신 커밋 — CI 체크아웃은 main tip 이지만, 로컬에서 돌 때를 위해 원격을 직접 본다
HEAD_SHA=$(gh api "repos/${REPO}/commits/main" --jq '.sha' 2>/dev/null)
HEAD_DATE=$(gh api "repos/${REPO}/commits/main" --jq '.commit.committer.date' 2>/dev/null)
if [ -z "$HEAD_SHA" ]; then
  echo "✗ origin/main 조회 실패 — 판정 불가로 건너뛰어요."
  echo "대상 0개 | 위험 0 | 경고 0"
  exit 0
fi
SHORT="${HEAD_SHA:0:7}"

NOW_EPOCH=$(date -u +%s)
# ISO8601 Z → epoch. GNU(-d)는 Z를 UTC로 읽지만 BSD(-j -f)는 **로컬 시각으로 읽어**
# KST에선 9시간(540분) 어긋난다 — 등급을 좌우하는 값이라 BSD 경로에 -u를 명시한다.
HEAD_EPOCH=$(date -u -d "$HEAD_DATE" +%s 2>/dev/null \
  || date -j -u -f "%Y-%m-%dT%H:%M:%SZ" "$HEAD_DATE" +%s 2>/dev/null \
  || echo 0)
if [ "$HEAD_EPOCH" -eq 0 ]; then
  echo "✗ 커밋 시각 파싱 실패 — 판정 불가로 건너뛰어요."
  echo "대상 0개 | 위험 0 | 경고 0"
  exit 0
fi
AGE_MIN=$(( (NOW_EPOCH - HEAD_EPOCH) / 60 ))

echo "  origin/main  ${SHORT} (${AGE_MIN}분 전)"

# 해당 커밋의 배포 기록
DEP_ID=$(gh api "repos/${REPO}/deployments?sha=${HEAD_SHA}" --jq '.[0].id // empty' 2>/dev/null)

if [ -n "$DEP_ID" ]; then
  STATE=$(gh api "repos/${REPO}/deployments/${DEP_ID}/statuses" --jq '.[0].state // "pending"' 2>/dev/null)
  echo "  배포 기록    있음 (id ${DEP_ID}, 상태 ${STATE})"
  case "$STATE" in
    success)
      echo "  ✓ 최신 커밋이 배포됨"
      ;;
    failure|error)
      echo "  ✗ 배포 실패 상태"
      report "🔴" "§16 배포 불일치" "최신 커밋 ${SHORT} 배포가 ${STATE} — 라이브는 이전 버전"
      ;;
    *)
      # pending/in_progress 는 오래 머물면 이상
      if [ "$AGE_MIN" -gt "$CRIT_AFTER_MIN" ]; then
        report "🔴" "§16 배포 불일치" "최신 커밋 ${SHORT} 배포가 ${AGE_MIN}분째 ${STATE} 상태"
      elif [ "$AGE_MIN" -gt "$WARN_AFTER_MIN" ]; then
        report "🟡" "§16 배포 불일치" "최신 커밋 ${SHORT} 배포가 ${AGE_MIN}분째 ${STATE} 상태"
      else
        echo "  ✓ 배포 진행 중 (${AGE_MIN}분)"
      fi
      ;;
  esac
else
  echo "  배포 기록    없음"
  if [ "$AGE_MIN" -gt "$CRIT_AFTER_MIN" ]; then
    echo "  ✗ ${AGE_MIN}분째 배포 기록 없음"
    report "🔴" "§16 배포 불일치" "최신 커밋 ${SHORT} 이 ${AGE_MIN}분째 배포되지 않음 — Vercel 웹훅 유실 의심(9/16 782e311 13시간 사례). 복구: vercel --prod 수동 배포 후 Git 연동 확인"
  elif [ "$AGE_MIN" -gt "$WARN_AFTER_MIN" ]; then
    echo "  ⚠ ${AGE_MIN}분째 배포 기록 없음"
    report "🟡" "§16 배포 불일치" "최신 커밋 ${SHORT} 이 ${AGE_MIN}분째 배포되지 않음 — 웹훅 지연인지 유실인지 확인 필요"
  else
    echo "  ✓ 아직 배포 대기 시간 안 (${AGE_MIN}분 < ${WARN_AFTER_MIN}분)"
  fi
fi

echo ""
echo "───────────────────────────────────────────"
echo "  대상 1개 | 위험 ${CRIT} | 경고 ${WARN}"
echo "───────────────────────────────────────────"
echo ""

if [ "$CRIT" -gt 0 ]; then
  echo "▸ 위험 ${CRIT}건 발견 — \$WATCHMAN_FINDINGS 참고"
  exit 1
elif [ "$WARN" -gt 0 ]; then
  echo "▸ 경고 ${WARN}건 발견 — \$WATCHMAN_FINDINGS 참고"
else
  echo "▸ 최신 커밋이 라이브에 반영돼 있어요."
fi
exit 0
