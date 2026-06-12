'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { FileAudio, FileVideo, MoreVertical, Star, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EASE_OUT } from '@/components/motion';
import type { FileData } from '@/context/user-upload-data-context';
import { cn } from '@/lib/utils';

const cardMotion = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: EASE_OUT } },
  transition: { duration: 0.32, ease: EASE_OUT },
};

export function FileCard({
  file,
  onDelete,
  view = 'grid',
}: {
  file: FileData;
  onDelete: (file: FileData) => void;
  view?: 'grid' | 'list';
}) {
  const isAudio = file.content_type.startsWith('audio');
  const Icon = isAudio ? FileAudio : FileVideo;
  const uploaded = file.upload_timestamp?.toDate?.();

  const meta = (
    <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <span className="uppercase">{isAudio ? 'audio' : 'video'}</span>
      {uploaded && (
        <>
          <span aria-hidden>·</span>
          <span>{uploaded.toLocaleDateString()}</span>
        </>
      )}
      {!!file.rating && (
        <span className="flex items-center gap-0.5 text-primary">
          <Star className="h-3 w-3 fill-current" />
          {file.rating}
        </span>
      )}
    </p>
  );

  const actions = (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="File actions" className="shrink-0">
              <MoreVertical />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <AlertDialogTrigger
            render={
              <DropdownMenuItem variant="destructive" closeOnClick={false}>
                <Trash2 />
                Delete
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this file?</AlertDialogTitle>
          <AlertDialogDescription>
            “{file.original_filename}” and its transcript will be removed from your library. This
            can’t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogCancel variant="destructive" onClick={() => onDelete(file)}>
            Delete
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (view === 'list') {
    return (
      <motion.div layout {...cardMotion}>
        <div className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:border-primary/40">
          <Link href={`/dashboard/transcribe/${file.id}`} className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium group-hover:text-primary">{file.original_filename}</p>
              <div className="mt-0.5">{meta}</div>
            </div>
          </Link>
          {actions}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout {...cardMotion} whileHover={{ y: -4 }}>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100 sm:opacity-0" />
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              isAudio ? 'bg-primary/15' : 'bg-chart-2/15',
            )}
          >
            <Icon className={cn('h-6 w-6', isAudio ? 'text-primary' : 'text-chart-2')} />
          </div>
          {actions}
        </div>
        <Link href={`/dashboard/transcribe/${file.id}`} className="mt-4 flex-1">
          <p className="line-clamp-2 font-medium group-hover:text-primary">{file.original_filename}</p>
        </Link>
        <div className="mt-3">{meta}</div>
      </div>
    </motion.div>
  );
}
