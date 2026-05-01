#!/bin/bash
# 이랑 프로젝트 세션 종료 시 진행 상태 덤프
# 위치: ~/.claude/projects/-Users-igangseon-Workspace-irang/session-logs/session_YYYY-MM-DD_HHMM.md

set -e

LOG_DIR="$HOME/.claude/projects/-Users-igangseon-Workspace-irang/session-logs"
mkdir -p "$LOG_DIR"

TS=$(date +%Y-%m-%d_%H%M)
LOG_FILE="$LOG_DIR/session_${TS}.md"

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

{
  echo "---"
  echo "session_end: $(date -Iseconds)"
  echo "branch: $(git branch --show-current 2>/dev/null)"
  echo "---"
  echo ""
  echo "# Session Log — $(date '+%Y-%m-%d %H:%M')"
  echo ""
  echo "## 최근 커밋 (20건)"
  echo '```'
  git log --oneline -20 2>/dev/null
  echo '```'
  echo ""
  echo "## Git Status"
  echo '```'
  git status --short 2>/dev/null
  echo '```'
  echo ""
  echo "## Uncommitted Files"
  git status --porcelain 2>/dev/null | awk '{print "- `" $2 "` (" $1 ")"}'
} > "$LOG_FILE"

# 오래된 로그 30개 이상 시 정리 (최근 30개만 유지)
ls -t "$LOG_DIR"/session_*.md 2>/dev/null | tail -n +31 | xargs -I {} rm -f {} 2>/dev/null || true

exit 0
