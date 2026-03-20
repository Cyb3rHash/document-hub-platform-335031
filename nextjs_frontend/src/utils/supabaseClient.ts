import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Vite only exposes env vars to the browser when they are prefixed with VITE_.
 *
 * This app previously relied on NEXT_PUBLIC_* (Next.js convention). To preserve compatibility with
 * existing deployments, we support:
 * - VITE_SUPABASE_URL / VITE_SUPABASE_KEY (preferred)
 * - VITE_NEXT_PUBLIC_SUPABASE_URL / VITE_NEXT_PUBLIC_SUPABASE_KEY (legacy-but-still-Vite-exposed)
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_KEY ??
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_KEY ??
  // tolerate older naming that some setups used
  import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the client lazily so builds don't fail in environments without runtime env vars.
// Vite injects import.meta.env at build time, but some CI pipelines may not set them for UI-only builds.
let _client: SupabaseClient | null = null;

// PUBLIC_INTERFACE
export function getSupabaseClient(): SupabaseClient {
  /**
   * Returns a configured Supabase client.
   *
   * Throws a clear error if required VITE_* environment variables are not set.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_KEY in frontend environment (fallbacks: VITE_NEXT_PUBLIC_SUPABASE_URL / VITE_NEXT_PUBLIC_SUPABASE_KEY)."
    );
  }

  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Ensures session is stored (localStorage) and restored on reload.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Recommended for modern SPAs (and required for some OAuth providers).
        flowType: "pkce",
      },
    });
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
