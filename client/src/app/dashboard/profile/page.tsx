'use client';
import ProfileCard from '@/components/ProfileCard';
import TabbedContent from '@/components/TabbedContent';
import { useAuth } from '@/context/AuthContext';
import { FC } from 'react';

const profilePage: FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full">
          <ProfileCard
            name={user?.displayName == null ? 'add username' : user?.displayName}
            email={user?.email ?? 'add email'}
            university={'add school or work'}
          />
        </aside>
        <div className="w-full">
          <TabbedContent />
        </div>
      </div>
    </div>
  );
};

export default profilePage;
