import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "@/routes/LandingPage";
import LoginPage from "@/routes/LoginPage";
import SignupPage from "@/routes/SignupPage";
import AppLayout from "@/routes/app/AppLayout";
import DashboardPage from "@/routes/app/DashboardPage";
import ExplorePage from "@/routes/app/ExplorePage";
import UploadPage from "@/routes/app/UploadPage";
import ViewerPage from "@/routes/app/ViewerPage";
import AdminPage from "@/routes/app/AdminPage";
import NotFoundPage from "@/routes/NotFoundPage";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22 }}
      className="min-w-0"
    >
      {children}
    </motion.div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root SPA router with animated transitions between pages. */
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <SignupPage />
            </PageTransition>
          }
        />

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="viewer" element={<ViewerPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
