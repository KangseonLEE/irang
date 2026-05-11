# frontend-engineer 보고 표준 템플릿

> chief-of-staff.md 5/11 1on1 인수 체크리스트 8종 중 #4~#5에 매핑.
> 모바일 변경이 포함되면 "모바일 사전 점검" 섹션 필수. 아니면 삭제.
> 모든 라인은 `scripts/cos-inbox-check.ts`가 자동 grep함 — 라벨/키워드 변경 시 스크립트도 함께 갱신.

---

## 핵심 결론 (1-3줄)

(요약)

## 변경 파일

- `src/...` — 변경 사유 한 줄
- `src/...` — 변경 사유 한 줄

---

## 검증 (모든 코드 변경 — 인수 체크리스트 #5)

> CLAUDE.md 빌드 SOP + copywriting.md 근거.

- tsc / eslint / build 0 에러 ✅
  - tsc: 통과 ✅
  - eslint: 통과 ✅
  - build: 통과 ✅ (마지막 라인 prerendered/SSG/Dynamic 마커 확인)
- 카피 톤 ~예요/세요 준수: ✅ (새/수정된 UI 텍스트 검토 완료)

---

## 모바일 사전 점검 (모바일 변경 시 필수 — 인수 체크리스트 #4)

> frontend-engineer.md 5/6 1on1 근거.

### 모바일 5종 사전 점검

- vh → dvh 사용 확인: ✅ / 해당없음
- sticky 헤더 z-index 확인: ✅ / 해당없음
- hover는 `@media (hover: hover)` 래핑: ✅ / 해당없음
- viewport meta tag 확인: ✅
- safe-area-inset (iOS notch) 확인: ✅ / 해당없음

**모바일 5종 사전 점검 통과 (vh/sticky/hover/viewport/safe-area)** ✅

### 360/390/430/768 4단계 검증

- 360px (소형 안드로이드): 통과 ✅
- 390px (iPhone 13/14): 통과 ✅
- 430px (iPhone 14 Pro Max): 통과 ✅
- 768px (iPad 세로): 통과 ✅

---

## 사용처 영향 점검

- 변경한 컴포넌트의 사용처 grep 결과: N개 파일 영향
- 각 사용처 회귀 위험: ⚪/🟡/🔴

---

## 리스크 / 후속 작업

- (있으면 기재, 없으면 "없음")
