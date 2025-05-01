'use client';
import React, { useEffect } from 'react';
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
import {
  PlusCircle,
  FileAudio,
  FileVideo,
  Download,
  Trash2,
  Clock,
  Calendar,
  Bell,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Page() {
  const [files, setFiles] = React.useState<AllFiles>({ audioFiles: [], videoFiles: [] });
  const { getAllFiles } = useUserUploadData();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAllFiles()
      .then((files) => setFiles(files))
      .finally(() => setIsLoading(false));
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
    <div className="space-y-8">
      <div className="relative pb-6">
        <div className="absolute -left-40 -top-20 -z-10 h-80 w-80 rounded-full bg-primary/10 blur-[80px]"></div>
        <div className="absolute -bottom-40 -right-40 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-[80px]"></div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s an overview of your transcription files
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
            </Button>
            <Button asChild className="button-glow rounded-full">
              <Link href="/dashboard/upload">
                <PlusCircle className="mr-2 h-4 w-4" /> New Upload
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="stat-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <div className="rounded-full bg-primary/10 p-1.5">
                <FileAudio className="h-4 w-4 text-primary" />
              </div>
              Audio Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{files.audioFiles.length}</p>
            <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(files.audioFiles.length * 10, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <div className="rounded-full bg-secondary/10 p-1.5">
                <FileVideo className="h-4 w-4 text-secondary" />
              </div>
              Video Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{files.videoFiles.length}</p>
            <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-secondary/20">
              <div
                className="h-full bg-secondary"
                style={{ width: `${Math.min(files.videoFiles.length * 10, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <div className="rounded-full bg-accent/10 p-1.5">
                <PlusCircle className="h-4 w-4 text-accent" />
              </div>
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {files.audioFiles.length + files.videoFiles.length}
            </p>
            <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-accent/20">
              <div
                className="h-full bg-accent"
                style={{
                  width: `${Math.min((files.audioFiles.length + files.videoFiles.length) * 5, 100)}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="glass-effect border border-border bg-background/50">
            <TabsTrigger value="all" className="data-[state=active]:tab-active">
              All Files
            </TabsTrigger>
            <TabsTrigger value="audio" className="data-[state=active]:tab-active">
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:tab-active">
              Video
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <FilesSkeleton />
          ) : files.audioFiles.length === 0 && files.videoFiles.length === 0 ? (
            <EmptyState />
          ) : (
            <FileGrid
              files={[...files.audioFiles, ...files.videoFiles]}
              handleDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          {isLoading ? (
            <FilesSkeleton />
          ) : files.audioFiles.length === 0 ? (
            <EmptyState type="audio" />
          ) : (
            <FileGrid files={files.audioFiles} handleDelete={handleDelete} />
          )}
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          {isLoading ? (
            <FilesSkeleton />
          ) : files.videoFiles.length === 0 ? (
            <EmptyState type="video" />
          ) : (
            <FileGrid files={files.videoFiles} handleDelete={handleDelete} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FilesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="file-card animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-2/3 rounded bg-muted"></div>
            <div className="h-4 w-1/2 rounded bg-muted"></div>
          </CardHeader>
          <CardContent>
            <div className="h-12 w-full rounded bg-muted"></div>
          </CardContent>
          <CardFooter>
            <div className="h-9 w-full rounded bg-muted"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ type }: { type?: string }) {
  const Icon = type === 'video' ? FileVideo : type === 'audio' ? FileAudio : PlusCircle;
  const message = type ? `No ${type} files found` : 'No files found';

  return (
    <Card className="gradient-bg flex flex-col items-center justify-center p-10 text-center shadow-lg">
      <div className="glass-effect mb-4 rounded-full p-6">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <CardTitle className="mb-2 text-xl">{message}</CardTitle>
      <CardDescription className="mb-6">Upload a new file to get started</CardDescription>
      <Button asChild className="button-glow rounded-full">
        <Link href="/dashboard/upload">
          <PlusCircle className="mr-2 h-4 w-4" /> New Upload
        </Link>
      </Button>
    </Card>
  );
}

function FileGrid({
  files,
  handleDelete,
}: {
  files: FileData[];
  handleDelete: (fileId: string, type: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {files.map((file) => (
        <FileCard key={file.id} file={file} handleDelete={handleDelete} />
      ))}
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
  const isAudio = file.content_type.includes('audio');
  const Icon = isAudio ? FileAudio : FileVideo;
  const date = file.upload_timestamp.toDate();

  return (
    <Card
      className="file-card cursor-pointer transition-all duration-200"
      onClick={() => {
        router.push(`/dashboard/transcribe/${file.id}`);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-2">
            <CardTitle className="line-clamp-1 text-base font-medium">
              {file.original_filename}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              <span className="mx-1">•</span>
              <Calendar className="h-3 w-3" />
              {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </CardDescription>
          </div>
          <div className="file-icon">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3 pt-0">
        <p className="line-clamp-1 text-sm text-muted-foreground">{file.content_type}</p>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 px-3 py-2">
        <div className="flex w-full justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-1 text-xs hover:bg-primary/5 hover:text-primary"
            asChild
          >
            <Link
              href={file.file_url}
              download={file.original_filename}
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="mr-1 h-3 w-3" />
              Download
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 flex-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              if (file.id) {
                handleDelete(file.id, isAudio ? 'audio' : 'video');
              }
            }}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default Page;
