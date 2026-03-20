import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Input } from "@/components/ui";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/auth/AuthProvider";

function safeReturnTo(value: string | null): string {
  // Only allow in-app relative paths to avoid open redirects.
  if (!value) return "/app";
  if (!value.startsWith("/")) return "/app";
  if (value.startsWith("//")) return "/app";
  return value;
}

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login page (Supabase email/password). Redirects to /app (or returnTo) after success. */
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initializing } = useAuth();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const returnTo = useMemo(() => safeReturnTo(params.get("returnTo")), [params]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password]);

  useEffect(() => {
    // If the user is already authenticated (e.g., returning to /login), move them to the workspace.
    if (!initializing && user) {
      navigate(returnTo, { replace: true });
    }
  }, [initializing, navigate, returnTo, user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setLoading(true);
    const startedAt = performance.now();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      console.info("[auth] login_success", { elapsedMs: Math.round(performance.now() - startedAt), returnTo });
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to sign in.";
      console.error("[auth] login_failed", { message });
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Welcome back"
      subtitle="Sign in to access your document library, manage visibility, and review engagement signals."
      panelTitle="Sign in securely"
      panelSubtitle="Use your email and password to access your workspace."
      switchHref="/signup"
      switchLabel="Create account"
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
            rightAdornment={<FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={setPassword}
            rightAdornment={<FontAwesomeIcon icon={faLock} className="h-4 w-4" />}
          />
        </div>

        <Button type="submit" disabled={!canSubmit || loading} className="w-full">
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <motion.div
          initial={false}
          animate={{ height: error ? "auto" : 0, opacity: error ? 1 : 0 }}
          className="overflow-hidden"
        >
          {error ? (
            <div className="mt-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </motion.div>

        <p className="text-xs leading-relaxed text-gray-500">After signing in, you’ll be taken to your workspace.</p>
      </form>
    </AuthShell>
  );
}
