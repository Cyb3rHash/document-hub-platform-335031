export const getURL = () => {
  let url =
    import.meta.env.NEXT_PUBLIC_FRONTEND_URL ??
    import.meta.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000/";

  url = url.startsWith("http") ? url : `https://${url}`;
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
};
