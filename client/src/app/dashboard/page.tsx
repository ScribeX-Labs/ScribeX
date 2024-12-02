'use client';
import React, { use, useEffect } from 'react';
import Link from 'next/link';
import { FileData, useUserUploadData, AllFiles } from '@/context/UserUploadDataContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileAudio, FileVideo } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

function Page() {
  const [files, setFiles] = React.useState<AllFiles>({ audioFiles: [], videoFiles: [] });
  const { getAllFiles } = useUserUploadData();
  const { user } = useAuth();

  useEffect(() => {
    getAllFiles().then((files) => setFiles(files));
  }, []);

  const handleDelete = async (fileId: string, type: string) => {
    try {
      if (user?.uid) {
        await deleteDoc(doc(db, 'uploads', user.uid, `${type}_files`, fileId));
      } else {
        throw new Error('User ID is undefined');
      }
      const updatedFiles = { ...files };
      updatedFiles.audioFiles = updatedFiles.audioFiles.filter((file) => file.id !== fileId);
      updatedFiles.videoFiles = updatedFiles.videoFiles.filter((file) => file.id !== fileId);
      setFiles(updatedFiles);
    } catch (error: any) {
      console.error('Error deleting file:', error.message);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Files</h1>
          <Button asChild>
            <Link href="/dashboard/upload">
              <PlusCircle className="mr-2 h-4 w-4" /> New Upload
            </Link>
          </Button>
        </div>

        {files.audioFiles.length === 0 && files.videoFiles.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-6">
            <FileAudio className="mb-4 h-12 w-12 text-primary" />
            <CardTitle className="mb-2 text-xl">No files found</CardTitle>
            <CardDescription>Upload a new file to get started</CardDescription>
          </Card>
        ) : (
          <>
            {files.audioFiles.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Audio Files</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {files.audioFiles.map((file) => (
                    <FileCard key={file.id} file={file} handleDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
            {files.videoFiles.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-4 text-xl font-semibold">Video Files</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {files.videoFiles.map((file) => (
                    <FileCard key={file.id} file={file} handleDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FileCard({
  file,
  handleDelete,
}: {
  file: FileData;
  handleDelete: (fileId: string, type: string) => void;
}) {
  const router = useRouter();
  return (
    <div
      className="w-full cursor-pointer overflow-hidden"
      onClick={() => {
        router.push(`/dashboard/transcribe/${file.id}`);
      }}
    >
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center justify-between space-x-2">
            <div>
              <CardTitle className="text-clip text-wrap">{file.original_filename}</CardTitle>
              <CardDescription>{file.content_type}</CardDescription>
              <p className="text-sm text-muted-foreground">
                {file.upload_timestamp.toDate().toLocaleDateString()}
              </p>
            </div>
            {file.content_type.includes('audio') ? (
              <FileAudio className="h-12 w-12 text-primary" />
            ) : (
              <FileVideo className="h-12 w-12 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" asChild>
            <Link
              href={file.file_url}
              download={file.original_filename}
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </Link>
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (file.id) {
                handleDelete(file.id, file.content_type.includes('audio') ? 'audio' : 'video');
              }
            }}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Page;
