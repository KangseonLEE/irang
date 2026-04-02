import { createClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트.
 * - Server Components, Route Handlers, Server Actions에서 사용
 * - 요청마다 새 인스턴스 생성 (싱글턴 아님)
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseAnonKey);
}
