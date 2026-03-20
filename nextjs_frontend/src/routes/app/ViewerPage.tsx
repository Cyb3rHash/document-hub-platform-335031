import React, { useMemo, useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";
import { useDocuments, useDocument } from "@/hooks/documents";
import { documentHubApi } from "@/api/documentHubApi";

function useQueryParam(name: string): string | null {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search).get(name), [location.search, name]);
}

// PUBLIC_INTERFACE
export default function ViewerPage() {
  /** Viewer page connected to backend document read and view-url endpoints. */
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
  const activeVisibility = detailQuery.data?.visibility ?? undefined;

  async function openInNewTab() {
    if (!activeId) return;
    const { url } = await documentHubApi.getDocumentViewUrl(activeId);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function download() {
    if (!activeId) return;
    const { url } = await documentHubApi.getDocumentViewUrl(activeId);
    // Best-effort: open URL (backend should set content-disposition if it wants a download)
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Viewer"
        subtitle="Review documents with access-aware controls and backend-provided view/download URLs."
        actions={
          <>
            <Button variant="secondary" onClick={() => void openInNewTab()} disabled={!activeId}>
              <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4 w-4" />
              Open in new tab
            </Button>
            <Button variant="secondary" onClick={() => void download()} disabled={!activeId}>
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-3 py-2" disabled>
                  <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
                  Prev
                </Button>
                <Button variant="ghost" className="px-3 py-2" disabled>
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="h-[28rem] overflow-auto bg-gray-50 p-6 sm:h-[34rem]">
            <motion.div
              key={activeId ?? "none"}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="mx-auto grid max-w-2xl place-items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 shadow-sm"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Viewer placeholder</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  The viewer shell is wired to real backend metadata + signed URL actions. Next step is to render the
                  document content (PDF.js or an iframe) using the URL returned by the backend.
                </p>
              </div>
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  );
}
