import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  FileAudio,
  FileVideo,
  Brain,
  Share2,
  Check,
  Crown,
  ArrowRight,
  Zap,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import ScribeLogo from '@/components/ScribeLogo';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-32">
          <div className="absolute -left-40 -top-40 -z-10 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[100px]"></div>
          <div className="absolute -bottom-40 -right-40 -z-10 h-[600px] w-[600px] rounded-full bg-secondary/15 blur-[100px]"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-border/40 bg-muted/30 px-4 py-1.5 text-sm backdrop-blur-sm">
                <span className="mr-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                  NEW
                </span>
                Now with enhanced AI analysis capabilities
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="gradient-text">Transcribe, Understand, </span>
                <span className="relative">
                  Share
                  <span className="absolute -bottom-1 left-0 h-1 w-full bg-gradient-to-r from-primary to-secondary"></span>
                </span>
              </h1>
              <p className="mb-10 text-lg text-muted-foreground md:text-xl">
                Scribe helps you accurately transcribe audio and video files with advanced AI
                features. Transform your media into actionable insights in minutes, not hours.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="button-glow rounded-full bg-gradient-to-r from-primary to-secondary px-8 hover:shadow-lg hover:shadow-primary/20"
                >
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 hover:bg-primary/5"
                >
                  <Link href="#features">
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="gradient-bg relative py-24">
          <div className="absolute inset-0 -z-10 bg-[url('/noise.png')] bg-repeat opacity-30"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="gradient-text mb-3 text-3xl font-bold md:text-4xl">
                Powerful Features
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Everything you need to transform your audio and video content into accessible,
                searchable text.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: FileAudio,
                  title: 'Audio Transcription',
                  description: 'Transcribe audio files with 95% accuracy using advanced AI models',
                },
                {
                  icon: FileVideo,
                  title: 'Video Transcription',
                  description: 'Convert video content into searchable, editable text automatically',
                },
                {
                  icon: Brain,
                  title: 'AI Analysis',
                  description: 'Get insights, summaries and key points from your transcripts',
                },
                {
                  icon: Share2,
                  title: 'Easy Sharing',
                  description: 'Share and export your transcripts in multiple formats',
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="glass-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/10"
                >
                  <CardHeader className="pb-2">
                    <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-3">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-24">
          <div className="absolute -right-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]"></div>
          <div className="absolute -left-40 bottom-20 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px]"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="gradient-text mb-3 text-3xl font-bold md:text-4xl">
                Choose Your Plan
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Select the perfect plan for your transcription needs. Upgrade anytime as your
                requirements grow.
              </p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              {/* Free Tier */}
              <Card className="glass-effect border-2 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Sparkles className="mr-2 h-5 w-5 text-secondary" />
                    Free
                  </CardTitle>
                  <CardDescription>For casual users</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {[
                      'Up to 500MB file size',
                      'Up to 2 minutes duration',
                      'Basic transcription features',
                      'Limited AI analysis',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary/10">
                          <Check className="h-3 w-3 text-secondary" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full hover:bg-secondary/5"
                  >
                    <Link href="/login">Sign Up</Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Pro Tier */}
              <Card className="glass-effect relative border-2 border-primary/30 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                <div className="glass-effect absolute -right-3 -top-3 rounded-full border border-primary/20 bg-gradient-to-r from-primary/80 to-secondary/80 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Crown className="mr-2 h-5 w-5 text-primary" />
                    Pro
                  </CardTitle>
                  <CardDescription>For power users</CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {[
                      'Unlimited file size',
                      'Unlimited duration',
                      'Advanced transcription accuracy',
                      'Full AI analysis capabilities',
                      'Priority support',
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <div className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15">
                          <Zap className="h-3 w-3 text-primary" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="button-glow w-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  >
                    <Link href="/login">Get Pro</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="gradient-bg relative py-20">
          <div className="absolute inset-0 -z-10 bg-[url('/noise.png')] bg-repeat opacity-30"></div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="glass-effect mx-auto max-w-3xl rounded-3xl p-12 text-center">
              <h3 className="gradient-text mb-6 text-3xl font-bold">
                Ready to streamline your transcription workflow?
              </h3>
              <p className="mb-8 text-muted-foreground">
                Join thousands of professionals who save time and increase productivity with Scribe.
              </p>
              <Button
                asChild
                size="lg"
                className="button-glow rounded-full bg-gradient-to-r from-primary to-secondary px-8 hover:shadow-lg hover:shadow-primary/20"
              >
                <Link href="/login">Create Your Free Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/30 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center">
              <ScribeLogo className="h-8 w-8 text-primary" />
              <span className="gradient-text ml-2 text-xl font-bold">Scribe</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Cookies
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Scribe. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
