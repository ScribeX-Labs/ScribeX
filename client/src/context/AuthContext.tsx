'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
  getAuth,
  deleteUser,
} from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  createUser: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  deleteSelf: () => Promise<void>;
  deleteTranscription: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

const noAuthRoutes = ['/login', '/'];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isNoAuthRoute = noAuthRoutes.includes(pathname);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      toast({
        title: 'Login successful',
        description: 'You have successfully logged in',
      });
      router.push('/providers');
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
      });
    }
  };

  const createUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      toast({
        title: 'Account created',
        description: 'You have successfully created an account',
      });
      router.push('/providers');
    } catch (error: any) {
      toast({
        title: 'Account creation failed',
        description: error.message,
      });
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast({
        title: 'Login successful',
        description: 'You have successfully logged in',
      });
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for instructions on how to reset your password',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to send password reset email',
        description: error.message,
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);

      toast({
        title: 'Logout successful',
        description: 'You have successfully logged out',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message,
      });
    }
  };

  const deleteTranscription = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transcription', id));

      toast({
        title: 'Transcription deleted',
        description: 'Transcription deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting transcription', error);
      toast({
        title: 'Failed to delete transcription',
        description: 'An error occurred while deleting transcription',
      });
    }
  };

  const deleteChat = async (id: string): Promise<void> => {
    try {
      const chatDocRef = doc(db, 'chats', id);
      await deleteDoc(chatDocRef);
      console.log(`Chat with id ${id} deleted successfully`);
    } catch (error) {
      console.error('Erorr deleting chat: ', error);
      throw new Error('Failed to delete chat');
    }
  };

  const deleteSelf = async () => {
    try {
      console.log('inside the try curly braces');
      if (user) {
        await deleteUser(user);
        console.log('User deleted');
      } else {
        throw new Error('No user to delete');
      }
      console.log('User deleted');
    } catch (error) {
      console.log('There is an error whilst attempting to delete user, ', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        createUser,
        loginWithGoogle,
        forgotPassword,
        deleteSelf, // Include deleteSelf in the context
        deleteTranscription, // this is used to deleteTranscription from database
        deleteChat,
        isLoading,
      }}
    >
      {isNoAuthRoute ? <>{children}</> : <ProtectedRoute>{children}</ProtectedRoute>}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
