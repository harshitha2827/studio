
'use client'; // Need client component for state and interactivity

import * as React from 'react';
import type { Book, ReadingStatus } from "@/interfaces/book"; // Import Book type
// import { Bookshelf } from "@/components/bookshelf"; // Removed direct import
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, User, Settings, History, BookMarked } from "lucide-react"; // Import necessary icons, added BookMarked
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

// Simple type for profile data needed here
type UserProfile = {
  name?: string;
  avatarUrl?: string; // Can be a URL or a data URI
};

// --- Mock Data Generation (Adapted from bookshelf.tsx for example sections) ---
// IMPORTANT: In a real app, this data would come from an API
const generateSampleBooks = (count: number, seedPrefix: string): Book[] => {
  const books: Book[] = [];
  const startDate = new Date("2023-01-01").getTime();
  const endDate = new Date().getTime();

  for (let i = 1; i <= count; i++) {
     const randomTimestamp = startDate + Math.random() * (endDate - startDate);
     const randomDate = new Date(randomTimestamp);
     // For discovery sections, status/rating isn't directly relevant unless showing community data
     const status: ReadingStatus = 'want-to-read'; // Default status for general books
     const hasCover = Math.random() > 0.1; // 90% chance of cover

    books.push({
      id: `${seedPrefix}-${i}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: `${seedPrefix} Book ${i}`,
      author: `Author ${Math.floor(Math.random() * 50) + 1}`, // Random author
      status: status,
      // Rating/notes usually aren't shown in discovery sections unless aggregated
      addedDate: randomDate, // Represents when it became "trending" or "popular"
      coverUrl: hasCover ? `https://picsum.photos/seed/${seedPrefix}${i}/300/400` : `https://picsum.photos/seed/defaultBook/300/400`, // Fallback cover
      isbn: `978-${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
    });
  }
  // Sort might vary based on category (e.g., trending by recent activity, popular by ratings)
  return books.sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
};

const trendingBooks = generateSampleBooks(15, 'Trending');
const popularBooks = generateSampleBooks(15, 'Popular');
const top100Books = generateSampleBooks(15, 'Top100'); // Showing first 15 of top 100 for brevity
// --- End Mock Data Generation ---


export default function Home() {
  // Simulate authentication state - replace with actual auth logic later
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Assume logged in for demo
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setIsClient(true);

    if (isLoggedIn) {
       const storedData = typeof window !== 'undefined' ? localStorage.getItem('userProfile') : null;
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
  }, [isLoggedIn]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          {/* App Title */}
          <div className="flex gap-6 md:gap-10">
             <Link href="/" className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                 <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 1 0-5H20"></path>
               </svg>
               <span className="inline-block font-bold">BookShelfie</span>
             </Link>
           </div>

          {/* Right Section: Bookshelf Button, Profile Dropdown or Login Button */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              {/* Bookshelf Button - Link to the bookshelf section (or page) */}
              {/* NOTE: Linking to #bookshelf-section might need adjustment if Bookshelf moves to a new page */}
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/#bookshelf-section"> {/* Adjust href if Bookshelf moves to a separate page like /bookshelf */}
                  <BookMarked className="mr-2 h-4 w-4" />
                  My Bookshelf
                </Link>
              </Button>
              {/* Icon only button for mobile */}
               <Button asChild variant="ghost" size="icon" className="sm:hidden">
                 <Link href="/#bookshelf-section" aria-label="My Bookshelf"> {/* Adjust href if Bookshelf moves */}
                   <BookMarked className="h-5 w-5" />
                 </Link>
               </Button>


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
              {!isClient && <div className="h-9 w-9"></div>} {/* Placeholder */}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">

        {/* Book Discovery Sections */}
        <BookCategorySection title="Trending Books" books={trendingBooks} />
        <BookCategorySection title="Popular Books" books={popularBooks} />
        <BookCategorySection title="Top 100 (Sample)" books={top100Books} />

         {/* Removed Separator and Bookshelf component */}
         {/* <hr className="border-border my-8" /> */}
         {/* <div id="bookshelf-section" className="scroll-mt-16"> */}
            {/* <Bookshelf /> */}
         {/* </div> */}
      </main>

       {/* Optional Footer (Consider adding later if needed) */}
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

