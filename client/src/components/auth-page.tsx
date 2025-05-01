'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import ScribeLogo from '@/components/ScribeLogo';
import { AlertCircle, Mail, Lock, RotateCcw, ArrowLeft } from 'lucide-react';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type AuthFormData = {
  email: string;
  password: string;
};

export default function AuthPage() {
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [errors, setErrors] = useState<FormErrors>({});
  const { login, createUser, loginWithGoogle, forgotPassword, isLoading } = useAuth();

  const validateForm = (data: Partial<AuthFormData>): FormErrors => {
    const errors: FormErrors = {};

    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validationErrors = validateForm({ email, password });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      if (event.currentTarget.id === 'signin-form') {
        await login(email, password);
      } else if (event.currentTarget.id === 'signup-form') {
        await createUser(email, password);
      } else if (event.currentTarget.id === 'forgot-password-form') {
        await forgotPassword(email);
        toast({
          title: 'Password reset email sent',
          description: 'Check your inbox for instructions to reset your password.',
        });
      }
    } catch (error) {
      const err = error as Error;
      if (err.message.toLowerCase().includes('password')) {
        setErrors({ password: err.message });
      } else if (
        err.message.toLowerCase().includes('user') ||
        err.message.toLowerCase().includes('email')
      ) {
        setErrors({ email: err.message });
      } else {
        setErrors({ general: err.message });
      }
    }
  };

  return (
    <div className="container relative flex min-h-[80vh] flex-col items-center justify-center px-4">
      <div className="absolute -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"></div>
      <div className="absolute -bottom-40 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px]"></div>

      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -z-10 h-12 w-12 animate-pulse rounded-full bg-primary/20 blur-md"></div>
            <ScribeLogo className="h-12 w-12 text-primary" />
          </div>
          <h1 className="gradient-text ml-2 text-4xl font-bold">Scribe</h1>
        </div>

        {isForgotPassword ? (
          <Card className="glass-effect border-none shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="forgot-password-form" onSubmit={handleSubmit} noValidate>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className="rounded-lg border-primary/20 pl-10 focus:border-primary/50 focus:ring-primary/20"
                        required
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <p className="flex items-center text-sm text-destructive" role="alert">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  {errors.general && (
                    <p className="flex items-center text-sm text-destructive" role="alert">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {errors.general}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="button-glow w-full rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Reset Link
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 w-full rounded-full hover:bg-primary/5"
                    onClick={() => setIsForgotPassword(false)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-effect border-none shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'signin'
                  ? 'Enter your credentials to sign in'
                  : 'Enter your information to create an account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-transparent">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:tab-active data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:tab-active data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form
                    id="signin-form"
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          className="rounded-lg border-primary/20 pl-10 focus:border-primary/50 focus:ring-primary/20"
                          required
                          aria-invalid={errors.email ? 'true' : 'false'}
                        />
                      </div>
                      {errors.email && (
                        <p className="flex items-center text-sm text-destructive" role="alert">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => setIsForgotPassword(true)}
                          type="button"
                        >
                          Forgot password?
                        </Button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          className="rounded-lg border-primary/20 pl-10 focus:border-primary/50 focus:ring-primary/20"
                          required
                          aria-invalid={errors.password ? 'true' : 'false'}
                        />
                      </div>
                      {errors.password && (
                        <p className="flex items-center text-sm text-destructive" role="alert">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                    {errors.general && (
                      <p className="flex items-center text-sm text-destructive" role="alert">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.general}
                      </p>
                    )}
                    <Button
                      className="button-glow w-full rounded-full"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup">
                  <form
                    id="signup-form"
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-4 pt-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          className="rounded-lg border-primary/20 pl-10 focus:border-primary/50 focus:ring-primary/20"
                          required
                          aria-invalid={errors.email ? 'true' : 'false'}
                        />
                      </div>
                      {errors.email && (
                        <p className="flex items-center text-sm text-destructive" role="alert">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          className="rounded-lg border-primary/20 pl-10 focus:border-primary/50 focus:ring-primary/20"
                          required
                          aria-invalid={errors.password ? 'true' : 'false'}
                        />
                      </div>
                      {errors.password && (
                        <p className="flex items-center text-sm text-destructive" role="alert">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          {errors.password}
                        </p>
                      )}
                    </div>
                    {errors.general && (
                      <p className="flex items-center text-sm text-destructive" role="alert">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        {errors.general}
                      </p>
                    )}
                    <Button
                      className="button-glow w-full rounded-full"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={loginWithGoogle}
                disabled={isLoading}
                type="button"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign {activeTab === 'signin' ? 'in' : 'up'} with Google
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center p-4 text-center text-sm">
              <p className="text-muted-foreground">
                {activeTab === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                >
                  {activeTab === 'signin' ? 'Sign up' : 'Sign in'}
                </Button>
              </p>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
