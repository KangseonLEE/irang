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
WORKFLOWS=("sync-data" "api-health" "check-links" "check-policy" "data-freshness" "ip-list-sync" "cert-expiry" "watchman-ci" "community-pending" "ga4-snapshot")

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
    --json conclusion,createdAt,databaseId --jq '.[] | "\(.conclusion)\t\(.createdAt)\t\(.databaseId)"' 2>/dev/null)

  if [ -z "$raw" ]; then
    echo "  ⚪ ${label} | 실행 이력 없음 (신설 직후 또는 워크플로 미존재) — 판정 skip"
    continue
  fi

  # createdAt 30일 이내인 건만 유효 처리 + conclusion=failure/success만 시퀀스에 포함
  # (cancelled·skipped는 실패로 집계하지 않음 — §15-5)
  filtered=()
  while IFS=$'\t' read -r conclusion created_at run_id; do
    [ -z "$conclusion" ] && continue
    epoch=$(date -d "$created_at" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%SZ" "$created_at" +%s 2>/dev/null || echo 0)
    age_days=$(( (NOW_EPOCH - epoch) / 86400 ))
    if [ "$epoch" -eq 0 ] || [ "$age_days" -gt "$STALE_DAYS" ]; then
      continue
    fi
    if [ "$conclusion" = "failure" ] || [ "$conclusion" = "success" ]; then
      filtered+=("${conclusion}|${created_at}|${run_id}")
    fi
  done <<< "$raw"

  if [ ${#filtered[@]} -eq 0 ]; then
    echo "  ⚪ ${label} | 유효 실행 이력 없음 (30일 이내 없음) — 판정 skip"
    continue
  fi

  latest_conclusion="${filtered[0]%%|*}"
  latest_rest="${filtered[0]#*|}"
  latest_date="${latest_rest%%|*}"
  summary=$(printf '%s ' "${filtered[@]%%|*}")
  echo "  ${label} | 최근 3건: ${summary}"

  # ── watchman-ci 자기 참조 보정 (9/2 → 9/3 → 9/16 3차) ──
  #
  # watchman-ci 는 🔴 finding 이 있으면 **설계상** 마지막 "취합 + 이슈 발행" 스텝에서 exit 1 한다.
  # 이 정상 동작을 §15 가 다시 "워크플로 실패"로 증폭하면 안 된다.
  #
  # 앞선 두 번의 보정은 모두 **이슈의 존재/시각**에 판정을 묶었다가 진동했다:
  #   9/2 "열린 이슈가 있으면 skip"  → 이슈를 닫는 순간 직전 failure 가 🔴 → 새 이슈 → … 자기 영속 루프(#122)
  #   9/3 "직후 30분 내 이슈 생성"    → 열린 이슈가 있어 발행이 생략된 기간의 failure 를 크래시로 오판(9/16 실측)
  #
  # 이슈는 다른 규칙(열린 이슈면 발행 생략)에 좌우되는 부산물이라 판정 기준이 될 수 없다.
  # **실행 자체의 사실**에 묶는다 — 설계된 실패는 마지막 취합 스텝 하나만 failure 이고
  # 앞선 검사 스텝은 전부 success 다. setup·의존성·검사 스크립트 크래시는 더 앞 스텝에서 죽으므로
  # 그대로 판정 대상으로 남는다.
  if [ "$wf" = "watchman-ci" ]; then
    rewritten=()
    for entry in "${filtered[@]}"; do
      conclusion="${entry%%|*}"
      rest="${entry#*|}"; created="${rest%%|*}"; rid="${rest#*|}"
      if [ "$conclusion" = "failure" ] && [ -n "$rid" ]; then
        failed_steps=$(gh run view "$rid" --json jobs \
          --jq '[.jobs[].steps[] | select(.conclusion=="failure") | .name] | join("¦")' 2>/dev/null)
        # 실패 스텝이 취합 스텝 하나뿐이면 설계 동작
        if [ -n "$failed_steps" ] && [[ "$failed_steps" != *"¦"* ]] && [[ "$failed_steps" == *"취합"* ]]; then
          conclusion="designed"
        fi
      fi
      rewritten+=("${conclusion}|${created}|${rid}")
    done
    filtered=("${rewritten[@]}")
    latest_conclusion="${filtered[0]%%|*}"
    if [ "$latest_conclusion" = "designed" ]; then
      echo "  ⚪ ${label} | failure는 🔴 finding 설계 동작(취합 스텝만 실패) — 자기 참조 skip"
      continue
    fi
  fi

  # ── sync-data: 최신 실행이 failure면 즉시 🔴 (9/16 보정) ──
  #
  # 이전 규칙은 "최근 3건 중 failure 1건이라도" 였다. 하루 1회 cron 이라 일시 실패
  # 1회가 **3일간 🔴** 을 만들고, 그 사이 이슈가 열려 있으면 다른 finding 이 전부
  # 묻힌다(8/29 박제). 9/13 Gateway Timeout 1회가 9/14·9/15 성공 뒤에도 🔴 로 남아
  # "최근 스케줄 실행 failure" 라는 사실과 다른 문구를 냈던 것이 실례.
  #
  # 판정은 **최신 실행**으로. 복구되면 조용해지고 계속 실패면 계속 🔴 — 감시 목적은 그대로다.
  # 성공/실패를 오가는 플래핑(최근 3건 중 2건+ failure)만 🟡 로 남겨 추세를 놓치지 않는다.
  if [ "$wf" = "$IMMEDIATE_CRIT_WORKFLOW" ]; then
    if [ "$latest_conclusion" = "failure" ]; then
      echo "  ✗ ${label} | 최신 실행 failure (${latest_date}) — 즉시 위험"
      report "🔴" "§15 스케줄 워크플로" "${label} 최신 스케줄 실행 failure (${latest_date}) — 데이터 동기화 중단, 라이브 stale 직결"
      continue
    fi

    fail_total=0
    for entry in "${filtered[@]}"; do
      [ "${entry%%|*}" = "failure" ] && fail_total=$((fail_total + 1))
    done
    if [ "$fail_total" -ge 2 ]; then
      echo "  ⚠ ${label} | 최신은 성공이나 최근 3건 중 ${fail_total}건 failure — 플래핑"
      report "🟡" "§15 스케줄 워크플로" "${label} 최신 실행은 성공이나 최근 3건 중 ${fail_total}건 failure — 간헐 실패 추세 확인 필요"
    else
      echo "  ✓ ${label} | 최신 실행 성공 (${latest_date})"
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
