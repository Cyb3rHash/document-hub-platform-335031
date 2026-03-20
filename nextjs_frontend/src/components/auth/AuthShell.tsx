import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileShield,
  faShieldHalved,
  faChartLine,
  faMagnifyingGlass,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Container } from "../ui";

type Side = "left" | "right";

// PUBLIC_INTERFACE
export function AuthShell({
  mode,
  title,
  subtitle,
  panelTitle,
  panelSubtitle,
  children,
  switchHref,
  switchLabel,
}: {
  /** Which auth mode is active (affects which panel is emphasized). */
  mode: "login" | "signup";
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle: string;
  /** Right/left panel title */
  panelTitle: string;
  /** Right/left panel subtitle */
  panelSubtitle: string;
  /** Main form content */
  children: React.ReactNode;
  /** Link to switch page */
  switchHref: string;
  /** Link label to switch page */
  switchLabel: string;
}) {
  /** Two-panel enterprise auth layout with animated accent panel. */
  const accentSide: Side = mode === "login" ? "left" : "right";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
        <div className="mx-auto h-72 w-[60rem] max-w-[95vw] rounded-full bg-gradient-to-r from-blue-500/12 via-cyan-500/8 to-gray-50 opacity-90 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/70 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white shadow-sm">
              <FontAwesomeIcon icon={faFileShield} className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-gray-900">DocumentHub</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={switchHref}>
              <Button variant="ghost" className="px-3 sm:px-4">
                {switchLabel}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="secondary" className="hidden sm:inline-flex">
                Back to site
              </Button>
            </Link>
          </div>
        </Container>
      </header>

      <Container className="py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7"
            >
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm lg:max-h-[calc(100vh-8.5rem)]">
              <motion.div
                className="absolute inset-y-0 w-full bg-gradient-to-br from-gray-900 via-gray-900 to-blue-700"
                initial={false}
                animate={{
                  clipPath:
                    accentSide === "left"
                      ? "polygon(0% 0%, 62% 0%, 44% 100%, 0% 100%)"
                      : "polygon(56% 0%, 100% 0%, 100% 100%, 38% 100%)",
                }}
                transition={{ type: "spring", stiffness: 70, damping: 18 }}
              />

              <div className="relative max-h-full overflow-auto">
                <div className="grid gap-6 p-7 md:grid-cols-2 md:p-10">
                  <Panel
                    side="left"
                    active={accentSide === "left"}
                    title={mode === "login" ? panelTitle : "Already have an account?"}
                    subtitle={mode === "login" ? panelSubtitle : "Sign in to manage your library and track engagement."}
                    ctaHref={mode === "login" ? "/signup" : "/login"}
                    ctaLabel={mode === "login" ? "Create account" : "Sign in"}
                  />
                  <Panel
                    side="right"
                    active={accentSide === "right"}
                    title={mode === "signup" ? panelTitle : "New to DocumentHub?"}
                    subtitle={mode === "signup" ? panelSubtitle : "Create an account to start uploading and sharing securely."}
                    ctaHref={mode === "signup" ? "/login" : "/signup"}
                    ctaLabel={mode === "signup" ? "Sign in" : "Create account"}
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-500 sm:hidden">
              Use the header actions to switch modes or return to the site.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}

function Panel({
  side,
  active,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: {
  side: Side;
  active: boolean;
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className={["relative rounded-2xl p-6 md:p-7", active ? "text-white" : "text-gray-900"].join(" ")}>
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0.88, y: active ? 0 : 4 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        <p className={["mt-2 text-sm leading-relaxed", active ? "text-white/80" : "text-gray-600"].join(" ")}>
          {subtitle}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <MiniPill active={active} icon={faShieldHalved} label="Access control" />
          <MiniPill active={active} icon={faMagnifyingGlass} label="Searchable" />
          <MiniPill active={active} icon={faChartLine} label="Analytics" />
        </div>

        <div className="mt-8">
          <Link to={ctaHref}>
            <Button
              variant={active ? "secondary" : "primary"}
              className={active ? "bg-white text-gray-900 hover:bg-gray-50" : undefined}
            >
              {ctaLabel} <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {!active ? <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gray-50/25" /> : null}
      <span className="sr-only">{side}</span>
    </div>
  );
}

function MiniPill({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
  label: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1",
        active ? "bg-white/10 text-white ring-white/20" : "bg-white text-gray-700 ring-gray-200",
      ].join(" ")}
    >
      <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
