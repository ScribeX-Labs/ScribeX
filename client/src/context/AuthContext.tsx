'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { toast } from 'sonner';
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
} from 'firebase/auth';
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db } from '../lib/firebase';

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
      toast.success('Login successful');
      router.push('/providers');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const createUser = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      toast.success('User created successfully');
      router.push('/providers');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      toast.success('Login with Google successful');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Logout successful');
      router.push('/login');
    } catch (error: any) {
      toast.error('Failed to log out');
    }
  };

  const deleteSelf = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.delete();
        setUser(null);
        toast.success("Account deleted successfully");
        router.push('/login');
      } catch (error: any) {
        if (error.code === "auth/requires-recent-login") {
          toast.error("Please re-authenticate to delete your account.");
        } else {
          toast.error("Failed to delete account");
        }
      }
    } else {
      toast.error("No user is currently signed in.");
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
        deleteSelf,  // Include deleteSelf in the context
        deleteTranscription, // this is used to deleteTranscription from database
        deleteChat,
        isLoading,
      }}
    >
      {isNoAuthRoute ? <>{children}</> : <ProtectedRoute>{children}</ProtectedRoute>}
    </AuthContext.Provider>
  );
};

const deleteTranscription = async (id: string) => {
  try{
    await deleteDoc(doc(db, "transcription", id));
    toast.success("Transcription deleted successfully")
  }catch(error){
    console.error("Error deleting transcription", error);
    toast.error("Fao;ed to delete transcription")
  }
}

const deleteChat = async (id: string): Promise<void> => {
  try{
    const chatDocRef = doc(db, "chats", id);
    await deleteDoc(chatDocRef);
    console.log(`Chat with id ${id} deleted successfully`)
  }catch(error){
    console.error("Erorr deleting chat: ", error);
    throw new Error("Failed to delete chat")
  }
}







  //currently working on the deleting data function. work on this during class (?)

  const deleteData = async (tab: string, item: number) => {
    if(tab == "transcription"){

    }else if(tab == "chats"){

    }else{
      console.log("there is nothing to delete")
    }
  }
  


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
