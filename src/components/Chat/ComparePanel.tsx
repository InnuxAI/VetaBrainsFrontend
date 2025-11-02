import React, { useState } from "react";
import { compareDocs } from "@/api/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ComparePanel: React.FC = () => {
  const [docIds, setDocIds] = useState("");
  const [prompt, setPrompt] = useState("Compare SLAs, pricing, and termination clauses.");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const ids = docIds.split(",").map(s => s.trim()).filter(Boolean);
    if (!ids.length) return;
    setLoading(true);
    setResult("");
    try {
      const resp = await compareDocs({ doc_ids: ids, prompt });
      setResult(resp.table_markdown);
    } catch (e: any) {
      setResult(e?.message || "Failed to compare");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Input placeholder="doc_id_1, doc_id_2" value={docIds} onChange={(e) => setDocIds(e.target.value)} />
      <Input placeholder="Prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <Button onClick={run} disabled={loading || !docIds.trim()}>
        {loading ? "Comparing…" : "Compare"}
      </Button>
      <div className="rounded-xl border p-4 overflow-auto prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
};

export default ComparePanel;
