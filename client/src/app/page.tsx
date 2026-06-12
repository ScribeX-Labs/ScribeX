import Link from 'next/link';
import {
  ArrowRight,
  AudioLines,
  Check,
  FileText,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScribeLogo } from '@/components/scribe-logo';
import { Waveform } from '@/components/waveform';

const STEPS = [
  {
    icon: UploadCloud,
    title: 'Drop your media',
    body: 'Audio or video — lectures, interviews, meetings. Drag it in and we take it from there.',
  },
  {
    icon: AudioLines,
    title: 'We transcribe it',
    body: 'Speech becomes accurate, readable text in minutes, not hours.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Ask it anything',
    body: 'Chat with an AI that has read every word. Summaries, answers, study notes.',
  },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Export-ready transcripts',
    body: 'Clean plain-text exports you can paste into notes, papers, or docs.',
  },
  {
    icon: Sparkles,
    title: 'AI that knows your content',
    body: 'Powered by Claude. Ask follow-ups and get answers grounded in your transcript.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    body: 'Your files live in your account. Nobody else sees them — not even on free.',
  },
];

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    tagline: 'For trying it out',
    features: ['Files up to 500 MB', 'Media up to 2 minutes', 'AI chat on every transcript'],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$8',
    tagline: 'For serious note-takers',
    features: [
      'Files up to 5 GB',
      'Media up to 4 hours',
      'AI chat on every transcript',
      'Priority transcription queue',
    ],
    cta: 'Go Pro',
    highlighted: true,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <ScribeLogo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button className="press" nativeButton={false} render={<Link href="/login" />}>
              Get started
              <ArrowRight />
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* hero */}
        <section className="grain relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(ellipse_55%_55%_at_50%_-10%,oklch(0.795_0.155_75/0.14),transparent)]" />
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-24 text-center md:pb-28 md:pt-32">
            <Badge variant="outline" className="rise gap-2 rounded-full border-primary/30 px-3 py-1">
              <span className="rec-dot" />
              <span className="font-mono text-xs tracking-wide text-muted-foreground">
                REC · transcription in progress
              </span>
            </Badge>

            <h1
              className="rise mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
              style={{ animationDelay: '80ms' }}
            >
              Every word, captured.
              <br />
              <span className="text-primary">Every answer, instant.</span>
            </h1>

            <p
              className="rise mt-6 max-w-xl text-balance text-lg text-muted-foreground"
              style={{ animationDelay: '160ms' }}
            >
              ScribeX turns your lectures, meetings, and interviews into accurate transcripts —
              then lets you interrogate them with AI.
            </p>

            <div className="rise mt-8 flex items-center gap-3" style={{ animationDelay: '240ms' }}>
              <Button size="lg" className="press" nativeButton={false} render={<Link href="/login" />}>
                Start transcribing
                <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" className="press" nativeButton={false} render={<Link href="#pricing" />}>
                See pricing
              </Button>
            </div>

            <Waveform className="rise mt-16 h-20 w-full max-w-2xl justify-center" />
          </div>
        </section>

        {/* how it works */}
        <section className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-20">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              From recording to insight in three steps
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <Card key={step.title} className="relative overflow-hidden">
                  <CardContent className="space-y-3">
                    <span className="absolute right-4 top-2 font-mono text-5xl font-bold text-primary/10">
                      0{i + 1}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* features */}
        <section className="border-t border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-20">
            <div className="grid items-start gap-10 md:grid-cols-2">
              <div className="md:sticky md:top-24">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  Built for understanding
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Your recordings have answers. Now you can ask.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Most transcription tools stop at text. ScribeX keeps going — every transcript
                  becomes a conversation you can query, summarize, and study from.
                </p>
              </div>
              <div className="space-y-4">
                {FEATURES.map((feature) => (
                  <Card key={feature.title}>
                    <CardContent className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{feature.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {feature.body}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* pricing */}
        <section id="pricing" className="border-t border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-20">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Start free. Upgrade when your recordings get longer.
            </h2>
            <div className="mt-10 grid gap-4 md:max-w-3xl md:grid-cols-2">
              {TIERS.map((tier) => (
                <Card
                  key={tier.name}
                  className={tier.highlighted ? 'border-primary/50 shadow-[0_0_40px_-12px] shadow-primary/30' : ''}
                >
                  <CardContent className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-semibold">{tier.name}</h3>
                      {tier.highlighted && (
                        <Badge className="rounded-full">Most popular</Badge>
                      )}
                    </div>
                    <div>
                      <span className="font-display text-4xl font-bold">{tier.price}</span>
                      <span className="text-sm text-muted-foreground"> / month</span>
                      <p className="mt-1 text-sm text-muted-foreground">{tier.tagline}</p>
                    </div>
                    <ul className="space-y-2.5">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="press w-full"
                      variant={tier.highlighted ? 'default' : 'outline'}
                      nativeButton={false} render={<Link href="/login" />}
                    >
                      {tier.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
