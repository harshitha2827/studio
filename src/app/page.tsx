
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
  avatarUrl?: string;
};

export default function Home() {
  // Simulate authentication state - replace with actual auth logic later
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Set to true for demonstration
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const { toast } = useToast();

  // Simulate checking auth state and fetching profile data on mount
  React.useEffect(() => {
    // Replace with your actual check, e.g., check for a token
    // const userIsAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
    // setIsLoggedIn(userIsAuthenticated);

    // If logged in, fetch basic profile data (e.g., from localStorage for demo)
    if (isLoggedIn && typeof window !== 'undefined') {
       const storedData = localStorage.getItem('userProfile');
       if (storedData) {
            try {
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
    // Simulate logout action
    // localStorage.setItem('isLoggedIn', 'false'); // Example for local storage
    // localStorage.removeItem('userProfile'); // Clear profile on logout
    setIsLoggedIn(false);
    setUserProfile(null); // Clear profile state
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // In a real app, you'd redirect or clear auth state properly
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
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 relative"> {/* Ensure relative positioning for absolute children */}
      {/* Conditional Top Right Content: Profile Dropdown or Login Button */}
      <div className="absolute top-4 right-4 z-10"> {/* Ensure dropdown appears above other content */}
        {isLoggedIn && userProfile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name || 'User Profile'} />
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
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                <span>Reading History</span>
                 {/* Later: Link href="/history" */}
              </DropdownMenuItem>
              <DropdownMenuItem>
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
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>

      {/* Main content area */}
      <div className="w-full max-w-7xl mt-16"> {/* Add margin-top to prevent overlap with absolute positioned element */}
          <Bookshelf />
      </div>
    </main>
  );
}
