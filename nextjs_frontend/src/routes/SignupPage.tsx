import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Input } from "@/components/ui";
import { supabase } from "@/utils/supabaseClient";
import { getURL } from "@/utils/getURL";

// PUBLIC_INTERFACE
export default function SignupPage() {
  /** Signup page (Supabase email/password). */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return fullName.trim().length >= 2 && email.trim().length > 3 && password.length >= 6;
  }, [fullName, email, password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!canSubmit) return;

    setLoading(true);
    try {
      // For email confirmation flows, redirect back to the site URL.
      const redirectTo = getURL();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectTo,
        },
      });

      if (signUpError) throw signUpError;

      setSuccess("Account created. If email confirmation is enabled, check your inbox to verify your address.");
    } catch (err: unknown) {
      const message =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to create account.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      mode="signup"
      title="Create your account"
      subtitle="Set up your workspace to upload documents, manage sharing modes, and track engagement."
      panelTitle="Build your library"
      panelSubtitle="Organize documents with clear visibility settings and professional presentation."
      switchHref="/login"
      switchLabel="Sign in"
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-4">
          <Input
            label="Full name"
            name="fullName"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            required
            value={fullName}
            onChange={setFullName}
            rightAdornment={<FontAwesomeIcon icon={faUser} className="h-4 w-4" />}
          />

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
              Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>

        <motion.div
          initial={false}
          animate={{ height: error || success ? "auto" : 0, opacity: error || success ? 1 : 0 }}
          className="overflow-hidden"
        >
          {error ? (
            <div className="mt-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="mt-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}
        </motion.div>

        <p className="text-xs leading-relaxed text-gray-500">
          By creating an account, you agree to your organization’s policies for document handling and sharing.
        </p>
      </form>
    </AuthShell>
  );
}
