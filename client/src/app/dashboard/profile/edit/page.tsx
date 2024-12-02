'use client';
import { FC, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

const EditProfilePage: FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [university, setUniversity] = useState(''); // default value
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Fetch user data from Firestore (assuming you have a users collection)
    const userDocRef = doc(db, 'users', user.uid);
    const fetchUserData = async () => {
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setDisplayName(userData.displayName);
        setEmail(userData.email);
        setUniversity(userData.university);
      }
    };

    fetchUserData();
  }, [user, db]);

  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Update user data in Firestore (assuming you have a users collection)
      const userDocRef = doc(db, 'users', user.uid);

      // Check if the user document exists
      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) {
        // Create the user document if it doesn't exist
        await setDoc(userDocRef, {
          displayName,
          email,
          university,
        });
      } else {
        // Update the user document if it exists
        await updateDoc(userDocRef, {
          displayName,
          email,
          university,
        });
      }

      toast.success('Profile updated successfully');
      router.push('/dashboard/profile');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">University</label>
          <Input value={university} onChange={(e) => setUniversity(e.target.value)} />
        </div>
        <Button className="mt-4 w-full" onClick={handleSubmit}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditProfilePage;
