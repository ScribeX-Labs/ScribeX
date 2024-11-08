'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function AuthPage() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const { login, createUser, loginWithGoogle, forgotPassword, isLoading } = useAuth();

  const validateForm = (email: string, password?: string): FormErrors => {
    const errors: FormErrors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (password === '') {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validationErrors = validateForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    if (event.currentTarget.id === 'signin-form') {
      await login(email, password);
    } else if (event.currentTarget.id === 'signup-form') {
      await createUser(email, password);
    } else if (event.currentTarget.id === 'forgot-password-form') {
      await forgotPassword(email);
    }
  };

  const ForgotPasswordForm = () => (
    <form id="forgot-password-form" onSubmit={handleSubmit}>
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
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      <Button className="mt-4 w-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Reset Password'}
      </Button>
      <Button variant="link" className="mt-2 w-full" onClick={() => setIsForgotPassword(false)}>
        Back to Sign In
      </Button>
    </form>
  );

  const SignInForm = () => (
    <form id="signin-form" onSubmit={handleSubmit}>
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
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          data-testid="password-input"
          required
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>
      <Button className="mt-4 w-full" type="submit" disabled={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
      <Button variant="link" className="mt-2 w-full" onClick={() => setIsForgotPassword(true)}>
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
      <Button variant="outline" className="w-full" onClick={loginWithGoogle} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Sign in with Google'}
      </Button>
    </form>
  );

  const SignUpForm = () => (
    <form id="signup-form" onSubmit={handleSubmit}>
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
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          data-testid="password-input"
          required
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>
      <Button className="mt-4 w-full" type="submit" disabled={isLoading}>
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
      <Button variant="outline" className="w-full" onClick={loginWithGoogle} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Sign up with Google'}
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
            <ForgotPasswordForm />
          ) : (
            <Tabs defaultValue="signin" className="w-full">
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
