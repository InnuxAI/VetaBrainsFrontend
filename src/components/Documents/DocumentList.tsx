import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type DocumentResponse } from "../../api/documents";
import { Download, Eye, FileText, Clock, HardDrive, Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/api/http";

interface Props {
  documents: DocumentResponse[];
}

const formatSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const extToVariant: Record<string, { className: string }> = {
  pdf: { className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
  doc: { className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  docx: { className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  xls: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  xlsx: { className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" },
  ppt: { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  pptx: { className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  txt: { className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  md: { className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

const getBadgeClass = (ext: string) =>
  extToVariant[ext?.toLowerCase?.()]?.className ||
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";

const DocumentGrid: React.FC<Props> = ({ documents }) => {
  // AI Summary dialog state
  const [openId, setOpenId] = useState<string | null>(null);
  const [sumLoading, setSumLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const openSummary = async (docId: string) => {
    setOpenId(docId);
    setSumLoading(true);
    setSummary("");
    try {
      const { data } = await api.get(`/documents/${encodeURIComponent(docId)}/summary`);
      setSummary(data.summary || "No summary generated.");
    } catch {
      setSummary("Failed to generate summary.");
    } finally {
      setSumLoading(false);
    }
  };

  const openPreviewWithLog = async (
    doc: { id: string; domain: string },
    event: "preview" | "download" = "preview"
  ) => {
    try {
      await api.post("/documents/events/log", {
        doc_id: doc.id,
        event,
        weight: event === "download" ? 1.5 : 1.0,
        domain: doc.domain.toLowerCase(),
      });
    } catch {
      /* non-blocking */
    }

    try {
      if (event === "download") {
        // Resolve a direct-download URL (Azure SAS with rscd=attachment; or local FileResponse)
        const { data } = await api.get(`/documents/download_url/${encodeURIComponent(doc.id)}`);
        // Programmatic anchor click is more consistent for cross-origin downloads
        const a = document.createElement("a");
        a.href = data.url;
        a.rel = "noopener";
        // For cross-origin SAS, a new tab is fine; for same-origin you can use _self
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      // Preview flow: viewable URL (SAS without attachment)
      const { data } = await api.get(`/documents/preview_url/${encodeURIComponent(doc.id)}`);
      window.open(data.url, "_blank", "noopener");
    } catch {
      alert(event === "download" ? "Unable to download document." : "Unable to open document preview.");
    }
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">Browse and act on your files with a responsive, readable grid.</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {documents.length} item{documents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-[var(--color-chart-1)] to-[var(--color-chart-5)] text-white flex items-center justify-center shadow">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
            <p className="text-sm text-muted-foreground">When available, documents will appear here.</p>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      <AnimatePresence initial={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {documents.map((doc, idx) => {
            const title = doc.title || doc.original_name;
            const uploadedOn = new Date(doc.upload_date);
            const ext = (doc.file_type || doc.original_name?.split(".").pop() || "").toLowerCase();

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, delay: idx * 0.02 }}
                className="h-full"
                title={title}
              >
                <Card className="group h-full rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-card)]/80 shadow-sm hover:shadow-xl transition-all hover:-translate-y-0.5 relative overflow-hidden">
                  <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-[var(--color-chart-1)]/10 via-[var(--color-chart-3)]/10 to-[var(--color-chart-5)]/10" />
                  <CardContent className="relative z-10 p-4 flex flex-col h-full">
                    {/* Top: title + badge */}
                   <div className="min-w-0">
  <div className="flex items-center gap-2">
    {/* Filetype chip */}
    <Badge className={["px-2 py-0.5 rounded-full text-[10px] font-semibold", getBadgeClass(ext)].join(" ")}>
      {ext || "file"}
    </Badge>

    {/* New tag (small but visible) */}
    {doc.is_new && (
      <Badge className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-accent)] text-[var(--color-accent-foreground)]">
        New
      </Badge>
    )}

    {/* Title */}
    <h3 className="truncate font-medium text-sm">{title}</h3>
  </div>
</div>

                    {/* Middle: meta */}
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-muted-foreground">
                      <div className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {uploadedOn.toLocaleDateString()}
                      </div>
                      <div className="inline-flex items-center gap-1 justify-end sm:justify-start">
                        <HardDrive className="h-3.5 w-3.5" />
                        {formatSize(doc.file_size)}
                      </div>
                      <div className="col-span-2 truncate text-[11px]">{doc.original_name}</div>
                    </div>

                    <Separator className="my-3" />

                    {/* Bottom: actions */}
                    <div className="mt-auto flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => openPreviewWithLog({ id: doc.id, domain: doc.domain }, "preview")}
                        className="flex-1 min-w-[120px] justify-center border-[var(--color-chart-1)]/40 hover:bg-[var(--color-chart-1)]/10"
                        aria-label={`Preview ${title}`}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Preview
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => openSummary(doc.id)}
                        className="flex-1 min-w-[120px] justify-center border-[var(--color-chart-1)]/40 hover:bg-[var(--color-chart-1)]/10"
                        aria-label={`Summarize ${title}`}
                      >
                        <Sparkles className="h-4 w-4 mr-1.5" />
                        AI Summary
                      </Button>

                      <Button
                        onClick={() => openPreviewWithLog({ id: doc.id, domain: doc.domain }, "download")}
                        className="flex-1 min-w-[120px] justify-center bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
                        aria-label={`Download ${title}`}
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* AI Summary Modal */}
      <Dialog open={!!openId} onOpenChange={(v) => { if (!v) { setOpenId(null); setSummary(""); } }}>
  <DialogContent
    className="
      sm:max-w-lg
      w-[92vw]
      max-w-[640px]
      bg-[var(--color-popover)]        /* solid surface */
      text-[var(--color-popover-foreground)]
      border border-[var(--color-border)]
      shadow-lg
      p-0
      max-h-[90vh]                     /* keep modal inside viewport */
      overflow-hidden                  /* body will handle its own scroll */
    "
  >
    {/* Header (non-scrolling) */}
    <div className="p-4 border-b border-[var(--color-border)]">
      <DialogHeader className="space-y-1">
        <DialogTitle>AI Summary</DialogTitle>
        <DialogDescription>Auto-generated overview of this document.</DialogDescription>
      </DialogHeader>
    </div>

    {/* Scrollable body */}
    <div
      className="
        px-4 py-3
        overflow-y-auto
        max-h-[70vh]                   /* actual scroll area */
        overscroll-contain
      "
    >
      {sumLoading ? (
        <div className="text-sm text-[var(--color-muted-foreground)]">Summarizing…</div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words">
          {summary}
        </div>
      )}
    </div>

    {/* Optional footer (non-scrolling) */}
    {/* <div className="p-3 border-t border-[var(--color-border)] flex justify-end">
      <Button variant="outline" size="sm">Close</Button>
    </div> */}
  </DialogContent>
</Dialog>

    </div>
  );
};

export default DocumentGrid;
