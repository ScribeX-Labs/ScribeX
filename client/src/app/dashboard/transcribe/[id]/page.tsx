'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Download, FileAudio, Sparkles, Star, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/star-rating';
import { TranscriptChat, type ChatMessage } from '@/components/transcript-chat';
import { EASE_OUT } from '@/components/motion';
import { useAuth } from '@/context/auth-context';
import { useUserUploadData, type FileData } from '@/context/user-upload-data-context';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type Status = 'loading' | 'processing' | 'ready' | 'failed';

export default function TranscribePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { getFileById, updateFile } = useUserUploadData();

  const [fileData, setFileData] = useState<FileData | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [textId, setTextId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [progress, setProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [ratingOpen, setRatingOpen] = useState(false);

  const fileType = fileData?.content_type.split('/')[0] ?? 'audio';

  // load the file doc and refresh its presigned media url
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const data = await getFileById(id);
      if (cancelled) return;
      if (!data) {
        setStatus('failed');
        setFailureReason('This file could not be found in your library.');
        return;
      }
      setRating(data.rating ?? 0);
      if (data.text_id) setTextId(data.text_id);
      try {
        const refreshed = await api.refreshMediaUrl(user.uid, data.file_url);
        data.file_url = refreshed.new_file_url;
      } catch {
        // stale url still might play; don't block the page on it
      }
      if (!cancelled) {
        setFileData({ ...data });
        setStatus('processing');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.uid]);

  // fake forward motion while the job runs; snaps to 100 on completion
  useEffect(() => {
    if (status !== 'processing') return;
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1 + Math.random() * 2, 95));
    }, 800);
    return () => clearInterval(interval);
  }, [status]);

  const ensureTextId = useCallback(
    async (text: string, data: FileData): Promise<string | null> => {
      if (data.text_id) return data.text_id;
      try {
        const result = await api.aiUpload({
          text,
          file_id: data.id!,
          user_id: user!.uid,
          file_type: data.content_type.split('/')[0],
        });
        await updateFile(data.id!, { text_id: result.text_id });
        return result.text_id;
      } catch (error) {
        console.error('Error registering transcript with AI:', error);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uid],
  );

  // poll transcription status until it settles
  useEffect(() => {
    if (status !== 'processing' || !fileData?.id || !user) return;
    let cancelled = false;

    const check = async () => {
      try {
        const statusData = await api.transcriptionStatus(user.uid, fileData.id!);
        if (cancelled) return;

        if (statusData.status === 'COMPLETED') {
          const result = await api.transcription(user.uid, fileData.id!);
          if (cancelled) return;
          const text = result.results.transcripts[0]?.transcript ?? '';
          setTranscript(text);
          setProgress(100);
          const tid = await ensureTextId(text, fileData);
          if (!cancelled && tid) setTextId(tid);
          if (!cancelled) setStatus('ready');
        } else if (statusData.status === 'FAILED') {
          setFailureReason(statusData.failure_reason ?? null);
          setStatus('failed');
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Error checking transcription status:', error);
        setStatus('failed');
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fileData?.id, user?.uid]);

  // restore previous chat once we know the text id
  useEffect(() => {
    if (!textId || !user || !fileData?.id) return;
    api
      .aiHistory(textId, { user_id: user.uid, file_id: fileData.id, file_type: fileType })
      .then((data) => {
        setMessages(
          data.conversation.flatMap((turn) => [
            { role: 'user' as const, content: turn.question },
            { role: 'bot' as const, content: turn.answer },
          ]),
        );
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textId, user?.uid, fileData?.id]);

  const handleSend = async (question: string) => {
    if (!textId || !user || !fileData?.id) return;
    setMessages((prev) => [...prev, { role: 'user', content: question }, { role: 'bot', content: '…' }]);
    let answer: string;
    try {
      const response = await api.aiAsk({
        text_id: textId,
        question,
        user_id: user.uid,
        file_id: fileData.id,
        file_type: fileType,
      });
      answer = response.answer;
    } catch {
      answer = 'Sorry, something went wrong answering that. Try again.';
    }
    setMessages((prev) => {
      const next = [...prev];
      next[next.length - 1] = { role: 'bot', content: answer };
      return next;
    });
  };

  const handleExport = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileData?.original_filename.split('.')[0] ?? 'transcript'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRate = async (value: number) => {
    setRating(value);
    setRatingOpen(false);
    if (fileData?.id) {
      await updateFile(fileData.id, { rating: value });
      toast.success('Thanks for the feedback');
    }
  };

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <Skeleton className="h-[560px] rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to library"
            nativeButton={false} render={<Link href="/dashboard" />}
          >
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold tracking-tight md:text-2xl">
              {fileData?.original_filename}
            </h1>
            <StatusPill status={status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="press"
            onClick={() => setRatingOpen(true)}
            disabled={status !== 'ready'}
          >
            <Star className={rating ? 'fill-primary text-primary' : ''} />
            {rating ? `Rated ${rating}/5` : 'Rate'}
          </Button>
          <Button
            variant="outline"
            className="press"
            onClick={handleExport}
            disabled={status !== 'ready'}
          >
            <Download />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* player */}
          <Card className="overflow-hidden py-0">
            {fileType === 'video' ? (
              <video src={fileData?.file_url} controls className="aspect-video w-full bg-black" />
            ) : (
              <div className="relative flex flex-col items-center gap-5 px-6 py-10">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FileAudio className="h-8 w-8 text-primary" />
                </motion.div>
                <audio src={fileData?.file_url} controls className="w-full max-w-md" />
              </div>
            )}
          </Card>

          {/* transcript */}
          <Card>
            <CardContent>
              <AnimatePresence mode="wait">
                {status === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-5 py-6"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-12 items-end gap-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className="w-1 rounded-full bg-primary"
                            animate={{ scaleY: [0.3, 1, 0.4, 0.8, 0.3] }}
                            transition={{
                              duration: 1 + (i % 3) * 0.2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: i * 0.06,
                            }}
                            style={{ height: 40, transformOrigin: 'bottom' }}
                          />
                        ))}
                      </div>
                      <p className="mt-4 font-display font-medium">Transcribing your recording</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Longer recordings take a few minutes. You can leave and come back.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-mono text-xs text-muted-foreground">
                        <span>Processing</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </motion.div>
                )}

                {status === 'failed' && (
                  <motion.div
                    key="failed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <XCircle className="h-10 w-10 text-destructive" />
                    <p className="mt-3 font-display font-medium">We couldn’t transcribe this one</p>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      {failureReason ??
                        'Something went wrong with this file. Try uploading it again, or use a different format.'}
                    </p>
                    <Button className="press mt-5" nativeButton={false} render={<Link href="/dashboard/upload" />}>
                      Try another file
                    </Button>
                  </motion.div>
                )}

                {status === 'ready' && (
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE_OUT }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-display font-semibold">Transcript</h2>
                      <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                        <Sparkles className="h-3 w-3" /> Ready
                      </span>
                    </div>
                    <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{transcript}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* chat */}
        <div className="lg:col-span-2">
          <TranscriptChat
            messages={messages}
            disabled={status !== 'ready' || !textId}
            onSend={handleSend}
          />
        </div>
      </div>

      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Rate this transcript</DialogTitle>
            <DialogDescription>How accurate was the transcription?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <StarRating rating={rating} onChange={handleRate} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    loading: { label: 'Loading', cls: 'text-muted-foreground', dot: 'bg-muted-foreground' },
    processing: { label: 'Transcribing', cls: 'text-primary', dot: 'bg-primary' },
    ready: { label: 'Ready', cls: 'text-success', dot: 'bg-success' },
    failed: { label: 'Failed', cls: 'text-destructive', dot: 'bg-destructive' },
  } as const;
  const s = map[status];
  return (
    <span className={cn('mt-0.5 flex items-center gap-1.5 font-mono text-xs', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot, status === 'processing' && 'animate-pulse')} />
      {s.label}
    </span>
  );
}
