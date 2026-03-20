import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter, faFileLines, faArrowRight, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";
import { useDocuments } from "@/hooks/documents";
import type { DocumentVisibility } from "@/api/types";

function normalizeVisibility(v: string): DocumentVisibility | "all" {
  const lower = v.toLowerCase();
  if (lower === "private" || lower === "public" || lower === "unlisted") return lower;
  return "all";
}

// PUBLIC_INTERFACE
export default function ExplorePage() {
  /** Explore/search page for documents connected to backend list/search endpoints. */
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility | "all">("all");
  const [status, setStatus] = useState<string | "all">("all");

  const { data, loading, error, refetch } = useDocuments({ q, visibility, status });

  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Explore"
        subtitle="Search and filter across documents, visibility modes, and processing status."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => void refetch()}>
              <FontAwesomeIcon icon={faRotateRight} className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary" disabled>
              <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
              Filters
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <label className="block">
              <span className="sr-only">Search</span>
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by title, owner, tags"
                    className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </label>
          </div>
          <div className="sm:col-span-5 grid grid-cols-2 gap-3">
            <select
              value={visibility}
              onChange={(e) => setVisibility(normalizeVisibility(e.target.value))}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">All visibility</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as string)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="all">Any status</option>
              <option value="ready">Ready</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Results"
          subtitle={
            loading
              ? "Loading documents…"
              : error
                ? "Unable to load documents (see error below)."
                : `Showing ${items.length}${data?.total != null ? ` of ${data.total}` : ""} documents.`
          }
        />
        <CardBody className="grid gap-3">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {typeof error === "object" && error && "message" in error
                ? String((error as { message: unknown }).message)
                : "Request failed."}
            </div>
          ) : null}

          {items.length === 0 && !loading && !error ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-600">
              No documents found. Try clearing filters, or upload a new document.
            </div>
          ) : null}

          {items.map((doc) => {
            const visibilityLabel =
              doc.visibility === "public" ? "Public" : doc.visibility === "unlisted" ? "Unlisted" : "Private";
            const viewsLabel = doc.view_count != null ? String(doc.view_count) : "—";

            return (
              <div
                key={doc.id}
                className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-white text-gray-700 ring-1 ring-gray-200">
                    <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{doc.title ?? "Untitled"}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Status: {doc.status ?? "—"} · Updated {doc.updated_at ? "recently" : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      visibilityLabel === "Public"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                        : visibilityLabel === "Unlisted"
                          ? "bg-blue-50 text-blue-700 ring-blue-100"
                          : "bg-gray-50 text-gray-700 ring-gray-200"
                    )}
                  >
                    {visibilityLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                    {doc.status ?? "—"}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                    {viewsLabel} views
                  </span>
                  <Link to={`/app/viewer?id=${encodeURIComponent(doc.id)}`} className="ml-0 sm:ml-2">
                    <Button variant="ghost" className="px-3 py-2">
                      Open <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
