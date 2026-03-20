import React, { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faFileArrowUp,
  faTriangleExclamation,
  faCheck,
  faSpinner,
  faArrowRight,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, CardHeader, PageHeader, cn, Input } from "@/components/ui";
import { documentHubApi } from "@/api/documentHubApi";
import { invalidateDocumentsCache } from "@/hooks/documents";

const MAX_MB = 50;
const ACCEPTED = [".pdf", ".docx", ".ppt", ".pptx", ".txt"];

// PUBLIC_INTERFACE
export default function UploadPage() {
  /** Upload page connected to backend upload endpoint (multipart/form-data). */
  const [selected, setSelected] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  const canUpload = useMemo(() => Boolean(selected) && !uploading && !deleting, [selected, uploading, deleting]);

  const onPick = useCallback(
    (file: File | null) => {
      setError(null);
      setUploadedId(null);
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
      if (!title.trim()) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    },
    [title]
  );

  async function onUpload() {
    setError(null);
    setUploadedId(null);

    if (!selected) return;

    setUploading(true);
    try {
      const res = await documentHubApi.uploadDocument(selected, title.trim() || undefined);
      invalidateDocumentsCache();
      setUploadedId(res.id);
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Upload failed.";
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  async function onDeleteUploaded() {
    if (!uploadedId) return;

    const confirmed = window.confirm("Delete this uploaded document? This cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await documentHubApi.deleteDocument(uploadedId);
      // Ensure Explore/Viewer lists refresh after mutation.
      invalidateDocumentsCache();

      // Clear the success state; keep title so user can re-upload if desired.
      setUploadedId(null);
      setSelected(null);
    } catch (e: unknown) {
      const message =
        typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : "Delete failed.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

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
            <div className="grid gap-4">
              <Input
                label="Title"
                name="title"
                value={title}
                onChange={setTitle}
                placeholder="Document title"
                hint="Used for display and search."
              />

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
                    <p className="text-sm font-semibold text-gray-900">Select a file to upload</p>
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
                        disabled={uploading || deleting}
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
                          <p className="font-semibold">Something went wrong</p>
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

                  {uploadedId ? (
                    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left text-sm text-blue-800">
                      <p className="font-semibold">Upload accepted</p>
                      <p className="mt-1">
                        Document id: <span className="font-mono">{uploadedId}</span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link to={`/app/viewer?id=${encodeURIComponent(uploadedId)}`}>
                          <Button variant="secondary" className="px-3 py-2">
                            View <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Link to="/app/explore">
                          <Button variant="ghost" className="px-3 py-2">
                            Back to Explore
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          className="px-3 py-2"
                          disabled={deleting}
                          onClick={() => void onDeleteUploaded()}
                        >
                          <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          {deleting ? "Deleting…" : "Delete"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-2 flex justify-end">
                    <Button disabled={!canUpload} onClick={() => void onUpload()}>
                      {uploading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin className="h-4 w-4" />
                          Uploading
                        </>
                      ) : (
                        "Start upload"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
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
