'use client';
import { FC, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserUploadData } from '@/context/UserUploadDataContext';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const EditProfilePage: FC = () => {
  const { user } = useAuth();
  const firestore = getFirestore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [university, setUniversity] = useState(''); // default value
  
  const handleSubmit = async () => {
    if (!user) return;

    try {
      // Update user data in Firestore (assuming you have a users collection)
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName,
        email,
        university,
      });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
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
        <Button className="w-full mt-4" onClick={handleSubmit}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditProfilePage;
