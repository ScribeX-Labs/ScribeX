import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, FileVideo, Brain, Share2 } from 'lucide-react';
import Navbar from '@/components/navbar';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="container mx-auto flex-grow px-4 py-32">
        <section className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">Transcribe, Understand, Share</h2>
          <p className="mb-6 text-xl">
            Scribe helps you accurately transcribe audio and video files with advanced AI features.
          </p>
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
        </section>

        <section className="grid gap-6 py-32 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileAudio className="mr-2" />
                Audio Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Transcribe audio files with 95% accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileVideo className="mr-2" />
                Video Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Transcribe and caption video files</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2" />
                AI-Powered Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get insights and summaries from your transcripts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="mr-2" />
                Easy Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Share and export your transcripts effortlessly</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 text-center">
          <h3 className="mb-4 text-2xl font-bold">
            Ready to streamline your transcription workflow?
          </h3>
          <Button asChild size="lg">
            <Link href="/signup">Create Your Free Account</Link>
          </Button>
        </section>
      </main>

      <footer className="mt-8 bg-muted py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Scribe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
