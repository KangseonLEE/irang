/**
 * 환경변수 검증 레이어
 *
 * 서버 시작 시 한 번 호출하여 환경변수 설정 상태를 검증한다.
 * - 필수 변수가 누락되면 에러를 throw한다.
 * - 선택 변수가 누락되면 경고 로그를 출력한다 (기능 graceful degradation).
 * - 빈 문자열("")로 설정된 변수도 미설정으로 간주한다.
 */

interface EnvVar {
  /** 환경변수 이름 */
  name: string;
  /** 필수 여부 — true면 누락 시 에러 */
  required: boolean;
  /** 설명 (경고/에러 메시지에 포함) */
  description: string;
}

// ─── 환경변수 정의 ───

const SERVER_ENV_VARS: EnvVar[] = [
  // Supabase
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    required: false,
    description: "Supabase 서비스 역할 키 — 관리자 DB 작업에 필요",
  },
  // 외부 API 키
  {
    name: "UNSPLASH_ACCESS_KEY",
    required: false,
    description: "Unsplash API 키 — 지역 이미지 조회에 필요",
  },
  {
    name: "KOSIS_API_KEY",
    required: false,
    description: "KOSIS 통계 API 키 — 통계 데이터 조회에 필요",
  },
  {
    name: "RDA_API_KEY",
    required: false,
    description: "농촌진흥청 API 키 — 작물 정보 조회에 필요",
  },
  {
    name: "DATA_GO_KR_API_KEY",
    required: false,
    description: "공공데이터포털 API 키 — 날씨/의료 데이터에 필요",
  },
  {
    name: "NEIS_API_KEY",
    required: false,
    description: "NEIS 교육 API 키 — 학교 목록 조회에 필요",
  },
  {
    name: "SGIS_KEY",
    required: false,
    description: "SGIS 소비자 키 — 인구통계 조회에 필요",
  },
  {
    name: "SGIS_SECRET",
    required: false,
    description: "SGIS 소비자 시크릿 — 인구통계 조회에 필요",
  },
  {
    name: "NAVER_CLIENT_ID",
    required: false,
    description: "네이버 API 클라이언트 ID — 뉴스 검색에 필요",
  },
  {
    name: "NAVER_CLIENT_SECRET",
    required: false,
    description: "네이버 API 클라이언트 시크릿 — 뉴스 검색에 필요",
  },
];

const PUBLIC_ENV_VARS: EnvVar[] = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    required: false,
    description: "Supabase 프로젝트 URL — DB 연동에 필요",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: false,
    description: "Supabase 익명 키 — 클라이언트 DB 조회에 필요",
  },
  {
    name: "NEXT_PUBLIC_KAKAO_JS_KEY",
    required: false,
    description: "카카오 JavaScript 키 — 공유 기능에 필요",
  },
  {
    name: "NEXT_PUBLIC_GA_ID",
    required: false,
    description: "Google Analytics ID — 방문 분석에 필요",
  },
  {
    name: "NEXT_PUBLIC_FEEDBACK_URL",
    required: false,
    description: "피드백 폼 URL — 기본값 사용 가능",
  },
  {
    name: "NEXT_PUBLIC_SENTRY_DSN",
    required: false,
    description: "Sentry DSN — 에러 모니터링에 필요 (비워두면 비활성화)",
  },
];

/**
 * 환경변수를 검증하고 결과를 로그로 출력한다.
 * 필수 변수가 누락되면 에러를 throw한다.
 *
 * 서버 컴포넌트 진입점(layout.tsx 등)에서 한 번 호출한다.
 */
export function validateEnv(): void {
  const allVars = [...SERVER_ENV_VARS, ...PUBLIC_ENV_VARS];
  const missing: EnvVar[] = [];
  const warnings: EnvVar[] = [];

  for (const v of allVars) {
    const value = process.env[v.name];
    const isEmpty = value === undefined || value === "";

    if (isEmpty) {
      if (v.required) {
        missing.push(v);
      } else {
        warnings.push(v);
      }
    }
  }

  // 필수 변수 누락 → 에러
  if (missing.length > 0) {
    const list = missing
      .map((v) => `  - ${v.name}: ${v.description}`)
      .join("\n");
    throw new Error(
      `[env] 필수 환경변수가 설정되지 않았습니다:\n${list}`
    );
  }

  // 선택 변수 누락 → 경고 (개발 편의를 위해 요약)
  if (warnings.length > 0) {
    console.warn(
      `[env] 선택 환경변수 ${warnings.length}개 미설정 (해당 기능이 비활성화됩니다):`,
      warnings.map((v) => v.name).join(", ")
    );
  }
}
