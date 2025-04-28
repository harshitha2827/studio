
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Gift, LogIn, Search, Send, ThumbsUp } from 'lucide-react'; // Added relevant icons
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Book } from '@/interfaces/book'; // Assuming Book interface exists
import { SimpleBookCard } from '@/components/simple-book-card'; // Use simple card for books
import { generateSampleBooks } from '@/lib/mock-data'; // Use mock data generator
import { cn } from '@/lib/utils'; // Import cn utility function

// --- Mock Data Structures (Replace with actual data fetching/state) ---

// Mock User Structure (subset needed here)
interface MockUser {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
}

// Mock Recommendation Structure
interface Recommendation {
  id: string;
  sender: MockUser;
  recipient: MockUser;
  book: Book;
  message?: string;
  timestamp: Date;
  liked?: boolean; // Track if the recipient liked the recommendation
}

// Mock Users (replace with actual user search/data)
const mockUsers: MockUser[] = [
  { id: 'user1', username: 'alice_s', name: 'Alice Smith', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
  { id: 'user2', username: 'bob_j', name: 'Bob Johnson', avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
  { id: 'user3', username: 'charlie_w', name: 'Charlie Williams', avatarUrl: 'https://i.pravatar.cc/40?u=charlie' },
  { id: 'user4', username: 'diana_b', name: 'Diana Brown', avatarUrl: 'https://i.pravatar.cc/40?u=diana' },
];

// Mock Current User (replace with actual logged-in user context)
const currentUserId = 'user1'; // Assume Alice is logged in
const currentUser = mockUsers.find(u => u.id === currentUserId);

// Mock Existing Recommendations (replace with actual fetching)
// Load recommendations from localStorage or generate new ones
const loadMockRecommendations = (): Recommendation[] => {
    if (typeof window === 'undefined') return []; // Guard against SSR access

    const storedRecsRaw = localStorage.getItem('mockRecommendations');
    if (storedRecsRaw) {
        try {
            return JSON.parse(storedRecsRaw).map((r: any) => ({
                ...r,
                timestamp: new Date(r.timestamp), // Parse dates
                // Ensure sender/recipient/book are properly structured if needed
                // This example assumes basic structure is stored
            }));
        } catch (e) {
            console.error("Failed to parse recommendations from localStorage:", e);
            // Fallback or clear localStorage?
        }
    }
    // If nothing in storage, generate and store
    const newRecs = generateMockRecommendations(10);
    try {
        localStorage.setItem('mockRecommendations', JSON.stringify(newRecs.map(r => ({...r, timestamp: r.timestamp.toISOString() }))));
    } catch (e) {
        console.error("Failed to store initial recommendations:", e);
    }
    return newRecs;
}


const generateMockRecommendations = (count: number): Recommendation[] => {
  const recs: Recommendation[] = [];
  const books = generateSampleBooks(count * 2, 'recommendation-books'); // Generate some books

  for (let i = 0; i < count; i++) {
    const senderIndex = Math.floor(Math.random() * mockUsers.length);
    let recipientIndex = Math.floor(Math.random() * mockUsers.length);
    // Ensure recipient is not the sender
    while (recipientIndex === senderIndex) {
      recipientIndex = Math.floor(Math.random() * mockUsers.length);
    }
    const sender = mockUsers[senderIndex];
    const recipient = mockUsers[recipientIndex];
    const bookIndex = i % books.length; // Cycle through generated books

    // Only include recommendations sent TO the current user or sent BY the current user for this mock
    if (recipient.id === currentUserId || sender.id === currentUserId) {
        recs.push({
          id: `rec-${Date.now()}-${i}`,
          sender: sender,
          recipient: recipient,
          book: books[bookIndex],
          message: Math.random() > 0.4 ? `Hey ${recipient.name.split(' ')[0]}, thought you might like this one!` : undefined,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within the last week
          liked: recipient.id === currentUserId ? (Math.random() > 0.6 ? true : false) : undefined, // Randomly liked if recipient
        });
    }
  }
  // Sort by date, newest first
  return recs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// --- Helper Functions ---
const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
};

// --- Component ---
export default function RecommendationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Loading state
  const [isClient, setIsClient] = React.useState(false);

  // State for the "Send Recommendation" form
  const [userSearchTerm, setUserSearchTerm] = React.useState('');
  const [searchedUsers, setSearchedUsers] = React.useState<MockUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = React.useState<MockUser | null>(null);
  const [bookSearchTerm, setBookSearchTerm] = React.useState('');
  const [searchedBooks, setSearchedBooks] = React.useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [recommendationMessage, setRecommendationMessage] = React.useState('');

  // State for received recommendations
  const [receivedRecommendations, setReceivedRecommendations] = React.useState<Recommendation[]>([]);
  const [sentRecommendations, setSentRecommendations] = React.useState<Recommendation[]>([]);

  React.useEffect(() => {
    setIsClient(true);
    // Check login status
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);


    if (!loggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to view or send recommendations.",
            variant: "destructive",
        });
    } else {
        // Load user's recommendations (mock implementation)
        const allRecs = loadMockRecommendations(); // Load or generate
        setReceivedRecommendations(allRecs.filter(r => r.recipient.id === currentUserId));
        setSentRecommendations(allRecs.filter(r => r.sender.id === currentUserId));
    }
     setIsLoading(false); // Set loading false after initial checks and data loading
  }, [router, toast]); // Keep dependencies minimal for the initial load

  // --- Form Handlers ---

  const handleUserSearch = (term: string) => {
    setUserSearchTerm(term);
    if (term.length > 1) {
        // Mock user search - filter mockUsers (exclude self)
        const results = mockUsers.filter(u =>
            u.id !== currentUserId &&
            (u.name.toLowerCase().includes(term.toLowerCase()) || u.username.toLowerCase().includes(term.toLowerCase()))
        );
        setSearchedUsers(results);
    } else {
        setSearchedUsers([]);
    }
    setSelectedRecipient(null); // Clear selection if search term changes
  };

  const handleSelectRecipient = (user: MockUser) => {
    setSelectedRecipient(user);
    setUserSearchTerm(user.name); // Fill input with selected user's name
    setSearchedUsers([]); // Hide search results
  };

  const handleBookSearch = (term: string) => {
    setBookSearchTerm(term);
     if (term.length > 2) {
        // Mock book search - generate/filter books (replace with actual API if needed)
         const results = generateSampleBooks(10, `search-${term.toLowerCase()}`) // Generate based on term
                           .filter(b => b.title.toLowerCase().includes(term.toLowerCase()));
        setSearchedBooks(results);
    } else {
        setSearchedBooks([]);
    }
    setSelectedBook(null); // Clear selection if search term changes
  };

   const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setBookSearchTerm(book.title); // Fill input with selected book's title
    setSearchedBooks([]); // Hide search results
  };

  const handleSendRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !selectedBook || !currentUser) {
        toast({ title: "Missing Information", description: "Please select a recipient and a book.", variant: "destructive" });
        return;
    }

    // --- TODO: Implement actual recommendation sending logic ---
    // 1. Send data (currentUser.id, selectedRecipient.id, selectedBook.id, recommendationMessage) to backend API.
    // 2. Handle response (success/failure).

     const newRecommendation: Recommendation = {
         id: `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`, // Simple unique ID
         sender: currentUser,
         recipient: selectedRecipient,
         book: selectedBook,
         message: recommendationMessage || undefined,
         timestamp: new Date(),
         liked: false, // Not liked initially
     };

     // Update state optimistically
     setSentRecommendations(prev => [newRecommendation, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
     // If the recipient is the current user (self-recommendation, for testing?), update received too
     if (selectedRecipient.id === currentUserId) {
         setReceivedRecommendations(prev => [newRecommendation, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
     }

      // Save updated list to localStorage
     const updatedRecs = loadMockRecommendations(); // Load existing
     updatedRecs.push(newRecommendation);
     localStorage.setItem('mockRecommendations', JSON.stringify(updatedRecs.map(r => ({...r, timestamp: r.timestamp.toISOString() }))));


    console.log(`Sending recommendation of "${selectedBook.title}" to ${selectedRecipient.name} from ${currentUser.name} with message: "${recommendationMessage}"`);
    toast({ title: "Recommendation Sent!", description: `You recommended "${selectedBook.title}" to ${selectedRecipient.name}.` });

    // Reset form state
    setUserSearchTerm('');
    setSearchedUsers([]);
    setSelectedRecipient(null);
    setBookSearchTerm('');
    setSearchedBooks([]);
    setSelectedBook(null);
    setRecommendationMessage('');
  };

  // --- Received Recommendation Handlers ---
   const handleLikeRecommendation = (recommendationId: string) => {
       // --- TODO: Implement actual like/unlike logic via API ---
        console.log(`Toggling like for recommendation ${recommendationId}`);
        const updatedRecs = receivedRecommendations.map(r =>
            r.id === recommendationId ? { ...r, liked: !r.liked } : r
        );
        setReceivedRecommendations(updatedRecs);

        // Update localStorage
        const allRecs = loadMockRecommendations();
        const index = allRecs.findIndex(r => r.id === recommendationId);
        if (index !== -1) {
            allRecs[index].liked = !allRecs[index].liked; // Toggle the like status
             localStorage.setItem('mockRecommendations', JSON.stringify(allRecs.map(r => ({...r, timestamp: r.timestamp.toISOString() }))));
        }

       // toast({ title: "Updated!" }); // Optional feedback
   }


  // --- Rendering Logic ---

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
               <p className="text-muted-foreground mb-6">You need to be logged in to view or send book recommendations.</p>
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

  // Render Recommendations page only if logged in
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
        <div className="container flex h-16 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="truncate text-xl font-semibold">Book Recommendations</h1>
          <div> {/* Placeholder */} </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-4xl flex-1 space-y-8 px-4 py-8">

        {/* Send Recommendation Card */}
        <Card className="shadow-lg">
           <CardHeader>
              <CardTitle className="flex items-center"><Gift className="mr-2 h-5 w-5 text-primary" /> Send a Recommendation</CardTitle>
              <CardDescription>Share a book you think a friend would love.</CardDescription>
           </CardHeader>
           <CardContent>
             <form onSubmit={handleSendRecommendation} className="space-y-4">
                {/* Recipient Search */}
                <div className="relative space-y-1">
                   <label htmlFor="recipient-search" className="text-sm font-medium">To:</label>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                          id="recipient-search"
                          placeholder="Search users..."
                          value={userSearchTerm}
                          onChange={(e) => handleUserSearch(e.target.value)}
                          className="pl-10"
                          autoComplete="off" // Prevent browser autocomplete interference
                      />
                   </div>
                   {/* User Search Results Dropdown */}
                   {searchedUsers.length > 0 && (
                       <Card className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto shadow-md border">
                          <CardContent className="p-2">
                              {searchedUsers.map(user => (
                                 <Button
                                     key={user.id}
                                     variant="ghost"
                                     className="w-full justify-start h-auto p-2 mb-1"
                                     onClick={() => handleSelectRecipient(user)}
                                  >
                                      <Avatar className="h-7 w-7 mr-2 border">
                                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                      </Avatar>
                                      <div className="text-left">
                                         <p className="text-sm font-medium">{user.name}</p>
                                         <p className="text-xs text-muted-foreground">@{user.username}</p>
                                      </div>
                                 </Button>
                              ))}
                          </CardContent>
                       </Card>
                   )}
                   {selectedRecipient && !searchedUsers.length && (
                       <p className="text-xs text-muted-foreground pl-2 pt-1">Selected: {selectedRecipient.name} (@{selectedRecipient.username})</p>
                   )}
                </div>

                {/* Book Search */}
                <div className="relative space-y-1">
                    <label htmlFor="book-search" className="text-sm font-medium">Book:</label>
                     <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                          id="book-search"
                          placeholder="Search books..."
                          value={bookSearchTerm}
                          onChange={(e) => handleBookSearch(e.target.value)}
                          className="pl-10"
                          autoComplete="off"
                       />
                     </div>
                     {/* Book Search Results */}
                     {searchedBooks.length > 0 && (
                         <Card className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto shadow-md border">
                            <CardContent className="p-2">
                                {searchedBooks.map(book => (
                                   <Button
                                       key={book.id}
                                       variant="ghost"
                                       className="w-full justify-start h-auto p-2 mb-1 text-left"
                                       onClick={() => handleSelectBook(book)}
                                    >
                                      {/* Optionally show tiny book cover */}
                                      {/* <img src={book.coverUrl || `https://picsum.photos/seed/${book.id}/50/75`} alt="" className="h-10 w-auto mr-2 rounded-sm object-cover"/> */}
                                      <div>
                                         <p className="text-sm font-medium line-clamp-1">{book.title}</p>
                                         <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                                      </div>
                                   </Button>
                                ))}
                            </CardContent>
                         </Card>
                     )}
                    {selectedBook && !searchedBooks.length && (
                        <p className="text-xs text-muted-foreground pl-2 pt-1">Selected: {selectedBook.title} by {selectedBook.author}</p>
                    )}
                </div>

                {/* Message (Optional) */}
                <div className="space-y-1">
                   <label htmlFor="rec-message" className="text-sm font-medium">Message (Optional):</label>
                   <Textarea
                      id="rec-message"
                      placeholder="Add a personal note..."
                      value={recommendationMessage}
                      onChange={(e) => setRecommendationMessage(e.target.value)}
                      rows={2}
                      className="resize-none"
                   />
                </div>

                {/* Submit Button */}
                 <div className="flex justify-end">
                     <Button type="submit" disabled={!selectedRecipient || !selectedBook}>
                         <Send className="mr-2 h-4 w-4" /> Send Recommendation
                     </Button>
                 </div>
             </form>
           </CardContent>
        </Card>

        <Separator />

        {/* Received Recommendations */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Received Recommendations</CardTitle>
                <CardDescription>Books recommended to you by others.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {receivedRecommendations.length > 0 ? (
                    receivedRecommendations.map(rec => (
                        <Card key={rec.id} className="p-4 border bg-muted/30">
                             <div className="flex flex-col sm:flex-row gap-4">
                                {/* Book Card */}
                                <div className="w-full sm:w-24 flex-shrink-0">
                                     {/* Ensure isLoggedIn is passed */}
                                     <SimpleBookCard book={rec.book} className="w-full" isLoggedIn={isLoggedIn} />
                                </div>
                                {/* Recommendation Details */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                         <Avatar className="h-6 w-6 border">
                                            <AvatarImage src={rec.sender.avatarUrl} alt={rec.sender.name} />
                                            <AvatarFallback>{getInitials(rec.sender.name)}</AvatarFallback>
                                         </Avatar>
                                         <p><span className="font-medium">{rec.sender.name}</span> recommended this</p>
                                         <p className="text-xs text-muted-foreground ml-auto">
                                            {isClient ? new Date(rec.timestamp).toLocaleDateString() : '...'}
                                         </p>
                                    </div>
                                    {rec.message && (
                                        <blockquote className="border-l-2 pl-3 italic text-sm text-foreground/80">
                                            "{rec.message}"
                                        </blockquote>
                                    )}
                                    {/* Actions: Like Recommendation */}
                                    <div className="flex justify-end">
                                         <Button variant="ghost" size="sm" onClick={() => handleLikeRecommendation(rec.id)}>
                                             <ThumbsUp className={cn("mr-1.5 h-4 w-4", rec.liked && "text-primary fill-primary")} /> {rec.liked ? 'Liked' : 'Like'}
                                         </Button>
                                         {/* Add other actions like "Add to Want to Read" if needed */}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4">You haven't received any recommendations yet.</p>
                )}
            </CardContent>
        </Card>

        {/* Sent Recommendations (Optional Section) */}
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Sent Recommendations</CardTitle>
                <CardDescription>Books you've recommended to others.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-3">
               {sentRecommendations.length > 0 ? (
                  sentRecommendations.map(rec => (
                     <div key={rec.id} className="flex items-center justify-between text-sm p-2 border rounded-md bg-muted/20">
                         <div className='flex items-center gap-2 overflow-hidden'>
                            <span className="text-muted-foreground">To:</span>
                             <Avatar className="h-5 w-5 border">
                                <AvatarImage src={rec.recipient.avatarUrl} alt={rec.recipient.name} />
                                <AvatarFallback className='text-[8px]'>{getInitials(rec.recipient.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate mr-1">{rec.recipient.name}</span>
                            <span className="text-muted-foreground flex-shrink-0">-</span>
                            <span className="italic truncate ml-1">"{rec.book.title}"</span>
                         </div>
                         <span className="text-xs text-muted-foreground flex-shrink-0">
                            {isClient ? new Date(rec.timestamp).toLocaleDateString() : '...'}
                         </span>
                     </div>
                  ))
               ) : (
                   <p className="text-center text-muted-foreground py-4">You haven't sent any recommendations yet.</p>
               )}
            </CardContent>
        </Card>

      </main>
    </div>
  );
}

    