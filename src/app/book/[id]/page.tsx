
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
import { ArrowLeft, BookOpen, CheckCircle, Bookmark, Users, ThumbsUp, MessageSquare, Share2, ExternalLink } from 'lucide-react'; // Added ExternalLink
import { useToast } from '@/hooks/use-toast';
import { generateSampleBooks } from '@/lib/mock-data'; // For finding book by ID in mock data
import { StarRating } from '@/components/star-rating'; // Import StarRating

// Helper to find a book by ID from a sample list (replace with actual data fetching)
const findBookById = (id: string): Book | undefined => {
  const allSampleBooks = generateSampleBooks(500, 'bookDetail'); // Use a consistent seed
  return allSampleBooks.find(book => book.id === id);
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

  // --- Mock Data Generation (Consistent per book) ---
  const mockReaderCount = React.useMemo(() => {
      if (!bookId) return 100;
      return Math.floor(pseudoRandom(bookId.hashCode()) * 5000) + 100;
  }, [bookId]);
  const mockLikeCount = React.useMemo(() => {
      if (!bookId) return 20;
       return Math.floor(mockReaderCount * (pseudoRandom(bookId.hashCode() + 1) * 0.5 + 0.2));
  }, [mockReaderCount, bookId]);

  // Simple hash function for pseudo-random generation
  function pseudoRandom(seed: number): number {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
  }
  // Ensure String.prototype.hashCode is defined globally
  if (typeof String.prototype.hashCode === 'undefined') {
      String.prototype.hashCode = function() {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
          chr   = this.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0;
        }
        return hash;
      };
  }

  // --- Effects ---
  React.useEffect(() => {
    if (bookId) {
      setLoading(true);
      // Reset state for potentially new book
      setBook(null);
      setCurrentStatus(undefined);
      setCurrentRating(0);
      setComment('');

      // Simulate fetching book data
      const foundBook = findBookById(bookId);
      if (foundBook) {
        setBook(foundBook);
        // Load user-specific status/rating from localStorage
        if (typeof window !== 'undefined') {
            const savedBooksRaw = localStorage.getItem('bookshelfBooks');
            if (savedBooksRaw) {
                try {
                    const books: Book[] = JSON.parse(savedBooksRaw).map((b: any) => ({
                        ...b,
                        addedDate: new Date(b.addedDate),
                    }));
                    const userBookData = books.find(b => b.id === foundBook.id);
                    setCurrentStatus(userBookData?.status ?? foundBook.status);
                    setCurrentRating(userBookData?.rating ?? foundBook.rating ?? 0);
                } catch (e) {
                     console.error("Failed to parse books from localStorage:", e);
                     setCurrentStatus(foundBook.status);
                     setCurrentRating(foundBook.rating ?? 0);
                }
            } else {
                 setCurrentStatus(foundBook.status);
                 setCurrentRating(foundBook.rating ?? 0);
            }
        } else {
            setCurrentStatus(foundBook.status);
            setCurrentRating(foundBook.rating ?? 0);
        }
      } else {
        toast({
          title: "Book Not Found",
          description: "Could not find the requested book.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
  }, [bookId, toast]);

   // --- Actions ---
   const updateBookInStorage = (updatedBook: Book) => {
     if (typeof window !== 'undefined') {
        const savedBooksRaw = localStorage.getItem('bookshelfBooks');
        let books: Book[] = [];
        if (savedBooksRaw) {
           try {
                books = JSON.parse(savedBooksRaw).map((b: any) => ({
                    ...b,
                    addedDate: new Date(b.addedDate),
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
             // Preserve the blankPdfUrl from the original record if it exists
             const preservedPdfUrl = books[existingIndex].blankPdfUrl;
             books[existingIndex] = {
                ...updatedBook,
                addedDate: preservedAddedDate,
                blankPdfUrl: updatedBook.blankPdfUrl ?? preservedPdfUrl // Ensure it's preserved
             };
        } else {
             // Add as a new book, potentially with a default blankPdfUrl
             books.push({
                ...updatedBook,
                addedDate: new Date(),
                // Use the URL from the new book data, or the placeholder if missing
                blankPdfUrl: updatedBook.blankPdfUrl || "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/blank.pdf?alt=media&token=your-token" // Add default here too
            });
        }

        const booksToSave = books.map(b => ({
           ...b,
           addedDate: b.addedDate instanceof Date && !isNaN(b.addedDate.getTime())
                      ? b.addedDate.toISOString()
                      : new Date().toISOString(),
           // Ensure blankPdfUrl is included in the saved data
           blankPdfUrl: b.blankPdfUrl || undefined, // Store undefined if empty string or null
        }));
        localStorage.setItem('bookshelfBooks', JSON.stringify(booksToSave));
     }
   };

   const handleStatusChange = (newStatus: ReadingStatus) => {
     if (!book) return;
     setCurrentStatus(newStatus);
     const newRating = newStatus === 'finished' ? currentRating : undefined;
     const updatedBookData: Book = {
       ...book,
       status: newStatus,
       rating: newRating,
       // Preserve existing blankPdfUrl
       blankPdfUrl: book.blankPdfUrl,
     };
     setBook(prevBook => ({ ...prevBook!, status: newStatus, rating: newRating }));
     updateBookInStorage(updatedBookData);
     toast({
       title: `Book marked as '${newStatus.replace('-', ' ')}'`,
       description: `${book.title} status updated.`,
     });
   };

   const handleRatingChange = (newRating: number) => {
     if (!book || currentStatus !== 'finished') {
         toast({
            title: "Cannot Rate",
            description: "You can only rate books you have finished.",
            variant: "destructive"
         });
         return;
     }
     setCurrentRating(newRating);
     const updatedBookData: Book = {
       ...book,
       status: currentStatus,
       rating: newRating,
       // Preserve existing blankPdfUrl
       blankPdfUrl: book.blankPdfUrl,
     };
     setBook(prevBook => ({ ...prevBook!, rating: newRating }));
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
        if (!comment.trim()) return;
        console.log(`Submitting comment for book ${bookId}: ${comment}`);
        toast({ title: "Comment Added", description: "Your comment has been posted (simulation)." });
        setComment('');
    };

  // --- Rendering ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
         <Button variant="ghost" size="sm" onClick={() => router.back()} className="absolute top-4 left-4">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
         </Button>
        <p className="text-center text-lg text-muted-foreground">Book not found.</p>
      </div>
    );
  }

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
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                           <FileText className="h-1/2 w-1/2 text-muted-foreground opacity-50" />
                        </div>
                    ) : (
                       <Image
                           src={book.coverUrl || `https://picsum.photos/seed/${book.id}/300/400`}
                           alt={`${book.title} cover`}
                           fill
                           sizes="(max-width: 768px) 80vw, 30vw"
                           className="object-cover"
                           priority
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
                   {/* Link to Blank PDF if applicable */}
                    {isBlankPdfBook && book.blankPdfUrl && (
                       <Button variant="outline" size="sm" asChild className="mt-4">
                          <Link href={book.blankPdfUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Blank PDF
                          </Link>
                       </Button>
                    )}
                 </CardHeader>

                 <CardContent className="flex-grow space-y-6 p-6 pt-0 md:p-8 md:pt-0">
                    {/* User Rating */}
                    {displayStatus === 'finished' && (
                      <div>
                        <h3 className="mb-2 font-semibold text-foreground">My Rating</h3>
                        <StarRating
                            rating={currentRating}
                            onRatingChange={handleRatingChange}
                            size={24}
                            readOnly={displayStatus !== 'finished'}
                        />
                         {displayStatus !== 'finished' && <p className="mt-1 text-xs text-muted-foreground">Mark as 'Finished' to rate.</p>}
                      </div>
                    )}
                    {displayStatus !== 'finished' && book.rating !== undefined && book.rating > 0 && (
                        <div>
                            <h3 className="mb-2 font-semibold text-foreground">Last Rating</h3>
                            <StarRating rating={book.rating} size={24} readOnly={true} />
                        </div>
                    )}

                    {/* User Notes */}
                   {book.notes && (
                      <div>
                         <h3 className="mb-2 font-semibold text-foreground">My Notes</h3>
                         <p className="whitespace-pre-wrap text-sm text-foreground/80">{book.notes}</p>
                      </div>
                    )}

                    {/* Engagement Stats */}
                    <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div className="flex items-center" title={`${mockReaderCount} Readers`}>
                            <Users className="mr-1.5 h-4 w-4" />
                            <span>{mockReaderCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center" title={`${mockLikeCount} Likes`}>
                            <ThumbsUp className="mr-1.5 h-4 w-4" />
                             <span>{mockLikeCount.toLocaleString()}</span>
                        </div>
                         <div className="flex items-center" title={`View Comments`}>
                             <MessageSquare className="mr-1.5 h-4 w-4" />
                              <span>{/* TODO: Actual comment count */}</span>
                         </div>
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
                    {/* Status Management */}
                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Manage Status</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button variant={displayStatus === 'reading' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('reading')}>
                             <BookOpen className="mr-2 h-4 w-4" /> Reading
                          </Button>
                           <Button variant={displayStatus === 'finished' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('finished')}>
                             <CheckCircle className="mr-2 h-4 w-4" /> Finished
                          </Button>
                          <Button variant={displayStatus === 'want-to-read' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('want-to-read')}>
                             <Bookmark className="mr-2 h-4 w-4" /> Want to Read
                          </Button>
                        </div>
                    </div>
                    {/* Share Button */}
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
        <Card className="shadow-lg">
           <CardHeader>
              <CardTitle className="flex items-center">
                 <MessageSquare className="mr-2 h-5 w-5 text-primary"/> Comments
              </CardTitle>
              <CardDescription>Share your thoughts or read what others are saying.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              {/* Mock Comments List */}
              <div className="space-y-4">
                 <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=user1_${bookId}`} alt="User 1" />
                        <AvatarFallback>{getInitials('User One')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">BookLover123</p>
                        <p className="mt-1 text-sm text-muted-foreground">Absolutely loved this book!</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">2 days ago</p>
                    </div>
                 </div>
                 <Separator />
                 <div className="flex items-start space-x-3">
                     <Avatar className="h-8 w-8 border">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=user2_${bookId}`} alt="User 2" />
                        <AvatarFallback>{getInitials('Reader Dude')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 rounded-md border bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">ReaderDude</p>
                        <p className="mt-1 text-sm text-muted-foreground">Solid read!</p>
                         <p className="mt-1 text-xs text-muted-foreground/70">1 week ago</p>
                    </div>
                 </div>
              </div>

              <Separator className="my-6"/>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                 <Label htmlFor="comment-input" className="font-semibold">Add your comment</Label>
                 <Textarea
                    id="comment-input"
                    placeholder="Write your thoughts here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                    aria-label="Write your comment"
                  />
                  <div className="flex justify-end">
                     <Button type="submit" size="sm" disabled={!comment.trim()}>Post Comment</Button>
                  </div>
              </form>
           </CardContent>
        </Card>
      </main>
    </div>
  );
}

// Extend String prototype for simple hashCode if not already present globally
declare global {
    interface String {
        hashCode(): number;
    }
}

// Conditional definition moved here, outside component body
if (typeof String.prototype.hashCode === 'undefined') {
    String.prototype.hashCode = function() {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
          chr   = this.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
}
