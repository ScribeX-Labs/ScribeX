'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { useAuth } from './auth-context';

export interface FileData {
  id?: string;
  original_filename: string;
  content_type: string;
  file_url: string;
  filename: string;
  upload_timestamp: Timestamp;
  user_id: string;
  text_id?: string;
  rating?: number;
}

export interface AllFiles {
  audioFiles: FileData[];
  videoFiles: FileData[];
}

interface UserUploadDataContextType {
  getAllFiles: () => Promise<AllFiles>;
  getFileById: (fileId: string) => Promise<FileData | null>;
  updateFile: (fileId: string, fileData: Partial<FileData>) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
}

const UserUploadDataContext = createContext<UserUploadDataContextType | null>(null);

const MEDIA_COLLECTIONS = ['audio_files', 'video_files'] as const;

export function UserUploadDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const getFiles = async (kind: (typeof MEDIA_COLLECTIONS)[number]): Promise<FileData[]> => {
    if (!user) return [];
    try {
      const snapshot = await getDocs(collection(getFirebaseDb(), 'uploads', user.uid, kind));
      return snapshot.docs.map((d) => ({ ...(d.data() as FileData), id: d.id }));
    } catch (error) {
      console.error(`Error fetching ${kind}:`, error);
      return [];
    }
  };

  const getAllFiles = async (): Promise<AllFiles> => {
    const [audioFiles, videoFiles] = await Promise.all([
      getFiles('audio_files'),
      getFiles('video_files'),
    ]);
    return { audioFiles, videoFiles };
  };

  const findDocRef = async (fileId: string) => {
    if (!user) return null;
    for (const kind of MEDIA_COLLECTIONS) {
      const ref = doc(getFirebaseDb(), 'uploads', user.uid, kind, fileId);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) return { ref, snapshot };
    }
    return null;
  };

  const getFileById = async (fileId: string): Promise<FileData | null> => {
    try {
      const found = await findDocRef(fileId);
      if (!found) return null;
      return { ...(found.snapshot.data() as FileData), id: found.snapshot.id };
    } catch (error) {
      console.error('Error fetching file:', error);
      return null;
    }
  };

  const updateFile = async (fileId: string, fileData: Partial<FileData>) => {
    const found = await findDocRef(fileId);
    if (found) await updateDoc(found.ref, fileData);
  };

  const deleteFile = async (fileId: string) => {
    const found = await findDocRef(fileId);
    if (found) await deleteDoc(found.ref);
  };

  return (
    <UserUploadDataContext.Provider value={{ getAllFiles, getFileById, updateFile, deleteFile }}>
      {children}
    </UserUploadDataContext.Provider>
  );
}

export function useUserUploadData() {
  const context = useContext(UserUploadDataContext);
  if (!context) {
    throw new Error('useUserUploadData must be used within a UserUploadDataProvider');
  }
  return context;
}
