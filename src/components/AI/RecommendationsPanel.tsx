import React, { useEffect, useState } from "react";
// import { fetchRecommendations, type RecItem } from "@/api/recommendations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type Props = {
  onOpenDoc?: (docId: string) => void; // optional handler for preview or navigation
};

const RecommendationsPanel: React.FC<Props> = ({ onOpenDoc }) => {
  const [items, setItems] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);
//     fetchRecommendations()
//       .then(setItems)
//       .catch(() => setItems([]))
//       .finally(() => setLoading(false));
//   }, []);

  return (
    <div className="rounded-2xl border border-white/15 dark:border-white/10 bg-white/60 dark:bg-white/10 backdrop-blur-xl p-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold">For you</div>
      </div>
      <div className="mt-3 space-y-3">
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading recommendations…</div>
        ) : items.length === 0 ? (
          <div className="text-xs text-muted-foreground">No recommendations yet. Engage with documents to personalize suggestions.</div>
        ) : (
          items.slice(0, 5).map((r) => (
            <div key={`${r.doc_id}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{r.title || r.doc_id}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Score {r.score.toFixed(2)}</div>
                <div className="mt-1">
                  <Badge variant="secondary" className="bg-zinc-800/70 text-zinc-200">{r.domain}</Badge>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => onOpenDoc?.(r.doc_id)}
                className="whitespace-nowrap"
              >
                Open
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;
