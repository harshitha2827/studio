
'use client'; // Need client component for state and interactivity

import * as React from 'react';
import { Bookshelf } from "@/components/bookshelf";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, User, Settings, History } from "lucide-react"; // Import necessary icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useToast } from "@/hooks/use-toast"; // Import useToast hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

// Simple type for profile data needed here
type UserProfile = {
  name?: string;
  avatarUrl?: string; // Can be a URL or a data URI
};

export default function Home() {
  // Simulate authentication state - replace with actual auth logic later
  // For demo, assume user is logged in. In a real app, this would come from context/auth state.
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Initial state reflects server assumption
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null); // Initial state null
  const [isClient, setIsClient] = React.useState(false); // Track client mount
  const { toast } = useToast();

  // Effect to run on mount and handle client-side logic
  React.useEffect(() => {
    setIsClient(true); // Component has mounted

    // Check auth state (simulated) and load profile from localStorage
    if (isLoggedIn) {
       const storedData = localStorage.getItem('userProfile');
       if (storedData) {
            try {
                const parsed: { name?: string; avatarUrl?: string; dob?: string } = JSON.parse(storedData);
                setUserProfile({ name: parsed.name, avatarUrl: parsed.avatarUrl || '' });
            } catch (e) {
                 console.error("Failed to parse user profile from localStorage", e);
                 setUserProfile({ name: 'User', avatarUrl: '' }); // Fallback
            }
       } else {
            // Default if no profile exists yet but user is logged in
            setUserProfile({ name: 'User', avatarUrl: '' });
       }
    } else {
        setUserProfile(null); // Clear profile if not logged in
    }
  }, [isLoggedIn]); // Re-run if login status changes

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null); // Clear profile state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userProfile'); // Clear stored profile on logout
    }
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
     // Redirect to login page might be desired here
     // router.push('/login'); // Requires importing and using useRouter
  };

   // Generate initials for Avatar fallback
   const getInitials = (name: string | undefined): string => {
    if (!name) return 'U'; // Default to 'U' if no name
    const names = name.trim().split(' ');
    if (names.length === 1 && names[0].length > 0) return names[0][0].toUpperCase(); // Handle single name
    return names
      .filter(n => n.length > 0) // Ensure non-empty strings
      .map((n) => n[0])
      .slice(0, 2) // Take first letter of first two names/parts
      .join('')
      .toUpperCase();
   };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          {/* App Title */}
          <div className="flex gap-6 md:gap-10">
             <Link href="/" className="flex items-center space-x-2">
               {/* Simple SVG Book Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                 <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 1 0-5H20"></path>
               </svg>
               <span className="inline-block font-bold">BookShelfie</span>
             </Link>
           </div>

          {/* Right Section: Profile Dropdown or Login Button */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              {/* Only render profile dropdown or login button after client mount */}
              {isClient && (
                isLoggedIn && userProfile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                         <Avatar className="h-9 w-9 border">
                            {/* AvatarImage src can handle both URLs and data URIs */}
                            <AvatarImage src={userProfile.avatarUrl || undefined} alt={userProfile.name || 'User Profile'} />
                            <AvatarFallback>
                               {getInitials(userProfile.name)}
                            </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>{userProfile.name || 'My Account'}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile"> {/* Link to the profile page */}
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="cursor-not-allowed"> {/* Disabled for now */}
                        <History className="mr-2 h-4 w-4" />
                        <span>Reading History</span>
                         {/* Later: Link href="/history" */}
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="cursor-not-allowed"> {/* Disabled for now */}
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                        {/* Later: Link href="/settings" */}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                )
              )}
              {/* Render a placeholder or nothing during SSR/pre-hydration */}
              {!isClient && <div className="h-9 w-9"></div>}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content area - Bookshelf component handles its own internal layout */}
      <main className="flex-1">
         <Bookshelf />
      </main>

        {/* Optional Footer */}
        {/*
        <footer className="mt-auto border-t bg-muted/40 py-4">
          <div className="container text-center text-sm text-muted-foreground">
             BookShelfie © {new Date().getFullYear()}
          </div>
        </footer>
         */}
    </div>
  );
}
