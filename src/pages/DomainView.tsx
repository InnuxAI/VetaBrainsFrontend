import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { type DocumentResponse, fetchDocuments } from "@/api/documents";
import DocumentList from "@/components/Documents/DocumentList";
import UploadDocument from "@/components/Documents/UploadDocument";
import { fetchDomains, type Domain } from "@/api/domain";
import { useAuth } from "@/App";
// import ChatPanel from "@/components/Chat/ChatPanel";
import { Separator } from "@/components/ui/separator";
// import MultiDocChat from "@/components/Chat/MultiDocChat";

const DomainView: React.FC = () => {
  const { domain } = useParams<{ domain: string }>();
  const normalizedDomain = useMemo(() => domain?.toLowerCase() ?? "", [domain]);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [docLoading, setDocLoading] = useState(true);
  const [domLoading, setDomLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshDocuments = useCallback(() => {
    if (!normalizedDomain) return;
    setDocLoading(true);
    setError(null);
    fetchDocuments(normalizedDomain)
      .then(setDocuments)
      .catch((err) => {
        if (err?.response?.status === 403) setError("You are not authorized to view this domain.");
        else setError("Failed to load documents.");
      })
      .finally(() => setDocLoading(false));
  }, [normalizedDomain]);

  useEffect(() => {
    if (!normalizedDomain) return;
    refreshDocuments();
    setDomLoading(true);
    fetchDomains()
      .then(setDomains)
      .catch((err) => {
        if (err?.response?.status === 403) setError("You are not authorized to view this domain.");
        else setError("Failed to load domains.");
      })
      .finally(() => setDomLoading(false));
  }, [normalizedDomain, refreshDocuments]);

  if (!normalizedDomain) return <p className="p-6">Invalid domain</p>;

  const canUpload = user?.role === "admin";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-6 space-y-6">
      {/* <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold mt-4">Documents in {normalizedDomain}</h1>
        {canUpload && !domLoading && (
          <div className="min-w-[280px]">
            <UploadDocument domains={domains} onUploadSuccess={refreshDocuments} />
          </div>
        )}
      </div> */}

      {error && <p className="text-red-500">{error}</p>}

      {/* <div className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold mb-2">Ask this domain (AI)</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Answers are grounded in documents from “{normalizedDomain}” with citations.
        </p>
        <MultiDocChat scopeDomains={[normalizedDomain]} documents={documents} />

      </div> */}

      <Separator />

      {docLoading ? (
        <div className="text-sm text-muted-foreground">Loading documents…</div>
      ) : (
        <DocumentList documents={documents} />
      )}
    </div>
  );
};

export default DomainView;

