import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_KEY;

// Create the client lazily so builds don't fail in environments without runtime env vars.
// Vite injects import.meta.env at build time, but some CI pipelines may not set them for UI-only builds.
let _client: SupabaseClient | null = null;

// PUBLIC_INTERFACE
export function getSupabaseClient(): SupabaseClient {
  /**
   * Returns a configured Supabase client.
   *
   * Throws a clear error if required NEXT_PUBLIC_* environment variables are not set.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_KEY) in frontend environment."
    );
  }

  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Backward-compatible named export used throughout the app.
export const supabase = {
  auth: {
    signInWithPassword: (...args: Parameters<SupabaseClient["auth"]["signInWithPassword"]>) =>
      getSupabaseClient().auth.signInWithPassword(...args),
    signUp: (...args: Parameters<SupabaseClient["auth"]["signUp"]>) => getSupabaseClient().auth.signUp(...args),
  },
};
