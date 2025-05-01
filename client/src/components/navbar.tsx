import React from 'react';
import ScribeLogo from './ScribeLogo';
import { ModeToggle } from './theme-toggle';
import Link from 'next/link';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

function Navbar() {
  return (
    <header className="glass-effect sticky top-0 z-50 h-20 border-b border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <div className="absolute -z-10 h-10 w-10 animate-pulse rounded-full bg-primary/20 blur-md"></div>
            <ScribeLogo className="h-9 w-9 text-primary" />
          </div>
          <h1 className="gradient-text text-2xl font-bold tracking-tight">Scribe</h1>
        </Link>

        <div className="flex items-center gap-3 md:gap-4">
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="#features">
              <Button variant="ghost" className="rounded-full px-4 hover:bg-primary/5">
                Features
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="ghost" className="rounded-full px-4 hover:bg-primary/5">
                Pricing
              </Button>
            </Link>
            <Link href="#about">
              <Button variant="ghost" className="rounded-full px-4 hover:bg-primary/5">
                About
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full px-4 hover:bg-primary/5">
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button className="button-glow gradient-border rounded-full bg-gradient-to-r from-primary/90 to-secondary/90 hover:shadow-lg hover:shadow-primary/20">
                Get Started
              </Button>
            </Link>
          </div>

          <ModeToggle />

          <Button variant="ghost" size="icon" className="rounded-full md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
