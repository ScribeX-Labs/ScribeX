'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
//import AuthPage from '@/components/auth-page';
import { useRouter } from 'next/navigation';
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
  return (
    <div className="p-4">
      <div className="">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-lg">Welcome, {user?.email}</p>
        <Button onClick={logout}>Logout</Button>
        <Button onClick={() => {
          if(confirm("Are you sure you want to delete your account? This action cannot be undone.")){
            deleteSelf()}
          }}>Delete Account</Button>

      </div>
    </div>
  );
}

export default Page;
