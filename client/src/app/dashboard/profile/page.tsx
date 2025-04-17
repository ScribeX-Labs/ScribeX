'use client';
import ProfileCard from '@/components/ProfileCard';
import SubscriptionCard from '@/components/subscription-card';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';

const ProfilePage: FC = () => {
  const { user, logout } = useAuth();

  const [university, setUniversity] = useState(''); // default value

  useEffect(() => {
    if (!user) return;

    // Fetch user data from Firestore (assuming you have a users collection)
    const userDocRef = doc(db, 'users', user.uid);
    const fetchUserData = async () => {
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUniversity(userData.university);
      }
    };

    fetchUserData();
  }, [user, db]);

  console.log(user?.photoURL);
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="w-full md:w-1/2">
          <ProfileCard
            name={user?.displayName ?? 'Add Username'}
            email={user?.email ?? 'Add Email'}
            university={university ?? 'Add School or Work'}
            photoUrl={user?.photoURL ?? undefined} // Pass the profile picture URL
          />
        </aside>
        <div className="w-full md:w-1/2">
          <SubscriptionCard />
        </div>
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
