import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite configuration for the DocumentHub React SPA. */
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Cloud dev environments often require binding to 0.0.0.0
    host: true,
    port: Number(process.env.NEXT_PUBLIC_PORT || 3000),
    strictPort: false,
    /**
     * Allow Kavia preview hostnames through Vite's host check.
     * - Exact host included for current environment
     * - Subdomain wildcard for cloud.kavia.ai to avoid future host-block issues
     */
    allowedHosts: [
      "vscode-internal-18441-beta.beta01.cloud.kavia.ai",
      ".cloud.kavia.ai",
    ],
  },
  preview: {
    host: true,
    port: Number(process.env.NEXT_PUBLIC_PORT || 3000),
    strictPort: false,
    // Keep preview behavior consistent with dev server host allowlist.
    allowedHosts: [
      "vscode-internal-18441-beta.beta01.cloud.kavia.ai",
      ".cloud.kavia.ai",
    ],
  },
});
