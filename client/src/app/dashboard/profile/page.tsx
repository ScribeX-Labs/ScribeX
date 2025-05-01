'use client';
import ProfileCard from '@/components/ProfileCard';
import SubscriptionCard from '@/components/subscription-card';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FC, useEffect, useState } from 'react';
import { User } from 'lucide-react';

const ProfilePage: FC = () => {
  const { user, logout } = useAuth();
  const [university, setUniversity] = useState(''); // default value
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch user data from Firestore (assuming you have a users collection)
    const userDocRef = doc(db, 'users', user.uid);
    const fetchUserData = async () => {
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUniversity(userData.university || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Profile</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl border-2 bg-card p-1">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"></div>
            <ProfileCard
              name={user?.displayName ?? 'Add Username'}
              email={user?.email ?? 'Add Email'}
              university={university ?? 'Add School or Work'}
              photoUrl={user?.photoURL ?? undefined}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"></div>
            <SubscriptionCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
