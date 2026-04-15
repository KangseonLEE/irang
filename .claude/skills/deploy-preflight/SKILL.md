---
name: deploy-preflight
description: "Vercel 배포 전 전수 점검 — 빌드·타입·린트·체크리스트·카피톤·접근성·Lighthouse·링크·정책 스냅샷·API 건강성·Sentry·OG 이미지·sitemap·면책고지 배지. 모든 게이트 통과 시만 배포 승인. 트리거: '배포 전 점검', 'deploy preflight', '배포 준비 확인', '배포해도 되나', '퍼블리시 체크', 'preflight'. qa-reviewer가 주관, frontend-engineer + data-engineer 지원."
---

# Deploy Preflight — Vercel 배포 전 전수 점검

## 목적
배포 전 마지막 게이트. 코드·데이터·품질·모니터링·컨텐츠 무결성을 전수 점검하여 사고 없이 배포. 하나라도 FAIL이면 배포 차단.

## 트리거
- 자연어: "배포 전 점검", "배포해도 되나"
- qa-reviewer 주관
- frontend-engineer가 "배포 준비 완료" 신호 보낼 때 자동 호출

## 실행 절차

### STEP 1: 빌드·타입·린트 (frontend-engineer 협업)

```bash
rm -rf .next
npx tsc --noEmit
npm run lint
npm run build
```

- 타입 에러 → `🔴 FAIL`
- 린트 warning 5건+ → `🟡 WARN`
- 빌드 실패 → `🔴 FAIL`

### STEP 2: 테스트

```bash
npm test
```

- 테스트 실패 → `🔴 FAIL`
- 커버리지 출력 (현재 0이지만 점진 개선 추적)

### STEP 3: 체크리스트 A~H 전수 (pre-commit-check 위임)

`pre-commit-check` 스킬 호출. 결과 요약만 수집.

### STEP 4: API Health (api-health-check 위임)

`api-health-check` 스킬 호출. 환경변수 · 8 API · 폴백 · Sentry 점검.

### STEP 5: 정책 스냅샷 (policy-snapshot-sync 위임)

`policy-snapshot-sync` 스킬 호출. drift 있으면 배포 보류.

### STEP 6: SEO·메타 태그

- `<title>` 페이지별 유일성
- `<meta description>` 140자 이내
- OG 이미지 4종 페이지(메인/지역/작물/적합성 진단) 적용
- 이랑-SEO-롱테일-전략.md 20개 키워드 반영 여부(가동 후)

```bash
# sitemap 유효성
curl -s http://localhost:3000/sitemap.xml | head -20

# robots.txt
curl -s http://localhost:3000/robots.txt
```

### STEP 7: 접근성·성능 (Lighthouse)

**로컬 실행** (배포 후에도 프로덕션 URL 재실행):
```bash
npm run build && npm start &
npx lighthouse http://localhost:3000 --output=json --output-path=./lh-report.json --chrome-flags="--headless"
```

체크:
- Performance ≥ 90
- Accessibility ≥ 90 (특히 WCAG 2.1 AA 대비)
- Best Practices ≥ 90
- SEO ≥ 90

3개 핵심 페이지 각각: `/`, `/match`, `/regions/[샘플]`

### STEP 8: 링크 점검

```bash
bash scripts/check-links.sh
```

- 깨진 링크 1건+ → `🔴 FAIL`
- 이랑-SEO-롱테일-전략에서 추가된 `/guides/*` 페이지 포함 확인

### STEP 9: 면책 고지·배지 (이랑-면책고지-정책.md 준수)

- Footer 면책 고지 노출
- 5개 페이지 유형별 "참고용" 배지 (`/regions/*`, `/crops/*`, `/support/*`, `/match`, `/stats/*`)
- 수익·지원사업 금액에 표본·출처·범위 병기
- `/about/corrections` 페이지 존재

누락 시 `🟡 WARN` (즉시 배포 차단은 아님, 후속 배포에 포함)

### STEP 10: Sentry·GA4

- Sentry DSN 환경변수 설정
- Sentry 이벤트 1건 test 전송 (optional)
- GA4 (`G-CS2XS2Y12X`) 스크립트 삽입 확인

### STEP 11: 환경변수·Secrets

- Vercel 환경변수 목록이 `.env.local` 목록과 일치하는지 (수동 확인 안내)
- `.env.local`이 `.gitignore`에 포함
- secrets 유출 흔적 없음 (`git log -p | grep -i 'api_key\|secret'`)

### STEP 12: 결과 리포트

```
## 🚀 Deploy Preflight Report — {YYYY-MM-DD HH:mm}

### 📊 게이트 결과

| # | 게이트 | 결과 | 비고 |
|---|--------|------|------|
| 1 | 빌드·타입·린트 | ✅ PASS | |
| 2 | 테스트 | ⚠️ WARN | 커버리지 0 |
| 3 | 체크리스트 A~H | ✅ PASS | |
| 4 | API Health | ✅ PASS | |
| 5 | 정책 스냅샷 | ✅ PASS | |
| 6 | SEO·메타 | ✅ PASS | |
| 7 | Lighthouse | ⚠️ WARN | Accessibility 89 |
| 8 | 링크 | ✅ PASS | |
| 9 | 면책·배지 | ⚠️ WARN | 2개 페이지 누락 |
| 10 | Sentry·GA4 | ✅ PASS | |
| 11 | 환경변수 | ✅ PASS | |

### 🎯 배포 판정: CONDITIONAL

### ✅ PASS 게이트
...

### ⚠️ WARN 게이트 (검토 후 진행 가능)
- Lighthouse Accessibility 89 → 90 목표
- 면책 배지 누락: /stats/income, /stats/youth

### 🔴 BLOCK (해당 시)
...

### 권고 액션
1. 면책 배지 2개 추가 (frontend-engineer, 10분)
2. Lighthouse Accessibility 89 원인: focus-visible 대비 개선 (frontend-engineer)
3. 위 조치 후 재점검

### chief-of-staff 결정 필요
- WARN만 있음. 배포 진행 vs 보류 판단 (이전 대시보드 사용자 0명 상황 + Kill Scenario A 임박 고려)
```

## 판정 로직

- FAIL 1건+ → **BLOCK** (배포 금지)
- WARN만 있음 → **CONDITIONAL** (chief-of-staff 판단)
- 전부 PASS → **READY** (배포 승인)

## 주의사항
- 빌드 느림 주의 (Next.js 16 → 1~3분)
- Lighthouse도 오래 걸림 → 3개 핵심 페이지만
- secrets 로그 출력 금지 — 키 목록 비교만

## 팀 통신
- qa-reviewer 주관
- 각 게이트 상세는 하위 스킬 위임 (pre-commit-check, api-health-check, policy-snapshot-sync)
- 최종 판정은 chief-of-staff에 보고
- David(회장)에게는 BLOCK 또는 배포 완료 시에만 최종 보고
