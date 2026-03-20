export const getURL = () => {
  // PUBLIC_INTERFACE
  /**
   * Returns the canonical frontend origin URL used for redirects.
   *
   * Vite requires VITE_* prefixes. We keep a fallback for older Vite-migrated deployments
   * that stored "Next-style" names under VITE_NEXT_PUBLIC_*.
   */
  let url =
    import.meta.env.VITE_FRONTEND_URL ??
    import.meta.env.VITE_NEXT_PUBLIC_FRONTEND_URL ??
    "http://localhost:3000/";

  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};
