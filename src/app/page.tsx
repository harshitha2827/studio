
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
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Set to true for demonstration
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const { toast } = useToast();

  // Simulate checking auth state and fetching profile data on mount
  React.useEffect(() => {
    if (isLoggedIn && typeof window !== 'undefined') {
       const storedData = localStorage.getItem('userProfile');
       if (storedData) {
            try {
                // Parse data, which might include avatarUrl as data URI
                const parsed: { name?: string; avatarUrl?: string } = JSON.parse(storedData);
                setUserProfile({ name: parsed.name, avatarUrl: parsed.avatarUrl });
            } catch (e) {
                 console.error("Failed to parse user profile from localStorage", e);
                 setUserProfile({ name: 'User', avatarUrl: '' }); // Fallback
            }
       } else {
            // Default if no profile exists yet
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
  };

   // Generate initials for Avatar fallback
   const getInitials = (name: string | undefined): string => {
    if (!name) return 'U'; // Default to 'U' if no name
    const names = name.split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2) // Take first letter of first two names
      .join('')
      .toUpperCase();
   };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          {/* App Title */}
          <div className="flex gap-6 md:gap-10">
             <Link href="/" className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                 <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                 <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
               </svg>
               <span className="inline-block font-bold">BookShelfie</span>
             </Link>
           </div>

          {/* Right Section: Profile Dropdown or Login Button */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              {isLoggedIn && userProfile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                       <Avatar className="h-8 w-8">
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
                    <DropdownMenuItem asChild>
                      <Link href="/profile"> {/* Link to the profile page */}
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile Details</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled> {/* Disabled for now */}
                      <History className="mr-2 h-4 w-4" />
                      <span>Reading History</span>
                       {/* Later: Link href="/history" */}
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled> {/* Disabled for now */}
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
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-8 lg:px-12">
           <Bookshelf />
        </div>
      </main>
    </div>
  );
}
