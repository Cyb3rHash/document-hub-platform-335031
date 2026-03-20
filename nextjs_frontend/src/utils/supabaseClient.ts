import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// In `output: "export"` mode, Next.js will prerender pages at build time. If we
// throw on import, builds will fail in environments where the frontend env vars
// are not configured (common in CI for UI-only tasks).
//
// We therefore create the client lazily and throw only when an auth action is
// actually invoked (at runtime).
let _client: SupabaseClient | null = null;

// PUBLIC_INTERFACE
export function getSupabaseClient(): SupabaseClient {
  /**
   * Returns a configured Supabase client.
   *
   * Throws a clear error if required NEXT_PUBLIC_* environment variables are not set.
   * This is intentionally deferred to runtime to avoid breaking static export builds.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in frontend environment."
    );
  }

  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

// Backward-compatible named export used throughout the app.
// Note: this may be `null` until first access via `getSupabaseClient()`.
export const supabase = {
  auth: {
    signInWithPassword: (...args: Parameters<SupabaseClient["auth"]["signInWithPassword"]>) =>
      getSupabaseClient().auth.signInWithPassword(...args),
    signUp: (...args: Parameters<SupabaseClient["auth"]["signUp"]>) =>
      getSupabaseClient().auth.signUp(...args),
  },
};
