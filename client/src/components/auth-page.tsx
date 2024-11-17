'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { type } from 'os';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type AuthFormData = {
  email: string;
  password: string;
};

interface SignInFormProps {
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
  errors: FormErrors;
  onForgotPassword: () => void;
  onGoogleSignIn: () => Promise<void>;
}

interface SignUpFormProps {
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading: boolean;
  errors: FormErrors;
  onGoogleSignIn: () => Promise<void>;
}

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
  errors: FormErrors;
  onBack: () => void;
}

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

  const SignInForm: React.FC = () => (
    <form id="signin-form" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          data-testid="email-input"
          placeholder="m@example.com"
          required
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p
            className="text-sm text-red-500"
            data-testid="email-error"
            id="email-error"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          data-testid="password-input"
          required
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p
            className="text-sm text-red-500"
            data-testid="password-error"
            id="password-error"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>
      {errors.general && (
        <p className="mt-2 text-sm text-red-500" data-testid="general-error" role="alert">
          {errors.general}
        </p>
      )}
      <Button
        className="mt-4 w-full"
        type="submit"
        data-testid="signin-submit"
        disabled={isLoading}
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
      <Button
        variant="link"
        className="mt-2 w-full"
        onClick={() => setIsForgotPassword(true)}
        type="button"
      >
        Forgot password?
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={loginWithGoogle}
        disabled={isLoading}
        type="button"
        data-testid="google-signin"
      >
        Sign in with Google
      </Button>
    </form>
  );

  const SignUpForm: React.FC = () => (
    <form id="signup-form" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          data-testid="email-input"
          placeholder="m@example.com"
          required
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p
            className="text-sm text-red-500"
            data-testid="email-error"
            id="email-error"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          data-testid="password-input"
          required
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <p
            className="text-sm text-red-500"
            data-testid="password-error"
            id="password-error"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>
      <Button
        className="mt-4 w-full"
        type="submit"
        disabled={isLoading}
        data-testid="signup-submit"
      >
        {isLoading ? 'Signing Up...' : 'Sign Up'}
      </Button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full"
        onClick={loginWithGoogle}
        disabled={isLoading}
        type="button"
        data-testid="google-signup"
      >
        Sign up with Google
      </Button>
    </form>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{isForgotPassword ? 'Reset Password' : 'Welcome'}</CardTitle>
          <CardDescription>
            {isForgotPassword
              ? 'Enter your email to reset your password'
              : 'Sign in to your account or create a new one'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <form id="forgot-password-form" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  data-testid="email-input"
                  placeholder="m@example.com"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500" data-testid="email-error">
                    {errors.email}
                  </p>
                )}
              </div>
              <Button
                className="mt-4 w-full"
                type="submit"
                disabled={isLoading}
                data-testid="reset-submit"
              >
                {isLoading ? 'Processing...' : 'Reset Password'}
              </Button>
              <Button
                variant="link"
                className="mt-2 w-full"
                onClick={() => setIsForgotPassword(false)}
                type="button"
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <Tabs
              defaultValue="signin"
              className="w-full"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
