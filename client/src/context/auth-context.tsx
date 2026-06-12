'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { toast } from 'sonner';
import { getFirebaseAuth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteSelf: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (current) => {
      setUser(current);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      setUser(credential.user);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed', { description: friendlyAuthError(error) });
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      setUser(credential.user);
      toast.success('Account created');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Sign up failed', { description: friendlyAuthError(error) });
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      setUser(result.user);
      toast.success('Welcome back');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Login failed', { description: friendlyAuthError(error) });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      toast.success('Reset email sent', {
        description: 'Check your inbox for the reset link.',
      });
    } catch (error) {
      toast.error('Could not send reset email', { description: friendlyAuthError(error) });
    }
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
    setUser(null);
    router.push('/login');
  };

  const deleteSelf = async () => {
    if (!user) return;
    try {
      await deleteUser(user);
      toast.success('Account deleted');
      router.push('/');
    } catch (error) {
      toast.error('Could not delete account', { description: friendlyAuthError(error) });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, loginWithGoogle, forgotPassword, logout, deleteSelf }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in window was closed.';
    case 'auth/requires-recent-login':
      return 'Please sign in again, then retry.';
    default:
      return (error as Error)?.message ?? 'Something went wrong.';
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
