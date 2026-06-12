'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { GraduationCap, Mail, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SubscriptionCard } from '@/components/subscription-card';
import { useAuth } from '@/context/auth-context';
import { getFirebaseDb } from '@/lib/firebase';

interface UserProfile {
  displayName?: string;
  email?: string;
  university?: string;
}

export default function ProfilePage() {
  const { user, deleteSelf } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(getFirebaseDb(), 'users', user.uid))
      .then((snapshot) => setProfile(snapshot.exists() ? (snapshot.data() as UserProfile) : {}))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, [user]);

  const name = profile?.displayName || user?.displayName || 'Unnamed';
  const email = profile?.email || user?.email || '';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Account</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Profile</h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display">Your details</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="press"
                nativeButton={false} render={<Link href="/dashboard/profile/edit" />}
              >
                <Pencil />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {loading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-52" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border">
                    <AvatarImage src={user?.photoURL ?? undefined} alt="" />
                    <AvatarFallback className="bg-primary/15 font-display text-lg text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold">{name}</p>
                    <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {email}
                    </p>
                  </div>
                </div>

                {profile?.university && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    {profile.university}
                  </p>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-medium text-destructive">Danger zone</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deleting your account removes your login. Your uploads stay in storage until
                    support purges them.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="destructive" size="sm" className="press mt-3">
                          <Trash2 />
                          Delete account
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes your ScribeX account. This can’t be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep my account</AlertDialogCancel>
                        <AlertDialogCancel variant="destructive" onClick={deleteSelf}>
                          Delete forever
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <SubscriptionCard />
      </div>
    </div>
  );
}
