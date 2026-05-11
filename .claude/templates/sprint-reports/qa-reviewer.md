# qa-reviewer 보고 표준 템플릿

> chief-of-staff.md 5/11 1on1 인수 체크리스트 8종 중 #6~#7에 매핑.
> 배포 전 검증인지 infra 변경인지에 따라 해당 섹션만 채우고 나머지는 삭제.
> 모든 라인은 `scripts/cos-inbox-check.ts`가 자동 grep함 — 라벨/키워드 변경 시 스크립트도 함께 갱신.

---

## 핵심 결론 (1-3줄)

(요약 — 배포 승인 / 배포 보류 / 재작업 필요 중 하나로 결론)

## 검증 대상

- 브랜치 / 커밋: `<branch>` / `<sha>`
- 변경 파일 수: N개
- 변경 라인 수: +A / -B

---

## 보고 유형: 배포 전 검증 (인수 체크리스트 #6)

> qa-reviewer.md 정의 + .claude/rules/checklist.md 근거.

### 빌드 / 타입 / lint / Lighthouse 4종

- 빌드 (npm run build): 통과 ✅
- 타입 (tsc): 통과 ✅
- lint (eslint): 통과 ✅
- Lighthouse (Performance/Accessibility/Best Practices/SEO): 점수 기재

### 체크리스트 A~H

- A 공통 컴포넌트 재사용: 통과 ✅
- B CSS 복붙 없음: 통과 ✅
- C 인라인 스타일 없음: 통과 ✅
- D 클라이언트 컴포넌트 정당성: 통과 ✅
- E hover 미디어쿼리: 통과 ✅
- F SPA 네비게이션 정리: 통과 ✅
- G CSS 선언 순서: 통과 ✅
- H Server↔Client 경계: 통과 ✅

**체크리스트 A~H 통과** ✅

### 모바일 4단계 + 데스크탑 회귀

- 모바일 4단계 (360/390/430/768): 통과 ✅
- 데스크탑 회귀 (1024/1280/1440): 통과 ✅

---

## 보고 유형: infra 변경 검증 (인수 체크리스트 #7)

> qa-reviewer.md 5/6 1on1 근거.

### infra 검증 4종

- robots.txt / sitemap.xml 변경 검증: 통과 ✅
- middleware UA 차단 / redirect 검증: 통과 ✅
- next.config.ts headers 검증: 통과 ✅
- 영향 범위 (검색 색인 / 외부 ping 등): 통과 ✅

**infra 검증 4종 통과** ✅

### Cloudflare / Vercel 사이드 점검

- Cloudflare proxy 활성 상태: ✅
- Vercel 환경변수 sensitive 처리: ✅
- 배포 후 curl 확인 plan: ...

---

## 결론 / 승인

- ✅ 배포 승인 / 🟡 조건부 승인 (조건 명시) / 🔴 보류 (재작업 필요)

## 리스크 / 후속 작업

- (있으면 기재, 없으면 "없음")
