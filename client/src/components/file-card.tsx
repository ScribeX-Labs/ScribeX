'use client';

import Link from 'next/link';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FileData } from '@/context/user-upload-data-context';

export function FileCard({
  file,
  onDelete,
  index = 0,
}: {
  file: FileData;
  onDelete: (file: FileData) => void;
  index?: number;
}) {
  const isAudio = file.content_type.startsWith('audio');
  const Icon = isAudio ? FileAudio : FileVideo;
  const uploaded = file.upload_timestamp?.toDate?.();

  return (
    <Card
      className="rise group transition-colors hover:border-primary/40"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <CardContent className="flex items-center gap-4">
        <Link
          href={`/dashboard/transcribe/${file.id}`}
          className="flex min-w-0 flex-1 items-center gap-4"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium group-hover:text-primary">
              {file.original_filename}
            </p>
            <p className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="uppercase">{isAudio ? 'audio' : 'video'}</span>
              {uploaded && (
                <>
                  <span aria-hidden>·</span>
                  <span>{uploaded.toLocaleDateString()}</span>
                </>
              )}
              {!!file.rating && (
                <>
                  <span aria-hidden>·</span>
                  <span className="flex items-center gap-0.5 text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    {file.rating}
                  </span>
                </>
              )}
            </p>
          </div>
        </Link>

        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="File actions">
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
                “{file.original_filename}” and its transcript will be removed from your library.
                This can’t be undone.
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
      </CardContent>
    </Card>
  );
}
