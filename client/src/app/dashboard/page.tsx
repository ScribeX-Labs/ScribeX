'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
//import AuthPage from '@/components/auth-page';
import React, {useEffect} from 'react';

/*
const profilePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

}
*/

function Page() {
  const { user, logout, deleteSelf} = useAuth();

  const handleDeleteSelf = async (/*password: string*/) => {
    try {
      
      await deleteSelf("PUc16pDV8tR/5(XszH*"); // call deleteSelf to delete the user account
    } catch (error) {
      console.error("Error deleting account: ", error);
    }
  }
  return (
    <div className="p-4">
      <div className="">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-lg">Welcome, {user?.email}</p>
        <Button onClick={logout}>Logout</Button>
        <Button onClick={handleDeleteSelf}>Delete Account</Button>

      </div>
    </div>
  );
}

export default Page;