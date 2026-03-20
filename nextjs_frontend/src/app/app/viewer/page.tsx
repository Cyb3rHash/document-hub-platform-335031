"use client";

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
} from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";

type DocRow = { id: string; title: string; visibility: "Private" | "Unlisted" | "Public" };

// PUBLIC_INTERFACE
export default function ViewerPage() {
  /** Viewer page scaffold (UI only) with layout ready for PDF.js integration. */
  const docs: DocRow[] = useMemo(
    () => [
      { id: "doc_1", title: "Quarterly Report", visibility: "Private" },
      { id: "doc_2", title: "Product Brief", visibility: "Unlisted" },
      { id: "doc_3", title: "Onboarding Guide", visibility: "Public" },
      { id: "doc_4", title: "Security Review", visibility: "Private" },
    ],
    []
  );

  const [activeId, setActiveId] = useState(docs[0]?.id);

  const active = useMemo(() => docs.find((d) => d.id === activeId) ?? docs[0], [activeId, docs]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Viewer"
        subtitle="Review documents with pagination, zoom, and access-aware controls."
        actions={
          <>
            <Button variant="secondary">
              <FontAwesomeIcon icon={faUpRightFromSquare} className="h-4 w-4" />
              Open in new tab
            </Button>
            <Button variant="secondary">
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
              Download
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardHeader title="Library" subtitle="Select a document to view." />
          <CardBody className="grid gap-3">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-gray-400" />
                <span>Search within library</span>
              </div>
            </div>

            <div className="max-h-[28rem] overflow-auto pr-1">
              <div className="grid gap-2">
                {docs.map((d) => {
                  const activeRow = d.id === activeId;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setActiveId(d.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition",
                        activeRow
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "grid h-10 w-10 flex-none place-items-center rounded-2xl ring-1",
                            activeRow
                              ? "bg-white text-blue-700 ring-blue-100"
                              : "bg-white text-gray-700 ring-gray-200"
                          )}
                        >
                          <FontAwesomeIcon icon={faFileLines} className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{d.title}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{d.visibility}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-500">v1</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-8 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{active?.title}</p>
                <p className="text-xs text-gray-500">Page 1 of 14 · Zoom 100%</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="px-3 py-2">
                  <FontAwesomeIcon icon={faChevronLeft} className="h-3.5 w-3.5" />
                  Prev
                </Button>
                <Button variant="ghost" className="px-3 py-2">
                  Next
                  <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dedicated scroll region for the viewer content */}
          <div className="h-[28rem] overflow-auto bg-gray-50 p-6 sm:h-[34rem]">
            <motion.div
              key={active?.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="mx-auto grid max-w-2xl place-items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 shadow-sm"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">Viewer placeholder</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Integrate PDF.js rendering here (pagination, zoom, fullscreen, lazy-load). This layout already
                  isolates scrolling so the sidebar and topbar remain stable.
                </p>
              </div>
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  );
}
