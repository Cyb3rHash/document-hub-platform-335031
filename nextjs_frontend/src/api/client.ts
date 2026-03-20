import { getSupabaseClient } from "@/utils/supabaseClient";

/**
 * DocumentHub frontend API client.
 *
 * Flow name: FrontendApiRequestFlow
 * Entrypoint: apiRequest()
 *
 * Contract:
 * - Inputs:
 *   - path: string (must start with '/')
 *   - init: fetch init (method/headers/body)
 *   - options:
 *       - auth: boolean (default true) -> attaches Supabase access token as Bearer
 *       - signal: AbortSignal
 * - Outputs:
 *   - Resolves with parsed JSON (if JSON) or text (if not JSON) for 2xx responses.
 * - Errors:
 *   - Throws ApiError for non-2xx responses or network failures; includes status, requestId if available, and response body.
 * - Side effects:
 *   - Network call to backend.
 */

export type ApiBaseConfig = {
  baseUrl: string;
};

export class ApiError extends Error {
  public status?: number;
  public requestId?: string;
  public details?: unknown;

  constructor(message: string, opts?: { status?: number; requestId?: string; details?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.requestId = opts?.requestId;
    this.details = opts?.details;
  }
}

// PUBLIC_INTERFACE
export function getApiBaseConfig(): ApiBaseConfig {
  /**
   * Returns normalized API base URL configuration for the frontend.
   *
   * Vite requires browser-exposed env vars to start with VITE_.
   *
   * Priority order:
   * - VITE_API_BASE
   * - VITE_BACKEND_URL
   * - VITE_NEXT_PUBLIC_API_BASE (legacy support)
   * - VITE_NEXT_PUBLIC_BACKEND_URL (legacy support)
   *
   * If none is set, defaults to same-origin (empty base) which only works if the SPA is served behind the same domain
   * and a reverse proxy routes API paths to the backend.
   */
  const raw =
    import.meta.env.VITE_API_BASE ??
    import.meta.env.VITE_BACKEND_URL ??
    import.meta.env.VITE_NEXT_PUBLIC_API_BASE ??
    import.meta.env.VITE_NEXT_PUBLIC_BACKEND_URL ??
    "";

  const baseUrl = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  return { baseUrl };
}

async function getAuthHeader(): Promise<string | null> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? null;
    return token ? `Bearer ${token}` : null;
  } catch {
    // If Supabase isn't configured, we avoid throwing at import-time.
    // The API will likely reject calls requiring auth; callers get a clear ApiError from the response.
    return null;
  }
}

function parsePossibleJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Attempt to normalize backend responses into a simpler shape.
 *
 * Our Express backend returns an envelope:
 *   { status: "ok", data: <payload>, meta?: <meta> }
 *
 * Many frontend hooks/components expect the payload directly (e.g. `{ items: [] }`).
 * This function unwraps the envelope when detected, while keeping compatibility
 * with non-enveloped APIs.
 */
function unwrapApiEnvelope(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;

  const obj = parsed as Record<string, unknown>;
  const hasStatus = typeof obj.status === "string";
  const hasData = "data" in obj;

  if (!hasStatus || !hasData) return parsed;

  // Express convention in this repo: ok()/created() => { status: "ok", data, meta? }
  if (obj.status === "ok") {
    const data = obj.data;
    const meta = obj.meta;

    // Special-case document list shape: map meta.count => total for UI convenience.
    // If data is an object, we can merge in `total` without breaking consumers.
    if (data && typeof data === "object" && meta && typeof meta === "object") {
      const metaObj = meta as Record<string, unknown>;
      if (typeof metaObj.count === "number") {
        return { ...(data as Record<string, unknown>), total: metaObj.count };
      }
    }

    return data;
  }

  // For error envelopes we keep the full object so ApiError.details remains useful.
  return parsed;
}

type ApiRequestOptions = {
  auth?: boolean;
  signal?: AbortSignal;
};

// PUBLIC_INTERFACE
export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit,
  options?: ApiRequestOptions
): Promise<TResponse> {
  /**
   * Canonical API request function used by all page-level hooks.
   * Ensures consistent auth injection, error mapping, and debuggable error context.
   */
  if (!path.startsWith("/")) {
    throw new ApiError(`apiRequest path must start with '/'. Received: ${path}`);
  }

  const { baseUrl } = getApiBaseConfig();
  const url = `${baseUrl}${path}`;

  const headers = new Headers(init?.headers ?? {});
  // Always request JSON by default; backend can still return non-JSON.
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const wantsAuth = options?.auth !== false;
  if (wantsAuth) {
    const authHeader = await getAuthHeader();
    if (authHeader) headers.set("Authorization", authHeader);
  }

  // If body is a plain object (not FormData), set JSON content-type.
  const body = init?.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const operation = `${(init?.method ?? "GET").toUpperCase()} ${path}`;
  const startedAt = performance.now();

  try {
    const res = await fetch(url, { ...init, headers, signal: options?.signal });

    const requestId = res.headers.get("x-request-id") ?? undefined;
    const text = await res.text();
    const parsed = parsePossibleJson(text);

    const elapsedMs = Math.round(performance.now() - startedAt);
    // Minimal structured log for future debugging.
    console.info("[api]", { operation, status: res.status, elapsedMs, requestId });

    if (!res.ok) {
      throw new ApiError(`Request failed: ${operation}`, {
        status: res.status,
        requestId,
        details: parsed,
      });
    }

    const unwrapped = unwrapApiEnvelope(parsed);
    return unwrapped as TResponse;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      console.error("[api:error]", { operation, status: err.status, requestId: err.requestId, details: err.details });
      throw err;
    }
    const message =
      typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : "Network error";
    console.error("[api:error]", { operation, message });
    throw new ApiError(message);
  }
}
