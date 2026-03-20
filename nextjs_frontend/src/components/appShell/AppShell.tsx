import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faHouse,
  faCompass,
  faCloudArrowUp,
  faFileLines,
  faGear,
  faShieldHalved,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/components/ui";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: Parameters<typeof FontAwesomeIcon>[0]["icon"];
  section: "main" | "manage";
};

// PUBLIC_INTERFACE
export function AppShell({
  children,
  pageTitle,
}: {
  /** Page content rendered inside the shell. */
  children: React.ReactNode;
  /** Optional page title (used for topbar on small screens). */
  pageTitle?: string;
}) {
  /**
   * Hybrid SaaS layout:
   * - Left sidebar (collapsible on desktop, overlay drawer on mobile)
   * - Topbar with search placeholder + user menu stub
   * - Main content uses nested scroll area: sidebar and main scroll independently
   */
  const location = useLocation();
  const pathname = location.pathname;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = useMemo(
    () => [
      { key: "dashboard", label: "Dashboard", href: "/app", icon: faHouse, section: "main" },
      { key: "explore", label: "Explore", href: "/app/explore", icon: faCompass, section: "main" },
      { key: "upload", label: "Upload", href: "/app/upload", icon: faCloudArrowUp, section: "main" },
      { key: "viewer", label: "Viewer", href: "/app/viewer", icon: faFileLines, section: "main" },
      { key: "admin", label: "Admin", href: "/app/admin", icon: faGear, section: "manage" },
    ],
    []
  );

  const activeHref = useMemo(() => {
    const exact = navItems.find((i) => i.href === pathname)?.href;
    if (exact) return exact;
    const nested = navItems.filter((i) => i.href !== "/app").find((i) => pathname.startsWith(i.href));
    if (nested) return nested.href;
    return "/app";
  }, [navItems, pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden md:flex md:flex-col md:border-r md:border-gray-200/80 md:bg-white",
            "md:sticky md:top-0 md:h-screen"
          )}
          style={{ width: collapsed ? 76 : 272 }}
        >
          <div className="flex h-16 items-center justify-between gap-3 border-b border-gray-100 px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white">
                <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
              </span>
              {!collapsed ? (
                <span className="text-sm font-semibold tracking-tight text-gray-900">DocumentHub</span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-xl text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-auto px-2 py-3" aria-label="Sidebar">
            <NavSection
              label="Workspace"
              collapsed={collapsed}
              items={navItems.filter((i) => i.section === "main")}
              activeHref={activeHref}
            />
            <div className="my-3 h-px bg-gray-200/70" />
            <NavSection
              label="Management"
              collapsed={collapsed}
              items={navItems.filter((i) => i.section === "manage")}
              activeHref={activeHref}
            />
          </nav>

          <div className="border-t border-gray-100 p-3">
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition",
                "hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              )}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                <FontAwesomeIcon icon={faArrowRightFromBracket} className="h-4 w-4" />
              </span>
              {!collapsed ? <span>Sign out</span> : null}
            </button>
          </div>
        </aside>

        {/* Mobile overlay sidebar */}
        <AnimatePresence>
          {mobileOpen ? (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-[1px] md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-[18rem] bg-white shadow-xl md:hidden"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                aria-label="Mobile sidebar"
              >
                <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
                  <Link to="/" className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white">
                      <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-semibold tracking-tight text-gray-900">DocumentHub</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-xl text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    aria-label="Close sidebar"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                  </button>
                </div>

                <nav className="h-[calc(100vh-4rem)] overflow-auto px-2 py-3">
                  <NavSection
                    label="Workspace"
                    collapsed={false}
                    items={navItems.filter((i) => i.section === "main")}
                    activeHref={activeHref}
                  />
                  <div className="my-3 h-px bg-gray-200/70" />
                  <NavSection
                    label="Management"
                    collapsed={false}
                    items={navItems.filter((i) => i.section === "manage")}
                    activeHref={activeHref}
                  />
                </nav>
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar pageTitle={pageTitle} onOpenMobile={() => setMobileOpen(true)} />

          {/* Main scroll area */}
          <main className="min-w-0 flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-[88rem] px-4 py-6 sm:px-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Topbar({ pageTitle, onOpenMobile }: { pageTitle?: string; onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="grid h-10 w-10 place-items-center rounded-xl text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 md:hidden"
            aria-label="Open sidebar"
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-gray-900">
              {pageTitle ?? "Workspace"}
            </p>
            <p className="hidden text-xs text-gray-500 sm:block">Enterprise-ready document operations</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
          <div className="hidden w-full max-w-md items-center sm:flex">
            <div className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 shadow-sm">
              Search documents, owners, tags
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50"
          >
            Back to site
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="h-3.5 w-3.5 text-gray-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavSection({
  label,
  collapsed,
  items,
  activeHref,
}: {
  label: string;
  collapsed: boolean;
  items: Array<{ href: string; icon: NavItem["icon"]; label: string }>;
  activeHref: string;
}) {
  return (
    <div className="px-1">
      {!collapsed ? (
        <p className="px-3 pb-2 pt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
      ) : null}
      <ul className="grid gap-1">
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-xl ring-1 transition",
                    active
                      ? "bg-white text-blue-700 ring-blue-100"
                      : "bg-white text-gray-600 ring-gray-200 group-hover:bg-gray-50"
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                </span>
                {!collapsed ? <span className="truncate">{item.label}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
