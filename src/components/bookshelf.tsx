
"use client";

import * as React from "react";
import type { Book, ReadingStatus } from "@/interfaces/book";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "./book-card";
import { AddBookForm } from "./add-book-form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // Removed AlertDialogTrigger as it's handled implicitly
import { getCookie, setCookie } from "@/lib/cookies";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog"; // Need DialogTrigger for the hidden edit trigger
import { generateSampleBooks } from '@/lib/mock-data'; // Use mock data generator

const BOOKSHELF_TAB_COOKIE = "bookshelf_last_tab";
const DEFAULT_TAB: ReadingStatus = 'want-to-read'; // Define default tab

// Generate initial books consistently
const initialBooks = generateSampleBooks(20, 'bookshelf-initial');

export function Bookshelf() {
  const [books, setBooks] = React.useState<Book[]>(initialBooks); // Start with generated initial state
  const [isClient, setIsClient] = React.useState(false); // State to track client-side mount

  const [editingBook, setEditingBook] = React.useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = React.useState<string | null>(null);
  // Initialize tab state with default for SSR/initial render
  const [activeTab, setActiveTab] = React.useState<ReadingStatus>(DEFAULT_TAB);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { toast } = useToast();

   // Effect to load data from localStorage and read cookie ONLY on the client after mount
   React.useEffect(() => {
    setIsClient(true); // Indicate component has mounted on client

     // Load books from localStorage
     const savedBooks = localStorage.getItem('bookshelfBooks');
     if (savedBooks) {
       try {
         const parsedBooks = JSON.parse(savedBooks);
         if (Array.isArray(parsedBooks)) {
           // Parse dates and sort
           const loadedBooks = parsedBooks.map((book: any) => ({
             ...book,
             addedDate: new Date(book.addedDate), // Ensure date objects
           })).sort((a: Book, b: Book) => b.addedDate.getTime() - a.addedDate.getTime());
           setBooks(loadedBooks); // Update state with localStorage data
         }
       } catch (e) {
         console.error("Failed to parse books from localStorage:", e);
         // Fallback to initial state if parsing fails, and ensure localStorage reflects this
         const initialBooksToSave = initialBooks.map(book => ({
            ...book,
            addedDate: book.addedDate.toISOString(),
         }));
         localStorage.setItem('bookshelfBooks', JSON.stringify(initialBooksToSave));
         setBooks(initialBooks); // Explicitly set state back to initial
       }
     } else {
        // If no saved books, initialize localStorage with the initial set
        const initialBooksToSave = initialBooks.map(book => ({
            ...book,
            addedDate: book.addedDate.toISOString(),
        }));
        localStorage.setItem('bookshelfBooks', JSON.stringify(initialBooksToSave));
        setBooks(initialBooks); // Ensure state is the initial set
     }

     // Read active tab from cookie
     const savedTab = getCookie(BOOKSHELF_TAB_COOKIE) as ReadingStatus;
     if (savedTab && ['reading', 'finished', 'want-to-read'].includes(savedTab)) {
       setActiveTab(savedTab);
     }
   }, []); // Empty dependency array ensures this runs only once on mount


  // Save books to localStorage whenever the books state changes (only on client)
  React.useEffect(() => {
     if (isClient) {
      const booksToSave = books.map(book => ({
        ...book,
        addedDate: book.addedDate instanceof Date ? book.addedDate.toISOString() : new Date().toISOString(), // Ensure date is valid ISO string
      }));
      localStorage.setItem('bookshelfBooks', JSON.stringify(booksToSave));
     }
  }, [books, isClient]); // Depend on books and isClient

  // Save active tab to cookie when it changes (only on client)
  React.useEffect(() => {
    if (isClient) {
      setCookie(BOOKSHELF_TAB_COOKIE, activeTab, 30); // Save for 30 days
    }
  }, [activeTab, isClient]); // Depend on activeTab and isClient


  const handleBookSave = (book: Book) => {
    setBooks((prevBooks) => {
      const existingIndex = prevBooks.findIndex((b) => b.id === book.id);
      let updatedBooks;
      if (existingIndex > -1) {
        // Update existing book
        updatedBooks = [...prevBooks];
        updatedBooks[existingIndex] = { ...book, addedDate: prevBooks[existingIndex].addedDate }; // Keep original addedDate on update
      } else {
        // Add new book with current date as addedDate
        const newBook = { ...book, addedDate: new Date(), id: `${Date.now()}-${Math.random().toString(16).slice(2)}` }; // Ensure new ID
        updatedBooks = [...prevBooks, newBook];
      }
       // Always re-sort after adding or updating
       return updatedBooks.sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime());
    });
    setEditingBook(null); // Clear editing state
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
     // Find the hidden trigger button and click it programmatically
     const triggerButton = document.getElementById(`edit-trigger-${book.id}`);
     if (triggerButton) {
       triggerButton.click();
     } else {
         console.warn("Could not find trigger button for editing.");
     }
  };

 const handleDeleteConfirm = (id: string) => {
    setBooks((prevBooks) => prevBooks.filter((b) => b.id !== id));
    toast({
      title: "Book Deleted",
      description: "The book has been removed from your shelf.",
      variant: "destructive",
    });
    setBookToDelete(null); // Close dialog
  };

  const handleStatusChange = (id: string, status: ReadingStatus) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) => (b.id === id ? { ...b, status } : b))
    );
     toast({
      title: "Status Updated",
      description: `Book status changed to ${status}.`,
    });
  };

 const handleRatingChange = (id: string, rating: number) => {
    setBooks((prevBooks) =>
      prevBooks.map((b) => (b.id === id ? { ...b, rating } : b))
    );
     toast({
      title: "Rating Updated",
      description: `Book rating set to ${rating} stars.`,
    });
  };

  // Filter books based on current state and ensure sorting is applied
  const filteredBooks = (status: ReadingStatus) =>
    books.filter((book) => book.status === status &&
        (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         book.author.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime()); // Maintain sort order

  const statuses: ReadingStatus[] = ["reading", "finished", "want-to-read"];

  // Calculate counts based on the CURRENT state (will be correct after client mount)
  const getCountForStatus = (status: ReadingStatus): number => {
      return books.filter((book) => book.status === status &&
        (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         book.author.toLowerCase().includes(searchTerm.toLowerCase()))
    ).length;
  }

  // Filter books for the *initial* render using initialBooks to match server
   const initialFilteredBooks = (status: ReadingStatus) =>
     initialBooks.filter((book) => book.status === status &&
         (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()))
     ).sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());

   // Determine which set of books to render based on client-side mount
   const booksToRender = (status: ReadingStatus) => isClient ? filteredBooks(status) : initialFilteredBooks(status);


  return (
    <div className="container mx-auto px-4 py-8">
       {/* Header Row: Title and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">My Bookshelf</h1>
         <AddBookForm onBookSave={handleBookSave} initialBook={editingBook} />
         {/* Hidden trigger for editing */}
         {editingBook && (
            <DialogTrigger asChild id={`edit-trigger-${editingBook.id}`} style={{ display: 'none' }}>
                 <button>Hidden Edit Trigger</button>
            </DialogTrigger>
         )}
      </div>

        {/* Controls Row: Search and Tabs */}
       <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReadingStatus)} className="w-full">
         <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-auto sm:flex-grow sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
             {/* Tabs List */}
            <TabsList className="grid grid-cols-3 sm:inline-flex sm:w-auto w-full">
              {statuses.map((status) => (
                <TabsTrigger key={status} value={status} className="capitalize w-full sm:w-auto">
                  {status.replace('-', ' ')} {isClient ? `(${getCountForStatus(status)})` : ''} {/* Only show count on client */}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>


        {/* Tab Content Area */}
        {statuses.map((status) => (
          <TabsContent key={status} value={status}>
             {/* Use booksToRender to ensure initial render matches server */}
            {booksToRender(status).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {booksToRender(status).map((book) => (
                  <BookCard
                    key={book.id} // Use book.id which should be stable
                    book={book}
                    onEdit={() => handleEdit(book)}
                    onDelete={() => setBookToDelete(book.id)} // Trigger delete confirmation
                    onStatusChange={handleStatusChange}
                    onRatingChange={handleRatingChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No books found in '{status.replace('-', ' ')}'.</p>
                 {searchTerm && <p className="text-sm mt-2">Try adjusting your search or add new books!</p>}
                 {!searchTerm && <p className="text-sm mt-2">Add some books to get started!</p>}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

        {/* Delete Confirmation Dialog */}
       <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book
              from your bookshelf.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBookToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => bookToDelete && handleDeleteConfirm(bookToDelete)}
            >
                Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
