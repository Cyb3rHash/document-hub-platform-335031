/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_API_BASE?: string;
  readonly NEXT_PUBLIC_BACKEND_URL?: string;
  readonly NEXT_PUBLIC_FRONTEND_URL?: string;
  readonly NEXT_PUBLIC_WS_URL?: string;
  readonly NEXT_PUBLIC_NODE_ENV?: string;
  readonly NEXT_PUBLIC_NEXT_TELEMETRY_DISABLED?: string;
  readonly NEXT_PUBLIC_ENABLE_SOURCE_MAPS?: string;
  readonly NEXT_PUBLIC_PORT?: string;
  readonly NEXT_PUBLIC_TRUST_PROXY?: string;
  readonly NEXT_PUBLIC_LOG_LEVEL?: string;
  readonly NEXT_PUBLIC_HEALTHCHECK_PATH?: string;
  readonly NEXT_PUBLIC_FEATURE_FLAGS?: string;
  readonly NEXT_PUBLIC_EXPERIMENTS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
