const config = {
  plugins: {
    /**
     * Tailwind CSS (v3) PostCSS pipeline.
     * We use v3 here because this environment runs Node 18, and Tailwind v4's
     * native oxide binding requires Node >= 20.
     */
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
