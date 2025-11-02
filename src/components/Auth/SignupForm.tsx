import React, { useEffect, useMemo, useState } from "react";
import { adminExists, signup } from "../../api/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Check, Shield, UserIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  onSignupSuccess: () => void;
}

const strengthPalette = [
  "bg-[var(--color-border)]",           // 0
  "bg-rose-500",                        // 1
  "bg-orange-500",                      // 2
  "bg-yellow-500",                      // 3
  "bg-lime-500",                        // 4
  "bg-emerald-500",                     // 5
];

const SignupForm: React.FC<Props> = ({ onSignupSuccess }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [allowAdmin, setAllowAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    adminExists()
      .then((exists) => {
        if (mounted) setAllowAdmin(!exists);
      })
      .catch(() => {
        if (mounted) setAllowAdmin(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const passwordScore = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-5
  }, [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup({ email, username, password, role });
      onSignupSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    email.trim().length > 0 &&
    username.trim().length > 0 &&
    password.length >= 8 &&
    confirm.length >= 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-sm mx-auto"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div
        className={[
          "rounded-2xl p-6 md:p-7",
          "bg-[var(--color-card)]/80 backdrop-blur-xl",
          "border border-[var(--color-border)]",
          "shadow-[0_12px_45px_-15px_var(--shadow-color)]",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-[var(--color-primary)]/30 blur opacity-50" />
            <div className="relative h-9 w-9 rounded-full bg-[var(--color-foreground)]/90 ring-1 ring-[var(--color-border)] flex items-center justify-center">
              <span className="text-white text-sm font-semibold">EDP</span>
            </div>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Sign up to get started
            </p>
          </div>
        </div>

        <Separator className="my-5" />

        <form onSubmit={submit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[var(--color-input)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-[var(--color-input)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[var(--color-input)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
            />
            {/* Strength meter */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={[
                    "h-1.5 w-full rounded-full transition-colors",
                    i < passwordScore
                      ? strengthPalette[passwordScore]
                      : "bg-[var(--color-border)]",
                  ].join(" ")}
                />
              ))}
            </div>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">
              Use at least 8 characters with upper, lower, numbers, and symbols.
            </p>
          </div>

          {/* Confirm */}
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="bg-[var(--color-input)] border-[var(--color-border)] focus-visible:ring-[var(--color-ring)]"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="flex items-center gap-2">
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "admin" | "user")}
              >
                <SelectTrigger
                  id="role"
                  className="w-full bg-[var(--color-input)] border-[var(--color-border)] focus:ring-[var(--color-ring)]"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--color-popover)] border-[var(--color-border)]">
                  <SelectItem value="user">User</SelectItem>
                  {allowAdmin && <SelectItem value="admin">Admin</SelectItem>}
                </SelectContent>
              </Select>
              {allowAdmin ? (
                <Shield className="h-4 w-4 text-[var(--color-primary)]" />
              ) : (
                <UserIcon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
              )}
            </div>
            {!allowAdmin && (
              <p className="text-[11px] text-[var(--color-muted-foreground)]">
                Admin is available for the first account; admins can promote users later.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <Alert className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className={[
              "w-full",
              "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
              "hover:bg-[color-mix(in_oklch,var(--color-primary),black_10%)]",
              "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-0",
            ].join(" ")}
          >
            {loading ? (
              "Signing up..."
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Sign Up
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default SignupForm;
