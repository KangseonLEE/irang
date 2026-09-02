#!/bin/bash
# ═══════════════════════════════════════════
# cron/스케줄 워크플로 실패 감시 (watchman §15 CI 이관)
# 사용: bash scripts/watchman/check-schedule-health.sh          (로컬)
# CI:   bash scripts/watchman/check-schedule-health.sh --ci     (GitHub Actions)
#
# 배경: GitHub Actions 스케줄(cron) 워크플로는 실패해도 별도 알림이 없어
#       조용히 stale 데이터·깨진 링크·API 장애를 방치할 수 있다. push 트리거
#       CI와 달리 회장 화면 어디에도 뜨지 않는 사각지대(실제 2026-07-26
#       check-links schedule 실행 failure 발생). 이 스크립트는
#       .claude/agents/reminder-watchman.md §15(364~406행)의 수동 점검을
#       CI로 이관한 것 — 대상·판정 기준·false positive 방지 원칙은 그 문서를 따른다.
#
# 대상 8종: sync-data · api-health · check-links · check-policy ·
#           data-freshness · ip-list-sync · cert-expiry · watchman-ci(자기 자신)
#   watchman-ci를 포함하는 이유 — 이 점검 자체가 스케줄로 도는 aggregator라,
#   자기 자신이 크래시(워크플로 setup 실패 등)해도 다음 실행이 직전 실패를
#   잡아내는 자기치유 구조가 되어야 한다.
# ═══════════════════════════════════════════

set -uo pipefail

CI_MODE=false
if [[ "${1:-}" == "--ci" ]]; then
  CI_MODE=true
fi

# ── 점검 대상 워크플로 (파일명, .yml 제외) ──
WORKFLOWS=("sync-data" "api-health" "check-links" "check-policy" "data-freshness" "ip-list-sync" "cert-expiry" "watchman-ci")

# sync-data는 실패 1회만으로도 즉시 🔴 (데이터 동기화 중단 = 라이브 stale 직결)
IMMEDIATE_CRIT_WORKFLOW="sync-data"

# 30일보다 오래된 실행은 무효 (연 1회류 리마인더성 워크플로 대비 §15-5)
STALE_DAYS=30
NOW_EPOCH=$(date -u +%s)

echo ""
echo "═══════════════════════════════════════════"
echo "  이랑 — cron/스케줄 워크플로 실패 감시 (§15)"
echo "  $(date -u '+%Y-%m-%d %H:%M UTC') | 모드: $([ "$CI_MODE" = true ] && echo 'CI' || echo '로컬')"
echo "═══════════════════════════════════════════"
echo ""

# WATCHMAN_FINDINGS 미설정이면 append를 건너뛰고 stdout만 (로컬 실행 대응)
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

# ── gh 인증 확인 ──
# CI에서는 GH_TOKEN 환경변수로 gh CLI가 자동 인증된다. 미인증이면 조회 자체가
# 불가능하므로 이상 판정 없이 skip(exit 0) — 이 스크립트의 목적은 워크플로
# 상태 감시이지 인증 상태 감시가 아니다.
if ! command -v gh &> /dev/null; then
  echo "✗ gh CLI가 없어요. 점검을 건너뛰어요."
  echo "대상 0개 | 위험 0 | 경고 0"
  exit 0
fi
if [ -z "${GH_TOKEN:-}" ] && ! gh auth status &> /dev/null; then
  echo "✗ gh 인증이 안 돼 있어요 (GH_TOKEN 미설정). 점검을 건너뛰어요."
  echo "대상 0개 | 위험 0 | 경고 0"
  exit 0
fi

TARGETS=0

for wf in "${WORKFLOWS[@]}"; do
  TARGETS=$((TARGETS + 1))
  label="${wf}.yml"

  # 최근 스케줄(event=schedule) 실행 3건, 최신순. 워크플로 파일이 없거나
  # 실행 이력이 없으면 gh가 에러/빈 배열을 반환 — 둘 다 "신설 직후"로 보고
  # 🔴 내지 않는다 (§15-5).
  raw=$(gh run list --workflow="${wf}.yml" --event=schedule --limit 3 \
    --json conclusion,createdAt --jq '.[] | "\(.conclusion)\t\(.createdAt)"' 2>/dev/null)

  if [ -z "$raw" ]; then
    echo "  ⚪ ${label} | 실행 이력 없음 (신설 직후 또는 워크플로 미존재) — 판정 skip"
    continue
  fi

  # createdAt 30일 이내인 건만 유효 처리 + conclusion=failure/success만 시퀀스에 포함
  # (cancelled·skipped는 실패로 집계하지 않음 — §15-5)
  filtered=()
  while IFS=$'\t' read -r conclusion created_at; do
    [ -z "$conclusion" ] && continue
    epoch=$(date -d "$created_at" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2>/dev/null || echo 0)
    age_days=$(( (NOW_EPOCH - epoch) / 86400 ))
    if [ "$epoch" -eq 0 ] || [ "$age_days" -gt "$STALE_DAYS" ]; then
      continue
    fi
    if [ "$conclusion" = "failure" ] || [ "$conclusion" = "success" ]; then
      filtered+=("${conclusion}|${created_at}")
    fi
  done <<< "$raw"

  if [ ${#filtered[@]} -eq 0 ]; then
    echo "  ⚪ ${label} | 유효 실행 이력 없음 (30일 이내 없음) — 판정 skip"
    continue
  fi

  latest_conclusion="${filtered[0]%%|*}"
  latest_date="${filtered[0]#*|}"
  summary=$(printf '%s ' "${filtered[@]%%|*}")
  echo "  ${label} | 최근 3건: ${summary}"

  # ── watchman-ci 자기 참조 보정 (9/2) ──
  # watchman-ci는 🔴 finding이 있으면 설계상 exit 1(failure)이다. 열린 watchman 이슈가 있으면
  # 그 failure는 이미 이슈로 표면화된 신호이므로 §15가 다시 🟡/🔴로 증폭하지 않는다.
  # 열린 이슈가 없는데 failure면 이슈 발행조차 못 한 크래시 → 자기치유 목적대로 계속 판정.
  if [ "$wf" = "watchman-ci" ] && [ "$latest_conclusion" = "failure" ]; then
    open_watchman=$(gh issue list --label watchman --state open --limit 1 --json number --jq 'length' 2>/dev/null || echo 0)
    if [ "${open_watchman:-0}" -gt 0 ]; then
      echo "  ⚪ ${label} | failure는 🔴 finding 설계 동작(열린 watchman 이슈 존재) — 자기 참조 skip"
      continue
    fi
  fi

  # ── sync-data: 최근(30일 이내) 실행 중 failure 1건이라도 있으면 즉시 🔴 ──
  if [ "$wf" = "$IMMEDIATE_CRIT_WORKFLOW" ]; then
    has_failure=false
    for entry in "${filtered[@]}"; do
      if [ "${entry%%|*}" = "failure" ]; then
        has_failure=true
        fail_date="${entry#*|}"
        break
      fi
    done
    if [ "$has_failure" = true ]; then
      echo "  ✗ ${label} | failure 발견 (${fail_date}) — 즉시 위험"
      report "🔴" "§15 스케줄 워크플로" "${label} 최근 스케줄 실행 failure (${fail_date}) — 데이터 동기화 중단 의심, 라이브 stale 직결"
    fi
    continue
  fi

  # ── 그 외 워크플로: 최신부터 연속 failure 카운트 ──
  consec=0
  for entry in "${filtered[@]}"; do
    if [ "${entry%%|*}" = "failure" ]; then
      consec=$((consec + 1))
    else
      break
    fi
  done

  if [ "$consec" -ge 3 ]; then
    echo "  ✗ ${label} | 연속 failure ${consec}회 — 위험"
    report "🔴" "§15 스케줄 워크플로" "${label} 연속 failure ${consec}회 (최근: ${latest_date})"
  elif [ "$consec" -eq 2 ]; then
    echo "  ⚠ ${label} | 연속 failure ${consec}회 — 경고"
    report "🟡" "§15 스케줄 워크플로" "${label} 연속 failure ${consec}회 (최근: ${latest_date})"
  else
    echo "  ✓ ${label} | 정상 (최근: ${latest_conclusion})"
  fi
done

echo ""
echo "───────────────────────────────────────────"
echo "  대상 ${TARGETS}개 | 위험 ${CRIT} | 경고 ${WARN}"
echo "───────────────────────────────────────────"

if [ $CRIT -eq 0 ] && [ $WARN -eq 0 ]; then
  echo ""
  echo "▸ 모든 스케줄 워크플로가 정상이에요."
  exit 0
fi

echo ""
if [ $CRIT -gt 0 ]; then
  echo "▸ 위험 ${CRIT}건 발견 — \$WATCHMAN_FINDINGS 참고"
  exit 1
fi

echo "▸ 경고 ${WARN}건 발견 — \$WATCHMAN_FINDINGS 참고"
exit 0
