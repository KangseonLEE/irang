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
EVENTS_FILE="$PROJECT_DIR/src/lib/data/events.ts"
CENTERS_FILE="$PROJECT_DIR/src/lib/data/centers.ts"

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
SKIPPED=0
RESULTS=""
ISSUE_BODY=""
TIMEOUT_RESULTS=""
TIMEOUT_BODY=""

# 브라우저 UA — 한국 뉴스/공공기관 사이트가 curl 기본 UA를 봇으로 차단하는 경우 대응
# (CLAUDE.md "한국 뉴스 사이트 주의" 항목 참고)
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# 단일 URL fetch — 한 번 시도, status code만 반환
# Note: curl이 부분 출력 + exit-non-zero를 동시에 낼 수 있어 결과 마지막 3자리만 사용
fetch_status() {
  local url="$1"
  local max_time="${2:-30}"
  local raw
  # NOTE 2026-05-26: Connection: close 헤더가 일부 한국 정부 사이트
  # (youth.chungnam.go.kr 등)에서 즉시 끊김(code=000)을 유발 — 헤더 제거.
  # check-policy-sources.ts와 헤더 셋 통일.
  raw=$(curl -o /dev/null -s -w "%{http_code}" --max-time "$max_time" -L \
    -A "$UA" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -H "Accept-Language: ko-KR,ko;q=0.9,en;q=0.8" \
    -H "Accept-Encoding: gzip, deflate, br" \
    --compressed \
    "$url" 2>/dev/null)
  # 빈 값 또는 잘못된 출력 → "000"
  if [ -z "$raw" ]; then
    echo "000"
  else
    # 마지막 3자리만 추출 (curl 부분 출력 누적 대응)
    echo "${raw: -3}"
  fi
}

# ── 지역 차단 URL (2026-08-30 호스트 단위 → 2026-10-06 정확한 URL 단위) ──
# GitHub Actions 러너(미국)에서는 4xx/5xx가 나지만 한국에서는 200인 것이 **한국 실측으로 확인된 정확한 URL** 만
# 실패(FAIL)가 아니라 GEO 경고로 집계한다.
# 10/6 URL 단위로 좁힌 이유: 호스트 단위(cs.go.kr)일 때 청송군 농업기술센터 /atec/index.do 가 한국에서도
#   378B 웹방화벽 차단 페이지(경로 소멸)였는데, SP-052 때문에 등록한 같은 호스트라 매일 "GEO 경고"로 묻혔다
#   (run 37410465252). 이제 같은 호스트라도 목록에 없는 URL(새로 넣거나 바뀐 주소)은 한국 실측 전까지 실패로 본다.
# 등록 규칙: 한국 회선 curl GET 200 + 정상 제목 + 본문 키워드 확인 후 **정확한 URL** 을 그대로 추가. 추측 등록 금지.
#   데이터의 URL 을 바꾸면 옛 줄은 지우고 새 URL 을 다시 확인해 넣는다. 한 줄 = "URL 메모"(첫 칸만 비교).
# 이력: 8/30 #118 goryeong 404·fbo 502 / 10/1 cs.go.kr SP-052 404·geochang SP-053 403 / 10/3 gc.go.kr 김천시청 404(#158)
#   — 모두 한국 200. 아래 13건은 10/6 한국 전수 점검(QA 링크 점검 + data-engineer 재확인)에서 200·제목·본문 확인.
# 목록은 따옴표 없는 히어독(read -d '')으로 둔다 — 10/7 메모의 "영양군청 | 대한민국 별천지 영양" 같은 큰따옴표가
#   큰따옴표 문자열을 끊어 목록이 통째로 빈 값이 되고(set -e 라 스크립트가 시작하자마자 멈춤) 한 번도 실행 전에
#   발견됐다(10/8). \$( ) 안 히어독은 macOS bash 3.2 가 메모의 괄호에 걸려 뒤쪽 case 구문까지 깨므로 쓰지 않는다.
#   메모에는 무엇을 써도 되지만 첫 칸(URL)만 비교한다. src/__tests__/check-links-geo-list.test.ts 가 파싱을 검사한다
IFS= read -r -d '' GEO_WARN_URLS <<'GEO' || true
https://www.fbo.or.kr/ SP-018 농지은행 통합포털
https://www.fbo.or.kr/contents/Contents.do?menuId=0500100030 SP-050
https://www.fbo.or.kr/contents/Contents.do?menuId=0500100040 SP-051
https://www.goryeong.go.kr/kor/boardView.do?BRD_ID=1023&BOARD_IDX=41828&IDX=154 SP-038
https://www.goryeong.go.kr/ 센터 고령군청
https://www.goesan.go.kr/rfarm/selectBbsNttView.do?key=1662&bbsNo=326&nttNo=134164 SP-044
https://www.goesan.go.kr/rfarm/selectBbsNttView.do?key=1662&bbsNo=326&nttNo=134163 SP-045
https://goesan.go.kr/www/index.do 센터 괴산군청
https://www.cs.go.kr/specialty/00003170/00004055.web SP-052
https://www.cs.go.kr/agri.web 센터 청송군 농업기술센터(10/6 교체)
https://www.geochang.go.kr/00445/00450.web?gcode=1002&idx=14088774&amode=view SP-053
https://www.geochang.go.kr/ 센터 거창군청
https://www.gc.go.kr/ 센터 김천시청
https://www.yc.go.kr/ 센터 영천시청(10/7 #165 미국 404 · 한국 200 "영천시청")
https://www.yyg.go.kr/ 센터 영양군청(10/7 #165 미국 404 · 한국 200 "영양군청 | 대한민국 별천지 영양")
https://www.goseong.go.kr/ 센터 고성군청(경남, 10/7 #165 미국 400 · 한국 200 "경상남도 고성군청")
https://jung.daegu.kr/ 센터 대구 중구청(봇 방어: JS 쿠키 확인 후 새로고침 — 자동 점검은 늘 400 · 10/8 쿠키 재현 200 "대구광역시 중구청" → /new/pages/main/ "대구광역시 중구")
GEO

is_geo_url() {
  local u="$1" line
  while IFS= read -r line; do
    line="${line%%[[:space:]]*}"
    [ -n "$line" ] && [ "$u" = "$line" ] && return 0
  done <<< "$GEO_WARN_URLS"
  return 1
}

# URL 하나의 최종 상태코드 — 재시도 포함. 병렬로 돌므로 전역 변수를 건드리지 않는다.
probe_code() {
  local url="$1"
  local code
  # 시간 예산을 넘겼으면 조회하지 않는다 — job 한도에 잘려 결과가 통째로 사라지는 것보다 낫다 (10/3)
  if [ -n "${CHECK_LINKS_DEADLINE:-}" ] && [ "$(date +%s)" -ge "$CHECK_LINKS_DEADLINE" ]; then
    echo "SKIP"
    return 0
  fi
  code=$(fetch_status "$url")

  # 지역 차단 URL 이 4xx/5xx면 재시도해도 같은 결과 — 최대 ~2분 낭비를 막는다 (8/30, 15분 job timeout 원인 일부)
  if [ "$code" != "000" ] && is_geo_url "$url" && [ "$code" -ge 400 ] 2>/dev/null; then
    echo "$code"
    return 0
  fi
  # 타임아웃·연결 실패(000)는 재시도 1회만 (2026-10-03).
  # 실측: 9/23~10/3 순차 실행 8회에서 30s 타임아웃 뒤 재시도로 살아난 URL 은 **1건**, 끝까지 타임아웃인 URL 은
  # 회당 2~11건 × 131초(30+3+30+8+60)를 썼다 — 9/30·10/2 job 30분 초과 취소의 주원인. 타임아웃은 어차피 경고 집계.
  if [ "$code" = "000" ]; then
    sleep 3
    fetch_status "$url"
    return 0
  fi
  # 4xx/5xx 는 2회까지 재시도 — 일시 오류·rate limit 대응. 응답이 빨라 비용이 작다.
  # 백오프: 3s → 8s (서버 rate limit·DDoS 보호 회피)
  if [ "$code" -ge 400 ] 2>/dev/null && [ "$code" -lt 600 ] 2>/dev/null; then
    sleep 3
    code=$(fetch_status "$url")
  fi
  if [ "$code" = "000" ] || { [ "$code" -ge 400 ] 2>/dev/null && [ "$code" -lt 600 ] 2>/dev/null; }; then
    sleep 8
    code=$(fetch_status "$url" 60)
  fi
  echo "$code"
}

# 상태코드 → 정상/타임아웃/GEO/실패 집계 (순차 — 전역 카운터·본문 누적)
classify_result() {
  local id="$1"
  local url="$2"
  local source="$3"
  local code="$4"

  TOTAL=$((TOTAL + 1))

  local domain
  domain=$(echo "$url" | sed 's|https\{0,1\}://\([^/]*\).*|\1|' | sed 's/^www\.//')

  if [ "$code" = "SKIP" ]; then
    echo -e "  ${YELLOW}…${NC} 미검사(시간 예산 초과) | ${source}/${id} | ${domain}"
    SKIPPED=$((SKIPPED + 1))
    return 0
  fi

  if [ "$code" -ge 200 ] && [ "$code" -lt 400 ]; then
    echo -e "  ${GREEN}✓${NC} ${code} | ${source}/${id} | ${domain}"
    OK=$((OK + 1))
  elif [ "$code" = "000" ]; then
    echo -e "  ${YELLOW}⏱${NC} TIMEOUT | ${source}/${id} | ${domain}"
    TIMEOUT=$((TIMEOUT + 1))
    TIMEOUT_RESULTS="${TIMEOUT_RESULTS}\n  ⏱ TIMEOUT: ${source}/${id} — ${url}"
    TIMEOUT_BODY="${TIMEOUT_BODY}| \`${source}/${id}\` | TIMEOUT | ${url} |\n"
  elif is_geo_url "$url"; then
    # 한국 실측 등록 URL 의 4xx/5xx — 경고 집계(타임아웃과 같은 취급). 한국에서 재확인 필요 표시.
    echo -e "  ${YELLOW}⚠${NC} ${code} GEO | ${source}/${id} | ${domain} (러너 지역 차단 가능 — 한국에서 재확인)"
    TIMEOUT=$((TIMEOUT + 1))
    TIMEOUT_RESULTS="${TIMEOUT_RESULTS}\n  ⚠ ${code} GEO: ${source}/${id} — ${url}"
    TIMEOUT_BODY="${TIMEOUT_BODY}| \`${source}/${id}\` | ${code} (지역 차단 의심) | ${url} |\n"
  else
    echo -e "  ${RED}✗${NC} ${code} | ${source}/${id} | ${domain}"
    FAIL=$((FAIL + 1))
    RESULTS="${RESULTS}\n  ✗ ${code}: ${source}/${id} — ${url}"
    ISSUE_BODY="${ISSUE_BODY}| \`${source}/${id}\` | ${code} | ${url} |\n"
  fi
}

# ── 검사 대상 수집 → 조회 → 원래 순서로 집계 (2026-10-03) ──
# 9/30·10/2 실행이 job 30분 한도에 걸려 **결과 없이 취소**됐다 — 원인은 타임아웃 재시도 사다리(위 probe_code).
# 조회 동시성은 CHECK_LINKS_CONCURRENCY 로 조절하되 **기본은 순차(1)**: 10/3 US 러너 실측에서 동시 6건은
# 타임아웃이 14 → 57건으로 늘었다(순차일 땐 정상이던 gunsan·gongju·gov.kr 등까지) — 한국 쪽이 동시 요청을 늦춘다.
ENTRIES_FILE=$(mktemp)
CODES_FILE=$(mktemp)
trap 'rm -f "$ENTRIES_FILE" "$CODES_FILE"' EXIT
collect() {
  printf '%s\t%s\t%s\n' "$1" "$2" "$3" >> "$ENTRIES_FILE"
}

# ── 지원사업 URL 수집 ──

# id와 sourceUrl을 쌍으로 추출 — 엔트리(`id: "SP-…"`) 단위로 잘라 그 안에서 sourceUrl을 찾는다.
# 8/29 이전엔 `sourceUrl: "http…"`가 **한 줄**에 있을 때만 잡혀서, 긴 URL을 줄바꿈해 쓰면 그 항목이
# 조용히 검사에서 빠졌다(SP-033~037 큐레이션 중 실제 발생). 엔트리 단위 파싱은 줄바꿈과 무관하다.
while IFS=$'\t' read -r current_id url; do
  if [ -n "$current_id" ] && [ -n "$url" ]; then
    collect "programs" "$current_id" "$url"
  fi
done < <(perl -0777 -ne '
  for my $chunk (split /(?=\bid:\s*"SP-)/, $_) {
    next unless $chunk =~ /\bid:\s*"(SP-[^"]+)"/;
    my $id = $1;
    next unless $chunk =~ /sourceUrl:\s*"([^"]+)"/;
    print "$id\t$1\n";
  }
' "$PROGRAMS_FILE")


# ── 교육 URL 수집 ──

# programs와 동일한 엔트리 단위 파싱 (8/30) — `url:` 줄바꿈·중첩 객체(`sourceUrl`·`applyUrl` 등)에 흔들리지 않게
# 엔트리의 첫 `url: "http…"`만 검사 대상으로 잡는다.
while IFS=$'\t' read -r current_id url; do
  if [ -n "$current_id" ] && [ -n "$url" ]; then
    collect "education" "$current_id" "$url"
  fi
done < <(perl -0777 -ne '
  for my $chunk (split /(?=\bid:\s*"ED-)/, $_) {
    next unless $chunk =~ /\bid:\s*"(ED-[^"]+)"/;
    my $id = $1;
    next unless $chunk =~ /\burl:\s*"(https?:[^"]+)"/;
    print "$id\t$1\n";
  }
' "$EDUCATION_FILE")


# ── 체험·행사 URL 수집 (2026-09-29 추가) ──
# 지자체 체험 프로그램이 events.ts로 들어오기 시작하면서 링크 검증 사각지대가 생겼다.

while IFS=$'\t' read -r current_id url; do
  if [ -n "$current_id" ] && [ -n "$url" ]; then
    collect "events" "$current_id" "$url"
  fi
done < <(perl -0777 -ne '
  for my $chunk (split /(?=\bid:\s*"evt-)/, $_) {
    next unless $chunk =~ /\bid:\s*"(evt-[^"]+)"/;
    my $id = $1;
    next unless $chunk =~ /\burl:\s*"(https?:[^"]+)"/;
    print "$id\t$1\n";
  }
' "$EVENTS_FILE")


# ── 귀농귀촌지원센터 URL 수집 (2026-09-29 추가) ──
# 지자체 센터 홈페이지는 개편·도메인 통합이 잦은데 4월 검증 이후 재확인 경로가 없었다.
#
# ⚠ centers.ts는 238건이라 매일 전수 검사하면 기존 78건짜리 job이 4배가 된다
#   (8/17에 이미 러너 타임아웃으로 30분까지 늘린 이력). 요일별 1/7 슬라이스로
#   하루 ~34건만 보고 일주일이면 전수 순회한다. 전수 강제는 CHECK_LINKS_ALL_CENTERS=1.
CENTER_SLICES=7
CENTER_SLICE=${CHECK_LINKS_CENTER_SLICE:-$(( $(date '+%j' | sed 's/^0*//') % CENTER_SLICES ))}
if [ "${CHECK_LINKS_ALL_CENTERS:-0}" = "1" ]; then
  CENTERS_LABEL="귀농귀촌지원센터 (centers — 전수)"
  CENTER_SLICE="all"
else
  CENTERS_LABEL="귀농귀촌지원센터 (centers — 슬라이스 ${CENTER_SLICE}/${CENTER_SLICES}, 주 1회 전수 순회)"
fi

CENTER_INDEX=0
while IFS=$'\t' read -r current_id url; do
  if [ -n "$current_id" ] && [ -n "$url" ]; then
    if [ "$CENTER_SLICE" != "all" ] && [ $(( CENTER_INDEX % CENTER_SLICES )) -ne "$CENTER_SLICE" ]; then
      CENTER_INDEX=$((CENTER_INDEX + 1))
      continue
    fi
    CENTER_INDEX=$((CENTER_INDEX + 1))
    collect "centers" "$current_id" "$url"
  fi
done < <(perl -0777 -ne '
  for my $chunk (split /(?=\bid:\s*")/, $_) {
    next unless $chunk =~ /\bid:\s*"([a-z0-9-]+)"/;
    my $id = $1;
    next unless $chunk =~ /\burl:\s*"(https?:[^"]+)"/;
    print "$id\t$1\n";
  }
' "$CENTERS_FILE")


# ── 병렬 조회 ──
export -f fetch_status is_geo_url probe_code
# 시간 예산 (기본 30분, CHECK_LINKS_BUDGET_SEC 로 조정) — 10/3 밤 순차 실행이 37분(타임아웃 38건)이었다.
# 한국 기관 사이트는 미국 러너에서 시간대에 따라 응답이 크게 느려진다(오전 14건 / 밤 38건). job 한도(40분)에
# 잘리면 결과가 0이 되므로, 예산을 넘긴 URL 은 조회하지 않고 "미검사"로 남긴 채 그때까지의 결과로 끝낸다.
CHECK_LINKS_DEADLINE=$(( $(date +%s) + ${CHECK_LINKS_BUDGET_SEC:-1800} ))
export UA GEO_WARN_URLS CODES_FILE CHECK_LINKS_DEADLINE
PROBE_CONCURRENCY=${CHECK_LINKS_CONCURRENCY:-1}
# 행 번호를 키로 — 병렬 결과는 끝나는 순서대로 쌓이므로 집계는 원래 순서로 다시 맞춘다.
# 인자는 "행번호 URL" 한 덩어리(URL 에 공백은 없다). NUL 구분(-0): xargs 기본 모드는 따옴표·백슬래시를
# 해석해 URL 이 깨질 수 있다. -r: 대상 0건이면 실행하지 않는다(GNU xargs 는 빈 입력에도 1회 돈다).
awk -F'\t' '{printf "%s %s%c", NR, $3, 0}' "$ENTRIES_FILE" \
  | xargs -r -0 -n 1 -P "$PROBE_CONCURRENCY" bash -c '
      printf "%s\t%s\n" "${0%% *}" "$(probe_code "${0#* }")" >> "$CODES_FILE"
    '

section_label() {
  case "$1" in
    programs) echo "지원사업 (programs)" ;;
    education) echo "교육 (education)" ;;
    events) echo "체험·행사 (events)" ;;
    centers) echo "$CENTERS_LABEL" ;;
    *) echo "$1" ;;
  esac
}

# ── 집계 (수집 순서) ──
PREV_SOURCE=""
IDX=0
while IFS=$'\t' read -r source id url; do
  IDX=$((IDX + 1))
  if [ "$source" != "$PREV_SOURCE" ]; then
    [ -n "$PREV_SOURCE" ] && echo ""
    echo -e "${CYAN}▸ $(section_label "$source")${NC}"
    PREV_SOURCE="$source"
  fi
  code=$(awk -F'\t' -v i="$IDX" '$1 == i { print $2; exit }' "$CODES_FILE")
  classify_result "$id" "$url" "$source" "${code:-000}"
done < "$ENTRIES_FILE"

echo ""

# ── 결과 요약 ──
echo "───────────────────────────────────────────"
echo -e "  총 ${TOTAL}개 | ${GREEN}정상 ${OK}${NC} | ${RED}실패 ${FAIL}${NC} | ${YELLOW}타임아웃 ${TIMEOUT}${NC}$([ "$SKIPPED" -gt 0 ] && echo " | 미검사 ${SKIPPED}")"
echo "───────────────────────────────────────────"

# ── 타임아웃은 경고로만 처리 (exit code 영향 없음) ──
# NOTE 2026-08-17: 타임아웃(000)은 "링크가 죽었다"가 아니라 "러너에서 도달 못 했다"이다.
# GitHub Actions 러너(미국)에서 한국 정부 사이트가 상시 타임아웃 → 매일 이슈 생성 →
# 경보 피로로 진짜 깨진 링크를 가리는 역효과. 실측 8/17: 타임아웃 6건 전부 한국에서 200.
# 따라서 타임아웃은 warning 주석으로만 남기고, exit 1 / 이슈 생성은 실제 실패(4xx·5xx)에만 적용.
if [ "$SKIPPED" -gt 0 ] && [ "$CI_MODE" = true ]; then
  echo "::warning title=외부 링크 미검사 ${SKIPPED}건::시간 예산(${CHECK_LINKS_BUDGET_SEC:-1800}초)을 넘겨 나머지는 다음 실행에서 검사해요."
fi

if [ $TIMEOUT -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}▸ 타임아웃 (경고 — 러너 리전 이슈 가능성, 실패로 집계 안 함):${NC}"
  echo -e "$TIMEOUT_RESULTS"
  if [ "$CI_MODE" = true ]; then
    echo "::warning title=외부 링크 타임아웃 ${TIMEOUT}건::러너에서 도달 실패. 한국에서 직접 확인 필요할 수 있음."
  fi
  echo ""
fi

if [ $FAIL -gt 0 ]; then
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
   - \`src/lib/data/programs.ts\`·\`education.ts\`·\`events.ts\`·\`centers.ts\`에서 해당 항목에 \`linkStatus: \"broken\"\` 추가 또는 URL 교체
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
        --assignee "KangseonLEE" \
        2>/dev/null && echo "✅ GitHub Issue가 생성되었습니다." || echo "⚠️  Issue 생성 실패 (label이 없거나 권한 부족)"
    fi
  else
    echo "위 링크를 확인하고 src/lib/data/ 파일에서 URL을 수정하세요."
    echo "또는 linkStatus: \"broken\" 을 추가하여 목록에서 숨길 수 있습니다."
  fi

  exit 1
elif [ $TIMEOUT -gt 0 ] || [ "$SKIPPED" -gt 0 ]; then
  echo ""
  echo -e "${GREEN}▸ 깨진 링크 없음${NC} (타임아웃 ${TIMEOUT}건은 경고로만 기록$([ "$SKIPPED" -gt 0 ] && echo ", 미검사 ${SKIPPED}건은 다음 실행에서"))"
  exit 0
else
  echo ""
  echo -e "${GREEN}▸ 모든 외부 링크가 정상입니다.${NC}"
  exit 0
fi
