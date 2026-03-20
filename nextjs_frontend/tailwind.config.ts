import type { Config } from "tailwindcss";

// PUBLIC_INTERFACE
const config: Config = {
  /**
   * Tailwind v4 still needs content globs so it can detect class usage and
   * generate the corresponding utility CSS. Without this, the app will look
   * unstyled because almost no utilities are emitted.
   */
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
