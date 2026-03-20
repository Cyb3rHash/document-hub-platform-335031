import { apiRequest } from "@/api/client";
import type {
  AdminStatsResponse,
  AdminUsersResponse,
  DocumentDetail,
  DocumentVisibility,
  ListDocumentsResponse,
  UploadDocumentResponse,
} from "@/api/types";

type ListDocumentsParams = {
  q?: string;
  visibility?: DocumentVisibility | "all";
  status?: string | "all";
};

function buildQuery(params: Record<string, string | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== "all" && v.trim().length) qs.set(k, v);
  });
  const out = qs.toString();
  return out ? `?${out}` : "";
}

// PUBLIC_INTERFACE
export const documentHubApi = {
  /** List/search documents visible to the current user. */
  async listDocuments(params: ListDocumentsParams): Promise<ListDocumentsResponse> {
    const query = buildQuery({
      q: params.q,
      visibility: params.visibility && params.visibility !== "all" ? params.visibility : undefined,
      status: params.status && params.status !== "all" ? params.status : undefined,
    });

    // Try common endpoint shapes; keep selection centralized (no scattered conditionals in pages).
    const candidates = [`/api/documents${query}`, `/documents${query}`];

    let lastErr: unknown = null;
    for (const path of candidates) {
      try {
        return await apiRequest<ListDocumentsResponse>(path, { method: "GET" });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  },

  /** Upload a document as multipart/form-data. */
  async uploadDocument(file: File, title?: string): Promise<UploadDocumentResponse> {
    const form = new FormData();
    form.append("file", file);
    if (title) form.append("title", title);

    // Canonical backend route is POST /documents (mounted under both / and /api on the server).
    // Our apiRequest() already prefixes /api when needed, so keep the path simple.
    const res = await apiRequest<unknown>("/documents", { method: "POST", body: form });

    // Backward/forward compatible response normalization:
    // - New backend returns { id, title, status, document }
    // - Older backend returned { document: { id, ... } }
    if (res && typeof res === "object") {
      const obj = res as Record<string, unknown>;
      const topId = typeof obj.id === "string" ? obj.id : null;
      const doc = obj.document && typeof obj.document === "object" ? (obj.document as Record<string, unknown>) : null;
      const docId = doc && typeof doc.id === "string" ? (doc.id as string) : null;

      const id = topId ?? docId;
      if (id) return { id };
    }

    // If we can't detect an id, return the raw value (will be surfaced as a UI error by caller if used incorrectly).
    return res as UploadDocumentResponse;
  },

  /** Fetch document detail by id. */
  async getDocument(id: string): Promise<DocumentDetail> {
    const candidates = [`/api/documents/${id}`, `/documents/${id}`];

    let lastErr: unknown = null;
    for (const path of candidates) {
      try {
        return await apiRequest<DocumentDetail>(path, { method: "GET" });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  },

  /** Delete a document by id. */
  async deleteDocument(id: string): Promise<{ ok: true } | unknown> {
    const candidates = [`/api/documents/${id}`, `/documents/${id}`];

    let lastErr: unknown = null;
    for (const path of candidates) {
      try {
        return await apiRequest<{ ok: true }>(path, { method: "DELETE" });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  },

  /** Get a view/download URL (signed URL or proxy URL) for a document. */
  async getDocumentViewUrl(id: string): Promise<{ url: string }> {
    const candidates = [
      `/api/documents/${id}/view`,
      `/api/documents/${id}/url`,
      `/api/documents/${id}/download`,
      `/documents/${id}/view`,
      `/documents/${id}/url`,
      `/documents/${id}/download`,
    ];

    let lastErr: unknown = null;
    for (const path of candidates) {
      try {
        return await apiRequest<{ url: string }>(path, { method: "GET" });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  },

  /** Admin: fetch platform stats (requires admin privileges). */
  async adminStats(): Promise<AdminStatsResponse> {
    const candidates = ["/api/admin/stats", "/admin/stats", "/api/admin/overview", "/admin/overview"];

    let lastErr: unknown = null;
    for (const path of candidates) {
      try {
        return await apiRequest<AdminStatsResponse>(path, { method: "GET" });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  },

  /** Admin: list users. */
  async adminUsers(): Promise<AdminUsersResponse> {
    const candidates = ["/api/admin/users", "/admin/users"];

    let lastErr: unknown = null;
    for (const path of candidates) {
      try {
        return await apiRequest<AdminUsersResponse>(path, { method: "GET" });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  },
};
