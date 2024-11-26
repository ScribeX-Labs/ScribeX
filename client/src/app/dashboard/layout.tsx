'use client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ModeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4">
        <div className="flex justify-between">
          <SidebarTrigger />
          <div className="space-x-2">
            <ModeToggle />
            <Button size="icon" onClick={logout}>
              <LogOut size={24} />
            </Button>
          </div>
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}
