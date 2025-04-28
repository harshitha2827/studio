
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Book, ReadingStatus } from '@/interfaces/book';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Import Avatar
import { ArrowLeft, BookOpen, CheckCircle, Bookmark, Star, Users, ThumbsUp, MessageSquare, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSampleBooks } from '@/lib/mock-data'; // Assuming this can generate single book-like data or find by ID
import { StarRating } from '@/components/star-rating'; // Import StarRating

// Helper to find a book by ID from a sample list (replace with actual data fetching)
const findBookById = (id: string): Book | undefined => {
  // In a real app, fetch from API/DB. Here, we generate a large pool and find.
  // Using a consistent large pool to increase chances of finding the ID from category pages.
  // Note: This is inefficient for a real app. Use appropriate seed for detail context.
  const allSampleBooks = generateSampleBooks(500, 'bookDetail'); // Generate a pool with 'bookDetail' seed
  return allSampleBooks.find(book => book.id === id);
};

// Mock function to get initials
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

  // Mocked engagement data
  const mockReaderCount = React.useMemo(() => Math.floor(Math.random() * 5000) + 100, [bookId]); // Consistent per bookId load
  const mockLikeCount = React.useMemo(() => Math.floor(mockReaderCount * (Math.random() * 0.5 + 0.2)), [mockReaderCount]); // Likes relative to readers

  // Effect to "fetch" book data
  React.useEffect(() => {
    if (bookId) {
      setLoading(true);
      // Reset state for potentially new book
      setBook(null);
      setCurrentStatus(undefined);
      setCurrentRating(0);

      const foundBook = findBookById(bookId); // Simulate fetch
      if (foundBook) {
        setBook(foundBook);
        setCurrentStatus(foundBook.status);
        setCurrentRating(foundBook.rating ?? 0);
      } else {
        toast({
          title: "Book Not Found",
          description: "Could not find the requested book.",
          variant: "destructive",
        });
      }
      setLoading(false);
    }
  }, [bookId, toast]); // Depend only on bookId and toast

   // --- Actions ---
   const updateBookInStorage = (updatedBook: Book) => {
     if (typeof window !== 'undefined') {
        const savedBooksRaw = localStorage.getItem('bookshelfBooks');
        let books: Book[] = [];
        if (savedBooksRaw) {
           try {
                books = JSON.parse(savedBooksRaw).map((b: any) => ({
                    ...b,
                    addedDate: new Date(b.addedDate), // Ensure dates are parsed
                }));
           } catch (e) {
               console.error("Failed to parse books from localStorage for update:", e);
               return; // Exit if parsing fails
           }
        }

        const existingIndex = books.findIndex(b => b.id === updatedBook.id);
        if (existingIndex > -1) {
            books[existingIndex] = updatedBook;
        } else {
             books.push({ ...updatedBook, addedDate: new Date() }); // Add with current date if new
        }

        const booksToSave = books.map(b => ({
           ...b,
           addedDate: b.addedDate.toISOString(),
        }));
        localStorage.setItem('bookshelfBooks', JSON.stringify(booksToSave));
     }
   };

   const handleStatusChange = (newStatus: ReadingStatus) => {
     if (!book) return;

     setCurrentStatus(newStatus); // Update local state immediately
     const updatedBookData: Book = {
       ...book,
       status: newStatus,
       rating: newStatus === 'finished' ? currentRating : undefined,
     };
     setBook(updatedBookData); // Update the main book state as well
     updateBookInStorage(updatedBookData); // Simulate saving

     toast({
       title: `Book marked as '${newStatus.replace('-', ' ')}'`,
     });
   };

   const handleRatingChange = (newRating: number) => {
     if (!book || currentStatus !== 'finished') return;

     setCurrentRating(newRating); // Update local rating state
     const updatedBookData: Book = {
       ...book,
       rating: newRating,
     };
     setBook(updatedBookData); // Update the main book state
     updateBookInStorage(updatedBookData); // Simulate saving

     toast({
       title: `Rated ${newRating} stars`,
     });
   };

   const handleShare = () => {
      // In a real app, use navigator.share or copy link to clipboard
      toast({
          title: "Shared!",
          description: "Book link copied to clipboard (simulation).",
      });
   };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        // In a real app, submit the comment to backend
        toast({
            title: "Comment Added",
            description: "Your comment has been posted (simulation).",
        });
        setComment(''); // Clear comment box
    };

  // --- Rendering ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Loading book details...</p>
        {/* TODO: Add Skeleton Loader */}
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

  const status = currentStatus ?? book.status;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center">
             <Button variant="ghost" size="sm" onClick={() => router.back()}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             <h1 className="text-lg font-semibold ml-4 truncate">{book.title}</h1>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <Card className="overflow-hidden shadow-lg mb-8">
           <div className="grid md:grid-cols-3 gap-0">
              {/* Left: Cover Image */}
              <div className="md:col-span-1 bg-muted flex items-center justify-center p-6 md:p-8">
                <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded shadow-md mx-auto">
                   <Image
                       src={book.coverUrl || "https://picsum.photos/seed/defaultBookDetail/300/400"}
                       alt={`${book.title} cover`}
                       fill
                       sizes="(max-width: 768px) 80vw, 30vw"
                       className="object-cover"
                    />
                </div>
              </div>

              {/* Right: Details and Actions */}
               <div className="md:col-span-2 flex flex-col">
                 <CardHeader className="p-6 md:p-8">
                   <CardTitle className="text-2xl md:text-3xl font-bold">{book.title}</CardTitle>
                   <CardDescription className="text-lg text-muted-foreground">by {book.author}</CardDescription>
                   <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                       {book.pageCount && <span>{book.pageCount} pages</span>}
                       {book.isbn && <span>ISBN: {book.isbn}</span>}
                   </div>
                 </CardHeader>

                 <CardContent className="p-6 md:p-8 pt-0 space-y-6 flex-grow">
                    {/* Rating (Only show/allow interaction if status is 'finished') */}
                    {status === 'finished' && (
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground">My Rating</h3>
                        <StarRating rating={currentRating} onRatingChange={handleRatingChange} size={24} />
                      </div>
                    )}

                    {/* Notes/Synopsis (If available) */}
                   {book.notes && (
                      <div>
                         <h3 className="font-semibold mb-2 text-foreground">My Notes</h3>
                         <p className="text-sm text-foreground/80 whitespace-pre-wrap">{book.notes}</p>
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
                        {/* Comment count could be added here if data available */}
                    </div>

                    {/* Author Bio (If available) */}
                    {book.authorBio && (
                       <div>
                           <h3 className="font-semibold mb-2 text-foreground">About the Author</h3>
                           <p className="text-sm text-foreground/80">{book.authorBio}</p>
                       </div>
                    )}
                 </CardContent>

                 {/* Actions Footer */}
                 <div className="bg-muted/50 p-4 md:p-6 border-t mt-auto space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Manage Status</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button variant={status === 'reading' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('reading')}>
                             <BookOpen className="mr-2 h-4 w-4" /> Reading
                          </Button>
                           <Button variant={status === 'finished' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('finished')}>
                             <CheckCircle className="mr-2 h-4 w-4" /> Finished
                          </Button>
                          <Button variant={status === 'want-to-read' ? 'default' : 'outline'} size="sm" onClick={() => handleStatusChange('want-to-read')}>
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

        {/* Comments Section */}
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
                 {/* Example Comment 1 */}
                 <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarImage src="https://picsum.photos/seed/user1/40/40" alt="User 1" />
                        <AvatarFallback>U1</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">BookLover123</p>
                        <p className="text-sm text-muted-foreground">Absolutely loved this book! The ending was a complete surprise.</p>
                    </div>
                 </div>
                 <Separator />
                  {/* Example Comment 2 */}
                 <div className="flex items-start space-x-3">
                     <Avatar className="h-8 w-8 border">
                        <AvatarImage src="https://picsum.photos/seed/user2/40/40" alt="User 2" />
                        <AvatarFallback>RD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">ReaderDude</p>
                        <p className="text-sm text-muted-foreground">A bit slow in the middle, but overall a solid read.</p>
                    </div>
                 </div>
                 {/* Add more mock comments or a "Load More" button */}
              </div>

              <Separator className="my-6"/>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                 <Textarea
                    placeholder="Write your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="resize-none"
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
