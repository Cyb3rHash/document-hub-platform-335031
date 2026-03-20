import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faFileLines,
  faArrowRight,
  faRotateRight,
  faEye,
  faShieldHalved,
  faGlobe,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";
import { useDocuments } from "@/hooks/documents";
import type { DocumentVisibility } from "@/api/types";

function normalizeVisibility(v: string): DocumentVisibility | "all" {
  const lower = v.toLowerCase();
  if (lower === "private" || lower === "public" || lower === "unlisted") return lower;
  return "all";
}

function formatShortDate(iso: string | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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
        <CardBody className="grid gap-4 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <label className="block">
              <span className="text-sm font-medium text-gray-800">Search</span>
              <div className="mt-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by title"
                    className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </label>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-800">Visibility</span>
              <select
                value={visibility}
                onChange={(e) => setVisibility(normalizeVisibility(e.target.value))}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">All</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-gray-800">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as string)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="all">Any</option>
                <option value="ready">Ready</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="uploaded">Uploaded</option>
              </select>
            </label>
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
          right={
            <Link to="/app/upload">
              <Button variant="primary" className="px-3 py-2">
                Upload <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Button>
            </Link>
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
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-10 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">No documents found</p>
              <p className="mt-1">Try clearing filters, changing search terms, or uploading a new document.</p>
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <div className="hidden grid-cols-12 gap-3 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
                <div className="col-span-6">Document</div>
                <div className="col-span-2">Visibility</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1 text-right">Views</div>
                <div className="col-span-1 text-right">Open</div>
              </div>

              <div className="divide-y divide-gray-100 bg-white">
                {items.map((doc) => {
                  const visibilityLabel =
                    doc.visibility === "public" ? "Public" : doc.visibility === "unlisted" ? "Unlisted" : "Private";
                  const viewsLabel = doc.view_count != null ? String(doc.view_count) : "—";

                  const visibilityIcon =
                    visibilityLabel === "Public" ? faGlobe : visibilityLabel === "Unlisted" ? faLink : faShieldHalved;

                  return (
                    <div
                      key={doc.id}
                      className="grid grid-cols-1 gap-3 px-4 py-4 transition hover:bg-gray-50/60 md:grid-cols-12 md:items-center"
                    >
                      <div className="md:col-span-6">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-white text-gray-700 ring-1 ring-gray-200">
                            <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{doc.title ?? "Untitled"}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Updated {formatShortDate(doc.updated_at)} · Created {formatShortDate(doc.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                            visibilityLabel === "Public"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                              : visibilityLabel === "Unlisted"
                                ? "bg-blue-50 text-blue-700 ring-blue-100"
                                : "bg-gray-50 text-gray-700 ring-gray-200"
                          )}
                        >
                          <FontAwesomeIcon icon={visibilityIcon} className="h-3.5 w-3.5" />
                          {visibilityLabel}
                        </span>
                      </div>

                      <div className="md:col-span-2">
                        <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                          {doc.status ?? "—"}
                        </span>
                      </div>

                      <div className="md:col-span-1 md:text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                          <FontAwesomeIcon icon={faEye} className="h-3.5 w-3.5 text-gray-400" />
                          {viewsLabel}
                        </span>
                      </div>

                      <div className="md:col-span-1 md:flex md:justify-end">
                        <Link to={`/app/viewer?id=${encodeURIComponent(doc.id)}`}>
                          <Button variant="ghost" className="h-9 px-3 py-0">
                            Open <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
