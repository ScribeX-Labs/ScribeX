'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScribeLogo } from '@/components/scribe-logo';
import { Waveform } from '@/components/waveform';
import { useAuth } from '@/context/auth-context';

type Mode = 'login' | 'signup' | 'reset';

const COPY: Record<Mode, { title: string; description: string; cta: string }> = {
  login: {
    title: 'Welcome back',
    description: 'Sign in to pick up where you left off.',
    cta: 'Sign in',
  },
  signup: {
    title: 'Create your account',
    description: 'Start transcribing in under a minute.',
    cta: 'Create account',
  },
  reset: {
    title: 'Reset password',
    description: 'We’ll email you a link to reset it.',
    cta: 'Send reset link',
  },
};

export default function LoginPage() {
  const { login, signup, loginWithGoogle, forgotPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') await login(email, password);
      else if (mode === 'signup') await signup(email, password);
      else {
        await forgotPassword(email);
        setMode('login');
      }
    } catch {
      // surfaced via toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-x-0 top-0 -z-10 h-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,oklch(0.795_0.155_75/0.1),transparent)]" />
      <Waveform className="absolute bottom-0 left-1/2 h-16 w-[120%] -translate-x-1/2 justify-center opacity-20" />

      <div className="rise w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <ScribeLogo />
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">{COPY[mode].title}</CardTitle>
            <CardDescription>{COPY[mode].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode !== 'reset' && (
              <>
                <Button
                  variant="outline"
                  className="press w-full"
                  onClick={loginWithGoogle}
                  disabled={submitting}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <div className="flex items-center gap-3">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <Button type="submit" className="press w-full" disabled={submitting}>
                {submitting && <Loader2 className="animate-spin" />}
                {COPY[mode].cta}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' && (
                <>
                  New here?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Create an account
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => setMode('login')}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Back to sign in
                </button>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.96h5.35c-.5 2.36-2.45 3.7-5.35 3.7a5.76 5.76 0 1 1 0-11.52c1.47 0 2.79.5 3.83 1.49l2.21-2.21A8.96 8.96 0 0 0 12 3a9 9 0 1 0 0 18c5.19 0 8.63-3.65 8.63-8.79 0-.39-.1-.74-.28-1.11Z"
      />
    </svg>
  );
}
