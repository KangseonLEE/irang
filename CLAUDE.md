@AGENTS.md

# 이랑 프로젝트 개발 규칙

## 데이터 조회 원칙

- 공공데이터 API 호출 시 **항상 당해년도 기준**으로 조회한다.
- 연도를 하드코딩하지 않고 `new Date().getFullYear()`로 동적 산출한다.
- 예시: 2026년에 실행하면 startDt=20260101, endDt=20261231

## 환경변수

- API 키는 `.env.local`에서 관리한다.
- `DATA_GO_KR_API_KEY`: data.go.kr 공통 인증키 (기상청, 심평원, 교육부)
