import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";

// PUBLIC_INTERFACE
export function RequireAuth({ children }: { children: React.ReactNode }) {
  /**
   * Route guard for authenticated areas.
   *
   * Flow name: FrontendRequireAuthFlow
   * Entrypoint: <RequireAuth>
   *
   * Contract:
   * - Inputs: children (protected UI subtree)
   * - Outputs: children when authenticated; otherwise a redirect to /login?returnTo=<path>
   * - Errors: never throws (except for missing provider); does not swallow auth initialization errors
   * - Side effects: navigation redirect only
   */
  const { user, initializing } = useAuth();
  const location = useLocation();

  // During boot, avoid redirect loops while Supabase hydrates session from storage.
  if (initializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-600">
        Loading workspace…
      </div>
    );
  }

  if (!user) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <>{children}</>;
}
