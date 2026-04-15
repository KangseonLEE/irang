---
name: policy-snapshot-sync
description: ".policy-snapshots/ 지원사업 원문 스냅샷과 가공 데이터 간 drift를 감지하고 동기화. 정부 지원사업은 자주 바뀌므로 원문 변경 시 src/lib/data/programs.ts 갱신 필요. 트리거: '정책 스냅샷', 'policy snapshot', '지원사업 갱신', '스냅샷 동기화', '데이터 drift', 'policy-snapshot-sync'. data-engineer가 주기적으로 실행. scripts/check-policy-sources.ts와 연계."
---

# Policy Snapshot Sync — 정책 스냅샷 동기화

## 목적
`.policy-snapshots/`의 지원사업 원문 스냅샷과 `src/lib/data/` 가공 데이터 간 drift를 감지하고 동기화 제안. 정부 지원사업은 분기·연간 갱신이 잦아 원문 변경 → 가공 데이터 반영 누락이 사용자 피해로 이어짐.

## 트리거
- 자연어: "정책 스냅샷 확인", "지원사업 데이터 갱신"
- data-engineer 주기 실행 (주 1회 권고)
- Sprint1 Kill Scenario 진입 시 자동 점검

## 실행 절차

### STEP 1: 현재 스냅샷 목록

```bash
ls -la .policy-snapshots/
```

알려진 원문 소스:
- `farmland-bank_source*.txt` (농지은행)
- `forest-village_source*.txt` (산촌·임업)
- `return-farming_source*.txt` (귀농종합)
- `youth-startup_source*.txt` (청년창업농)

### STEP 2: 원문 재수집 (WebFetch)

`scripts/check-policy-sources.ts` 참조하여 각 원문 URL을 WebFetch:

```bash
tsx scripts/check-policy-sources.ts
```

현재 스냅샷과 diff:
- 텍스트 완전 동일 → PASS
- 변경 있음 → WARN + 변경 범위 추출

### STEP 3: 가공 데이터 교차 검증

`src/lib/data/programs.ts`(또는 관련 파일)의 항목 중:
- 모집 기간·금액·자격·신청 기관 정보를 스냅샷과 대조
- 불일치 감지 시 FAIL

### STEP 4: drift 리포트

```markdown
## 📋 Policy Snapshot Sync Report — {날짜}

### 원문 변경 감지
| 스냅샷 | 변경 유형 | 차이 |
|--------|---------|------|
| farmland-bank_source0.txt | 모집기간 변경 | 2026-04-30 → 2026-05-15 |

### 가공 데이터 drift
| 파일:라인 | 필드 | 원문 | 가공 |
|-----------|------|------|------|
| src/lib/data/programs.ts:L123 | deadline | 2026-05-15 | 2026-04-30 (구 원문) |

### 권고 액션
1. 원문 스냅샷 업데이트 (`cp` 새 수집본 → .policy-snapshots/)
2. `src/lib/data/programs.ts` 해당 항목 수정
3. 커밋: `data: 정부 농지은행 지원사업 모집기간 갱신 (2026-04-30 → 2026-05-15)`
```

### STEP 5: 자동 적용 여부

- **자동 적용 금지** — 정책 정보는 사용자 의사결정에 직접 영향
- 변경안을 data-engineer에 제시 후 수동 검증
- 수정 후 `이랑-면책고지-정책.md`의 "정정 이력" `/about/corrections` 페이지에도 기록 제안

## 주의사항
- 자동 쓰기 금지. 제안만.
- 원문 사이트 접근 실패 시 WARN (네트워크·서비스 일시 중단일 수 있음)
- 스냅샷 자체 타임스탬프(파일 mtime)도 7일+ 오래됐으면 재수집 권고
- 공공데이터 라이선스 이슈(이랑.md R2) 관련 — 원문 재배포가 아닌 가공 정보 서빙임을 유지

## 팀 통신
- data-engineer가 1차 실행
- drift 발견 시 chief-of-staff에 보고 → qa-reviewer에 재검증 의뢰
- 반복 패턴 → reminder-watchman에 감시 대상 추가
