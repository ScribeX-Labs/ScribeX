import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, FileVideo, Brain, Share2 } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-16">
        <section className="mb-16 text-center">
          <h2 className="mb-4 text-5xl font-bold text-primary">Transcribe, Understand, Share</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Scribe helps you accurately transcribe audio and video files with advanced AI features.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </section>

        <section className="grid gap-8 py-16 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileAudio,
              title: 'Audio Transcription',
              description: 'Transcribe audio files with 95% accuracy',
            },
            {
              icon: FileVideo,
              title: 'Video Transcription',
              description: 'Transcribe and caption video files',
            },
            {
              icon: Brain,
              title: 'AI-Powered Analysis',
              description: 'Get insights and summaries from your transcripts',
            },
            {
              icon: Share2,
              title: 'Easy Sharing',
              description: 'Share and export your transcripts effortlessly',
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="border-2 border-primary/10 bg-card transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="flex items-center text-primary">
                  <feature.icon className="mr-2 h-6 w-6" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border bg-background p-12 text-center text-secondary-foreground">
          <h3 className="mb-6 text-3xl font-bold">
            Ready to streamline your transcription workflow?
          </h3>
          <Button asChild size="lg" variant="default" className="rounded-full px-8 py-6 text-lg">
            <Link href="/login">Create Your Free Account</Link>
          </Button>
        </section>
      </main>

      <footer className="mt-16 border-t bg-background py-8 text-muted-foreground">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Scribe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
