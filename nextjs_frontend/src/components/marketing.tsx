"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileShield,
  faMagnifyingGlass,
  faArrowRight,
  faCloudArrowUp,
  faChartLine,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { Badge, Button, Container } from "./ui";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#security", label: "Security" },
  { href: "#pricing", label: "Pricing" },
];

// PUBLIC_INTERFACE
export function MarketingNav() {
  /** Top navigation used on the landing page. */
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-gray-50/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <FontAwesomeIcon
              icon={faFileShield}
              className="h-4 w-4 text-blue-600"
            />
          </span>
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            DocumentHub
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button>
              Get started{" "}
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium text-gray-700 transition hover:text-gray-900"
    >
      <span>{children}</span>
      <motion.span
        layoutId="nav-underline"
        className="absolute -bottom-1 left-0 right-0 h-px origin-left bg-gray-900/50"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />
    </Link>
  );
}

// PUBLIC_INTERFACE
export function MarketingHero() {
  /** Landing page hero section. */
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-[56rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500/15 via-cyan-500/10 to-gray-50 opacity-80 blur-3xl" />
      </div>

      <Container className="relative py-14 md:py-24">
        <div className="grid gap-10 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <Badge className="mb-5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Modern document management for teams
            </Badge>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-balance text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl"
            >
              Securely upload, organize, and share documents—without compromising
              control.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-gray-600 md:text-lg"
            >
              DocumentHub is a Scribd-like platform built for professional
              workflows: granular visibility, fast viewer UX, analytics, and a
              clean dashboard for your content library.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link href="/signup">
                <Button className="w-full sm:w-auto">
                  Create your account{" "}
                  <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Explore features
                </Button>
              </Link>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat label="Upload speed" value="Fast" icon={faCloudArrowUp} />
              <Stat
                label="Search"
                value="Instant"
                icon={faMagnifyingGlass}
              />
              <Stat label="Security" value="RLS-ready" icon={faLock} />
            </div>
          </div>

          <div className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="border-b border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Library overview
                  </p>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    Live
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Visibility, view counts, and status at a glance.
                </p>
              </div>

              <div className="p-5">
                <div className="grid gap-3">
                  {[
                    { title: "Quarterly Report", meta: "Private · Ready" },
                    { title: "Product Brief", meta: "Unlisted · Ready" },
                    { title: "Onboarding Guide", meta: "Public · Processing" },
                  ].map((row) => (
                    <div
                      key={row.title}
                      className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {row.title}
                        </p>
                        <p className="text-xs leading-5 text-gray-600">
                          {row.meta}
                        </p>
                      </div>
                      <div className="flex min-w-[3.5rem] flex-none items-center justify-end gap-2 text-xs text-gray-600">
                        <FontAwesomeIcon
                          icon={faChartLine}
                          className="h-3.5 w-3.5"
                        />
                        <span>1.2k</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 text-white">
                  <p className="text-sm font-semibold">Share confidently</p>
                  <p className="mt-1 text-sm text-white/85">
                    Choose public, unlisted, or private access with optional
                    watermarking.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
}) {
  return (
    <div className="flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-gray-200 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur sm:px-4 sm:py-3">
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-gray-900 text-white">
        <FontAwesomeIcon icon={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-4 text-gray-600">{label}</p>
        <p className="text-sm font-semibold leading-5 text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function MarketingFooter() {
  /** Simple footer for marketing pages. */
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <Container className="py-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
              <FontAwesomeIcon
                icon={faFileShield}
                className="h-4 w-4 text-blue-600"
              />
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">DocumentHub</p>
              <p className="text-xs text-gray-600">
                Secure document sharing and viewing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign in
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/signup"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Create account
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} DocumentHub. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
