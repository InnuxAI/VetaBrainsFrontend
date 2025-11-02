import { api } from "./http";

export type ChatRequest = {
  query: string;
  domain_filter?: string[];
  doc_ids?: string[];
  top_k?: number;
};

export type ChatResponse = {
  answer: string;
  source_docs: string[];
};

export async function askChat(req: ChatRequest) {
  const { data } = await api.post<ChatResponse>("/ai/chat/query", req);
  return data;
}

export async function compareDocs(req: { doc_ids: string[]; prompt?: string; criteria?: string[]; top_k_per_doc?: number }) {
  const { data } = await api.post("/ai/chat/compare", req);
  return data as { table_markdown: string; citations: string[] };
}