"use client";

import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faFileArrowUp,
  faTriangleExclamation,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { Button, Card, CardBody, CardHeader, PageHeader, cn } from "@/components/ui";

const MAX_MB = 50;
const ACCEPTED = [".pdf", ".docx", ".ppt", ".pptx", ".txt"];

// PUBLIC_INTERFACE
export default function UploadPage() {
  /** Upload page scaffold with enterprise drag-and-drop styling (no backend wiring yet). */
  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback((file: File | null) => {
    setError(null);
    setSelected(null);
    if (!file) return;

    const sizeMb = file.size / (1024 * 1024);
    const name = file.name.toLowerCase();
    const okType = ACCEPTED.some((ext) => name.endsWith(ext));

    if (!okType) {
      setError(`Unsupported file type. Allowed: ${ACCEPTED.join(", ")}`);
      return;
    }
    if (sizeMb > MAX_MB) {
      setError(`File too large. Max ${MAX_MB}MB.`);
      return;
    }

    setSelected(file);
  }, []);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Upload"
        subtitle="Add new documents to your library with validation and processing status."
        actions={
          <Button variant="secondary" disabled>
            Upload options
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Upload a document"
            subtitle="Drag a file into the drop zone, or browse to select. Supported formats include PDF and Office documents."
          />
          <CardBody>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "relative rounded-2xl border border-dashed bg-gray-50 px-6 py-10 text-center",
                "border-gray-200"
              )}
            >
              <div className="mx-auto grid max-w-md gap-4">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-700 ring-1 ring-blue-100 shadow-sm">
                  <FontAwesomeIcon icon={faCloudArrowUp} className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Drop your file here</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Max {MAX_MB}MB. Accepted: {ACCEPTED.join(", ")}.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800">
                    <FontAwesomeIcon icon={faFileArrowUp} className="h-4 w-4" />
                    Browse files
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <Button variant="secondary" disabled>
                    Import from URL
                  </Button>
                </div>

                {error ? (
                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-semibold">Upload blocked</p>
                        <p className="mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {selected ? (
                  <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faCheck} className="mt-0.5 h-4 w-4" />
                      <div className="min-w-0">
                        <p className="font-semibold">Ready to upload</p>
                        <p className="mt-1 truncate text-emerald-800">{selected.name}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="mt-2 flex justify-end">
                  <Button disabled={!selected}>Start upload</Button>
                </div>
              </div>
            </motion.div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Processing notes" subtitle="What happens after upload." />
          <CardBody className="grid gap-3 text-sm text-gray-700">
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-semibold text-gray-900">Validation</p>
              <p className="mt-1 text-gray-600">File type and size checks run immediately in the browser.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-semibold text-gray-900">Conversion</p>
              <p className="mt-1 text-gray-600">Office formats may be converted for optimized viewing.</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="font-semibold text-gray-900">Visibility</p>
              <p className="mt-1 text-gray-600">Default is private; you can adjust to unlisted or public.</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
