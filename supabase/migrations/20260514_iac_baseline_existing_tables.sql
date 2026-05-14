-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: IaC Baseline — search_logs / education_courses / data_sync_log
-- Date: 2026-05-14
-- Description:
--   prod에 이미 존재하는 3개 테이블의 schema를 IaC(supabase/migrations)에
--   소급 등록. 5/14 admin assessments silent fail 사고 후 회장 결재
--   "Supabase IaC 갭 3건 보강" 일환.
--
--   prod DB는 절대 변경하지 않는다. 모든 statement는 `IF NOT EXISTS` 또는
--   `OR REPLACE` 멱등 패턴으로 작성, 첫 apply 시도에서 NOOP가 되어야 함.
--
-- Schema source of truth:
--   - prod row sample 1건 SELECT (REST API)로 컬럼 추론
--   - src/types/supabase.ts (Database.public.Tables) 와 교차 검증
--
-- 검증 (apply 후, 또는 staging clone):
--   - SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_name IN ('search_logs','education_courses','data_sync_log')
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────
-- 1) search_logs
--    검색어 로그. 클라이언트 → /api/search-log → service_role INSERT.
--    RLS 강화는 001_search_logs_rls_hardening.sql 참조.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_logs (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  query        text        NOT NULL,
  result_count integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_created_at
  ON search_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_logs_query
  ON search_logs (query);

ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- 2) education_courses
--    교육 과정 마스터. CRUD는 admin 또는 seed/sync 스크립트가 담당.
--    프론트는 active_education view 우선, 정적 데이터(education.ts) 병합.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education_courses (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text        NOT NULL UNIQUE,
  title             text        NOT NULL,
  region            text        NOT NULL,
  organization      text        NOT NULL,
  type              text        NOT NULL CHECK (type IN ('온라인', '오프라인', '혼합')),
  duration          text        NOT NULL,
  schedule          text        NOT NULL,
  target            text        NOT NULL,
  cost              text        NOT NULL,
  description       text        NOT NULL,
  capacity          integer,
  application_start date        NOT NULL,
  application_end   date        NOT NULL,
  status            text        NOT NULL CHECK (status IN ('모집중', '모집예정', '마감')),
  level             text        NOT NULL CHECK (level IN ('입문', '초급', '중급', '심화')),
  url               text        NOT NULL,
  link_status       text        CHECK (link_status IN ('active', 'broken', 'unverified')),
  is_verified       boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_courses_status
  ON education_courses (status);

CREATE INDEX IF NOT EXISTS idx_education_courses_application_end
  ON education_courses (application_end);

CREATE INDEX IF NOT EXISTS idx_education_courses_region
  ON education_courses (region);

ALTER TABLE education_courses ENABLE ROW LEVEL SECURITY;

-- active_education view (status != '마감')
CREATE OR REPLACE VIEW active_education AS
  SELECT * FROM education_courses
  WHERE status IN ('모집중', '모집예정');

-- ──────────────────────────────────────────────
-- 3) data_sync_log
--    seed/sync 스크립트의 실행 이력. loader.ts에서 최신 sync 시각 조회.
--    INSERT는 service_role(서버 사이드 스크립트)만.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_sync_log (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  source        text        NOT NULL,
  table_name    text        NOT NULL,
  action        text        NOT NULL CHECK (action IN ('insert', 'update', 'delete', 'sync')),
  record_count  integer     NOT NULL DEFAULT 0,
  status        text        NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
  error_message text,
  metadata      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_sync_log_table_name_created
  ON data_sync_log (table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_sync_log_status
  ON data_sync_log (status);

ALTER TABLE data_sync_log ENABLE ROW LEVEL SECURITY;

-- service_role 외에는 접근 불가 (admin 화면도 service_role 경유)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'data_sync_log'
      AND policyname = 'DataSyncLog: service all'
  ) THEN
    CREATE POLICY "DataSyncLog: service all" ON data_sync_log
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'education_courses'
      AND policyname = 'EducationCourses: public read'
  ) THEN
    CREATE POLICY "EducationCourses: public read" ON education_courses
      FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'education_courses'
      AND policyname = 'EducationCourses: service write'
  ) THEN
    CREATE POLICY "EducationCourses: service write" ON education_courses
      FOR ALL USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
