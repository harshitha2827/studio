
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Book, ReadingStatus } from '@/interfaces/book';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookOpen, CheckCircle, Bookmark, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateSampleBooks } from '@/lib/mock-data'; // Assuming this can generate single book-like data or find by ID
import { StarRating } from '@/components/star-rating'; // Import StarRating

// Helper to find a book by ID from a sample list (replace with actual data fetching)
const findBookById = (id: string): Book | undefined => {
  // In a real app, fetch from API/DB. Here, we generate a large pool and find.
  // Using a consistent large pool to increase chances of finding the ID from category pages.
  // Note: This is inefficient for a real app.
  const allSampleBooks = generateSampleBooks(500, 'bookDetail'); // Generate a pool
  return allSampleBooks.find(book => book.id === id);
};

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookId = typeof params.id === 'string' ? params.id : '';

  // --- State Management ---
  // Simulate fetching book data
  const [book, setBook] = React.useState<Book | null>(null);
  const [loading, setLoading] = React.useState(true);
   // State specifically for managing the status and rating locally on this page
  const [currentStatus, setCurrentStatus] = React.useState<ReadingStatus | undefined>(undefined);
  const [currentRating, setCurrentRating] = React.useState<number>(0);


  // Effect to "fetch" book data
  React.useEffect(() => {
    if (bookId) {
      setLoading(true);
      const foundBook = findBookById(bookId); // Simulate fetch
      if (foundBook) {
        setBook(foundBook);
        // Initialize local status/rating from the found book's data
        setCurrentStatus(foundBook.status);
        setCurrentRating(foundBook.rating ?? 0); // Use rating from book, default 0
      } else {
        // Handle book not found scenario
        toast({
          title: "Book Not Found",
          description: "Could not find the requested book.",
          variant: "destructive",
        });
        // Optionally redirect: router.push('/');
      }
      setLoading(false);
    }
  }, [bookId, toast, router]);

   // --- Actions ---
   // In a real app, these would update a database/API and likely the global state/cache.
   // Here, we'll update local state and simulate saving to localStorage (like in Bookshelf).

  const updateBookInStorage = (updatedBook: Book) => {
     if (typeof window !== 'undefined') {
        const savedBooksRaw = localStorage.getItem('bookshelfBooks');
        let books: Book[] = [];
        if (savedBooksRaw) {
           try {
               // Parse carefully, handling potential date strings
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
            // If the book wasn't in storage (e.g., navigating directly), add it.
            // This might happen if the detail page is accessed before the main bookshelf loads/saves.
             books.push({ ...updatedBook, addedDate: new Date() }); // Add with current date if new
        }

        // Save back to localStorage, ensuring dates are stringified
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
       // Reset rating if moving away from 'finished'
       rating: newStatus === 'finished' ? currentRating : undefined,
     };
     setBook(updatedBookData); // Update the main book state as well
     updateBookInStorage(updatedBookData); // Simulate saving

     toast({
       title: `Book marked as '${newStatus.replace('-', ' ')}'`,
     });
   };

   const handleRatingChange = (newRating: number) => {
     if (!book || currentStatus !== 'finished') return; // Only allow rating if finished

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


  // --- Rendering ---
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading book details...</p> {/* Replace with Skeleton later */}
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
         <Button variant="ghost" size="sm" onClick={() => router.back()} className="self-start mb-4">
             <ArrowLeft className="mr-2 h-4 w-4" /> Back
         </Button>
        <p className="text-center text-lg text-muted-foreground">Book not found.</p>
      </div>
    );
  }

  // Determine current status for display and actions
  const status = currentStatus ?? book.status; // Use local state if available

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
       {/* Simple Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center">
             <Button variant="ghost" size="sm" onClick={() => router.back()}>
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
             </Button>
             {/* Maybe add Book title here later */}
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
        <Card className="overflow-hidden shadow-lg">
           <div className="grid md:grid-cols-3 gap-0"> {/* Gap 0 for seamless look */}
              {/* Left: Cover Image */}
              <div className="md:col-span-1 bg-muted flex items-center justify-center p-6 md:p-8">
                <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded shadow-md mx-auto">
                   <Image
                       src={book.coverUrl || "https://picsum.photos/seed/defaultBookDetail/300/400"} // Fallback
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
                   <CardDescription className="text-lg text-muted-foreground">{book.author}</CardDescription>
                   {book.isbn && <p className="text-sm text-muted-foreground mt-1">ISBN: {book.isbn}</p>}
                 </CardHeader>

                 <CardContent className="p-6 md:p-8 pt-0 space-y-6 flex-grow">
                    {/* Notes/Synopsis (If available) */}
                   {book.notes && (
                      <div>
                         <h3 className="font-semibold mb-2 text-foreground">My Notes</h3>
                         <p className="text-sm text-foreground/80 whitespace-pre-wrap">{book.notes}</p>
                      </div>
                    )}

                    {/* Rating (Only show/allow interaction if status is 'finished') */}
                    {status === 'finished' && (
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground">My Rating</h3>
                        <StarRating rating={currentRating} onRatingChange={handleRatingChange} size={24} />
                      </div>
                    )}

                     {/* Add other details here if needed, e.g., genre, pages */}
                 </CardContent>

                 {/* Actions Footer */}
                 <div className="bg-muted/50 p-4 md:p-6 border-t mt-auto">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Manage Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                         variant={status === 'reading' ? 'default' : 'outline'}
                         size="sm"
                         onClick={() => handleStatusChange('reading')}
                       >
                         <BookOpen className="mr-2 h-4 w-4" /> Reading
                      </Button>
                       <Button
                         variant={status === 'finished' ? 'default' : 'outline'}
                         size="sm"
                         onClick={() => handleStatusChange('finished')}
                       >
                         <CheckCircle className="mr-2 h-4 w-4" /> Finished
                      </Button>
                      <Button
                         variant={status === 'want-to-read' ? 'default' : 'outline'}
                         size="sm"
                         onClick={() => handleStatusChange('want-to-read')}
                       >
                         <Bookmark className="mr-2 h-4 w-4" /> Want to Read
                      </Button>
                    </div>
                 </div>
               </div>
           </div>
        </Card>
      </main>
    </div>
  );
}
