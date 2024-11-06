// app/profile/page.tsx
// app/profile/page.tsx
"use client";
import ProfileCard from "@/components/ProfileCard";
import TabbedContent from "@/components/TabbedContent";
import { useAuth } from '@/context/AuthContext';
import { FC } from "react";


const profilePage: FC = () => {
  const {user, logout} = useAuth();
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-1/3">
          <ProfileCard name={user?.name == null? "add username" : user?.name} email={user?.email} university={user?.school == null? "add school or work" : user?.school} />
        </aside>
        <main className="w-full md:w-2/3">
          <TabbedContent />
        </main>
      </div>
    </div>
  );
}

export default profilePage