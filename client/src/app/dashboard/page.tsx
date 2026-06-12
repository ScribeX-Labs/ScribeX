'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileAudio, FileVideo, Files, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCard } from '@/components/file-card';
import { Waveform } from '@/components/waveform';
import { useAuth } from '@/context/auth-context';
import { useUserUploadData, type FileData } from '@/context/user-upload-data-context';

export default function DashboardPage() {
  const { user } = useAuth();
  const { getAllFiles, deleteFile } = useUserUploadData();
  const [audioFiles, setAudioFiles] = useState<FileData[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const newestFirst = (a: FileData, b: FileData) =>
      (b.upload_timestamp?.toMillis?.() ?? 0) - (a.upload_timestamp?.toMillis?.() ?? 0);
    getAllFiles().then(({ audioFiles: audio, videoFiles: video }) => {
      if (cancelled) return;
      setAudioFiles(audio.sort(newestFirst));
      setVideoFiles(video.sort(newestFirst));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleDelete = async (file: FileData) => {
    if (!file.id) return;
    try {
      await deleteFile(file.id);
      setAudioFiles((prev) => prev.filter((f) => f.id !== file.id));
      setVideoFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success('File deleted');
    } catch {
      toast.error('Could not delete file');
    }
  };

  const allFiles = [...audioFiles, ...videoFiles].sort(
    (a, b) => (b.upload_timestamp?.toMillis?.() ?? 0) - (a.upload_timestamp?.toMillis?.() ?? 0),
  );

  const firstName = user?.displayName?.split(' ')[0];

  const stats = [
    { label: 'All recordings', value: allFiles.length, icon: Files },
    { label: 'Audio', value: audioFiles.length, icon: FileAudio },
    { label: 'Video', value: videoFiles.length, icon: FileVideo },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Library</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
            {firstName ? `Welcome back, ${firstName}` : 'Your recordings'}
          </h1>
        </div>
        <Button className="press" nativeButton={false} render={<Link href="/dashboard/upload" />}>
          <UploadCloud />
          New upload
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                {loading ? (
                  <Skeleton className="h-7 w-10" />
                ) : (
                  <p className="font-mono text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        {(
          [
            ['all', allFiles],
            ['audio', audioFiles],
            ['video', videoFiles],
          ] as const
        ).map(([key, files]) => (
          <TabsContent key={key} value={key} className="mt-4 space-y-3">
            {loading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : files.length === 0 ? (
              <EmptyState kind={key} />
            ) : (
              files.map((file, i) => (
                <FileCard key={file.id} file={file} onDelete={handleDelete} index={i} />
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function EmptyState({ kind }: { kind: 'all' | 'audio' | 'video' }) {
  const label = kind === 'all' ? 'recordings' : `${kind} files`;
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12 text-center">
        <Waveform className="h-10 opacity-30" bars={16} animate={false} />
        <h3 className="mt-4 font-display text-lg font-semibold">No {label} yet</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Upload a lecture, meeting, or interview and ScribeX will transcribe it for you.
        </p>
        <Button className="press mt-5" nativeButton={false} render={<Link href="/dashboard/upload" />}>
          <UploadCloud />
          Upload your first file
        </Button>
      </CardContent>
    </Card>
  );
}
