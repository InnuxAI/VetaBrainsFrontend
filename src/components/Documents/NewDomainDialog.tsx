import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/api/http";

interface Props {
  onCreated: () => void;
}

const NewDomainDialog: React.FC<Props> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [subdomains, setSubdomains] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName("");
      setDisplayName("");
      setDescription("");
      setSubdomains("");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim().toLowerCase();
    if (!cleanName) {
      setError("Domain name is required");
      return;
    }

    setLoading(true);
    const subs = Array.from(
      new Set(
        subdomains
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      )
    );

    try {
      await api.post("/domains/", {
        name: cleanName,
        display_name: displayName || undefined,
        description: description || undefined,
        subdomains: subs.length ? subs : undefined,
      });
      setOpen(false);
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to create domain");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="
            px-4
            bg-[var(--color-primary)]
            text-[var(--color-primary-foreground)]
            hover:bg-[color-mix(in_oklch,var(--color-primary),black_12%)]
            shadow-sm
            rounded-[var(--radius-md)]
          "
        >
          + New Folder
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          sm:max-w-lg
          bg-[var(--color-popover)]
          text-[var(--color-popover-foreground)]
          border border-[var(--color-border)]
          shadow-xl
          rounded-[var(--radius-lg)]
          p-0
        "
      >
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create New Domain
            </DialogTitle>
            <DialogDescription className="text-[var(--color-muted-foreground)]">
              Organize documents under a new domain. Optionally add subdomains as comma-separated values.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Domain Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., sales"
              required
              className="
                bg-[var(--color-input)]
                border-[var(--color-border)]
                focus-visible:ring-2
                focus-visible:ring-[var(--color-ring)]
                rounded-[var(--radius-md)]
              "
              autoFocus
            />
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Lowercase, concise name used in URLs and permissions.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Sales Department"
              className="
                bg-[var(--color-input)]
                border-[var(--color-border)]
                focus-visible:ring-2
                focus-visible:ring-[var(--color-ring)]
                rounded-[var(--radius-md)]
              "
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional domain description for context"
              className="
                bg-[var(--color-input)]
                border-[var(--color-border)]
                focus-visible:ring-2
                focus-visible:ring-[var(--color-ring)]
                rounded-[var(--radius-md)]
              "
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subdomains">Subdomains (comma-separated)</Label>
            <Input
              id="subdomains"
              value={subdomains}
              onChange={(e) => setSubdomains(e.target.value)}
              placeholder="e.g., policies, region-east, 2025-reports"
              className="
                bg-[var(--color-input)]
                border-[var(--color-border)]
                focus-visible:ring-2
                focus-visible:ring-[var(--color-ring)]
                rounded-[var(--radius-md)]
              "
            />
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Use simple, lowercase slugs. You can edit subdomains later.
            </p>
          </div>

          {error && (
            <div className="text-sm text-[var(--color-destructive)]">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="
                border-[var(--color-border)]
                text-[var(--color-foreground)]
                hover:bg-[var(--color-accent)]
                hover:text-[var(--color-accent-foreground)]
                rounded-[var(--radius-md)]
              "
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="
                bg-[var(--color-primary)]
                text-[var(--color-primary-foreground)]
                hover:bg-[color-mix(in_oklch,var(--color-primary),black_12%)]
                rounded-[var(--radius-md)]
              "
            >
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDomainDialog;
