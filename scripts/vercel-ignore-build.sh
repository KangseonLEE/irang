#!/bin/sh
# Vercel "Ignored Build Step" (vercel.json ignoreCommand) — exit 0 = 빌드 생략, 그 외 = 빌드.
#
# 1) 같은 커밋 재배포(직전 배포 SHA = 지금 SHA)는 빌드한다. DB 큐레이션 행을 SQL 로 고친 뒤
#    대시보드 Redeploy 로 상세(빌드 때 만든 HTML)를 다시 만드는 경로다 — 10/7 이게 막혀
#    SP-011 상세가 SQL 적용 뒤에도 예전 값으로 남았다.
# 2) 직전 배포 이후 문서·CI·스크립트만 바뀌었으면 생략한다(9/17 Hobby 한도, 10/4 여러 커밋 푸시).
# 3) git 정보가 없거나(CLI 배포) 비교할 커밋을 못 찾으면 빌드한다 — 판정 실패는 언제나 빌드 쪽.
#
# 명령을 vercel.json 에 한 줄로 늘리면 설정 검사에서 막힌다(10/7: 221자 정상 → 322자 미리보기 Error).
# 생략 경로 목록은 scripts/watchman/check-deploy-drift.sh 와 같아야 한다.

head_sha=$(git rev-parse --verify --quiet "HEAD^{commit}") || exit 1
prev_sha=$(git rev-parse --verify --quiet "${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}^{commit}") || exit 1
[ "$prev_sha" = "$head_sha" ] && exit 1

git diff --quiet "$prev_sha" "$head_sha" -- . \
  ':(exclude)CLAUDE.md' ':(exclude)docs/' ':(exclude)worklog/' ':(exclude)*.md' \
  ':(exclude).github/' ':(exclude)scripts/'
