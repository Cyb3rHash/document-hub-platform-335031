import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppShell } from "@/components/appShell/AppShell";

function titleForPath(pathname: string): string {
  if (pathname === "/app") return "Dashboard";
  if (pathname.startsWith("/app/explore")) return "Explore";
  if (pathname.startsWith("/app/upload")) return "Upload";
  if (pathname.startsWith("/app/viewer")) return "Viewer";
  if (pathname.startsWith("/app/admin")) return "Admin";
  return "Workspace";
}

// PUBLIC_INTERFACE
export default function AppLayout() {
  /** Layout for the authenticated application area (/app/*). */
  const location = useLocation();
  return (
    <AppShell pageTitle={titleForPath(location.pathname)}>
      <Outlet />
    </AppShell>
  );
}
