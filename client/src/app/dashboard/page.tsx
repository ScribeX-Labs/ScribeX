'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, FileAudio, FileVideo, LayoutGrid, List, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { FileCard } from '@/components/file-card';
import { Waveform } from '@/components/waveform';
import { AnimatedNumber, EASE_OUT, Stagger, StaggerItem } from '@/components/motion';
import { useAuth } from '@/context/auth-context';
import { useUserUploadData, type FileData } from '@/context/user-upload-data-context';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'audio' | 'video';
type View = 'grid' | 'list';

export default function DashboardPage() {
  const { user } = useAuth();
  const { getAllFiles, deleteFile } = useUserUploadData();
  const [audioFiles, setAudioFiles] = useState<FileData[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('grid');

  useEffect(() => {
    let cancelled = false;
    const newest = (a: FileData, b: FileData) =>
      (b.upload_timestamp?.toMillis?.() ?? 0) - (a.upload_timestamp?.toMillis?.() ?? 0);
    getAllFiles().then(({ audioFiles: audio, videoFiles: video }) => {
      if (cancelled) return;
      setAudioFiles(audio.sort(newest));
      setVideoFiles(video.sort(newest));
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

  const allFiles = useMemo(
    () =>
      [...audioFiles, ...videoFiles].sort(
        (a, b) => (b.upload_timestamp?.toMillis?.() ?? 0) - (a.upload_timestamp?.toMillis?.() ?? 0),
      ),
    [audioFiles, videoFiles],
  );

  const shown = filter === 'audio' ? audioFiles : filter === 'video' ? videoFiles : allFiles;
  const firstName = user?.displayName?.split(' ')[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Library</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {firstName ? `Welcome back, ${firstName}` : 'Your recordings'}
        </h1>
      </div>

      {/* bento hero */}
      <Stagger className="grid gap-4 md:grid-cols-3" stagger={0.08}>
        <StaggerItem className="md:col-span-2">
          <Link
            href="/dashboard/upload"
            className="grain group relative flex h-full min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card p-6 transition-colors hover:border-primary/50"
          >
            <Waveform className="pointer-events-none absolute inset-x-0 -bottom-1 h-10 opacity-[0.12]" animate={false} />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
              <UploadCloud className="h-5 w-5 text-primary" />
            </div>
            <div className="relative">
              <h2 className="font-display text-xl font-semibold">Drop a new recording</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Audio or video — transcription starts the moment it’s up.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Upload now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </StaggerItem>

        <StaggerItem className="grid grid-cols-2 gap-4 md:grid-cols-1">
          <StatTile icon={FileAudio} label="Audio" value={audioFiles.length} loading={loading} />
          <StatTile icon={FileVideo} label="Video" value={videoFiles.length} loading={loading} />
        </StaggerItem>
      </Stagger>

      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(['all', 'audio', 'video'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'relative rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
                filter === f ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {filter === f && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-10 rounded-md bg-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {f}
            </button>
          ))}
        </div>

        <ToggleGroup
          value={[view]}
          onValueChange={(v) => v[0] && setView(v[0] as View)}
          variant="outline"
          size="sm"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* files */}
      {loading ? (
        <div className={cn('grid gap-4', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className={view === 'grid' ? 'h-40 rounded-2xl' : 'h-[68px] rounded-xl'} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <motion.div
          layout
          className={cn('grid gap-4', view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}
        >
          <AnimatePresence mode="popLayout">
            {shown.map((file) => (
              <FileCard key={file.id} file={file} onDelete={handleDelete} view={view} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-7 w-8" />
        ) : (
          <AnimatedNumber value={value} className="block font-mono text-2xl font-bold" />
        )}
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ filter }: { filter: Filter }) {
  const label = filter === 'all' ? 'recordings' : `${filter} files`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="flex flex-col items-center rounded-2xl border border-border/70 bg-card py-16 text-center"
    >
      <Waveform className="h-10 opacity-30" bars={16} animate={false} />
      <h3 className="mt-4 font-display text-lg font-semibold">No {label} yet</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Upload a lecture, meeting, or interview and ScribeX will transcribe it for you.
      </p>
      <Button className="press mt-5" nativeButton={false} render={<Link href="/dashboard/upload" />}>
        <UploadCloud />
        Upload your first file
      </Button>
    </motion.div>
  );
}
