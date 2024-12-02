'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface UserUploadDataContextType {
  addAudioFile: (fileData: FileData) => Promise<void>;
  addVideoFile: (fileData: FileData) => Promise<void>;
  getAudioFiles: () => Promise<FileData[]>;
  getVideoFiles: () => Promise<FileData[]>;
  getAllFiles: () => Promise<AllFiles>;
  getFileById: (fileId: string) => Promise<FileData | null>;
  updateFile: (fileId: string, fileData: Partial<FileData>) => Promise<void>;
}

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

const UserUploadDataContext = createContext<UserUploadDataContextType | null>(null);

export const UserUploadDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Access the current user from the AuthContext
  const firestore = getFirestore();

  const addAudioFile = async (fileData: FileData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const colRef = collection(firestore, 'uploads', user.uid, 'audio_files');
      const docRef = await addDoc(colRef, { ...fileData, user_id: user.uid });
      await updateDoc(docRef, { id: docRef.id });
    } catch (error: any) {
      console.error('Error adding audio file:', error.message);
    }
  };

  const addVideoFile = async (fileData: FileData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const colRef = collection(firestore, 'uploads', user.uid, 'video_files');
      const docRef = await addDoc(colRef, { ...fileData, user_id: user.uid });
      await updateDoc(docRef, { id: docRef.id });
    } catch (error: any) {
      console.error('Error adding video file:', error.message);
    }
  };

  const getAudioFiles = async (): Promise<FileData[]> => {
    try {
      if (!user) throw new Error('User not authenticated');
      const colRef = collection(firestore, 'uploads', user.uid, 'audio_files');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FileData,
      );
    } catch (error: any) {
      console.error('Error fetching audio files:', error.message);
      return [];
    }
  };

  const getVideoFiles = async (): Promise<FileData[]> => {
    try {
      if (!user) throw new Error('User not authenticated');
      const colRef = collection(firestore, 'uploads', user.uid, 'video_files');
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as FileData,
      );
    } catch (error: any) {
      console.error('Error fetching video files:', error.message);
      return [];
    }
  };

  const getFileById = async (fileId: string): Promise<FileData | null> => {
    try {
      if (!user) throw new Error('User not authenticated');
      const audioColRef = collection(firestore, 'uploads', user.uid, 'audio_files');
      const videoColRef = collection(firestore, 'uploads', user.uid, 'video_files');

      const [audioSnapshot, videoSnapshot] = await Promise.all([
        getDocs(audioColRef),
        getDocs(videoColRef),
      ]);

      const audioFile = audioSnapshot.docs.find((doc) => doc.id === fileId);
      if (audioFile) {
        return { id: audioFile.id, ...audioFile.data() } as FileData;
      }

      const videoFile = videoSnapshot.docs.find((doc) => doc.id === fileId);
      if (videoFile) {
        return { id: videoFile.id, ...videoFile.data() } as FileData;
      }

      return null;
    } catch (error: any) {
      console.error('Error fetching file by ID:', error.message);
      return null;
    }
  };

  const getAllFiles = async (): Promise<AllFiles> => {
    try {
      if (!user) throw new Error('User not authenticated');
      const [audioFiles, videoFiles] = await Promise.all([getAudioFiles(), getVideoFiles()]);

      return { audioFiles, videoFiles };
    } catch (error: any) {
      console.error('Error fetching all files:', error.message);
      return { audioFiles: [], videoFiles: [] };
    }
  };

  const updateFile = async (fileId: string, fileData: Partial<FileData>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const audioColRef = collection(firestore, 'uploads', user.uid, 'audio_files');
      const videoColRef = collection(firestore, 'uploads', user.uid, 'video_files');

      const [audioSnapshot, videoSnapshot] = await Promise.all([
        getDocs(audioColRef),
        getDocs(videoColRef),
      ]);

      const audioFile = audioSnapshot.docs.find((doc) => doc.id === fileId);
      if (audioFile) {
        await updateDoc(audioFile.ref, fileData);
        return;
      }

      const videoFile = videoSnapshot.docs.find((doc) => doc.id === fileId);
      if (videoFile) {
        await updateDoc(videoFile.ref, fileData);
        return;
      }
    } catch (error: any) {
      console.error('Error updating file:', error.message);
    }
  };

  return (
    <UserUploadDataContext.Provider
      value={{
        addAudioFile,
        addVideoFile,
        getAudioFiles,
        getVideoFiles,
        getAllFiles,
        getFileById,
        updateFile,
      }}
    >
      {children}
    </UserUploadDataContext.Provider>
  );
};

export const useUserUploadData = () => {
  const context = useContext(UserUploadDataContext);
  if (!context) {
    throw new Error('useUserUploadData must be used within a UserUploadDataProvider');
  }
  return context;
};
