'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';


function Page() {
  const { user, logout, deleteSelf} = useAuth();

  return (
    <div className="w-full p-4">
      <div className="">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-lg">Welcome, {user?.email}</p>
        <Button onClick={logout}>Logout</Button>
        <Button onClick={deleteSelf}>Delete Account</Button>
        <Button asChild>
          <Link href="/upload">Upload</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/transcribe">Transcribe</Link>
        </Button>
      </div>
    </div>
  );
}

export default Page;