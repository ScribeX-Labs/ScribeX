'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { getFirebaseDb } from '@/lib/firebase';

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [university, setUniversity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(getFirebaseDb(), 'users', user.uid))
      .then((snapshot) => {
        const data = snapshot.exists() ? snapshot.data() : {};
        setDisplayName((data.displayName as string) || user.displayName || '');
        setUniversity((data.university as string) || '');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await Promise.all([
        setDoc(
          doc(getFirebaseDb(), 'users', user.uid),
          { displayName, university, email: user.email },
          { merge: true },
        ),
        updateProfile(user, { displayName }),
      ]);
      toast.success('Profile updated');
      router.push('/dashboard/profile');
    } catch {
      toast.error('Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back to profile"
          nativeButton={false} render={<Link href="/dashboard/profile" />}
        >
          <ArrowLeft />
        </Button>
        <h1 className="font-display text-2xl font-bold tracking-tight">Edit profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Your details</CardTitle>
          <CardDescription>This is how you appear across ScribeX.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                disabled={loading}
                placeholder="Where you study (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ''} disabled readOnly />
              <p className="text-xs text-muted-foreground">
                Email is tied to your login and can’t be changed here.
              </p>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="press" disabled={saving || loading}>
                {saving && <Loader2 className="animate-spin" />}
                Save changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                nativeButton={false} render={<Link href="/dashboard/profile" />}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
