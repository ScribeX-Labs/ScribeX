'use client';
import AuthPage from '@/components/auth-page';
import Navbar from '@/components/navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

function Page() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <>
      <Navbar />
      <AuthPage />
    </>
  );
}

export default Page;
