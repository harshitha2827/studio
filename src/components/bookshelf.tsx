
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

export function Bookshelf() {
  const [books, setBooks] = React.useState<Book[]>(() => {
     // Load books from localStorage on initial render
     if (typeof window !== 'undefined') {
        const savedBooks = localStorage.getItem('bookshelfBooks');
        // Ensure date strings are parsed back into Date objects
        if (savedBooks) {
          try {
            const parsedBooks = JSON.parse(savedBooks);
            return parsedBooks.map((book: any) => ({
              ...book,
              addedDate: new Date(book.addedDate), // Convert string back to Date
            }));
          } catch (e) {
            console.error("Failed to parse books from localStorage:", e);
            return [];
          }
        }
     }
     return [];
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
        // Add new book
        return [...prevBooks, book].sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime()); // Keep sorted by added date desc
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
