
'use client'; // Need client component for state and interactivity

import * as React from 'react';
import type { Book, ReadingStatus } from "@/interfaces/book"; // Import Book type
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogOut, User, Settings, BookMarked, Search, MessageSquare, Users, UserSearch } from "lucide-react"; // Added Users, UserSearch icons
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
import { Chat } from '@/interfaces/chat'; // Import Chat interface
import { useRouter } from 'next/navigation'; // Import useRouter
import { cn } from "@/lib/utils";

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
  const [bookSearchTerm, setBookSearchTerm] = React.useState(''); // State for the book search bar
  const [userSearchTerm, setUserSearchTerm] = React.useState(''); // State for the user search bar
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    // This effect runs only on the client after hydration
    setIsClient(true);

    // TODO: Replace with actual auth check
    // For now, we simulate based on profile presence in localStorage
    const storedData = localStorage.getItem('userProfile');
    const loggedIn = !!storedData; // Consider user logged in if profile exists
    setIsLoggedIn(loggedIn);

    if (loggedIn && storedData) {
       // Access localStorage only on the client
       try {
           const parsed: { name?: string; avatarUrl?: string; dob?: string } = JSON.parse(storedData);
           setUserProfile({ name: parsed.name, avatarUrl: parsed.avatarUrl || '' });
       } catch (e) {
            console.error("Failed to parse user profile from localStorage", e);
            setUserProfile({ name: 'User', avatarUrl: '' }); // Fallback
       }
    } else {
        setUserProfile(null); // Not logged in or no profile
    }
  }, []); // Run only once on mount

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    // Access localStorage only on the client
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userProfile');
      // Optionally clear other related storage
      localStorage.removeItem('bookshelfBooks');
      localStorage.removeItem('mockChallenges');
      localStorage.removeItem('mockRewardTransactions');
      // Clear cookie
       document.cookie = "bookshelf_last_tab=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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

   // Handle Book Search
   const handleBookSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookSearchTerm.trim()) return;
        router.push(`/search?q=${encodeURIComponent(bookSearchTerm.trim())}`);
   };
   const handleMobileBookSearchClick = () => {
     if (!bookSearchTerm.trim()) {
       toast({ title: "Enter Search Term", description: "Please type what book you want to search for." });
       return;
     }
     router.push(`/search?q=${encodeURIComponent(bookSearchTerm.trim())}`);
   };

    // Handle User Search
   const handleUserSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userSearchTerm.trim()) return;
        // Navigate to user search results page (e.g., /users/search)
        router.push(`/users/search?q=${encodeURIComponent(userSearchTerm.trim())}`);
   };
   const handleMobileUserSearchClick = () => {
     if (!userSearchTerm.trim()) {
       toast({ title: "Enter User Search Term", description: "Please type the user you want to search for." });
       return;
     }
     router.push(`/users/search?q=${encodeURIComponent(userSearchTerm.trim())}`);
   };

   // Function to handle navigation, checks login status for protected routes
   const navigate = (path: string) => {
       // Use isClient flag to ensure this only runs client-side
       if (!isClient) return; // Don't navigate during SSR or before hydration

       if (!isLoggedIn) {
           toast({
               title: "Login Required",
               description: "Please log in to access this feature.",
               variant: "destructive",
               action: (
                  <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                     Login
                  </Button>
               ),
           });
           // Consider redirecting immediately after toast or let user click action
           // router.push('/login');
       } else {
           router.push(path);
       }
   };


  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          {/* Left Section: App Title */}
          <div className="flex items-center gap-4 md:gap-6">
             <Link href="/" className="flex items-center space-x-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                 <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v16H6.5a2.5 2.5 0 0 1 0-5H20"></path>
               </svg>
               <span className="inline-block font-bold">BookBurst</span>
             </Link>
          </div>

           {/* Center Section: Search Bars (Desktop) */}
          <div className="hidden sm:flex flex-1 justify-center gap-4 max-w-2xl">
              {/* Book Search */}
              <form onSubmit={handleBookSearchSubmit} className="relative flex-grow max-w-xs items-center">
                  <Input
                      type="search"
                      placeholder="Search books..."
                      value={bookSearchTerm}
                      onChange={(e) => setBookSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm" // Add padding for icon
                      aria-label="Search for books"
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </form>
              {/* User Search */}
              <form onSubmit={handleUserSearchSubmit} className="relative flex-grow max-w-xs items-center">
                  <Input
                      type="search"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm" // Add padding for icon
                      aria-label="Search for users"
                  />
                  <UserSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </form>
          </div>


          {/* Right Section: Icons & Profile */}
          <div className="flex items-center justify-end space-x-1 sm:space-x-2">
             {/* Mobile Search Inputs & Buttons */}
             <div className="sm:hidden flex items-center gap-1">
                {/* Mobile Book Search */}
                <div className="relative">
                    <Input
                        type="search"
                        placeholder="Books..."
                        value={bookSearchTerm}
                        onChange={(e) => setBookSearchTerm(e.target.value)}
                        className="pl-7 h-9 text-sm w-24" // Shorter input
                        aria-label="Search books"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-7" // Smaller button
                        onClick={handleMobileBookSearchClick}
                        aria-label="Submit book search"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                 {/* Mobile User Search */}
                 <div className="relative">
                     <Input
                         type="search"
                         placeholder="Users..."
                         value={userSearchTerm}
                         onChange={(e) => setUserSearchTerm(e.target.value)}
                         className="pl-7 h-9 text-sm w-24" // Shorter input
                         aria-label="Search users"
                     />
                     <Button
                         variant="ghost"
                         size="icon"
                         className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-7" // Smaller button
                         onClick={handleMobileUserSearchClick}
                         aria-label="Submit user search"
                     >
                         <UserSearch className="h-4 w-4" />
                     </Button>
                 </div>
            </div>


            {/* Action Icons */}
            <Button variant="ghost" size="icon" onClick={() => navigate('/readers-club')} aria-label="Readers Club">
                <Users className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/chat')} aria-label="Chat">
                 <MessageSquare className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" onClick={() => navigate('/bookshelf')} aria-label="My Bookshelf">
               <BookMarked className="h-5 w-5" />
             </Button>


              {/* Profile Dropdown or Login Button */}
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
                        {/* Use navigate function for profile link */}
                        <button onClick={() => navigate('/profile')} className="flex items-center w-full">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile Details</span>
                        </button>
                      </DropdownMenuItem>
                      {/* Removed Reading History button */}
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
              {!isClient && <div className="h-9 w-9 rounded-full bg-muted animate-pulse"></div>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 space-y-12">

        {/* Book Discovery Sections - Pass isLoggedIn state */}
        <BookCategorySection title="Trending Books" books={trendingBooks} slug="trending" isLoggedIn={isLoggedIn} />
        <BookCategorySection title="Popular Books" books={popularBooks} slug="popular" isLoggedIn={isLoggedIn}/>
        <BookCategorySection title="Top 100 (Sample)" books={top100Books} slug="top-100" isLoggedIn={isLoggedIn} />

      </main>

       {/* Optional Footer */}
       {/*
       <footer className="mt-auto border-t bg-muted/40 py-4">
         <div className="container text-center text-sm text-muted-foreground">
            BookBurst © {new Date().getFullYear()}
         </div>
       </footer>
       */}
    </div>
  );
}

    