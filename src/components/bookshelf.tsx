
"use client";

import * as React from "react";
import type { Book, ReadingStatus } from "@/interfaces/book";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "./book-card";
import { AddBookForm } from "./add-book-form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"; // Removed AlertDialogTrigger as it's handled implicitly
import { getCookie, setCookie } from "@/lib/cookies"; // Import cookie utils
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog"; // Need DialogTrigger for the hidden edit trigger


const BOOKSHELF_TAB_COOKIE = "bookshelf_last_tab";

// Sample Books Data - Expanded to 15 books
const sampleBooks: Book[] = [
  // Existing 5 books
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    status: "finished",
    rating: 5,
    addedDate: new Date("2023-01-15T10:00:00Z"),
    notes: "A classic for a reason. Atticus Finch is an inspiring character.",
    coverUrl: "https://picsum.photos/seed/mockingbird/300/400",
    isbn: "978-0061120084",
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    status: "reading",
    addedDate: new Date("2023-03-10T11:00:00Z"),
    notes: "Thought-provoking and slightly terrifying.",
    coverUrl: "https://picsum.photos/seed/1984/300/400",
    isbn: "978-0451524935",
  },
  {
    id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    status: "want-to-read",
    addedDate: new Date("2023-05-20T12:00:00Z"),
    coverUrl: "https://picsum.photos/seed/gatsby/300/400",
    isbn: "978-0743273565",
  },
   {
    id: "4",
    title: "Dune",
    author: "Frank Herbert",
    status: "finished",
    rating: 4,
    addedDate: new Date("2023-02-28T13:00:00Z"),
    notes: "Incredible world-building, a bit dense at times.",
    coverUrl: "https://picsum.photos/seed/dune/300/400",
    isbn: "978-0441172719",
  },
  {
    id: "5",
    title: "Atomic Habits",
    author: "James Clear",
    status: "reading",
    addedDate: new Date("2023-06-01T14:00:00Z"),
    notes: "Practical advice on building good habits.",
    coverUrl: "https://picsum.photos/seed/habits/300/400",
    isbn: "978-0735211292",
  },
  // Adding 10 more books
  {
    id: "6",
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    status: "finished",
    rating: 5,
    addedDate: new Date("2023-07-15T09:30:00Z"),
    notes: "Mind-blowing perspective on human history.",
    coverUrl: "https://picsum.photos/seed/sapiens/300/400",
    isbn: "978-0062316097",
  },
  {
    id: "7",
    title: "Project Hail Mary",
    author: "Andy Weir",
    status: "reading",
    addedDate: new Date("2023-08-01T15:00:00Z"),
    coverUrl: "https://picsum.photos/seed/hailmary/300/400",
    isbn: "978-0593135204",
  },
  {
    id: "8",
    title: "The Midnight Library",
    author: "Matt Haig",
    status: "want-to-read",
    addedDate: new Date("2023-08-10T10:00:00Z"),
    coverUrl: "https://picsum.photos/seed/library/300/400",
    isbn: "978-0525559474",
  },
  {
    id: "9",
    title: "Educated",
    author: "Tara Westover",
    status: "finished",
    rating: 4,
    addedDate: new Date("2023-04-05T16:00:00Z"),
    notes: "Incredible and inspiring memoir.",
    coverUrl: "https://picsum.photos/seed/educated/300/400",
    isbn: "978-0399590504",
  },
  {
    id: "10",
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    status: "finished",
    rating: 3,
    addedDate: new Date("2023-09-01T11:00:00Z"),
    coverUrl: "https://picsum.photos/seed/crawdads/300/400",
    isbn: "978-0735219090",
  },
  {
    id: "11",
    title: "The Alchemist",
    author: "Paulo Coelho",
    status: "want-to-read",
    addedDate: new Date("2023-09-15T14:30:00Z"),
    coverUrl: "https://picsum.photos/seed/alchemist/300/400",
    isbn: "978-0062315007",
  },
  {
    id: "12",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    status: "reading",
    addedDate: new Date("2023-10-01T12:00:00Z"),
    notes: "Fascinating insights into cognitive biases.",
    coverUrl: "https://picsum.photos/seed/thinking/300/400",
    isbn: "978-0374533557",
  },
  {
    id: "13",
    title: "Circe",
    author: "Madeline Miller",
    status: "finished",
    rating: 5,
    addedDate: new Date("2023-10-20T09:00:00Z"),
    notes: "Beautiful retelling of Greek mythology.",
    coverUrl: "https://picsum.photos/seed/circe/300/400",
    isbn: "978-1408710196",
  },
  {
    id: "14",
    title: "The Silent Patient",
    author: "Alex Michaelides",
    status: "want-to-read",
    addedDate: new Date("2023-11-05T17:00:00Z"),
    coverUrl: "https://picsum.photos/seed/patient/300/400",
    isbn: "978-1250301697",
  },
  {
    id: "15",
    title: "Becoming",
    author: "Michelle Obama",
    status: "reading",
    addedDate: new Date("2023-11-15T13:45:00Z"),
    coverUrl: "https://picsum.photos/seed/becoming/300/400",
    isbn: "978-1524763138",
  },
];


export function Bookshelf() {
  const [books, setBooks] = React.useState<Book[]>(() => {
     // Load books from localStorage on initial render
     if (typeof window !== 'undefined') {
        const savedBooks = localStorage.getItem('bookshelfBooks');
        // Ensure date strings are parsed back into Date objects
        if (savedBooks) {
          try {
            const parsedBooks = JSON.parse(savedBooks);
            // Check if parsedBooks is an array and not empty
            if (Array.isArray(parsedBooks) && parsedBooks.length > 0) {
                // Sort loaded books by addedDate descending
                return parsedBooks.map((book: any) => ({
                    ...book,
                    addedDate: new Date(book.addedDate), // Convert string back to Date
                })).sort((a: Book, b: Book) => b.addedDate.getTime() - a.addedDate.getTime());
            }
          } catch (e) {
            console.error("Failed to parse books from localStorage:", e);
            // Fall through to returning sorted sample books if parsing fails or data is invalid
          }
        }
        // If no saved books or parsing failed, return sorted sample books
        return sampleBooks.sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime());
     }
     // If window is not defined (SSR), return sorted sample books
     return sampleBooks.sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime()); // Or return [] if you prefer empty on SSR
  });
  const [editingBook, setEditingBook] = React.useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = React.useState<string | null>(null);
   const [activeTab, setActiveTab] = React.useState<ReadingStatus>(() => {
     // Initialize tab from cookie or default to 'reading'
     if (typeof window !== 'undefined') {
        return (getCookie(BOOKSHELF_TAB_COOKIE) as ReadingStatus) || 'reading';
     }
     return 'reading';
   });
  const [searchTerm, setSearchTerm] = React.useState("");


  const { toast } = useToast();

  // Save books to localStorage whenever the books state changes
  React.useEffect(() => {
     if (typeof window !== 'undefined') {
      // Ensure dates are stored as strings (ISO format is standard)
      const booksToSave = books.map(book => ({
        ...book,
        addedDate: book.addedDate.toISOString(),
      }));
      localStorage.setItem('bookshelfBooks', JSON.stringify(booksToSave));
     }
  }, [books]);

  // Save active tab to cookie when it changes
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCookie(BOOKSHELF_TAB_COOKIE, activeTab, 30); // Save for 30 days
    }
  }, [activeTab]);


  const handleBookSave = (book: Book) => {
    setBooks((prevBooks) => {
      const existingIndex = prevBooks.findIndex((b) => b.id === book.id);
      if (existingIndex > -1) {
        // Update existing book
        const updatedBooks = [...prevBooks];
        updatedBooks[existingIndex] = book;
        return updatedBooks.sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime()); // Maintain sort on update
      } else {
        // Add new book with current date as addedDate
        const newBook = { ...book, addedDate: new Date() };
        return [...prevBooks, newBook].sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime()); // Keep sorted by added date desc
      }
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
         // Potentially add state management for the AddBookForm dialog visibility here
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

  const filteredBooks = (status: ReadingStatus) =>
    books.filter((book) => book.status === status &&
        (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         book.author.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime()); // Ensure sorting is consistent

  const statuses: ReadingStatus[] = ["reading", "finished", "want-to-read"];


  return (
    <div className="container mx-auto px-4 py-8">
       {/* Header Row: Title and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">My Bookshelf</h1>
         {/* Pass editingBook to AddBookForm. The AddBookForm component itself contains the DialogTrigger */}
         <AddBookForm onBookSave={handleBookSave} initialBook={editingBook} />
         {/* Hidden trigger for editing, needs AddBookForm to be openable */}
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
                  {status.replace('-', ' ')} ({filteredBooks(status).length})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>


        {/* Tab Content Area */}
        {statuses.map((status) => (
          <TabsContent key={status} value={status}>
            {filteredBooks(status).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks(status).map((book) => (
                  <BookCard
                    key={book.id}
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

