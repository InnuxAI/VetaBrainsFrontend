// src/pages/UploadDocumentPage.tsx
import React, { useState, useEffect } from "react";
import { fetchDomains } from "@/api/domain";
import UploadDocument from "@/components/Documents/UploadDocument";

const UploadDocumentPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  useEffect(() => {
    fetchDomains().then(setDomains);
  }, []);

  return (
    <div className="max-w-xl mx-auto pt-12 space-y-8">
      <UploadDocument domains={domains} onUploadSuccess={() => {}} />
    </div>
  );
};

export default UploadDocumentPage;
