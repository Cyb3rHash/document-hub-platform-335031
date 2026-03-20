import type { Config } from "tailwindcss";

// PUBLIC_INTERFACE
const config: Config = {
  /**
   * Tailwind v4 needs content globs so it can detect class usage and emit utilities.
   * This SPA uses routes/components under src/.
   */
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
