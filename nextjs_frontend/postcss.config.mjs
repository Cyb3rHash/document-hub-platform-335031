const config = {
  plugins: {
    /**
     * Tailwind is intentionally disabled here to avoid Tailwind v4's PostCSS plugin
     * requirements (and native optional dependency issues) in this environment.
     *
     * The app's styling is handled via plain CSS (see src/styles/globals.css).
     */
    autoprefixer: {},
  },
};

export default config;
