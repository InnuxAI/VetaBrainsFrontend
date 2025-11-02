import React, { useEffect, useMemo, useState, useCallback } from "react";
import { askChat, compareDocs } from "@/api/chat";
import { fetchDomains, type Domain } from "@/api/domain";
import { fetchDocuments, type DocumentResponse } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import DocMultiSelect from "@/components/Chat/DocMultiSelect";
import RecommendationsPanel from "@/components/AI/RecommendationsPanel";
import { 
  Sparkles, 
  Filter, 
  FileText, 
  Send, 
  GitCompare, 
  Brain, 
  Gauge,
  MessageSquare,
  Zap,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Chip: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={[
      "px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
      "shadow-sm hover:shadow-md",
      active 
        ? "border-primary bg-primary/10 text-primary shadow-primary/20" 
        : "border-border bg-card/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    ].join(" ")}
  >
    {label}
  </motion.button>
);

export default function GlobalChat() {
  const [allDomains, setAllDomains] = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [allDocs, setAllDocs] = useState<Record<string, DocumentResponse[]>>({});
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [compareOut, setCompareOut] = useState("");

  const [loading, setLoading] = useState(false);
  const [useMemory, setUseMemory] = useState(true);
  const [minScore, setMinScore] = useState<number | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load permitted domains
  useEffect(() => {
    fetchDomains().then(setAllDomains).catch(() => setAllDomains([]));
  }, []);

  // Load docs for selected domains
  useEffect(() => {
    const targets = selectedDomains.length ? selectedDomains : allDomains.map((d) => d.name.toLowerCase());
    const unique = Array.from(new Set(targets)).slice(0, 6);
    Promise.all(
      unique.map(async (dom) => {
        if (allDocs[dom]) return { dom, docs: allDocs[dom] };
        const docs = await fetchDocuments(dom);
        return { dom, docs };
      })
    )
      .then((arr) => {
        const map = { ...allDocs };
        arr.forEach(({ dom, docs }) => {
          map[dom] = docs;
        });
        setAllDocs(map);
      })
      .catch(() => {});
  }, [selectedDomains, allDomains]);

  const visibleDocs = useMemo(() => {
    const doms = selectedDomains.length ? selectedDomains : allDomains.map((d) => d.name.toLowerCase());
    const result: DocumentResponse[] = [];
    const seen = new Set<string>();
    doms.forEach((d) => {
      (allDocs[d] || []).forEach((doc) => {
        if (!seen.has(doc.id)) {
          seen.add(doc.id);
          result.push(doc);
        }
      });
    });
    return result;
  }, [selectedDomains, allDomains, allDocs]);

  const toggleDomain = (name: string) => {
    const key = name.toLowerCase();
    setSelectedDomains((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
    setSelectedDocIds([]);
  };

  const submitQ = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    setCompareOut("");
    try {
      const res = await askChat({
        query: q,
        domain_filter: selectedDomains.length ? selectedDomains : undefined,
        doc_ids: selectedDocIds.length ? selectedDocIds : undefined,
        top_k: 10,
        use_memory: useMemory,
        min_score: minScore,
      });
      setAnswer(res.answer || "");
      setSources(res.source_docs || []);
    } catch {
      setAnswer("Failed to get an answer. Please try again.");
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [query, selectedDomains, selectedDocIds, useMemory, minScore, loading]);

  const submitCompare = useCallback(async () => {
    if (selectedDocIds.length < 2 || loading) return;
    setLoading(true);
    setCompareOut("");
    try {
      const resp = await compareDocs({
        doc_ids: selectedDocIds,
        prompt: "Compare requirements coverage, SLAs, termination, and pricing exceptions.",
      });
      setCompareOut(resp.table_markdown);
    } catch {
      setCompareOut("Failed to compare documents.");
    } finally {
      setLoading(false);
    }
  }, [selectedDocIds, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-8">
        
        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-chart-2 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
              Global Intelligence
            </h1>
          </div>
          <p className="text-muted-foreground text-base" style={{ fontFamily: 'var(--font-sans)' }}>
            Ask questions across all your permitted domains with AI-powered context
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Content - Left Side */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Domain Filters Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>
                      Domain Scope
                    </h2>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {selectedDomains.length || "All"} selected
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {allDomains.map((d) => {
                      const key = d.name.toLowerCase();
                      const active = selectedDomains.includes(key);
                      return (
                        <Chip
                          key={key}
                          active={active}
                          onClick={() => toggleDomain(key)}
                          label={d.display_name || d.name}
                        />
                      );
                    })}
                    {allDomains.length === 0 && (
                      <span className="text-sm text-muted-foreground italic">No domains available</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Document Selector Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>
                      Target Documents
                    </h2>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {selectedDocIds.length} selected
                    </Badge>
                  </div>
                  <DocMultiSelect 
                    documents={visibleDocs} 
                    selected={selectedDocIds} 
                    onChange={setSelectedDocIds} 
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Query Input Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-xl border-border/50 backdrop-blur-sm bg-card/95">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>
                      Your Question
                    </h2>
                  </div>
                  
                  <div className="relative rounded-xl border-2 border-border/60 bg-background/50 focus-within:border-primary/50 focus-within:shadow-lg transition-all duration-200">
                    <Textarea
                      placeholder="Ask anything across your knowledge base..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          submitQ();
                        }
                      }}
                      rows={4}
                      className="min-h-[120px] resize-none bg-transparent border-0 focus-visible:ring-0 text-base"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    />
                  </div>

                  {/* Advanced Controls Toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Advanced options
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={useMemory}
                                onChange={(e) => setUseMemory(e.target.checked)}
                              />
                              <div className="w-10 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors"></div>
                              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                            </div>
                            <Brain className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                              Semantic Memory
                            </span>
                          </label>
                          
                          <Separator orientation="vertical" className="h-6" />
                          
                          <label className="flex items-center gap-2.5 text-sm">
                            <Gauge className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Min Score</span>
                            <input
                              type="number"
                              min={0}
                              max={1}
                              step={0.05}
                              value={minScore ?? ""}
                              onChange={(e) => setMinScore(e.target.value === "" ? undefined : Number(e.target.value))}
                              className="h-8 w-20 rounded-lg border border-border bg-background px-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                              placeholder="0.00"
                            />
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      <span>Press Enter to send • Shift+Enter for new line</span>
                    </div>
                    <div className="flex gap-2.5">
                      <Button 
                        onClick={submitQ} 
                        disabled={loading || !query.trim()}
                        className="shadow-md hover:shadow-lg transition-shadow"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? "Thinking..." : "Ask"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={submitCompare} 
                        disabled={loading || selectedDocIds.length < 2}
                        className="shadow-sm hover:shadow-md transition-shadow"
                        size="lg"
                      >
                        <GitCompare className="h-4 w-4 mr-2" />
                        Compare
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Answer Card */}
            <AnimatePresence>
              {answer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="shadow-xl border-primary/20 backdrop-blur-sm bg-gradient-to-br from-card via-card to-primary/5">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>
                          AI Response
                        </h3>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {answer}
                      </div>
                      {sources.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              <FileText className="h-3.5 w-3.5" />
                              Sources ({sources.length})
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {sources.map((s, i) => (
                                <Badge 
                                  key={`${s}-${i}`} 
                                  variant="secondary"
                                  className="text-xs font-mono shadow-sm"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Compare Output Card */}
            <AnimatePresence>
              {compareOut && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="shadow-xl border-chart-2/20 backdrop-blur-sm bg-card/95">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <GitCompare className="h-4 w-4 text-chart-2" />
                        <h3 className="text-base font-semibold">Comparison Matrix</h3>
                      </div>
                      <div className="overflow-auto rounded-lg border border-border bg-background/50 p-4">
                        <pre 
                          className="text-sm whitespace-pre-wrap font-mono"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {compareOut}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Recommendations */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-4"
          >
            <div className="sticky top-6">
              <RecommendationsPanel 
                onOpenDoc={(id) => {
                  // window.open(`${API_BASE}/documents/preview/${id}`, "_blank");
                }} 
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
