'use client';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/context/AuthContext';
import { FC } from 'react';


const ProfilePage: FC = () => {
  const { user, logout } = useAuth();
  console.log(user?.photoURL);
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full">
          <ProfileCard
            name={user?.displayName ?? 'Add Username'}
            email={user?.email ?? 'Add Email'}
            university={'Add School or Work'}
            photoUrl={user?.photoURL ?? undefined} // Pass the profile picture URL
          />
        </aside>
        <div className="w-full"></div>
      </div>
    </div>
  );
  /*
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
          
        </div>
      </div>
    </div>
  );
  */
};

export default ProfilePage;
