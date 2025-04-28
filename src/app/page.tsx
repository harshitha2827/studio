
'use client'; // Need client component for state and interactivity

import * as React from 'react';
import { Bookshelf } from "@/components/bookshelf";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, LogOut, User, Settings, History } from "lucide-react"; // Import necessary icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useToast } from "@/hooks/use-toast"; // Import useToast hook

export default function Home() {
  // Simulate authentication state - replace with actual auth logic later
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Set to true for demonstration
  const { toast } = useToast();

  // Simulate checking auth state on mount (e.g., from localStorage/cookie)
  // React.useEffect(() => {
  //   // Replace with your actual check, e.g., check for a token
  //   const userIsAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  //   setIsLoggedIn(userIsAuthenticated);
  // }, []);

  const handleLogout = () => {
    // Simulate logout action
    // localStorage.setItem('isLoggedIn', 'false'); // Example for local storage
    setIsLoggedIn(false);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    // In a real app, you'd redirect or clear auth state properly
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 relative"> {/* Ensure relative positioning for absolute children */}
      {/* Conditional Top Right Content: Profile Dropdown or Login Button */}
      <div className="absolute top-4 right-4 z-10"> {/* Ensure dropdown appears above other content */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="User Profile Menu">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
