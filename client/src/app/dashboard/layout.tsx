import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4">
        <div className="flex justify-between">
          <SidebarTrigger />
          <ThemeToggle />
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}
