export type DocumentVisibility = "private" | "unlisted" | "public";
export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export type DocumentListItem = {
  id: string;
  title: string;
  owner_id?: string;
  visibility?: DocumentVisibility;
  status?: DocumentStatus;
  view_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type DocumentDetail = DocumentListItem & {
  storage_path?: string;
  preview_storage_path?: string | null;
  disable_download?: boolean;
  watermark_text?: string | null;
};

export type ListDocumentsResponse = {
  items: DocumentListItem[];
  total?: number;
};

export type UploadDocumentResponse = {
  id: string;
  title?: string;
  status?: DocumentStatus;
  document?: DocumentDetail;
};

export type AdminStatsResponse = {
  users?: number;
  documents?: number;
  admins?: number;
};

export type AdminUserRow = {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  status?: string;
  last_active?: string;
};

export type AdminUsersResponse = {
  items: AdminUserRow[];
};
