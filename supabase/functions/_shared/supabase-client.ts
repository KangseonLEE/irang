/**
 * Edge Function용 Supabase Service Role 클라이언트
 * - Deno 런타임에서 실행
 * - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY는 Supabase가 자동 주입
 */

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
}
