import React, { useCallback, useRef, useState } from "react";
import { askChat } from "@/api/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CornerDownLeft, Loader2, Sparkles, Link2, ClipboardCopy, History, BookOpen } from "lucide-react";

type Props = {
  scopeDomains?: string[];   // e.g., [currentDomain]
  title?: string;            // e.g., “Ask this domain”
  description?: string;      // e.g., “Answers are grounded in your permitted documents.”
};

type QA = { q: string; a: string; sources: string[] };

const ChatResearch: React.FC<Props> = ({
  scopeDomains,
  title = "Ask this domain",
  description = "Answers are grounded in your permitted documents.",
}) => {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QA[]>([]);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const submit = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    try {
      const res = await askChat({
        query: q,
        domain_filter: scopeDomains && scopeDomains.length ? scopeDomains : undefined,
      });
      const a = res.answer || "";
      const srcs = res.source_docs || [];
      setAnswer(a);
      setSources(srcs);
      setHistory((h) => [{ q, a, sources: srcs }, ...h].slice(0, 10));
    } catch {
      setAnswer("Failed to get an answer. Please try again.");
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [query, scopeDomains, loading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const clearAll = () => {
    setQuery("");
    setAnswer("");
    setSources([]);
    inputRef.current?.focus();
  };

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(answer);
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Chat pane */}
      <div className="lg:col-span-7 space-y-4">
        <div className="relative rounded-2xl border border-white/15 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl p-4 md:p-5 shadow-[0_20px_60px_-20px_rgba(99,102,241,0.35)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs text-muted-foreground">{description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {scopeDomains?.length ? (
                <div className="hidden md:flex flex-wrap gap-1.5">
                  {scopeDomains.map((d) => (
                    <Badge key={d} variant="secondary" className="bg-zinc-800/70 text-zinc-200">{d}</Badge>
                  ))}
                </div>
              ) : null}
              <Button variant="secondary" size="sm" onClick={clearAll}>Clear</Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="rounded-xl border border-white/15 dark:border-white/10 bg-white/70 dark:bg-white/5">
            <Textarea
              ref={inputRef}
              placeholder="Ask your question…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              rows={4}
              className="min-h-[104px] resize-none bg-transparent focus-visible:ring-indigo-400"
            />
            <div className="flex items-center justify-between px-3 pb-3 -mt-1">
              <div className="text-xs text-muted-foreground">
                Press Enter to send • Shift+Enter for new line
              </div>
              <Button
                onClick={submit}
                disabled={loading || !query.trim()}
                className="gap-1.5 text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:shadow-[0_0_18px_1px_rgba(139,92,246,0.45)]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
                {loading ? "Answering…" : "Send"}
              </Button>
            </div>
          </div>
        </div>

        {/* Answer card */}
        <Card className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Answer</div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={copyAnswer} className="gap-1.5">
                <ClipboardCopy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="text-sm whitespace-pre-wrap">
            {answer || (loading ? "Thinking…" : "Ask something to get started.")}
          </div>
        </Card>
      </div>

      {/* Right: Sources + History */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="h-4 w-4 text-indigo-400" />
            Sources
          </div>
          <Separator className="my-3" />
          {sources.length === 0 ? (
            <div className="text-xs text-muted-foreground">Citations will appear here when available.</div>
          ) : (
            <ScrollArea className="max-h-64 pr-2">
              <ul className="list-disc ml-5 space-y-2 text-xs text-muted-foreground">
                {sources.map((s, i) => (
                  <li key={`${s}-${i}`}>{s}</li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </Card>

        <Card className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-indigo-400" />
            Recent
          </div>
          <Separator className="my-3" />
          {history.length === 0 ? (
            <div className="text-xs text-muted-foreground">Your last 10 questions will appear here.</div>
          ) : (
            <ScrollArea className="max-h-64 pr-2 space-y-3">
              {history.map((h, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-3">
                  <div className="text-xs font-medium mb-1">Q: {h.q}</div>
                  <div className="text-xs text-muted-foreground line-clamp-3">A: {h.a}</div>
                </div>
              ))}
            </ScrollArea>
          )}
        </Card>

        <Card className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl p-4 md:p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            Tips
          </div>
          <Separator className="my-3" />
          <ul className="list-disc ml-5 text-xs text-muted-foreground space-y-1.5">
            <li>Be specific: include product, client, or section keywords.</li>
            <li>Use follow-ups: “cite pricing term” or “compare SLAs”.</li>
            <li>Scope matters: queries only search permitted domains.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ChatResearch;
