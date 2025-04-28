
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import type { Book, ReadingStatus } from '@/interfaces/book';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Import Label
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, BookOpen, CheckCircle, Bookmark, Users, Heart, MessageSquare, Share2, ExternalLink, FileText, LogIn } from 'lucide-react'; // Replaced ThumbsUp with Heart, Added LogIn
import { useToast } from '@/hooks/use-toast';
import { generateSampleBooks } from '@/lib/mock-data'; // For finding book by ID in mock data
import { StarRating } from '@/components/star-rating'; // Import StarRating
import { cn } from '@/lib/utils'; // Import cn for conditional classes

// --- Helper to find a book by ID ---
// Define known seeds used across the app for generating initial mock data sets
const knownSeeds = ['trending', 'popular', 'top-100', 'bookshelf-initial'];
// Define a reasonable number of books to generate per seed for the lookup process
const booksPerSeedLookup = 100; // Adjust if needed, balances lookup scope vs performance

const findBookById = (id: string): Book | undefined => {
  // 1. Prioritize checking localStorage (most accurate source for user-added/modified books)
  if (typeof window !== 'undefined') {
    const savedBooksRaw = localStorage.getItem('bookshelfBooks');
    if (savedBooksRaw) {
      try {
        const books: Book[] = JSON.parse(savedBooksRaw).map((b: any) => ({
          ...b,
          addedDate: new Date(b.addedDate),
          blankPdfUrl: b.blankPdfUrl || undefined, // Ensure field exists
        }));
        const userBookData = books.find(b => b.id === id);
        if (userBookData) {
          // If found in localStorage, return this version immediately
          return userBookData;
        }
      } catch (e) {
        console.error("Failed to parse books from localStorage during lookup:", e);
        // Continue to mock data lookup if localStorage fails
      }
    }
  }

  // 2. If not in localStorage, search through generated mock data from known seeds
  const allSampleBooksMap = new Map<string, Book>();

  // Generate books for known fixed categories/seeds
  knownSeeds.forEach(seed => {
    const books = generateSampleBooks(booksPerSeedLookup, seed);
    books.forEach(book => {
      // Add to map only if not already present (avoids duplicates if seeds overlap)
      if (!allSampleBooksMap.has(book.id)) {
        allSampleBooksMap.set(book.id, book);
      }
    });
  });

  // Check if the book is already found in the map from known seeds
  if (allSampleBooksMap.has(id)) {
    return allSampleBooksMap.get(id);
  }

  // 3. If still not found, try deducing seed from ID (for dynamic category pages)
  const idParts = id.split('-');
  if (idParts.length > 1) {
    const potentialSeed = idParts.slice(0, -1).join('-'); // Handle seeds like 'sci-fi'
    // Avoid regenerating if seed is already known or invalid
    if (potentialSeed && !knownSeeds.includes(potentialSeed)) {
      // Generate books specifically for this potential seed
      const categoryBooks = generateSampleBooks(booksPerSeedLookup, potentialSeed);
      categoryBooks.forEach(book => {
        if (!allSampleBooksMap.has(book.id)) {
          allSampleBooksMap.set(book.id, book);
        }
      });
      // Check the map again after adding books from the deduced seed
      if (allSampleBooksMap.has(id)) {
        return allSampleBooksMap.get(id);
      }
    }
  }

  // 4. If not found after all attempts, return undefined
  return undefined;
};


// Mock function to get initials for avatars
const getInitials = (name: string | undefined): string => {
    if (!name) return 'A';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2) // Take first letter of first two names
      .join('')
      .toUpperCase();
};

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookId = typeof params.id === 'string' ? params.id : '';

  // --- State Management ---
  const [book, setBook] = React.useState<Book | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentStatus, setCurrentStatus] = React.useState<ReadingStatus | undefined>(undefined);
  const [currentRating, setCurrentRating] = React.useState<number>(0);
  const [comment, setComment] = React.useState('');
  const [isLiked, setIsLiked] = React.useState(false); // State for like status
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // State for login status
  const [isClient, setIsClient] = React.useState(false); // Track client mount

  // --- Mock Data Generation (Consistent per book) ---
  const mockReaderCount = React.useMemo(() => {
      if (!bookId) return 100;
      // Use a simple hash function for pseudo-randomness based on ID
      let hash = 0;
      for (let i = 0; i < bookId.length; i++) {
        const char = bookId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash % 5000) + 100; // Ensure positive number > 100
  }, [bookId]);

  // Keep the initial calculation based on hash, but we'll update the displayed count on interaction
  const initialMockLikeCount = React.useMemo(() => {
      if (!bookId) return 20;
      // Base likes on reader count for some correlation
       let hash = 0;
       for (let i = 0; i < bookId.length; i++) {
         const char = bookId.charCodeAt(i);
         hash = ((hash << 5) - hash) + char + 1; // Slightly different hash
         hash |= 0;
       }
       const likeRatio = (Math.abs(hash % 31) + 20) / 100; // Random ratio between 0.2 and 0.5
       return Math.floor(mockReaderCount * likeRatio);
  }, [mockReaderCount, bookId]);

   // State for the displayed like count, initialized with mock data
  const [displayedLikeCount, setDisplayedLikeCount] = React.useState(initialMockLikeCount);

   // Mock comment count (can be made deterministic like others if needed)
   const mockCommentCount = React.useMemo(() => {
       if (!bookId) return 5;
       let hash = 0;
       for (let i = 0; i < bookId.length; i++) {
           const char = bookId.charCodeAt(i);
           hash = ((hash << 5) - hash) + char + 2; // Different hash again
           hash |= 0;
       }
       return Math.abs(hash % 50) + 5; // Between 5 and 54 comments
   }, [bookId]);

  // Update displayed count when initial count changes (e.g., bookId changes)
  React.useEffect(() => {
    setDisplayedLikeCount(initialMockLikeCount);
  }, [initialMockLikeCount]);

  // --- Effects ---
  React.useEffect(() => {
    setIsClient(true); // Mark as client-mounted
    // Check login status on mount
    // TODO: Replace with actual auth check
    const userProfileExists = typeof window !== 'undefined' && localStorage.getItem('userProfile');
    setIsLoggedIn(!!userProfileExists);

    if (bookId) {
      setLoading(true);
      // Reset state for potentially new book
      setBook(null);
      setCurrentStatus(undefined);
      setCurrentRating(0);
      setComment('');
      setIsLiked(false); // Reset like state

      // Simulate fetching book data using the updated findBookById
      const foundBook = findBookById(bookId);

      if (foundBook) {
        setBook(foundBook);
        // Load user-specific status/rating only if logged in
        if (!!userProfileExists) {
            setCurrentStatus(foundBook.status);
            setCurrentRating(foundBook.rating ?? 0);
             // --- TODO: Load actual like status from user data if logged in ---
             // Example: const userLiked = await fetchUserLikeStatus(bookId); setIsLiked(userLiked);
        } else {
            // If not logged in, display the default status/rating from the book data if available
            setCurrentStatus(foundBook.status); // Display status read-only
            setCurrentRating(foundBook.rating ?? 0); // Display rating read-only
        }
      } else {
         // Only show toast if book is genuinely not found after checking all sources
         console.warn(`Book with ID ${bookId} not found in localStorage or generated mock data.`);
         // Redirect or show not found state
      }
      setLoading(false);
    } else {
        setLoading(false); // No ID, stop loading
    }
  }, [bookId]); // Rerun when bookId changes

   // --- Actions ---
   const showLoginToast = () => {
        toast({
            title: "Login Required",
            description: "Please log in to perform this action.",
            variant: "destructive",
            action: (
                <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                    Login
                </Button>
            ),
        });
   }

   const updateBookInStorage = (updatedBook: Book) => {
     if (!isLoggedIn) {
         showLoginToast();
         return;
     }
     if (typeof window !== 'undefined') {
        const savedBooksRaw = localStorage.getItem('bookshelfBooks');
        let books: Book[] = [];
        if (savedBooksRaw) {
           try {
                books = JSON.parse(savedBooksRaw).map((b: any) => ({
                    ...b,
                    addedDate: new Date(b.addedDate),
                    blankPdfUrl: b.blankPdfUrl || undefined, // Ensure field exists
                }));
           } catch (e) {
               console.error("Failed to parse books from localStorage for update:", e);
               toast({ title: "Error", description: "Could not save book changes.", variant: "destructive" });
               return;
           }
        }

        const existingIndex = books.findIndex(b => b.id === updatedBook.id);
        if (existingIndex > -1) {
             const preservedAddedDate = books[existingIndex].addedDate;
             // Preserve the blankPdfUrl from the original record if it exists and isn't being explicitly changed
             const preservedPdfUrl = books[existingIndex].blankPdfUrl;
             books[existingIndex] = {
                ...updatedBook,
                addedDate: preservedAddedDate, // Keep original added date
                blankPdfUrl: updatedBook.blankPdfUrl ?? preservedPdfUrl // Ensure it's preserved or updated
             };
        } else {
             // Add as a new book if somehow it wasn't found before (e.g., added via details page)
             books.push({
                ...updatedBook,
                addedDate: new Date(), // Assign current date as added date
                // Use the URL from the new book data, or the placeholder if missing
                blankPdfUrl: updatedBook.blankPdfUrl || "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/blank.pdf?alt=media&token=your-token"
            });
        }

        // Prepare for saving: Convert Date objects to ISO strings
        const booksToSave = books.map(b => ({
           ...b,
           addedDate: b.addedDate instanceof Date && !isNaN(b.addedDate.getTime())
                      ? b.addedDate.toISOString()
                      : new Date().toISOString(),
           // Ensure blankPdfUrl is included in the saved data, store undefined if empty/null
           blankPdfUrl: b.blankPdfUrl || undefined,
           // Ensure rating is undefined if not 'finished'
           rating: b.status === 'finished' ? (b.rating ?? 0) : undefined,
        }));
        localStorage.setItem('bookshelfBooks', JSON.stringify(booksToSave));
     }
   };

   const handleStatusChange = (newStatus: ReadingStatus) => {
     if (!book) return;
     if (!isLoggedIn) {
         showLoginToast();
         return;
     }

     // Determine if it's a blank PDF book
     const isBlankPdfBook = !book.coverUrl && book.blankPdfUrl;

     // Optimistically update UI state
     setCurrentStatus(newStatus);
     const newRating = newStatus === 'finished' ? currentRating : undefined; // Reset rating if not finished
     if (newStatus !== 'finished') setCurrentRating(0); // Clear rating state if not finished

     const updatedBookData: Book = {
       ...book,
       status: newStatus,
       rating: newRating,
       // Preserve existing blankPdfUrl unless explicitly changed elsewhere
       blankPdfUrl: book.blankPdfUrl,
     };

     // Update the book object in local state for immediate UI feedback
     setBook(updatedBookData);

     // Persist change to localStorage
     updateBookInStorage(updatedBookData);

     // Show toast notification
     toast({
       title: `Book marked as '${newStatus.replace('-', ' ')}'`,
       description: `${book.title} status updated.`,
     });

     // If setting to 'reading' and it's a blank PDF book, open the PDF
     if (newStatus === 'reading' && isBlankPdfBook && updatedBookData.blankPdfUrl) {
         window.open(updatedBookData.blankPdfUrl, '_blank', 'noopener,noreferrer');
         toast({ // Optional secondary toast
             title: "Opening PDF...",
             description: `Opening the document for ${book.title}.`,
         });
     }
   };

   const handleRatingChange = (newRating: number) => {
     if (!book) return;
     if (!isLoggedIn) {
         showLoginToast();
         // Optionally revert the visual change in StarRating component if possible
         return;
     }
     if (currentStatus !== 'finished') {
         toast({
            title: "Cannot Rate",
            description: "You can only rate books you have finished.",
            variant: "destructive"
         });
         // Revert rating state if needed, though StarRating might handle this
         // setCurrentRating(book.rating ?? 0); // Or keep previous valid rating
         return;
     }
     setCurrentRating(newRating); // Update local state for rating display

     const updatedBookData: Book = {
       ...book,
       status: currentStatus, // Keep current status ('finished')
       rating: newRating,
       // Preserve existing blankPdfUrl
       blankPdfUrl: book.blankPdfUrl,
     };

     // Update the book object in local state
     setBook(updatedBookData);

     // Persist change to localStorage
     updateBookInStorage(updatedBookData);

     toast({
       title: `Rated ${newRating} stars`,
       description: `Your rating for ${book.title} has been saved.`,
     });
   };

   const handleShare = () => {
      if (!book) return;
      const shareUrl = window.location.href;
      if (navigator.share) {
         navigator.share({ title: book.title, text: `Check out this book: ${book.title} by ${book.author}`, url: shareUrl })
         .then(() => toast({ title: "Shared Successfully!" }))
         .catch((error) => console.error('Error sharing:', error));
      } else {
          navigator.clipboard.writeText(shareUrl).then(() => {
              toast({ title: "Link Copied!", description: "Book link copied to clipboard." });
          }).catch(err => {
               toast({ title: "Failed to Copy", description: "Could not copy link to clipboard.", variant: "destructive" });
               console.error('Failed to copy: ', err);
          });
      }
   };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoggedIn) {
            showLoginToast();
            return;
        }
        if (!comment.trim()) return;
        console.log(`Submitting comment for book ${bookId}: ${comment}`);
        // --- TODO: Implement actual comment saving logic ---
        // This would typically involve sending the comment to a backend/database
        toast({ title: "Comment Added", description: "Your comment has been posted (simulation)." });
        setComment(''); // Clear comment input after submission
        // Ideally, you would also update the mockCommentCount or refetch comments here
    };

    // Handle Like Button Click
    const handleLikeClick = () => {
        if (!isLoggedIn) {
            showLoginToast();
            return;
        }
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setDisplayedLikeCount((prevCount) => newLikedState ? prevCount + 1 : prevCount - 1);

        // --- TODO: Implement actual like/unlike logic ---
        // This would involve sending a request to a backend API to update the like status and count for the user and book.
        // Example: await api.toggleLikeBook(bookId, newLikedState);

        toast({
            title: newLikedState ? "Liked!" : "Unliked",
            description: `You've ${newLikedState ? 'liked' : 'unliked'} ${book?.title}.`,
        });
    };

    // Handle Comment Icon Click - Scroll to comments section
    const handleCommentIconClick = () => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
           commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };


  // --- Rendering ---
  if (loading || !isClient) { // Show loading until client is mounted and data is loaded
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Loading book details...</p>
        {/* Optionally add a spinner */}
      </div>
    );
  }

  if (!book) {
    // Render a more informative "Not Found" state within the page layout
    return (
      <div className="flex min-h-screen flex-col bg-secondary/30">
         <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Go back">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h1 className="ml-4 truncate text-lg font-semibold">Book Not Found</h1>
            </div>
         </header>
         <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
             <Card className="text-center shadow-lg">
                 <CardHeader>
                     <CardTitle>Oops! Book Not Found</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-muted-foreground">We couldn't find the book you were looking for (ID: {bookId}).</p>
                     <p className="mt-2 text-sm text-muted-foreground">It might have been removed or the link might be incorrect.</p>
                     <Button onClick={() => router.push('/')} className="mt-6">Go to Home</Button>
                 </CardContent>
             </Card>
         </main>
      </div>
    );
  }

  // Ensure status is derived from the current state
  const displayStatus = currentStatus ?? book.status;
  const isBlankPdfBook = !book.coverUrl && book.blankPdfUrl;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center">
             <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Go back">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             <h1 className="ml-4 truncate text-lg font-semibold">{book.title}</h1>
         </div>
      </header>

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
        <Card className="mb-8 overflow-hidden shadow-lg">
           <div className="grid gap-0 md:grid-cols-3">
              {/* Left Column: Cover Image or PDF Placeholder */}
              <div className="flex items-center justify-center bg-muted p-6 md:col-span-1 md:p-8">
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded shadow-md">
                    {isBlankPdfBook ? (
                         <Link
                            href={isLoggedIn && book.blankPdfUrl ? book.blankPdfUrl : '#'}
                            onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); showLoginToast(); } }}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open blank PDF for ${book.title}${!isLoggedIn ? ' (Login required)' : ''}`}
                            className={cn("block h-full w-full", isLoggedIn ? "cursor-pointer" : "cursor-not-allowed")}
                            >
                           <div className="flex h-full w-full items-center justify-center bg-muted hover:bg-muted/80 transition-colors">
                              <FileText className="h-1/2 w-1/2 text-muted-foreground opacity-50" />
                           </div>
                         </Link>
                    ) : (
                       <Image
                           src={book.coverUrl || `https://picsum.photos/seed/${book.id}/300/400`}
                           alt={`${book.title} cover`}
                           fill
                           sizes="(max-width: 768px) 80vw, 30vw"
                           className="object-cover"
                           priority // Prioritize loading the main book cover
                        />
                    )}
                </div>
              </div>

              {/* Right Column: Details and Actions */}
               <div className="flex flex-col md:col-span-2">
                 <CardHeader className="p-6 md:p-8">
                   <CardTitle className="text-2xl font-bold md:text-3xl">{book.title}</CardTitle>
                   <CardDescription className="text-lg text-muted-foreground">by {book.author}</CardDescription>
                   <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                       {book.pageCount && <span>{book.pageCount} pages</span>}
                       {book.isbn && <span>ISBN: {book.isbn}</span>}
                   </div>
                   {/* Link to Blank PDF if applicable and NOT the main display */}
                    {isBlankPdfBook && book.blankPdfUrl && (
                       <Button
                            variant="outline"
                            size="sm"
                            asChild={isLoggedIn} // Use asChild only if logged in to make it a Link
                            onClick={() => { if (!isLoggedIn) showLoginToast(); }}
                            className="mt-4"
                            disabled={!isLoggedIn} // Disable if not logged in
                            >
                            {isLoggedIn ? (
                                <Link href={book.blankPdfUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Blank PDF
                                </Link>
                            ) : (
                                <>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open Blank PDF (Login Req.)
                                </>
                            )}
                       </Button>
                    )}
                 </CardHeader>

                 <CardContent className="flex-grow space-y-6 p-6 pt-0 md:p-8 md:pt-0">
                    {/* User Rating - Interactive only if logged in and finished */}
                    {displayStatus === 'finished' && (
                      <div>
                        <h3 className="mb-2 font-semibold text-foreground">My Rating</h3>
                        <StarRating
                            rating={currentRating} // Use state for current rating
                            onRatingChange={handleRatingChange} // Will check login inside
                            size={24}
                            readOnly={!isLoggedIn} // Read-only if not logged in
                        />
                      </div>
                    )}
                    {/* Show read-only last rating if not finished but has one */}
                    {displayStatus !== 'finished' && book.rating !== undefined && book.rating > 0 && (
                        <div>
                            <h3 className="mb-2 font-semibold text-foreground">Last Rating</h3>
                            <StarRating rating={book.rating} size={24} readOnly={true} />
                        </div>
                    )}

                    {/* User Notes (Display only, editing handled elsewhere) */}
                   {book.notes && isLoggedIn && ( // Only show notes if logged in
                      <div>
                         <h3 className="mb-2 font-semibold text-foreground">My Notes</h3>
                         <p className="whitespace-pre-wrap text-sm text-foreground/80">{book.notes}</p>
                      </div>
                    )}

                     {/* Engagement Stats & Like Button */}
                     <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                         <div className="flex items-center" title={`${mockReaderCount.toLocaleString()} Readers`}>
                             <Users className="mr-1.5 h-4 w-4" />
                             <span>{mockReaderCount.toLocaleString()}</span>
                         </div>
                         {/* Interactive Like Button - Checks login on click */}
                         <Button
                             variant="ghost"
                             size="sm"
                             className={cn(
                                 "flex items-center px-2 py-1 -ml-2 text-muted-foreground hover:text-primary", // Adjust padding/margin
                                 isLoggedIn && isLiked && "text-red-500 hover:text-red-600" // Only show red if logged in and liked
                             )}
                             onClick={handleLikeClick}
                             title={isLoggedIn ? (isLiked ? "Unlike" : "Like") : "Log in to like"}
                             aria-pressed={isLoggedIn && isLiked}
                             disabled={!isClient} // Disable briefly until client mount confirms login status
                         >
                             <Heart className={cn("mr-1.5 h-4 w-4 transition-colors", isLoggedIn && isLiked && "fill-current")} />
                             <span>{displayedLikeCount.toLocaleString()}</span> {/* Use displayed count */}
                         </Button>
                         {/* Interactive Comment Icon Button */}
                          <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center px-2 py-1 -ml-2 text-muted-foreground hover:text-primary" // Adjust padding/margin
                              onClick={handleCommentIconClick}
                              title={`View ${mockCommentCount} Comments`}
                              aria-label={`View ${mockCommentCount} comments`}
                          >
                              <MessageSquare className="mr-1.5 h-4 w-4" />
                              <span>{mockCommentCount.toLocaleString()}</span>
                          </Button>
                     </div>


                    {/* Author Bio */}
                    {book.authorBio && (
                       <div>
                           <h3 className="mb-2 font-semibold text-foreground">About the Author</h3>
                           <p className="text-sm text-foreground/80">{book.authorBio}</p>
                       </div>
                    )}
                 </CardContent>

                 {/* Actions Footer */}
                 <div className="mt-auto space-y-4 border-t bg-muted/50 p-4 md:p-6">
                    {/* Status Management - Only show if logged in */}
                    {isLoggedIn ? (
                        <div>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Manage Status</h3>
                            <div className="flex flex-wrap gap-2">
                            <Button variant={displayStatus === 'reading' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('reading')}>
                                <BookOpen className="mr-2 h-4 w-4" /> {isBlankPdfBook ? 'Read Now' : 'Reading'}
                            </Button>
                            <Button variant={displayStatus === 'finished' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('finished')}>
                                <CheckCircle className="mr-2 h-4 w-4" /> Finished
                            </Button>
                            <Button variant={displayStatus === 'want-to-read' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('want-to-read')}>
                                <Bookmark className="mr-2 h-4 w-4" /> Want to Read
                            </Button>
                            </div>
                        </div>
                     ) : (
                        <div className="text-center text-sm text-muted-foreground">
                            <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                                <LogIn className="mr-2 h-4 w-4" /> Log in to manage status
                            </Button>
                        </div>
                     )}
                    {/* Share Button - Always visible */}
                    <div>
                         <Button variant="outline" size="sm" onClick={handleShare} className="w-full sm:w-auto">
                             <Share2 className="mr-2 h-4 w-4" /> Share
                         </Button>
                    </div>
                 </div>
               </div>
           </div>
        </Card>

        {/* Comments Section Card */}
        <Card id="comments-section" className="shadow-lg"> {/* Added ID here */}
           <CardHeader>
              <CardTitle className="flex items-center">
                 <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Comments ({mockCommentCount}) {/* Show count in title */}
              </CardTitle>
              <CardDescription>Share your thoughts or read what others are saying.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              {/* Mock Comments - Always visible */}
              <div className="space-y-4">
                 {/* Example Mock Comment 1 */}
                 <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 border">
                        {/* Use a deterministic avatar based on user + book */}
                        <AvatarImage src={`https://i.pravatar.cc/40?u=user1_${bookId}`} alt="User 1" />
                        <AvatarFallback>{getInitials('User One')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">BookLover123</p>
                        <p className="mt-1 text-sm text-muted-foreground">Absolutely loved this book! The characters were so well-developed.</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">2 days ago</p>
                    </div>
                 </div>
                 <Separator />
                  {/* Example Mock Comment 2 */}
                 <div className="flex items-start space-x-3">
                     <Avatar className="h-8 w-8 border">
                         <AvatarImage src={`https://i.pravatar.cc/40?u=user2_${bookId}`} alt="User 2" />
                        <AvatarFallback>{getInitials('Reader Dude')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">ReaderDude</p>
                        <p className="mt-1 text-sm text-muted-foreground">Solid read! The plot twist near the end caught me by surprise.</p>
                         <p className="mt-1 text-xs text-muted-foreground/70">1 week ago</p>
                    </div>
                 </div>
                  {/* Add more comments or pagination controls here */}
              </div>

              <Separator className="my-6"/>

              {/* Add Comment Form - Only functional if logged in */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                 <Label htmlFor="comment-input" className="font-semibold">Add your comment</Label>
                 <Textarea
                    id="comment-input"
                    placeholder={isLoggedIn ? "Write your thoughts here..." : "Log in to add a comment..."}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                    aria-label={isLoggedIn ? "Write your comment" : "Log in to comment"}
                    disabled={!isLoggedIn} // Disable if not logged in
                  />
                  <div className="flex justify-end">
                     <Button type="submit" size="sm" disabled={!comment.trim() || !isLoggedIn}>
                        {isLoggedIn ? 'Post Comment' : 'Log in to Post'}
                    </Button>
                  </div>
              </form>
           </CardContent>
        </Card>
      </main>
    </div>
  );
}
