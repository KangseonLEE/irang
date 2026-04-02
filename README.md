# 이랑 — 귀농 정보 큐레이션 포탈

> **"어디서, 무엇을, 어떻게"** — 귀농에 필요한 정보를 한곳에서.

흩어진 지원사업, 지역 환경, 작물 데이터를 **조건 기반으로 큐레이션**하여,
귀농 예정자가 5분 만에 자신에게 맞는 로드맵을 확인할 수 있는 웹서비스입니다.

---

## 왜 이랑인가요?

귀농을 고려하는 도시 직장인에게 가장 큰 허들은 **정보의 파편화**입니다.

| 현재 문제 | 이랑의 해결 |
|----------|-----------|
| 지원사업 정보가 농사로, 지자체, 귀농귀촌종합센터 등에 흩어져 있음 | **조건(나이 x 지역 x 작물) 기반 지원사업 검색** |
| 지역 선택에 필요한 기후/인프라/인구 데이터를 직접 비교하기 어려움 | **시군구별 거주환경/재배환경 비교 대시보드** |
| 기존 서비스(팜모닝, 그린랩스)는 현직 농민 대상 | **귀농 "예정자"에게 맞춘 정보 설계** |

> *"이랑"은 밭을 갈 때 생기는 고랑 사이의 두둑을 뜻합니다.*
> *농업의 본질을 담으면서, "함께 이랑(나란히)"이라는 중의적 의미를 가집니다.*

---

## 핵심 기능

### Phase 1 — 정보 큐레이션 MVP (현재)

- **지역 비교** `/regions` — 기후, 의료/교육 인프라, 인구 데이터로 시군구 비교
- **지원사업 검색** `/programs` — 나이/지역/희망 작물 조건으로 필터링
- **작물 정보** `/crops` — 주요 작물의 재배 환경, 수익성, 난이도 안내

### Phase 2 — 커뮤니티 & 콘텐츠 (예정)

- 귀농 선배 인터뷰 / 후기
- Q&A 커뮤니티
- 귀농 체크리스트 / 가이드 콘텐츠

### Phase 3 — 스마트팜 연계 (예정)

- 스마트팜 장비/솔루션 연계
- 재배 관리 대시보드

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router) / TypeScript / Tailwind CSS / shadcn/ui v3 |
| Backend | Next.js API Routes (Serverless) |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Data Pipeline | GitHub Actions / Python (공공데이터 API + 크롤링) |
| Analytics | Google Analytics 4 |

---

## 데이터 소스

공공데이터 API와 공식 통계를 활용하여 신뢰도 높은 정보를 제공합니다.

| 데이터 | 출처 |
|--------|------|
| 기상 (기온/강수/일조) | 기상청 ASOS API |
| 의료기관 | 건강보험심평원 API |
| 학교 위치 | 교육부 표준데이터 |
| 인구/고령화율 | 통계청 SGIS API |
| 작물 재배면적/생산량 | 통계청 KOSIS API |
| 귀농 지원사업 | 농림축산식품부 / AgriX |

---

## 시작하기

### 사전 준비

- Node.js 20+
- Supabase 프로젝트 (PostgreSQL)
- 공공데이터 API Key ([data.go.kr](https://data.go.kr))

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/KangseonLEE/irang.git
cd irang

# 2. 의존성 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 실제 키 입력

# 4. 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 환경변수

| 변수명 | 설명 |
|--------|------|
| `DATA_GO_KR_API_KEY` | 공공데이터포털 인증키 |
| `SGIS_CONSUMER_KEY` | 통계청 SGIS 서비스ID |
| `SGIS_CONSUMER_SECRET` | 통계청 SGIS 보안KEY |
| `KOSIS_API_KEY` | KOSIS Open API 인증키 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous Key |

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 홈 (Hero + Feature Cards)
│   ├── regions/          # 지역 비교
│   ├── programs/         # 지원사업 검색
│   └── crops/            # 작물 정보
├── components/
│   ├── layout/           # Header, Footer, MobileNav
│   └── ui/               # shadcn/ui 컴포넌트
└── lib/
    └── supabase/         # Supabase 클라이언트
```

---

## 로드맵

| 마일스톤 | 내용 | 목표 시점 |
|---------|------|----------|
| M0 | 시장조사 + PRD 확정 | 2026년 4월 |
| M1 | 데이터 소스 확보 + 스키마 설계 | 2026년 5월 |
| M2 | MVP 개발 (지원사업 검색) | 2026년 6월 |
| M3 | 베타 테스트 + 피드백 | 2026년 7월 |
| M4 | Phase 2 기획 시작 | 2026년 8월 |

---

## 라이선스

이 프로젝트는 개인 사이드 프로젝트입니다. 라이선스는 추후 결정 예정입니다.

---

<p align="center">
  <strong>이랑</strong> · 귀농, 이제 어디서 시작할지 알 수 있어요.
</p>
