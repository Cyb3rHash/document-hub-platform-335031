import React from "react";
import { AppShell } from "@/components/appShell/AppShell";

// PUBLIC_INTERFACE
export default function AppLayout({ children }: { children: React.ReactNode }) {
  /**
   * Next.js App Router layout for the authenticated application area.
   * This wraps all /app/* routes in the hybrid sidebar + topbar shell.
   */
  return <AppShell pageTitle="DocumentHub">{children}</AppShell>;
}
