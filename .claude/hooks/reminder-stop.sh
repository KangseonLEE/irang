#!/usr/bin/env bash
# reminder-stop.sh — Stop hook for 이랑 코드 리포 reminder-watchman sweep
# Runs at session end. Writes flag file if attention is needed.
# Always exits 0 to never block session termination.

set -u
set +e

WORKSPACE="${CLAUDE_PROJECT_DIR:-$HOME/Workspace/irang}"
FLAG_FILE="$WORKSPACE/.reminder-flag.md"

# ── 1. Condition gates ──────────────────────

DOW=$(date +%u)
HOUR=$(date +%H)

# Skip weekends
[ "$DOW" -ge 6 ] && exit 0

# Skip before 17:00
[ "$HOUR" -lt 17 ] && exit 0

# Skip if no git repo (safety)
[ ! -d "$WORKSPACE/.git" ] && exit 0

# ── 2. Health checks ──────────────────────

cd "$WORKSPACE" 2>/dev/null || exit 0

# Uncommit changes count
UNCOMMIT=$(git status --short 2>/dev/null | grep -v "^??" | wc -l | tr -d ' ')
UNTRACKED=$(git status --short 2>/dev/null | grep "^??" | wc -l | tr -d ' ')

# Unpushed commits count
UNPUSHED=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')

# Oldest uncommit file age (days)
OLDEST_UNCOMMIT_DAYS=0
if [ "$UNCOMMIT" -gt 0 ]; then
  OLDEST_FILE=$(git status --short 2>/dev/null | grep -v "^??" | awk '{print $NF}' | while read f; do
    [ -f "$f" ] && echo "$(stat -f %m "$f" 2>/dev/null || stat -c %Y "$f" 2>/dev/null) $f"
  done | sort -n | head -1 | awk '{print $1}')
  if [ -n "$OLDEST_FILE" ]; then
    NOW=$(date +%s)
    OLDEST_UNCOMMIT_DAYS=$(( (NOW - OLDEST_FILE) / 86400 ))
  fi
fi

# Environment var sanity (existence check only, no values)
ENV_MISSING=0
if [ -f "$WORKSPACE/.env.local" ]; then
  for key in DATA_GO_KR_API_KEY KOSIS_API_KEY NAVER_CLIENT_ID NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SENTRY_DSN; do
    grep -q "^${key}=" "$WORKSPACE/.env.local" || ENV_MISSING=$((ENV_MISSING + 1))
  done
else
  ENV_MISSING=5  # no .env.local at all
fi

# (Kill Criteria 날짜 계산 블록은 2026-08-18 제거 — Sprint1 판정 종료. 함께 있던
#  `$(( ... (-n "$VAR" ? 1 : 0) ))` 잘못된 산술식도 같이 사라짐.)

# ── 3. Write flag only if notable ──────────────────────

TOTAL=$((UNCOMMIT > 0 && OLDEST_UNCOMMIT_DAYS >= 3 ? 1 : 0))
TOTAL=$((TOTAL + (UNPUSHED >= 5 ? 1 : 0)))
TOTAL=$((TOTAL + (ENV_MISSING > 0 ? 1 : 0)))

if [ "$TOTAL" -eq 0 ]; then
  [ -f "$FLAG_FILE" ] && rm -f "$FLAG_FILE"
  exit 0
fi

cat > "$FLAG_FILE" <<EOF
---
type: reminder-flag
generated: $(date +%Y-%m-%dT%H:%M:%S)
stale-after: $(date -v+1d +%Y-%m-%d 2>/dev/null || date -d '+1 day' +%Y-%m-%d 2>/dev/null)
---

# ⚠️ 이랑 Code Repo Reminder Flag — $(date +%Y-%m-%d %H:%M)

Stop hook이 세션 종료 시점에 아래 신호를 감지했습니다.
다음 세션 시작 시 Claude가 reminder-watchman 에이전트를 자동 호출합니다.

## 전처리 수치 (근사치)

- Uncommit 변경: **${UNCOMMIT}건** (untracked ${UNTRACKED}건 별도), 가장 오래: **D+${OLDEST_UNCOMMIT_DAYS}일**
- Unpushed 커밋: **${UNPUSHED}건**
- 환경변수 누락 (필수 5종 중): **${ENV_MISSING}건**

> 정확한 영업일·게이트 검증은 reminder-watchman 에이전트가 수행합니다.

## 자동 액션

다음 세션 시작 시 이 파일이 감지되어 reminder-watchman이 자동 호출됩니다.
정상이라 판단되면 이 파일을 삭제하거나 무시해도 됩니다.
EOF

exit 0
