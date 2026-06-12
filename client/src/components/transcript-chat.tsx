'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AudioLines, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export function TranscriptChat({
  messages,
  disabled,
  onSend,
}: {
  messages: ChatMessage[];
  disabled: boolean;
  onSend: (question: string) => void;
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput('');
    onSend(question);
  };

  return (
    <Card className="flex h-full flex-col gap-0 py-0">
      <CardHeader className="border-b py-4 [.border-b]:pb-4">
        <CardTitle className="flex items-center gap-2 font-display">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15">
            <AudioLines className="h-4 w-4 text-primary" />
          </span>
          Ask the transcript
        </CardTitle>
        <CardDescription>Answers grounded in this recording.</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div ref={scrollRef} className="flex h-[460px] flex-col gap-3 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                Try asking
              </p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p>“Summarize this in three bullets”</p>
                <p>“What were the action items?”</p>
                <p>“Explain the part about…”</p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                      message.role === 'user'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-muted',
                    )}
                  >
                    {message.content === '…' ? <TypingDots /> : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <Input
          placeholder={disabled ? 'Waiting for transcript…' : 'Ask anything about this recording'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          className="press"
          disabled={disabled || !input.trim()}
          aria-label="Send"
        >
          <Send />
        </Button>
      </form>
    </Card>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Thinking">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0.3s]" />
    </span>
  );
}
