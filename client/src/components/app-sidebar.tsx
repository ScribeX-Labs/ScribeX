'use client'
import { FileText, Home, Share2, Brain, Settings, Bell, Download } from 'lucide-react';
import  {useState} from 'react';
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

const items = [
  {
    title: 'Your Files',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: Settings,
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
          <SidebarGroupLabel>Scribe</SidebarGroupLabel>
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
      <div className="border-t flex items-center cursor-pointer" onClick={togglePopup}>
        <Avatar src={user?.photoURL} size="50px"/>
        <div className="flex flex-col ml-4 flex-grow overflow-hidden">
          <span className="text-sm font-medium">{user?.displayName}</span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>

      {/* Popup Dropdown */}
      {isPopupOpen && (
        <div className="absolute bottom-16 left-0 w-full bg-white shadow-md rounded-md z-50">
          <ul className="p-2">
            <li className="p-2 hover:bg-gray-100">
              <button onClick={logout} className="w-full text-left text-black">
                Log out
              </button>
            </li>
          </ul>
        </div>
      )}
    </Sidebar>
  );
}
