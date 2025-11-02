// import { api } from './http';

// export interface DocumentResponse {
//   id: string;
//   filename: string;
//   original_name: string;
//   domain: string;
//   file_type: string;
//   file_size: number;
//   title?: string;
//   description?: string;
//   uploaded_by: string;
//   upload_date: string;
// }

// export async function fetchDocuments(domain: string): Promise<DocumentResponse[]> {
//   const { data } = await api.get(`/documents/${domain}`);
//   return data;
// }

// export async function uploadDocument(domain: string, file: File, title?: string, description?: string) {
//   const form = new FormData();
//   form.append('domain', domain);
//   form.append('file', file);
//   if (title) form.append('title', title);
//   if (description) form.append('description', description);
//   const { data } = await api.post('/documents/upload', form, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return data;
// }

import { api } from "./http";

export interface DocumentResponse {
  id: string;
  filename: string;
  original_name: string;
  domain: string;
  file_type: string;
  file_size: number;
  title?: string;
  description?: string;
  uploaded_by: string;
  upload_date: string;
  is_new?: boolean;
  new_until?: string;
}

/**
 * List documents in a domain (RBAC enforced server-side).
 */
export async function fetchDocuments(domain: string): Promise<DocumentResponse[]> {
  const { data } = await api.get(`/documents/${encodeURIComponent(domain)}`);
  return data as DocumentResponse[];
}

/**
 * Upload a document to a domain.
 * Backend saves file then triggers background indexing into Chroma.
 */
export async function uploadDocument(
  domain: string,
  file: File,
  title?: string,
  description?: string
): Promise<DocumentResponse> {
  const form = new FormData();
  form.append("domain", domain);
  form.append("file", file);
  if (title) form.append("title", title);
  if (description) form.append("description", description);

  const { data } = await api.post("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as DocumentResponse;
}

/**
 * Preview a document (returns a Blob URL you can assign to <a> or <embed>).
 * Uses GET /documents/preview/{document_id}.
 */
export async function previewDocument(documentId: string): Promise<Blob> {
  const res = await api.get(`/documents/preview/${encodeURIComponent(documentId)}`, {
    responseType: "blob",
  });
  return res.data as Blob;
}

/**
 * Download a document (forces file download).
 * Uses GET /documents/download/{document_id}.
 */
export async function downloadDocument(documentId: string): Promise<Blob> {
  const res = await api.get(`/documents/download/${encodeURIComponent(documentId)}`, {
    responseType: "blob",
  });
  return res.data as Blob;
}

/**
 * Optional: helper to poll for availability (indexing done).
 * Since indexing is background, you can poll list to reflect when the doc appears in search,
 * or simply show a toast “Indexing in background…” after upload.
 */
export async function pollDocumentsUntil(
  domain: string,
  predicate: (docs: DocumentResponse[]) => boolean,
  { intervalMs = 2000, timeoutMs = 20000 }: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<DocumentResponse[] | null> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const docs = await fetchDocuments(domain);
    if (predicate(docs)) return docs;
    if (Date.now() - start > timeoutMs) return null;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
