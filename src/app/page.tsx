
'use client'; // Need client component for state and interactivity

import * as React from 'react';
import type { Book, ReadingStatus } from "@/interfaces/book"; // Import Book type
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, User, Settings, History, BookMarked, Search } from "lucide-react"; // Added Search icon
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
import { BookCategorySection } from "@/components/book-category-section"; // Import the new component
import { generateSampleBooks } from '@/lib/mock-data'; // Import mock data generator
import { Input } from "@/components/ui/input"; // Import Input component

// Simple type for profile data needed here
type UserProfile = {
  name?: string;
  avatarUrl?: string; // Can be a URL or a data URI
};


// Generate the data once at module load time - ensuring consistency
const trendingBooks = generateSampleBooks(15, 'trending');
const popularBooks = generateSampleBooks(15, 'popular');
const top100Books = generateSampleBooks(15, 'top-100');


export default function Home() {
  // Simulate authentication state - replace with actual auth logic later
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Assume logged in for demo
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState(''); // State for the search bar
  const { toast } = useToast();

  React.useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);

    if (isLoggedIn) {
       // Access localStorage only on the client
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
            setUserProfile({ name: 'User', avatarUrl: '' }); // Default if logged in but no profile
       }
    } else {
        setUserProfile(null);
    }
  }, [isLoggedIn]); // Rerun if login state changes

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    // Access localStorage only on the client
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userProfile');
    }
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
     // Consider redirecting: router.push('/login');
  };

   const getInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1 && names[0].length > 0) return names[0][0].toUpperCase();
    return names
      .filter(n => n.length > 0)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
   };

   const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;
        // In a real app, navigate to a search results page or filter current view
        toast({
            title: "Search Submitted",
            description: `Searching for: ${searchTerm} (functionality not implemented)`,
        });
   };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          {/* Left Section: App Title & Search */}
          <div className="flex gap-4 md:gap-6 items-center flex-1 sm:flex-none">
             <Link href="/" className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                 <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 1 0-5H20"></path>
               </svg>
               <span className="inline-block font-bold">Bookshelf</span>
             </Link>

             {/* Search Bar */}
             <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative flex-grow max-w-xs items-center">
                <Input
                    type="search"
                    placeholder="Search books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 text-sm" // Add padding for icon
                 />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
             </form>
           </div>


          {/* Right Section: Bookshelf Button, Profile Dropdown or Login Button */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            {/* Search Icon Button for Mobile */}
            <Button variant="ghost" size="icon" className="sm:hidden">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
            </Button>

            {/* Bookshelf Button */}
             <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
               <Link href="/bookshelf" aria-label="My Bookshelf">
                 <BookMarked className="h-5 w-5" />
               </Link>
             </Button>
             <Button asChild variant="ghost" size="icon" className="sm:hidden">
               <Link href="/bookshelf" aria-label="My Bookshelf">
                 <BookMarked className="h-5 w-5" />
               </Link>
             </Button>


              {/* Only render profile/login state after client mount to avoid hydration mismatch */}
              {isClient && (
                isLoggedIn && userProfile ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                         <Avatar className="h-9 w-9 border">
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
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile Details</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="cursor-not-allowed">
                        <History className="mr-2 h-4 w-4" />
                        <span>Reading History</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="cursor-not-allowed">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
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
              {/* Placeholder during SSR/initial render before client check */}
              {!isClient && <div className="h-9 w-9 rounded-full bg-muted"></div>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">

        {/* Book Discovery Sections - Use the pre-generated consistent data and pass slugs */}
        <BookCategorySection title="Trending Books" books={trendingBooks} slug="trending" />
        <BookCategorySection title="Popular Books" books={popularBooks} slug="popular" />
        <BookCategorySection title="Top 100 (Sample)" books={top100Books} slug="top-100" />

         {/* Bookshelf component is no longer rendered here */}
      </main>

       {/* Optional Footer (Consider adding later if needed) */}
       {/*
       <footer className="mt-auto border-t bg-muted/40 py-4">
         <div className="container text-center text-sm text-muted-foreground">
            Bookshelf © {new Date().getFullYear()}
         </div>
       </footer>
       */}
    </div>
  );
}
