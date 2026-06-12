'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  ArrowRight,
  AudioLines,
  Check,
  Download,
  FileText,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScribeLogo } from '@/components/scribe-logo';
import { LiveTranscript } from '@/components/live-transcript';
import { EASE_OUT, Reveal, Stagger, StaggerItem } from '@/components/motion';
import { cn } from '@/lib/utils';

const HEADLINE = ['Every', 'word,', 'captured.'];

const STEPS = [
  { n: '01', icon: UploadCloud, title: 'Drop your media', body: 'Audio or video — lectures, interviews, meetings. Drag it in.' },
  { n: '02', icon: AudioLines, title: 'We transcribe it', body: 'Speech becomes accurate, readable text in minutes.' },
  { n: '03', icon: MessageCircleQuestion, title: 'Ask it anything', body: 'Chat with an AI that has read every word.' },
];

const FAQ = [
  { q: 'What file types can I upload?', a: 'Any common audio or video format — mp3, wav, m4a, mp4, mov and more. Just drag it in.' },
  { q: 'How accurate is the transcription?', a: 'We use AWS Transcribe under the hood, which handles natural speech, multiple speakers, and background noise well.' },
  { q: 'Is my content private?', a: 'Yes. Your files and transcripts live in your own account and are never shared — not even on the free plan.' },
  { q: 'What does the AI chat do?', a: 'Every transcript becomes a conversation. Ask for summaries, pull out action items, or get answers grounded only in your recording.' },
];

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* ── hero ── */}
        <section className="grain relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_50%_60%_at_50%_-10%,oklch(0.795_0.155_75/0.16),transparent)]" />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-24 pt-20 md:grid-cols-2 md:pt-28">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1"
              >
                <span className="rec-dot" />
                <span className="font-mono text-xs tracking-wide text-muted-foreground">
                  REC · AI transcription
                </span>
              </motion.div>

              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl lg:text-7xl">
                <span className="block">
                  {HEADLINE.map((word, i) => (
                    <motion.span
                      key={word}
                      className="mr-[0.25em] inline-block"
                      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 + i * 0.08 }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
                <motion.span
                  className="block text-primary"
                  initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.36 }}
                >
                  Every answer, instant.
                </motion.span>
              </h1>

              <motion.p
                className="mt-6 max-w-md text-balance text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.5 }}
              >
                ScribeX turns your lectures, meetings, and interviews into accurate transcripts —
                then lets you interrogate them with AI.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.6 }}
              >
                <Button size="lg" className="press" nativeButton={false} render={<Link href="/login" />}>
                  Start transcribing
                  <ArrowRight />
                </Button>
                <Button size="lg" variant="outline" className="press" nativeButton={false} render={<Link href="#pricing" />}>
                  See pricing
                </Button>
              </motion.div>
            </div>

            <LiveTranscript className="md:ml-auto md:w-full md:max-w-md" />
          </div>
        </section>

        {/* ── steps ── */}
        <section id="how" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
              <h2 className="mt-3 max-w-lg font-display text-3xl font-bold tracking-tight md:text-4xl">
                From recording to insight in three steps
              </h2>
            </Reveal>

            <Stagger inView className="relative mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
              <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-primary/40 via-border to-transparent md:block" />
              {STEPS.map((step) => (
                <StaggerItem key={step.n} className="relative">
                  <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-background">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="mt-5 block font-mono text-xs text-primary">{step.n}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── bento features ── */}
        <section id="features" className="border-t border-border/60 bg-card/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-24">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Built for understanding</p>
              <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight md:text-4xl">
                Your recordings have answers. Now you can ask.
              </h2>
            </Reveal>

            <div className="mt-12 grid auto-rows-[200px] gap-4 md:grid-cols-3">
              <BentoTile className="md:col-span-2 md:row-span-2" accent>
                <div className="flex h-full flex-col justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-semibold">AI that knows your content</h3>
                    <p className="mt-2 max-w-sm text-muted-foreground">
                      Powered by Claude. Ask follow-ups, request summaries, and get answers grounded
                      in your transcript — never made up.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {['Summarize this', 'Action items?', 'Explain the part about…'].map((chip) => (
                        <span key={chip} className="rounded-full border border-primary/30 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </BentoTile>

              <BentoTile>
                <FeatureMini icon={FileText} title="Export-ready" body="Clean plain-text exports for notes, papers, docs." />
              </BentoTile>
              <BentoTile>
                <FeatureMini icon={ShieldCheck} title="Private by default" body="Your files stay in your account. Always." />
              </BentoTile>
              <BentoTile className="md:col-span-2">
                <div className="flex h-full items-center justify-between gap-4">
                  <FeatureMini icon={Zap} title="Fast turnaround" body="Minutes, not hours — even on long recordings." />
                  <Download className="hidden h-16 w-16 shrink-0 text-primary/15 sm:block" />
                </div>
              </BentoTile>
              <BentoTile>
                <FeatureMini icon={AudioLines} title="Audio & video" body="Any common format. Just drop it in." />
              </BentoTile>
            </div>
          </div>
        </section>

        {/* ── pricing ── */}
        <section id="pricing" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-24">
            <Reveal className="flex flex-col items-center text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
              <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight md:text-4xl">
                Start free. Upgrade when your recordings get longer.
              </h2>
              <BillingToggle annual={annual} onChange={setAnnual} />
            </Reveal>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
              <PriceCard
                name="Free"
                price="$0"
                tagline="For trying it out"
                features={['Files up to 500 MB', 'Media up to 2 minutes', 'AI chat on every transcript']}
                cta="Start free"
              />
              <PriceCard
                highlighted
                name="Pro"
                price={annual ? '$6' : '$8'}
                tagline={annual ? 'Billed annually' : 'For serious note-takers'}
                features={['Files up to 5 GB', 'Media up to 4 hours', 'AI chat on every transcript', 'Priority transcription queue']}
                cta="Go Pro"
              />
            </div>
          </div>
        </section>

        {/* ── faq ── */}
        <section id="faq" className="border-t border-border/60 bg-card/30">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-24 md:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">FAQ</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Questions, answered.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <Accordion className="w-full">
                {FAQ.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left font-display text-base font-medium">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* ── final cta ── */}
        <section className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-24">
            <Reveal className="grain relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 to-background px-6 py-16 text-center">
              <h2 className="mx-auto max-w-xl font-display text-3xl font-bold tracking-tight md:text-5xl">
                Stop re-watching. Start asking.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Upload your first recording and have a transcript you can talk to in minutes.
              </p>
              <Button size="lg" className="press mt-8" nativeButton={false} render={<Link href="/login" />}>
                Get started free
                <ArrowRight />
              </Button>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row">
          <ScribeLogo />
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} ScribeX. Every word, captured.
          </p>
        </div>
      </footer>
    </div>
  );
}

function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <ScribeLogo />
        <nav className="hidden items-center gap-6 md:flex">
          {[
            ['How it works', '#how'],
            ['Features', '#features'],
            ['Pricing', '#pricing'],
            ['FAQ', '#faq'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
            Sign in
          </Button>
          <Button className="press" nativeButton={false} render={<Link href="/login" />}>
            Get started
            <ArrowRight />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}

function BentoTile({
  children,
  className,
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-6 transition-colors',
        accent
          ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-card'
          : 'border-border/70 bg-card hover:border-primary/30',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function FeatureMini({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-display font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function BillingToggle({ annual, onChange }: { annual: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      {[
        ['Monthly', false],
        ['Annual', true],
      ].map(([label, value]) => {
        const active = annual === value;
        return (
          <button
            key={String(value)}
            onClick={() => onChange(value as boolean)}
            className={cn(
              'relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId="billing-pill"
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            {label}
            {value === true && <span className="ml-1.5 text-xs opacity-80">−25%</span>}
          </button>
        );
      })}
    </div>
  );
}

function PriceCard({
  name,
  price,
  tagline,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <Reveal>
      <div
        className={cn(
          'flex h-full flex-col rounded-2xl border p-6',
          highlighted
            ? 'border-primary/50 bg-card shadow-[0_0_50px_-12px] shadow-primary/30'
            : 'border-border/70 bg-card',
        )}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{name}</h3>
          {highlighted && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              Popular
            </span>
          )}
        </div>
        <div className="mt-4 flex items-end gap-1">
          <motion.span
            key={price}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="font-display text-4xl font-bold"
          >
            {price}
          </motion.span>
          <span className="pb-1 text-sm text-muted-foreground">/mo</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
        <ul className="mt-5 flex-1 space-y-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          className="press mt-6 w-full"
          variant={highlighted ? 'default' : 'outline'}
          nativeButton={false}
          render={<Link href="/login" />}
        >
          {cta}
        </Button>
      </div>
    </Reveal>
  );
}
