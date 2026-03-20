import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";

export default [
  // Ignore generated output and vendored folders that can exist from the previous Next.js build.
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/.vercel/**"
    ],
  },

  js.configs.recommended,

  // App source: TS/TSX + browser globals
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        location: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly"
      }
    },
    rules: {
      // This project is TS-first; TS handles unused locals better than base rule.
      "no-unused-vars": "off",
      // Make sure JSX variables aren't incorrectly flagged in React 17+ transform.
      "no-undef": "off"
    }
  },

  // Tooling/config files: Node globals
  {
    files: ["*.config.{js,mjs,ts}", "vite.config.ts", "tailwind.config.ts", "postcss.config.mjs"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        process: "readonly",
        __dirname: "readonly",
        Buffer: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off"
    }
  }
];
