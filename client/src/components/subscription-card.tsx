'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Info, Sparkles, Zap, Clock, FileUp, RotateCcw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';

interface Subscription {
  tier: string;
  is_active: boolean;
  created_at?: any;
  updated_at?: any;
}

interface SubscriptionLimits {
  file_size: number;
  duration: number;
  file_size_display: string;
  duration_display: string;
}

interface SubscriptionData {
  user_id: string;
  subscription: Subscription;
  limits: SubscriptionLimits;
}

// Default free tier limits to show if the API fails
const DEFAULT_FREE_TIER = {
  user_id: '',
  subscription: {
    tier: 'free',
    is_active: true,
  },
  limits: {
    file_size: 500 * 1024 * 1024, // 500 MB
    duration: 120, // 2 minutes
    file_size_display: '500 MB',
    duration_display: '2 minutes',
  },
};

export default function SubscriptionCard() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${user.uid}`,
        );
        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        } else {
          console.error('Failed to fetch subscription data');
          // Set default free tier data if the API fails
          setSubscriptionData({
            ...DEFAULT_FREE_TIER,
            user_id: user.uid,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        // Set default free tier data if the API fails
        setSubscriptionData({
          ...DEFAULT_FREE_TIER,
          user_id: user.uid,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleUpgradeClick = async () => {
    if (!user) return;

    setUpgrading(true);
    try {
      // In a real application, this would redirect to a payment processor
      // For demo purposes, we'll just call the API directly
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${user.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: 'pro' }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
        toast.success('Upgraded to Pro tier successfully!');
      } else {
        toast.error('Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('An error occurred while upgrading');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full border-2">
        <CardHeader>
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!subscriptionData) {
    return (
      <Card className="w-full border-2">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Unable to load subscription information</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="gap-2 rounded-full">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const isPro = subscriptionData.subscription.tier === 'pro';

  return (
    <Card
      className={`w-full overflow-hidden border-2 ${isPro ? 'border-primary/50' : 'border-border'}`}
    >
      <div
        className={`absolute -right-20 -top-20 h-40 w-40 rounded-full ${isPro ? 'bg-primary/20' : 'bg-secondary/10'} blur-3xl`}
      ></div>
      <CardHeader className={isPro ? 'bg-primary/10' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {isPro ? (
              <Crown className="mr-2 h-5 w-5 text-primary" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5 text-secondary" />
            )}
            {isPro ? 'Pro Subscription' : 'Free Tier'}
          </CardTitle>
          {isPro && (
            <div className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Active
            </div>
          )}
        </div>
        <CardDescription>
          {isPro
            ? 'Enjoy unlimited transcription capabilities'
            : 'Upgrade to unlock unlimited transcriptions'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <h3 className="mb-4 text-sm font-medium">Your current limits:</h3>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <FileUp className="h-4 w-4 text-primary" />
              </div>
              <span className="ml-2 text-sm">Max file size</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum size of audio/video files you can upload</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">{subscriptionData.limits.file_size_display}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="ml-2 text-sm">Max duration</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="ml-1 h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Maximum length of audio/video files you can transcribe</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="font-medium">{subscriptionData.limits.duration_display}</span>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-center pt-5">
        {!isPro ? (
          <Button
            className="button-glow w-full gap-2 rounded-full"
            onClick={handleUpgradeClick}
            disabled={upgrading}
          >
            {upgrading ? (
              <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {upgrading ? 'Processing...' : 'Upgrade to Pro'}
          </Button>
        ) : (
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary">Pro Features Active</p>
            </div>
            <p className="text-xs text-muted-foreground">Thank you for being a Pro subscriber!</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 