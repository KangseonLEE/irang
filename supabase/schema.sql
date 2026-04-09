-- ==========================================================================
-- 이랑 (irang) — Supabase Database Schema
-- 귀농 정보 포탈: 지원사업, 교육, 행사 데이터 관리
-- ==========================================================================

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- 1. 지원사업 (support_programs)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS support_programs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,               -- URL-safe identifier (e.g. "prg-001")
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  region        TEXT NOT NULL,                       -- "전국", "전라남도", etc.
  organization  TEXT NOT NULL,
  support_type  TEXT NOT NULL CHECK (support_type IN ('보조금','융자','교육','현물','컨설팅')),
  support_amount TEXT NOT NULL,
  eligibility_age_min INT NOT NULL DEFAULT 18,
  eligibility_age_max INT NOT NULL DEFAULT 65,
  eligibility_detail TEXT NOT NULL DEFAULT '',
  application_start DATE NOT NULL,
  application_end   DATE NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('모집중','모집예정','마감')) DEFAULT '모집예정',
  related_crops TEXT[] DEFAULT '{}',                 -- array of crop names
  source_url    TEXT NOT NULL DEFAULT '',
  link_status   TEXT CHECK (link_status IN ('active','broken','unverified')) DEFAULT 'unverified',
  year          INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  is_verified   BOOLEAN DEFAULT FALSE,              -- 관리자 검증 여부
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_programs_region ON support_programs(region);
CREATE INDEX idx_programs_status ON support_programs(status);
CREATE INDEX idx_programs_type ON support_programs(support_type);
CREATE INDEX idx_programs_dates ON support_programs(application_start, application_end);
CREATE INDEX idx_programs_year ON support_programs(year);

-- ==========================================================================
-- 2. 교육과정 (education_courses)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS education_courses (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,               -- e.g. "edu-001"
  title         TEXT NOT NULL,
  region        TEXT NOT NULL,
  organization  TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('온라인','오프라인','혼합')),
  duration      TEXT NOT NULL DEFAULT '',
  schedule      TEXT NOT NULL DEFAULT '',
  target        TEXT NOT NULL DEFAULT '',
  cost          TEXT NOT NULL DEFAULT '무료',
  description   TEXT NOT NULL DEFAULT '',
  capacity      INT,                                 -- NULL = 무제한
  application_start DATE NOT NULL,
  application_end   DATE NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('모집중','모집예정','마감')) DEFAULT '모집예정',
  level         TEXT NOT NULL CHECK (level IN ('입문','초급','중급','심화')) DEFAULT '초급',
  url           TEXT NOT NULL DEFAULT '',
  link_status   TEXT CHECK (link_status IN ('active','broken','unverified')) DEFAULT 'unverified',
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_education_region ON education_courses(region);
CREATE INDEX idx_education_status ON education_courses(status);
CREATE INDEX idx_education_type ON education_courses(type);
CREATE INDEX idx_education_level ON education_courses(level);
CREATE INDEX idx_education_dates ON education_courses(application_start, application_end);

-- ==========================================================================
-- 3. 행사/체험 (farm_events)
-- ==========================================================================
CREATE TABLE IF NOT EXISTS farm_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,               -- e.g. "evt-001"
  title         TEXT NOT NULL,
  region        TEXT NOT NULL,
  organization  TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('일일체험','팜스테이','박람회','설명회','멘토링','축제')),
  date_start    DATE NOT NULL,
  date_end      DATE,                                -- NULL = 1일 행사
  location      TEXT NOT NULL DEFAULT '',
  cost          TEXT NOT NULL DEFAULT '무료',
  description   TEXT NOT NULL DEFAULT '',
  capacity      INT,                                 -- NULL = 제한없음
  target        TEXT NOT NULL DEFAULT '',
  url           TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL CHECK (status IN ('접수중','접수예정','마감')) DEFAULT '접수예정',
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_region ON farm_events(region);
CREATE INDEX idx_events_status ON farm_events(status);
CREATE INDEX idx_events_type ON farm_events(type);
CREATE INDEX idx_events_dates ON farm_events(date_start, date_end);

-- ==========================================================================
-- 4. 데이터 수집 로그 (data_sync_log) — 크롤링/API 동기화 이력
-- ==========================================================================
CREATE TABLE IF NOT EXISTS data_sync_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source      TEXT NOT NULL,                         -- "rda_api", "manual", "scraper", etc.
  table_name  TEXT NOT NULL,                         -- "support_programs", "education_courses", etc.
  action      TEXT NOT NULL CHECK (action IN ('insert','update','delete','sync')),
  record_count INT DEFAULT 0,
  status      TEXT NOT NULL CHECK (status IN ('success','failed','partial')) DEFAULT 'success',
  error_message TEXT,
  metadata    JSONB DEFAULT '{}',                    -- 추가 메타데이터
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_log_source ON data_sync_log(source);
CREATE INDEX idx_sync_log_created ON data_sync_log(created_at DESC);

-- ==========================================================================
-- 5. 자동 updated_at 트리거
-- ==========================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_programs_updated_at
  BEFORE UPDATE ON support_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_education_updated_at
  BEFORE UPDATE ON education_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON farm_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================================================
-- 6. 자동 상태 업데이트 함수 (모집중/마감 자동 전환)
-- ==========================================================================
CREATE OR REPLACE FUNCTION auto_update_program_status()
RETURNS void AS $$
BEGIN
  -- 지원사업: 마감일 지난 건 → 마감
  UPDATE support_programs
  SET status = '마감'
  WHERE status != '마감'
    AND application_end < CURRENT_DATE;

  -- 지원사업: 모집시작일 도래 + 마감일 전 → 모집중
  UPDATE support_programs
  SET status = '모집중'
  WHERE status = '모집예정'
    AND application_start <= CURRENT_DATE
    AND application_end >= CURRENT_DATE;

  -- 교육과정: 동일 로직
  UPDATE education_courses
  SET status = '마감'
  WHERE status != '마감'
    AND application_end < CURRENT_DATE;

  UPDATE education_courses
  SET status = '모집중'
  WHERE status = '모집예정'
    AND application_start <= CURRENT_DATE
    AND application_end >= CURRENT_DATE;

  -- 행사: date_start 기준
  UPDATE farm_events
  SET status = '마감'
  WHERE status != '마감'
    AND COALESCE(date_end, date_start) < CURRENT_DATE;

  UPDATE farm_events
  SET status = '접수중'
  WHERE status = '접수예정'
    AND date_start <= CURRENT_DATE + INTERVAL '30 days'
    AND COALESCE(date_end, date_start) >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================================================
-- 7. RLS (Row Level Security) — 기본 정책
-- ==========================================================================
-- 읽기: 누구나 가능 (공공 데이터)
ALTER TABLE support_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_log ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
CREATE POLICY "Programs: public read" ON support_programs
  FOR SELECT USING (true);

CREATE POLICY "Education: public read" ON education_courses
  FOR SELECT USING (true);

CREATE POLICY "Events: public read" ON farm_events
  FOR SELECT USING (true);

CREATE POLICY "SyncLog: public read" ON data_sync_log
  FOR SELECT USING (true);

-- 서비스 롤만 쓰기 가능 (service_role key 사용)
CREATE POLICY "Programs: service write" ON support_programs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Education: service write" ON education_courses
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Events: service write" ON farm_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "SyncLog: service write" ON data_sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- ==========================================================================
-- 8. 유용한 뷰
-- ==========================================================================

-- 활성 지원사업 뷰 (모집중 + 모집예정)
CREATE OR REPLACE VIEW active_programs AS
SELECT * FROM support_programs
WHERE status IN ('모집중', '모집예정')
  AND link_status != 'broken'
ORDER BY
  CASE status WHEN '모집중' THEN 0 WHEN '모집예정' THEN 1 END,
  application_end ASC;

-- 활성 교육과정 뷰
CREATE OR REPLACE VIEW active_education AS
SELECT * FROM education_courses
WHERE status IN ('모집중', '모집예정')
  AND link_status != 'broken'
ORDER BY
  CASE status WHEN '모집중' THEN 0 WHEN '모집예정' THEN 1 END,
  application_end ASC;

-- 활성 행사 뷰
CREATE OR REPLACE VIEW active_events AS
SELECT * FROM farm_events
WHERE status IN ('접수중', '접수예정')
ORDER BY
  CASE status WHEN '접수중' THEN 0 WHEN '접수예정' THEN 1 END,
  date_start ASC;

-- ==========================================================================
-- 9. 검색 로그 (search_logs) — 인기 검색어 집계용
-- ==========================================================================

CREATE TABLE IF NOT EXISTS search_logs (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  query       TEXT NOT NULL,
  result_count INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 집계 쿼리 성능을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_search_logs_created
  ON search_logs (created_at DESC);

-- RLS 활성화
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- INSERT + SELECT 모두 서비스 롤만 허용
-- 클라이언트는 /api/search-log Route Handler를 통해 서버 사이드 INSERT
CREATE POLICY "SearchLogs: service all" ON search_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ==========================================================================
-- 10. 인기 검색어 집계 함수
-- ==========================================================================

-- 최근 N일간 상위 검색어 반환 (기본 7일, 상위 12개)
CREATE OR REPLACE FUNCTION get_trending_searches(
  days_back INT DEFAULT 7,
  max_results INT DEFAULT 12
)
RETURNS TABLE(query TEXT, search_count BIGINT) AS $$
  SELECT
    lower(trim(sl.query)) AS query,
    count(*) AS search_count
  FROM search_logs sl
  WHERE sl.created_at >= now() - (days_back || ' days')::interval
    AND length(trim(sl.query)) >= 2
  GROUP BY lower(trim(sl.query))
  ORDER BY search_count DESC
  LIMIT max_results;
$$ LANGUAGE sql STABLE;
