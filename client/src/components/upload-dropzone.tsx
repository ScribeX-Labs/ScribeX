'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  FileVideo,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { api, type SubscriptionInfo } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

type Phase = 'idle' | 'uploading' | 'done' | 'error';

export function UploadDropzone() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limits, setLimits] = useState<SubscriptionInfo['limits'] | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .getSubscription(user.uid)
      .then((info) => setLimits(info.limits))
      .catch(() => {});
  }, [user]);

  const stopProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  useEffect(() => () => stopProgress(), []);

  const startProgress = () => {
    setProgress(0);
    progressTimer.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 8, 92));
    }, 350);
  };

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setFile(accepted[0]);
      setPhase('idle');
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'audio/*': [], 'video/*': [] },
    maxFiles: 1,
    multiple: false,
    noClick: true,
  });

  const handleUpload = async () => {
    if (!file || !user) return;
    setPhase('uploading');
    setError(null);
    startProgress();

    try {
      const result = await api.uploadMedia(user.uid, file);
      stopProgress();
      setProgress(100);
      setPhase('done');
      setTimeout(() => router.push(`/dashboard/transcribe/${result.id}`), 900);
    } catch (err) {
      stopProgress();
      setPhase('error');
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  };

  const Icon = file?.type.startsWith('audio/') ? FileAudio : FileVideo;

  return (
    <Card>
      <CardContent className="space-y-5">
        <div
          {...getRootProps()}
          onClick={open}
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-10 text-center transition-colors duration-200',
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50 hover:bg-primary/5',
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 transition-transform duration-300',
                isDragActive && 'scale-110',
              )}
            >
              <UploadCloud className="h-7 w-7 text-primary" />
            </div>
            <p className="font-display text-lg font-semibold">
              {isDragActive ? 'Drop it here' : 'Drag & drop your media'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or <span className="text-primary underline underline-offset-4">browse files</span>
            </p>
            {limits && (
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                up to {limits.display.file_size} · {limits.display.duration} on your plan
              </p>
            )}
          </div>
        </div>

        {file && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · {file.type || 'unknown'}
                </p>
              </div>
              {phase === 'idle' && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove file"
                  onClick={() => setFile(null)}
                >
                  <X />
                </Button>
              )}
            </div>

            {phase === 'uploading' && (
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}

            {phase === 'error' && error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {phase === 'done' ? (
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <p>Uploaded. Taking you to the transcript…</p>
              </div>
            ) : (
              <Button
                className="press w-full"
                size="lg"
                onClick={handleUpload}
                disabled={phase === 'uploading'}
              >
                {phase === 'uploading' ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <UploadCloud />
                    Upload & transcribe
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
