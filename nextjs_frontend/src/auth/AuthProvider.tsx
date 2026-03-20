import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/utils/supabaseClient";

type AuthState = {
  session: Session | null;
  user: User | null;
  initializing: boolean;
};

type AuthContextValue = AuthState & {
  // PUBLIC_INTERFACE
  refreshSession: () => Promise<void>;
  // PUBLIC_INTERFACE
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }: { children: React.ReactNode }) {
  /**
   * Provides a canonical, app-wide Supabase auth state for the SPA.
   *
   * Flow name: FrontendAuthSessionFlow
   * Canonical entrypoint: <AuthProvider>
   *
   * Contract:
   * - Inputs: React children.
   * - Outputs: Context containing {session, user, initializing} and actions.
   * - Errors: Never throws during render; logs auth errors and keeps state as unauthenticated.
   * - Side effects:
   *   - Reads initial session from Supabase local storage via supabase.auth.getSession()
   *   - Subscribes to auth changes via supabase.auth.onAuthStateChange()
   *
   * Invariants:
   * - initializing=true until the initial getSession() completes
   * - if session is non-null then user is non-null (Supabase invariant)
   */
  const [state, setState] = useState<AuthState>({ session: null, user: null, initializing: true });

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    async function init() {
      const startedAt = performance.now();
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;

        setState({
          session: data.session ?? null,
          user: data.session?.user ?? null,
          initializing: false,
        });

        console.info("[auth] init_session", {
          hasSession: Boolean(data.session),
          elapsedMs: Math.round(performance.now() - startedAt),
        });
      } catch (e: unknown) {
        if (!mounted) return;

        const message =
          typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Unknown error";
        console.error("[auth] init_session_failed", { message });

        setState({ session: null, user: null, initializing: false });
      }
    }

    void init();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      console.info("[auth] state_change", { event, hasSession: Boolean(session) });
      setState({ session: session ?? null, user: session?.user ?? null, initializing: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      ...state,
      refreshSession: async () => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[auth] refresh_session_failed", { message: error.message });
          return;
        }
        setState({ session: data.session ?? null, user: data.session?.user ?? null, initializing: false });
      },
      signOut: async () => {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[auth] sign_out_failed", { message: error.message });
          throw error;
        }
      },
    };
  }, [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /**
   * Hook to access the current authenticated session/user state.
   *
   * Throws if used outside <AuthProvider>.
   */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
