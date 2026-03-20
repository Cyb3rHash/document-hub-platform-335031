import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter, faFileLines, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";

// PUBLIC_INTERFACE
export default function ExplorePage() {
  /** Explore/search page for documents (UI scaffold). */
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Explore"
        subtitle="Search and filter across documents, visibility modes, and processing status."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary">
              <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
              Filters
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-12">
          <div className="sm:col-span-7">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
                <span>Search by title, owner, tags</span>
              </div>
            </div>
          </div>
          <div className="sm:col-span-5 grid grid-cols-2 gap-3">
            <select className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10">
              <option>All visibility</option>
              <option>Private</option>
              <option>Unlisted</option>
              <option>Public</option>
            </select>
            <select className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10">
              <option>Any status</option>
              <option>Ready</option>
              <option>Processing</option>
              <option>Failed</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Results" subtitle="Showing 24 documents matching your criteria." />
        <CardBody className="grid gap-3">
          {[
            { title: "Product Brief", visibility: "Unlisted", status: "Ready", views: "842" },
            { title: "Onboarding Guide", visibility: "Public", status: "Processing", views: "331" },
            { title: "Security Review", visibility: "Private", status: "Ready", views: "98" },
            { title: "Partner Deck", visibility: "Unlisted", status: "Ready", views: "1,012" },
          ].map((doc) => (
            <div
              key={doc.title}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-white text-gray-700 ring-1 ring-gray-200">
                  <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{doc.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">Owner: You · Updated recently</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                    doc.visibility === "Public"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : doc.visibility === "Unlisted"
                        ? "bg-blue-50 text-blue-700 ring-blue-100"
                        : "bg-gray-50 text-gray-700 ring-gray-200"
                  )}
                >
                  {doc.visibility}
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                  {doc.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200">
                  {doc.views} views
                </span>
                <Link to="/app/viewer" className="ml-0 sm:ml-2">
                  <Button variant="ghost" className="px-3 py-2">
                    Open <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
