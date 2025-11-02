import React, { useState } from 'react';
import { login } from '../../api/auth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface Props {
  onLoginSuccess: (user: any, token: string) => void;
}

const LoginForm: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const data = await login(email, password);
      onLoginSuccess(data.user, data.access_token);
      localStorage.setItem('accessToken', data.access_token);
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (

      
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-sm mx-auto font-[var(--font-sans)]"
      >
      <div
        className="rounded-[var(--radius-lg)] p-6 md:p-8 
        bg-[var(--card)] text-[var(--card-foreground)]
        border border-[var(--border)] shadow-[var(--shadow-md)]"
        >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] 
                          flex items-center justify-center font-bold text-sm">
            VB
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Welcome back
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Sign in to continue
            </p>
          </div>
        </div>

        <Separator className="my-5 bg-[var(--border)]" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email" className="text-[var(--foreground)]">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-[var(--input)] border border-[var(--border)] 
              focus-visible:ring-[var(--ring)] 
              rounded-[var(--radius-md)] text-[var(--foreground)]"
              />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password" className="text-[var(--foreground)]">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="pr-10 bg-[var(--input)] border border-[var(--border)] 
                focus-visible:ring-[var(--ring)] 
                rounded-[var(--radius-md)] text-[var(--foreground)]"
                />
              <button
                type="button"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                onClick={() => setShowPwd(s => !s)}
                className="absolute inset-y-0 right-3 flex items-center 
                text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                tabIndex={-1}
                >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <Alert
            variant="destructive"
            className="bg-[var(--destructive)]/10 text-[var(--destructive)] 
            border border-[var(--destructive)]/40 rounded-[var(--radius-md)]"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Button */}
          <Button
            type="submit"
            disabled={submitting || !email || !password}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] 
            rounded-[var(--radius-md)] font-medium hover:bg-[var(--primary)]/90 
            focus:ring-2 focus:ring-[var(--ring)] transition-all"
            >
            <LogIn className="mr-2 h-4 w-4" />
            {submitting ? 'Signing in…' : 'Log In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-5 text-[11px] text-[var(--muted-foreground)] text-center">
          Press Ctrl/⌘ + K anywhere to open command menu
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
