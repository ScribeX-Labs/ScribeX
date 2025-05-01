'use client'
import { Home, User, FileAudio, FileVideo, BarChart, Settings, LogOut, Upload } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import ScribeLogo from './ScribeLogo';
import { usePathname } from 'next/navigation';

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Upload',
    url: '/dashboard/upload',
    icon: Upload,
  },
  {
    title: 'Audio Files',
    url: '/dashboard/audio',
    icon: FileAudio,
  },
  {
    title: 'Video Files',
    url: '/dashboard/video',
    icon: FileVideo,
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: BarChart,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const pathname = usePathname();

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <Sidebar className="border-r border-border bg-card/50 backdrop-blur-sm">
      <SidebarContent className="py-6">
        <SidebarGroup className="px-2">
          <SidebarGroupLabel className="mb-8 flex items-center px-4">
            <ScribeLogo className="mr-2 h-6 w-6 text-primary" />
            <span className="gradient-text text-xl font-bold">Scribe</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="my-1">
                    <SidebarMenuButton
                      asChild
                      className={`rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary/15 to-primary/5 font-medium text-primary'
                          : 'hover:bg-primary/5'
                      }`}
                    >
                      <Link href={item.url} className="flex items-center px-4 py-2.5">
                        <div
                          className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                            isActive ? 'bg-primary/10' : 'bg-transparent'
                          }`}
                        >
                          <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                        </div>
                        <span>{item.title}</span>
                        {isActive && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Profile Section */}
      <div className="mt-auto border-t border-border p-4">
        <div
          className="group flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5"
          onClick={togglePopup}
        >
          <Avatar
            src={user?.photoURL ?? ''}
            size="40px"
            className="border-2 border-primary/10 bg-primary/5 transition-all group-hover:border-primary/20"
          />
          <div className="flex-grow overflow-hidden">
            <p className="truncate font-medium">{user?.displayName || 'User'}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {isPopupOpen && (
          <div className="glass-effect mt-2 rounded-lg p-2 shadow-lg">
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
