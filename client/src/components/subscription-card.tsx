'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, HardDrive, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { api, type SubscriptionInfo } from '@/lib/api';

export function SubscriptionCard() {
  const { user } = useAuth();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .getSubscription(user.uid)
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load subscription');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      const idToken = await user.getIdToken();
      await api.setSubscription(user.uid, 'pro', idToken);
      toast.success('Welcome to Pro', {
        description: 'Bigger files, longer recordings — go wild.',
      });
      setInfo(await api.getSubscription(user.uid));
    } catch (error) {
      toast.error('Upgrade failed', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!info) return null;

  const isPro = info.subscription.tier === 'pro';

  return (
    <Card className={cn('grain relative overflow-hidden', isPro && 'border-primary/40')}>
      {isPro && (
        <div className="absolute inset-x-0 top-0 -z-0 h-24 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,oklch(0.795_0.155_75/0.18),transparent)]" />
      )}
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Subscription</CardTitle>
          <Badge variant={isPro ? 'default' : 'secondary'} className="rounded-full uppercase">
            {info.subscription.tier}
          </Badge>
        </div>
        <CardDescription>
          {isPro
            ? 'You’re on Pro — the full ScribeX experience.'
            : 'You’re on the free plan. Pro unlocks longer recordings.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <LimitTile icon={HardDrive} label="Max file size" value={info.limits.display.file_size} />
          <LimitTile icon={Clock} label="Max duration" value={info.limits.display.duration} />
        </div>

        {!isPro && (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button className="press w-full" onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Upgrade to Pro
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function LimitTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-xl border bg-muted/40 p-3"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 font-mono text-lg font-bold">{value}</p>
    </motion.div>
  );
}
