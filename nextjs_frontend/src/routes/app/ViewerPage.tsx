import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight,
  faUpRightFromSquare,
  faDownload,
  faSpinner,
  faTriangleExclamation,
  faRotateRight,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
} from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";
import { useDocuments, useDocument } from "@/hooks/documents";
import { documentHubApi } from "@/api/documentHubApi";

import * as pdfjsLib from "pdfjs-dist";

// pdfjs-dist worker configuration for Vite.
// Using `new URL(..., import.meta.url)` is the recommended approach in bundlers.
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

function useQueryParam(name: string): string | null {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search).get(name), [location.search, name]);
}

type ViewerMode = "pdf" | "iframe" | "none";

/**
 * Best-effort mime inference:
 * - Backend returns mime_type on document rows, but frontend types may not yet include it.
 * - We fall back to filename extension in storage_path/original_filename when available.
 */
function inferIsPdf(input: { mime_type?: unknown; original_filename?: unknown; storage_path?: unknown }): boolean {
  const mime = typeof input.mime_type === "string" ? input.mime_type : "";
  if (mime.toLowerCase().includes("application/pdf")) return true;

  const filename = typeof input.original_filename === "string" ? input.original_filename : "";
  const path = typeof input.storage_path === "string" ? input.storage_path : "";
  const guess = (filename || path).toLowerCase();
  return guess.endsWith(".pdf");
}

/**
 * Many storage backends attach `Content-Disposition: attachment` to signed URLs, which forces download in a new tab.
 * For preview, we do a best-effort fetch->Blob->blob: URL and open that, which usually favors inline display.
 *
 * If the fetch is blocked by CORS (common), we fall back to opening the signed URL directly.
 */
async function openSignedUrlInline(url: string, title?: string): Promise<void> {
  try {
    const res = await fetch(url, { method: "GET", credentials: "omit" });
    if (!res.ok) throw new Error(`Failed to fetch file: HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Note: a blob URL isn't subject to the origin server's Content-Disposition, so browsers generally render inline when supported.
    window.open(blobUrl, "_blank", "noopener,noreferrer");

    // Revoke eventually to avoid memory leaks, but keep it alive long enough for the new tab to load.
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    // Fallback: open the signed URL directly (may still download depending on server headers).
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

type PdfState =
  | { kind: "idle" }
  | { kind: "loading"; url: string }
  | { kind: "ready"; url: string; pdf: pdfjsLib.PDFDocumentProxy; pageCount: number }
  | { kind: "error"; url?: string; message: string };

// PUBLIC_INTERFACE
export default function ViewerPage() {
  /** Viewer page connected to backend document read and signed-url endpoints, rendering PDFs via PDF.js. */
  const initialId = useQueryParam("id");

  const [search, setSearch] = useState("");
  const listQuery = useDocuments({ q: search, visibility: "all", status: "all" });
  const docs = listQuery.data?.items ?? [];

  const [activeId, setActiveId] = useState<string | null>(() => initialId ?? docs[0]?.id ?? null);

  // Keep active selection stable when list loads.
  React.useEffect(() => {
    if (!activeId && docs[0]?.id) setActiveId(docs[0].id);
  }, [activeId, docs]);

  const detailQuery = useDocument(activeId);

  const activeTitle = detailQuery.data?.title ?? (activeId ? "Loading…" : "No document selected");

  // IMPORTANT: DocumentDetail types in frontend are narrower than backend rows.
  // We treat extra fields (mime_type, original_filename) as best-effort.
  const detailAny = (detailQuery.data ?? {}) as unknown as Record<string, unknown>;
  const activeVisibility = (detailAny.visibility as string | undefined) ?? undefined;
  const isPdf = inferIsPdf({
    mime_type: detailAny.mime_type,
    original_filename: detailAny.original_filename,
    storage_path: detailAny.storage_path,
  });

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [signedUrlLoading, setSignedUrlLoading] = useState(false);
  const [signedUrlError, setSignedUrlError] = useState<string | null>(null);

  const [viewerMode, setViewerMode] = useState<ViewerMode>("none");

  // PDF viewer state.
  const [pdfState, setPdfState] = useState<PdfState>({ kind: "idle" });
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  async function openInNewTab() {
    if (!activeId) return;
    const { url } = await documentHubApi.getDocumentViewUrl(activeId);

    // Prefer inline display when possible (blob URL), but gracefully fall back.
    await openSignedUrlInline(url, activeTitle);
  }

  async function download() {
    if (!activeId) return;
    const { url } = await documentHubApi.getDocumentViewUrl(activeId);

    // Explicit download action: use the backend-provided signed URL directly.
    // If backend/storage sets Content-Disposition: attachment, this will download.
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function refreshSignedUrl() {
    if (!activeId) return;

    setSignedUrlLoading(true);
    setSignedUrlError(null);

    try {
      const res = await documentHubApi.getDocumentViewUrl(activeId, 900);
      setSignedUrl(res.url);
      setViewerMode(isPdf ? "pdf" : "iframe");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load signed URL.";
      setSignedUrl(null);
      setViewerMode("none");
      setSignedUrlError(msg);
    } finally {
      setSignedUrlLoading(false);
    }
  }

  // When the active document changes, fetch a fresh signed URL and reset viewer state.
  React.useEffect(() => {
    setSignedUrl(null);
    setSignedUrlError(null);
    setViewerMode("none");

    setPdfState({ kind: "idle" });
    setPageNumber(1);
    setZoom(1.0);

    if (!activeId) return;

    // Fire and forget; state updates are handled inside.
    void refreshSignedUrl();
  }, [activeId]);

  // Load PDF document when we have a signed URL AND the doc is inferred to be a PDF.
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!signedUrl || !activeId) return;
      if (!isPdf) return;

      setPdfState({ kind: "loading", url: signedUrl });

      try {
        // pdf.js can load via URL directly; for signed URLs this is typical.
        const task = pdfjsLib.getDocument({
          url: signedUrl,
          // With signed URLs we should not send any extra credentials.
          withCredentials: false,
        });

        const pdf = await task.promise;
        if (cancelled) return;

        setPdfState({ kind: "ready", url: signedUrl, pdf, pageCount: pdf.numPages });
        setPageNumber(1);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load PDF.";
        setPdfState({ kind: "error", url: signedUrl, message });
        // Fallback to iframe mode if PDF.js fails (e.g., CORS issue, blocked worker, etc.)
        setViewerMode("iframe");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [signedUrl, activeId, isPdf]);

  // Render the current PDF page to canvas when ready / page changes / zoom changes.
  React.useEffect(() => {
    let cancelled = false;

    async function render() {
      if (viewerMode !== "pdf") return;
      if (pdfState.kind !== "ready") return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Cancel any in-flight render (user clicked quickly).
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        renderTaskRef.current = null;
      }

      try {
        const page = await pdfState.pdf.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: zoom });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set physical pixel size for crisp rendering.
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const task = page.render({ canvasContext: ctx, viewport, transform });
        renderTaskRef.current = task;
        await task.promise;

        renderTaskRef.current = null;
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to render page.";
        setPdfState({ kind: "error", url: signedUrl ?? undefined, message });
        setViewerMode("iframe");
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [viewerMode, pdfState, pageNumber, zoom, signedUrl]);

  const canPrev = pdfState.kind === "ready" ? pageNumber > 1 : false;
  const canNext = pdfState.kind === "ready" ? pageNumber < pdfState.pageCount : false;

  function goPrev() {
    if (!canPrev) return;
    setPageNumber((p) => Math.max(1, p - 1));
  }

  function goNext() {
    if (!canNext) return;
    if (pdfState.kind !== "ready") return;
    setPageNumber((p) => Math.min(pdfState.pageCount, p + 1));
  }

  function zoomIn() {
    setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10));
  }

  function zoomOut() {
    setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));
  }

  const mixedContentRisk = useMemo(() => {
    try {
      const frontendProto = window.location.protocol;
      const apiBase =
        import.meta.env.VITE_API_BASE ??
        import.meta.env.VITE_BACKEND_URL ??
        import.meta.env.VITE_NEXT_PUBLIC_API_BASE ??
        import.meta.env.VITE_NEXT_PUBLIC_BACKEND_URL ??
        "";

      // If api base is blank, requests are same-origin and generally safe from mixed content rules.
      if (!apiBase) return false;

      const apiProto = new URL(apiBase).protocol;
      return frontendProto === "https:" && apiProto === "http:";
    } catch {
      return false;
    }
  }, []);

  return (
    <div className="grid gap-6">
      {mixedContentRisk ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Potential mixed content configuration</p>
          <p className="mt-1 text-amber-900/80">
            This page is loaded over HTTPS, but the API base URL appears to be HTTP. Brave (and other browsers) will block
            those requests, which can make the preview appear “blocked”. Update VITE_API_BASE / VITE_BACKEND_URL to an
            HTTPS URL.
          </p>
        </div>
      ) : null}
      <PageHeader
        title="Viewer"
        subtitle="Review documents with access-aware controls and backend-provided signed URLs."
        actions={
          <>
            <Button variant="secondary" onClick={() => void openInNewTab()} disabled={!activeId || signedUrlLoading}>
              <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4 w-4" />
              Open in new tab
            </Button>
            <Button variant="secondary" onClick={() => void download()} disabled={!activeId || signedUrlLoading}>
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
              Download
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader
            title="Library"
            subtitle={
              listQuery.loading
                ? "Loading documents…"
                : listQuery.error
                  ? "Unable to load documents."
                  : "Select a document to view."
            }
          />
          <CardBody className="grid gap-3">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search within library"
                  className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="max-h-[28rem] overflow-auto pr-1">
              <div className="grid gap-2">
                {docs.map((d) => {
                  const activeRow = d.id === activeId;
                  const visLabel = d.visibility ?? "private";
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setActiveId(d.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                        activeRow ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "grid h-10 w-10 flex-none place-items-center rounded-2xl ring-1",
                            activeRow ? "bg-white text-blue-700 ring-blue-100" : "bg-white text-gray-700 ring-gray-200"
                          )}
                        >
                          <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{d.title ?? "Untitled"}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{visLabel}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{d.status ?? "—"}</span>
                    </button>
                  );
                })}

                {docs.length === 0 && !listQuery.loading ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                    No documents yet. Upload one to start viewing.
                  </div>
                ) : null}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-8 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{activeTitle}</p>
                <p className="text-xs text-gray-500">
                  {detailQuery.loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-3.5 w-3.5" />
                      Loading metadata…
                    </>
                  ) : (
                    `Visibility: ${activeVisibility ?? "—"}`
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  className="px-3 py-2"
                  onClick={() => void refreshSignedUrl()}
                  disabled={!activeId || signedUrlLoading}
                >
                  <FontAwesomeIcon icon={signedUrlLoading ? faSpinner : faRotateRight} spin={signedUrlLoading} className="h-3.5 w-3.5" />
                  Refresh URL
                </Button>

                <Button
                  variant="ghost"
                  className="px-3 py-2"
                  onClick={goPrev}
                  disabled={!activeId || signedUrlLoading || viewerMode !== "pdf" || !canPrev}
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
                  Prev
                </Button>
                <Button
                  variant="ghost"
                  className="px-3 py-2"
                  onClick={goNext}
                  disabled={!activeId || signedUrlLoading || viewerMode !== "pdf" || !canNext}
                >
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  className="px-3 py-2"
                  onClick={zoomOut}
                  disabled={!activeId || signedUrlLoading || viewerMode !== "pdf" || pdfState.kind !== "ready"}
                  title="Zoom out"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  className="px-3 py-2"
                  onClick={zoomIn}
                  disabled={!activeId || signedUrlLoading || viewerMode !== "pdf" || pdfState.kind !== "ready"}
                  title="Zoom in"
                >
                  <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                {viewerMode === "pdf" ? (
                  <span>
                    Page{" "}
                    <span className="font-semibold text-gray-700">
                      {pdfState.kind === "ready" ? pageNumber : "—"}
                    </span>
                    {pdfState.kind === "ready" ? ` / ${pdfState.pageCount}` : ""}
                    {" · "}Zoom <span className="font-semibold text-gray-700">{Math.round(zoom * 100)}%</span>
                  </span>
                ) : viewerMode === "iframe" ? (
                  <span>Embedded preview (fallback mode)</span>
                ) : (
                  <span>Select a document to view.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5",
                    isPdf ? "border-blue-100 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"
                  )}
                >
                  {isPdf ? "PDF" : "Non-PDF"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[28rem] overflow-auto bg-gray-50 p-6 sm:h-[34rem]">
            <motion.div
              key={activeId ?? "none"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="mx-auto grid max-w-4xl"
            >
              {!activeId ? (
                <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">No document selected</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">Choose a document from the library to start viewing.</p>
                  </div>
                </div>
              ) : signedUrlError ? (
                <div className="rounded-2xl border border-red-200 bg-white px-6 py-10 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">Unable to load document URL</p>
                      <p className="mt-1 text-sm text-gray-600">{signedUrlError}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => void refreshSignedUrl()} disabled={signedUrlLoading}>
                          <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
                          Try again
                        </Button>
                        <Button variant="secondary" onClick={() => void openInNewTab()} disabled={!activeId}>
                          <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4 w-4" />
                          Open in new tab
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : signedUrlLoading && !signedUrl ? (
                <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 shadow-sm">
                  <div className="text-center text-sm text-gray-600">
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                    Loading viewer…
                  </div>
                </div>
              ) : viewerMode === "pdf" ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  {pdfState.kind === "loading" ? (
                    <div className="grid place-items-center px-6 py-16 text-sm text-gray-600">
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                      Loading PDF…
                    </div>
                  ) : pdfState.kind === "error" ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-6 text-sm text-amber-900">
                      <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4" />
                        <div className="min-w-0">
                          <p className="font-semibold">PDF rendering failed</p>
                          <p className="mt-1 text-amber-900/80">{pdfState.message}</p>
                          <p className="mt-3 text-amber-900/80">
                            Falling back to embedded preview. You can also open in a new tab.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => setViewerMode("iframe")} disabled={!signedUrl}>
                              Use fallback preview
                            </Button>
                            <Button variant="secondary" onClick={() => void openInNewTab()} disabled={!activeId}>
                              <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4 w-4" />
                              Open in new tab
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : pdfState.kind === "ready" ? (
                    <div className="grid justify-center overflow-auto">
                      <canvas ref={canvasRef} className="block rounded-xl bg-white" />
                    </div>
                  ) : (
                    <div className="grid place-items-center px-6 py-16 text-sm text-gray-600">
                      <FontAwesomeIcon icon={faSpinner} spin className="mr-2 h-4 w-4" />
                      Preparing…
                    </div>
                  )}
                </div>
              ) : viewerMode === "iframe" && signedUrl ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* Safe fallback for non-PDFs (and also as a PDF fallback if PDF.js cannot render due to CORS). */}
                  <iframe
                    src={signedUrl}
                    title={activeTitle}
                    className="h-[28rem] w-full sm:h-[34rem]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    // Brave (and other privacy-focused browsers) can block cross-origin embeds more aggressively,
                    // especially when the iframe is sandboxed with unnecessary capabilities.
                    // For a simple file preview we do NOT need scripts; keep the sandbox as restrictive as possible.
                    sandbox="allow-same-origin allow-forms"
                    allow="fullscreen"
                  />
                  <div className="border-t border-gray-100 p-3 text-xs text-gray-500">
                    If the embedded preview does not load, use “Open in new tab” or “Download”.
                  </div>
                </div>
              ) : (
                <div className="grid place-items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">Ready to view</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      {signedUrl ? "Rendering will start automatically." : "Fetching a signed URL…"}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  );
}
