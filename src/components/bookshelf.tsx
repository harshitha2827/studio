"use client";

import * as React from "react";
import type { Book, ReadingStatus } from "@/interfaces/book";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookCard } from "./book-card";
import { AddBookForm } from "./add-book-form";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getCookie, setCookie } from "@/lib/cookies"; // Import cookie utils
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";


const BOOKSHELF_TAB_COOKIE = "bookshelf_last_tab";

export function Bookshelf() {
  const [books, setBooks] = React.useState<Book[]>(() => {
     // Load books from localStorage on initial render
     if (typeof window !== 'undefined') {
        const savedBooks = localStorage.getItem('bookshelfBooks');
        return savedBooks ? JSON.parse(savedBooks) : [];
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
      localStorage.setItem('bookshelfBooks', JSON.stringify(books));
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
        return updatedBooks;
      } else {
        // Add new book
        return [...prevBooks, book].sort((a,b) => b.addedDate.getTime() - a.addedDate.getTime()); // Keep sorted by added date desc
      }
    });
    setEditingBook(null); // Clear editing state
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    // We need a way to trigger the dialog open state here.
    // A simple way is to manage the AddBookForm's open state externally,
    // but for simplicity, we'll let the user click the (now hidden) trigger again.
    // A better approach would involve controlling the Dialog's open prop from Bookshelf.
    // For now, find the button and click it programmatically (or use state).
     const triggerButton = document.getElementById(`edit-trigger-${book.id}`);
     if (triggerButton) {
       triggerButton.click();
     } else {
         // Fallback if direct trigger manipulation isn't feasible/desired
         // We need to ensure the AddBookForm dialog opens when edit is clicked.
         // This might require lifting state up or using a ref.
         console.warn("Could not find trigger button for editing.");
         // As a temporary measure, maybe just open the dialog directly if we manage its state here.
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
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-primary">My Bookshelf</h1>
         {/* Pass editingBook to AddBookForm */}
         <AddBookForm onBookSave={handleBookSave} initialBook={editingBook} />
         {/* Hidden trigger for editing */}
         {editingBook && (
            <DialogTrigger asChild id={`edit-trigger-${editingBook.id}`} style={{ display: 'none' }}>
                 <button>Hidden Edit Trigger</button>
            </DialogTrigger>
         )}
      </div>

       <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>


      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReadingStatus)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          {statuses.map((status) => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status.replace('-', ' ')} ({filteredBooks(status).length})
            </TabsTrigger>
          ))}
        </TabsList>

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
