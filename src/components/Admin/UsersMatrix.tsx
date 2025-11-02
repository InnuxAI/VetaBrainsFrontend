import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import { adminSetUserDomains } from "../../api/admin";
import { Loader2, Shield, User as UserIcon, CheckSquare, XSquare, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type UserRow = {
  id: string;
  email: string;
  username: string;
  role: "admin" | "user";
  domains: string[];
};

type DomainCol = {
  id: string;
  name: string;
  display_name: string;
};

const UsersMatrix: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [domains, setDomains] = useState<DomainCol[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.get("/admin/matrix");
      setUsers(data.users);
      setDomains(data.domains);
    } catch {
      setError("Failed to load users/domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!ql) return true;
      return u.username.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql);
    });
  }, [users, q, roleFilter]);

  const toggle = async (userId: string, domainName: string, checked: boolean) => {
    setSaving(userId);
    setError(null);
    try {
      const user = users.find((u) => u.id === userId)!;
      const current = new Set(user.domains || []);
      checked ? current.add(domainName) : current.delete(domainName);
      const next = Array.from(current).sort();

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, domains: next } : u)));
      await adminSetUserDomains(userId, next);
    } catch {
      setError("Failed to update domains");
      load();
    } finally {
      setSaving(null);
    }
  };

  const setAllForUser = async (userId: string, grant: boolean) => {
    setSaving(userId);
    setError(null);
    try {
      const allNames = domains.map((d) => d.name);
      const next = grant ? allNames : [];
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, domains: next } : u)));
      await adminSetUserDomains(userId, next);
    } catch {
      setError("Failed to update domains");
      load();
    } finally {
      setSaving(null);
    }
  };

  const setAllForDomain = async (domainName: string, grant: boolean) => {
    setError(null);
    const affected = filteredUsers.filter((u) => u.role !== "admin");
    setUsers((prev) =>
      prev.map((u) => {
        if (!affected.some((x) => x.id === u.id)) return u;
        const s = new Set(u.domains || []);
        grant ? s.add(domainName) : s.delete(domainName);
        return { ...u, domains: Array.from(s).sort() };
      })
    );
    try {
      for (const u of affected) {
        const s = new Set(u.domains || []);
        grant ? s.add(domainName) : s.delete(domainName);
        await adminSetUserDomains(u.id, Array.from(s).sort());
      }
    } catch {
      setError("Failed to update domain permissions");
      load();
    }
  };

  return (
    <motion.div
      className="space-y-5 p-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)]/70 backdrop-blur-xl shadow-[0_0_25px_-8px_var(--shadow-color)]"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[var(--color-chart-1)] to-[var(--color-chart-5)] flex items-center justify-center shadow-[0_6px_30px_-12px_var(--shadow-color)]">
            <Sparkles className="text-white h-4 w-4" />
          </div>
          <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-chart-1)] via-[var(--color-chart-3)] to-[var(--color-chart-5)]">
            Permissions Matrix
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search user or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)]"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
          </div>
          <Select value={roleFilter} onValueChange={(v: "all" | "admin" | "user") => setRoleFilter(v)}>
            <SelectTrigger className="w-[160px] bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-[var(--color-popover)] text-[var(--color-popover-foreground)] border-[var(--color-border)]">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded-2xl border border-[var(--color-border)]/60">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-[var(--color-card)]/85 backdrop-blur-md border-b border-[var(--color-border)]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[220px]">User</TableHead>
                <TableHead className="w-[280px]">Email</TableHead>
                <TableHead className="w-[240px]">Role / Actions</TableHead>
                {domains.map((d) => (
                  <TableHead key={d.id} className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-[var(--color-chart-1)] font-medium">{d.display_name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10"
                        title={`Grant ${d.display_name}`}
                        onClick={() => setAllForDomain(d.name, true)}
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-rose-500 hover:bg-rose-500/10"
                        title={`Revoke ${d.display_name}`}
                        onClick={() => setAllForDomain(d.name, false)}
                      >
                        <XSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3 + domains.length} className="text-center py-8 text-[var(--color-muted-foreground)]">
                    No matching users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u, idx) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                    className={idx % 2 === 0 ? "bg-[var(--color-background)]/35" : "bg-[var(--color-background)]/15"}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-[var(--color-chart-1)] to-[var(--color-chart-5)] text-white rounded-lg"
                        >
                          {u.username.slice(0, 2).toUpperCase()}
                        </Badge>
                        <span className="font-medium text-[var(--color-foreground)]">{u.username}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-[var(--color-muted-foreground)]">{u.email}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-[var(--color-foreground)]">
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4 text-[var(--color-chart-5)]" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                        )}
                        <span className="capitalize">{u.role}</span>
                        {u.role !== "admin" && (
                          <>
                            <Separator orientation="vertical" className="mx-2 h-5 bg-[var(--color-border)]" />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAllForUser(u.id, true)}
                              disabled={saving === u.id}
                              className="border-[var(--color-chart-1)] text-[var(--color-chart-1)] hover:bg-[var(--color-chart-1)]/10"
                            >
                              Grant all
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setAllForUser(u.id, false)}
                              disabled={saving === u.id}
                              className="text-rose-500 hover:bg-rose-500/10"
                            >
                              Revoke all
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>

                    {domains.map((d) => {
                      const checked = (u.domains || []).includes(d.name);
                      const disabled = u.role === "admin";
                      const isSaving = saving === u.id;
                      return (
                        <TableCell key={d.id} className="text-center">
                          <div className="inline-flex items-center gap-2">
                            <Checkbox
                              checked={checked || disabled}
                              disabled={disabled || isSaving}
                              onCheckedChange={(val) => typeof val === "boolean" && toggle(u.id, d.name, val)}
                              className="data-[state=checked]:bg-[var(--color-chart-1)] border-[var(--color-chart-1)]"
                            />
                            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-muted-foreground)]" />}
                          </div>
                        </TableCell>
                      );
                    })}
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-[var(--color-muted-foreground)]">
        Tip: Use the header grant/revoke buttons to apply permissions to all visible non-admin users quickly.
      </p>
    </motion.div>
  );
};

export default UsersMatrix;
