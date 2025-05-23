
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Gift, HelpCircle, BarChart, CalendarPlus, UserPlus, History, LogIn } from 'lucide-react'; // Added History icon, Added LogIn
import { mockRewardBalance } from '@/app/readers-club/page'; // Import mock balance from readers club
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function RewardsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Loading state

  React.useEffect(() => {
    // Check login status on client mount
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);
    setIsLoading(false); // Finish loading check

    if (!loggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to view your rewards.",
            variant: "destructive",
        });
        // Optionally redirect
        // router.push('/login');
    }
  }, [router, toast]);

  if (isLoading) {
     return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Checking login status...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
              <div className="text-center max-w-md bg-background p-8 rounded-lg shadow-lg border">
                  <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
                  <p className="text-muted-foreground mb-6">You need to be logged in to view your reward points.</p>
                  <Button onClick={() => router.push('/login')} size="lg">
                      <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                  </Button>
                  <Button variant="link" size="sm" onClick={() => router.back()} className="mt-4">
                      <ArrowLeft className="mr-1 h-4 w-4" /> Go Back
                  </Button>
              </div>
         </div>
      );
  }

  // Render rewards page only if logged in
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
            <div className="container flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <h1 className="truncate text-xl font-semibold">Reward Points</h1>
            <div> {/* Placeholder for potential future actions */} </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto max-w-2xl flex-1 space-y-8 px-4 py-8">

            {/* Current Balance Card */}
            <Card className="shadow-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-2">
                        <Gift className="h-7 w-7 text-yellow-500" />
                        Your Reward Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold text-primary">{mockRewardBalance}</p>
                    <p className="text-muted-foreground mt-1">points</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                    {/* Update button to be a Link */}
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/rewards/history">
                             <History className="mr-2 h-4 w-4" /> View History
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* How Points Work Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        How Points Work
                    </CardTitle>
                    <CardDescription>Earn points by participating and use them to unlock more features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-foreground/90">
                    <p>
                        <strong className="font-medium text-foreground">Earning Points:</strong> You earn points by completing reading challenges, participating in discussions, and achieving reading milestones.
                    </p>
                    <p>
                        <strong className="font-medium text-foreground">Using Points:</strong> Reward points can be used for various activities within the Readers Club:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                            <strong className="font-semibold">Enter Premium Challenges:</strong> Some special challenges or marathons may require a point entry fee.
                        </li>
                        <li>
                            <strong className="font-semibold">Host Challenges:</strong> Spending points might be required to host your own challenges and invite members (e.g., 50 points to host).
                        </li>
                        <li>
                            <strong className="font-semibold">Participate in Quizzes:</strong> Join book-related quizzes using points.
                        </li>
                        <li>
                            <strong className="font-semibold">Unlock Badges:</strong> Future feature - redeem points for exclusive profile badges.
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Actions Card */}
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Use your points or explore ways to earn more.</CardDescription>
                </CardHeader>
                 <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button asChild variant="default">
                        <Link href="/readers-club#challenges-section">
                            <CalendarPlus className="mr-2 h-4 w-4" /> Browse Challenges
                        </Link>
                    </Button>
                     <Button asChild variant="secondary">
                        <Link href="/readers-club"> {/* Link back to the main club page */}
                           <UserPlus className="mr-2 h-4 w-4" /> Go to Readers Club
                        </Link>
                     </Button>
                     {/* Add buttons for hosting or quizzes when implemented */}
                 </CardContent>
            </Card>

        </main>
    </div>
  );
}
