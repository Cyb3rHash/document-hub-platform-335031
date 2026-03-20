import { useCallback } from "react";
import { documentHubApi } from "@/api/documentHubApi";
import type { DocumentVisibility, ListDocumentsResponse, DocumentDetail } from "@/api/types";
import { invalidateCache, useCachedQuery } from "@/hooks/cache";

type UseDocumentsParams = {
  q: string;
  visibility: DocumentVisibility | "all";
  status: string | "all";
};

// PUBLIC_INTERFACE
export function useDocuments(params: UseDocumentsParams) {
  /** Cached list/search query for documents. */
  const key = `documents:list?q=${params.q}|visibility=${params.visibility}|status=${params.status}`;

  const queryFn = useCallback(
    (signal: AbortSignal) => {
      // Signal is provided for symmetry; apiRequest supports it, but our API wrapper currently doesn’t pass it through.
      // We keep it for future extension without changing hook signature.
      void signal;
      return documentHubApi.listDocuments({ q: params.q, visibility: params.visibility, status: params.status });
    },
    [params.q, params.status, params.visibility]
  );

  return useCachedQuery<ListDocumentsResponse>(key, queryFn, { staleTimeMs: 10_000 });
}

// PUBLIC_INTERFACE
export function useDocument(id: string | null) {
  /** Cached document detail query by id. */
  const enabled = Boolean(id);
  const key = `documents:detail:${id ?? "none"}`;

  const queryFn = useCallback(
    (signal: AbortSignal) => {
      void signal;
      if (!id) return Promise.reject(new Error("Missing document id"));
      return documentHubApi.getDocument(id);
    },
    [id]
  );

  return useCachedQuery<DocumentDetail>(key, queryFn, { enabled, staleTimeMs: 10_000 });
}

// PUBLIC_INTERFACE
export function invalidateDocumentsCache() {
  /** Helper to invalidate all document list/detail cache entries. */
  invalidateCache("documents:");
}
