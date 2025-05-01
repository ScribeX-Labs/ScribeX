// components/ProfileCard.tsx
import { FC } from "react"
import Avatar from "./Avatar"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import Link from 'next/link';
import { Card, CardContent, CardHeader } from './ui/card';
import { Pencil, User } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface ProfileCardProps {
  name: string;
  email: string;
  university: string;
  photoUrl?: string;
  isLoading?: boolean;
}

const ProfileCard: FC<ProfileCardProps> = ({
  name,
  email,
  university,
  photoUrl,
  isLoading = false,
}) => {
  // Compute initials fallback
  const getInitials = () => {
    let initials = '';
    const words = name.trim().split(' ');
    words.forEach((word) => {
      if (word.length > 0) {
        initials += word[0].toUpperCase();
      }
    });
    return initials;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-4">
        <div className="relative">
          <Avatar
            src={photoUrl}
            fallback={getInitials()}
            size="64px"
            className="h-16 w-16 border-2 border-primary/20 bg-primary/5"
          />
          <div className="absolute -bottom-1 -right-1 rounded-full bg-card p-0.5 shadow-sm">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">Computer Science Student</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Email</label>
          <Input value={email} readOnly className="border-border bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">University</label>
          <Input value={university} readOnly className="border-border bg-background" />
        </div>
        <Button asChild className="button-glow w-full rounded-full">
          <Link href="/dashboard/profile/edit" className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCard
