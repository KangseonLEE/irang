import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 브라우저(클라이언트) 전용 Supabase 클라이언트.
 * - "use client" 컴포넌트에서 import
 * - 서버 컴포넌트에서는 server.ts를 사용
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
