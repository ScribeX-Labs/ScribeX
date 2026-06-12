'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AudioLines, Sparkles } from 'lucide-react';
import { EASE_OUT } from '@/components/motion';

const LINES = [
  'So the key insight from the lecture is that',
  'compound interest grows exponentially over time —',
  'which is exactly why starting early matters so much.',
];

// animated mock of the product: live bars on the left, transcript typing on the right
export function LiveTranscript({ className }: { className?: string }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const line = LINES[lineIdx];
    if (charIdx < line.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIdx((i) => (i + 1) % LINES.length);
      setCharIdx(0);
    }, 1600);
    return () => clearTimeout(t);
  }, [charIdx, lineIdx]);

  const visible = LINES.slice(0, lineIdx);
  const typing = LINES[lineIdx].slice(0, charIdx);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.35 }}
      className={className}
      style={{ perspective: 1000 }}
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <span className="rec-dot" />
          <span className="font-mono text-xs text-muted-foreground">lecture-09.mp3</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            <Sparkles className="h-3 w-3" /> live
          </span>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 p-4">
          {/* pulsing bars */}
          <div className="flex h-full items-center gap-[3px] rounded-xl bg-primary/5 px-3 py-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-primary/70"
                animate={{ scaleY: [0.3, 1, 0.5, 0.85, 0.3] }}
                transition={{
                  duration: 1.1 + (i % 4) * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.08,
                }}
                style={{ height: 40, transformOrigin: 'center' }}
              />
            ))}
          </div>

          {/* transcript */}
          <div className="min-h-[120px] space-y-1.5 text-sm leading-relaxed">
            <AnimatePresence initial={false}>
              {visible.map((line) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.55 }}
                  className="text-muted-foreground"
                >
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
            <p className="text-foreground">
              {typing}
              <motion.span
                className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-primary"
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
          <AudioLines className="h-3.5 w-3.5 text-primary" />
          Transcribing in real time
        </div>
      </div>
    </motion.div>
  );
}
