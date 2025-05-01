'use client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Bell, LogOut, Menu, User } from 'lucide-react';
import Avatar from '@/components/Avatar';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-h-screen w-full bg-background">
        <header className="glass-effect sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="rounded-full p-2 transition-colors hover:bg-primary/5">
              <Menu size={20} />
            </SidebarTrigger>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full transition-colors hover:bg-primary/5"
            >
              <Bell size={18} />
            </Button>
            <ModeToggle />

            <Link href="/dashboard/profile" className="flex items-center">
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-full pl-2 pr-3 transition-colors hover:bg-primary/5"
              >
                <Avatar
                  src={user?.photoURL ?? ''}
                  size="28px"
                  className="border border-primary/10"
                />
                <span className="hidden text-sm font-medium md:inline-block">
                  {user?.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
