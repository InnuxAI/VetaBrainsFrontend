import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { type DocumentResponse } from "@/api/documents";

type Props = {
  documents: DocumentResponse[];
  selected: string[];
  onChange: (ids: string[]) => void;
  limit?: number;
};

const DocMultiSelect: React.FC<Props> = ({ documents, selected, onChange, limit = 24 }) => {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };
  const top = useMemo(() => documents.slice(0, limit), [documents, limit]);

  return (
    <div className="flex flex-wrap gap-2">
      {top.map((d) => {
        const on = selected.includes(d.id);
        const label = d.title || d.original_name || d.filename;
        return (
          <button
            key={d.id}
            onClick={() => toggle(d.id)}
            className={[
              "px-2.5 py-1.5 rounded-lg border text-xs",
              on
                ? "border-indigo-400 bg-indigo-500/15 text-indigo-200"
                : "border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10",
            ].join(" ")}
            title={label}
          >
            {label}
          </button>
        );
      })}
      {documents.length > limit && (
        <Badge variant="secondary" className="bg-zinc-800/70 text-zinc-200">
          +{documents.length - limit} more
        </Badge>
      )}
    </div>
  );
};

export default DocMultiSelect;
