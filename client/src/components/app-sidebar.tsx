'use client'
import { Home, User } from 'lucide-react';
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

const items = [
  {
    title: 'Your Files',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User,
  },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <ScribeLogo className="mr-2 h-6 w-6" />
            Scribe
          </SidebarGroupLabel>
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

      {/* Logout Button at Bottom 
      you left off here, what you need to work on next is 
      
      
      */}

      {/* User Profile Section */}
      <div className="flex cursor-pointer items-center border-t p-2" onClick={togglePopup}>
        <Avatar src={user?.photoURL ?? ''} size="40px" />
        <div className="ml-4 flex flex-grow flex-col overflow-hidden">
          <span className="text-sm font-medium">{user?.displayName}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>

      {/* Popup Dropdown */}
      {isPopupOpen && (
        <div className="absolute bottom-16 left-0 z-50 w-full rounded-md shadow-md">
          <ul className="p-2">
            <Button onClick={logout}>Log out</Button>
          </ul>
        </div>
      )}
    </Sidebar>
  );
}
