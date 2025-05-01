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
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-grow items-center justify-center">
        <AuthPage />
      </main>
    </div>
  );
}

export default Page;
