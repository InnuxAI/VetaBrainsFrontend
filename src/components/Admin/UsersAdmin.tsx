import React, { useEffect, useMemo, useState, useRef } from "react";
import { adminListUsers, adminUpdateUser, adminSetUserDomains, listDomains } from "../../api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  domains: string[];
  is_active: boolean;
  created_at?: string;
}
interface Domain {
  id: string;
  name: string;
  display_name?: string;
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [error, setError] = useState<string | null>(null);

  const domainNames = useMemo(() => domains.map((d) => d.name), [domains]);

  const load = async () => {
    setError(null);
    try {
      const [u, d] = await Promise.all([adminListUsers(), listDomains()]);
      setUsers(u);
      setDomains(d);
    } catch {
      setError("Failed to load users or domains");
    }
  };
  useEffect(() => {
    load();
  }, []);

  const toggleRole = async (u: User) => {
    try {
      const nextRole = u.role === "admin" ? "user" : "admin";
      await adminUpdateUser(u.id, { role: nextRole });
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to update role");
    }
  };

  const saveDomains = async (u: User, domainsCsv: string) => {
    const safe = domainsCsv
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    try {
      await adminSetUserDomains(u.id, safe);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to set domains");
    }
  };

  return (
    <div className="space-y-4" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Users</h2>
        <div className="text-xs text-[var(--color-muted-foreground)]">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && (
        <Alert className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {users.map((u, idx) => (
          <div
            key={u.id}
            className={[
              "rounded-2xl border border-[var(--color-border)]/60",
              idx % 2 === 0 ? "bg-[var(--color-card)]/70" : "bg-[var(--color-card)]/50",
              "p-4"
            ].join(" ")}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              {/* Left: identity */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  >
                    {u.username.slice(0, 2).toUpperCase()}
                  </Badge>
                  <div className="font-medium truncate">{u.username}</div>
                </div>
                <div className="text-sm text-[var(--color-muted-foreground)] truncate">
                  {u.email}
                </div>
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  Created {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                </div>
              </div>

              {/* Middle: role and domains snapshot */}
              <div className="min-w-0 md:flex-1">
                <div className="text-sm">
                  Role:{" "}
                  <span className={u.role === "admin" ? "text-[var(--color-chart-5)]" : "text-[var(--color-foreground)]"}>
                    {u.role}
                  </span>
                </div>
                <div className="text-sm">
                  Domains:{" "}
                  <span className="text-[var(--color-muted-foreground)] line-clamp-2 break-all">
                    {u.domains.length ? u.domains.join(", ") : "—"}
                  </span>
                </div>
              </div>

              {/* Right: actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRole(u)}
                  className="border-[var(--color-border)] hover:bg-[var(--color-accent)]/30"
                >
                  {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                </Button>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Domains editor row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                defaultValue={u.domains.join(", ")}
                placeholder="comma separated domain names"
                className="flex-1 bg-[var(--color-input)] border-[var(--color-border)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    saveDomains(u, target.value);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={(e) => {
                  const wrapper = e.currentTarget.parentElement as HTMLElement;
                  const input = wrapper.querySelector("input") as HTMLInputElement;
                  saveDomains(u, input.value);
                }}
                className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary)]/90"
              >
                Save Domains
              </Button>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p className="text-sm text-[var(--color-muted-foreground)]">No users yet.</p>
      )}
    </div>
  );
};

export default UsersAdmin;
