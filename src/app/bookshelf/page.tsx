
'use client';

import * as React from 'react';
import { Bookshelf } from '@/components/bookshelf';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function BookshelfPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Add loading state

  React.useEffect(() => {
    // Check login status on client mount
    // TODO: Replace with actual auth check
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);
    setIsLoading(false); // Finish loading check

    if (!loggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to view your bookshelf.",
            variant: "destructive",
        });
      // Optionally redirect immediately, or show a login prompt
      // router.push('/login');
    }
  }, [router, toast]); // Add router and toast to dependencies

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
                 <p className="text-muted-foreground mb-6">You need to be logged in to view your personal bookshelf.</p>
                 <Button onClick={() => router.push('/login')} size="lg">
                     <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                 </Button>
                 <Button variant="link" size="sm" asChild className="mt-4">
                     <Link href="/">
                         <ArrowLeft className="mr-1 h-4 w-4" /> Go Back Home
                     </Link>
                 </Button>
             </div>
        </div>
     );
  }

  // Render bookshelf only if logged in
  return (
    <div className="flex min-h-screen flex-col bg-background">
       {/* Simple Header for Bookshelf Page */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center justify-between">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back to Discovery
              </Link>
            </Button>
            {/* Can add other header elements if needed later */}
         </div>
      </header>

      {/* Main Content - The Bookshelf Component */}
      <main className="flex-1">
        <Bookshelf />
      </main>
    </div>
  );
}
