/**
 * Supabase Database 타입 정의
 * - supabase/schema.sql 과 동기화
 * - 추후 `supabase gen types typescript` 로 자동 생성 가능
 */

export interface Database {
  public: {
    Tables: {
      support_programs: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          region: string;
          organization: string;
          support_type: "보조금" | "융자" | "교육" | "현물" | "컨설팅";
          support_amount: string;
          eligibility_age_min: number;
          eligibility_age_max: number;
          eligibility_detail: string;
          application_start: string;
          application_end: string;
          status: "모집중" | "모집예정" | "마감";
          related_crops: string[];
          source_url: string;
          link_status: "active" | "broken" | "unverified" | null;
          year: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["support_programs"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["support_programs"]["Insert"]
        >;
      };
      education_courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          region: string;
          organization: string;
          type: "온라인" | "오프라인" | "혼합";
          duration: string;
          schedule: string;
          target: string;
          cost: string;
          description: string;
          capacity: number | null;
          application_start: string;
          application_end: string;
          status: "모집중" | "모집예정" | "마감";
          level: "입문" | "초급" | "중급" | "심화";
          url: string;
          link_status: "active" | "broken" | "unverified" | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["education_courses"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["education_courses"]["Insert"]
        >;
      };
      farm_events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          region: string;
          organization: string;
          type: "일일체험" | "팜스테이" | "박람회" | "설명회" | "멘토링" | "축제";
          date_start: string;
          date_end: string | null;
          location: string;
          cost: string;
          description: string;
          capacity: number | null;
          target: string;
          url: string;
          status: "접수중" | "접수예정" | "마감";
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["farm_events"]["Row"],
          "id" | "created_at" | "updated_at"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["farm_events"]["Insert"]
        >;
      };
      data_sync_log: {
        Row: {
          id: string;
          source: string;
          table_name: string;
          action: "insert" | "update" | "delete" | "sync";
          record_count: number;
          status: "success" | "failed" | "partial";
          error_message: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["data_sync_log"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["data_sync_log"]["Insert"]
        >;
      };
    };
    Views: {
      active_programs: {
        Row: Database["public"]["Tables"]["support_programs"]["Row"];
      };
      active_education: {
        Row: Database["public"]["Tables"]["education_courses"]["Row"];
      };
      active_events: {
        Row: Database["public"]["Tables"]["farm_events"]["Row"];
      };
    };
  };
}
