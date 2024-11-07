'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import React from 'react';

function Page() {
  const { user, logout } = useAuth();
  return (
    <div className="p-4">
      <div className="">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-lg">Welcome, {user?.email}</p>
        <Button onClick={logout}>Logout</Button>
        <Button asChild>
          <Link href="/upload">Upload</Link>
        </Button>
      </div>
    </div>
  );
}

export default Page;
