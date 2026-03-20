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
  },
  preview: {
    host: true,
    port: Number(process.env.NEXT_PUBLIC_PORT || 3000),
    strictPort: false,
  },
});
