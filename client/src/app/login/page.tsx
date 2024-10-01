'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function Page() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="p-4">
      <Button onClick={loginWithGoogle}>Login with Google</Button>
    </div>
  );
}

export default Page;
