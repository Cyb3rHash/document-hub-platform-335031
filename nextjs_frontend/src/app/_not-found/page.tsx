import NotFound from "../not-found";

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** 
   * Next.js App Router internal not-found entrypoint.
   *
   * Some Next.js versions/build modes (notably `output: "export"`) expect an
   * internal `/_not-found` route module to exist during static generation.
   * We delegate to the canonical `app/not-found.tsx` UI so behavior stays
   * consistent and we avoid duplicating markup.
   */
  return <NotFound />;
}
