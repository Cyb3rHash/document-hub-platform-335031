import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vite middleware plugin that ensures Vite internal client modules are served with
 * a JavaScript MIME type.
 *
 * Chromium browsers can refuse to execute `<script type="module">` responses when
 * `Content-Type` is `text/html`, even if the body is valid JS. In this environment
 * we observed `/@vite/client` and `/@react-refresh` being served as `text/html`,
 * which can cause the preview to appear "blocked" or blank in Chrome/Brave.
 */
function fixViteClientMimeTypes() {
  return {
    name: "fix-vite-client-mime-types",
    apply: "serve",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url: string = req?.url || "";

        // Vite's special dev endpoints that must be treated as ESM JS.
        // (They are imported via <script type="module" src="/@vite/client">, etc.)
        const isViteInternalClient =
          url === "/@vite/client" ||
          url.startsWith("/@vite/client?") ||
          url === "/@react-refresh" ||
          url.startsWith("/@react-refresh?");

        if (isViteInternalClient) {
          // Force a JS MIME type. Use text/javascript for broad compatibility.
          // (application/javascript would also work; keep consistent with other served modules.)
          res.setHeader("Content-Type", "text/javascript; charset=utf-8");
          // Avoid sniffing-related surprises in Chromium.
          res.setHeader("X-Content-Type-Options", "nosniff");
        }

        next();
      });
    },
  };
}

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite configuration for the DocumentHub React SPA. */
  plugins: [fixViteClientMimeTypes(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Cloud dev environments often require binding to 0.0.0.0
    host: true,
    port: Number(process.env.VITE_PORT || process.env.NEXT_PUBLIC_PORT || 3000),
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
