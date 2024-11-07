import { FileText, Home, Share2, Brain, Settings, Bell, Download } from 'lucide-react';

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

// Menu items.
const items = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Account Management',
    url: '/dashboard/account',
    icon: Settings,
  },
  {
    title: 'File Management',
    url: '/dashboard/files',
    icon: FileText,
  },
  {
    title: 'Transcription Services',
    url: '/dashboard/transcriptions',
    icon: Bell,
  },
  {
    title: 'Sharing & Collaboration',
    url: '/dashboard/sharing',
    icon: Share2,
  },
  {
    title: 'Content Insights',
    url: '/dashboard/insights',
    icon: Brain,
  },
  {
    title: 'System Management',
    url: '/dashboard/system',
    icon: Settings,
  },
  {
    title: 'Export & Download',
    url: '/dashboard/export',
    icon: Download,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
