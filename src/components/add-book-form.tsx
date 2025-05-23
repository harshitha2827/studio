
"use client";

import * as React from "react";
import type { Book, ReadingStatus } from "@/interfaces/book";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "./star-rating";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea

// --- !!! IMPORTANT: Replace this placeholder URL !!! ---
// This default URL will be used if a book being edited doesn't already have one.
// Upload your blank PDF to Firebase Storage and paste the Download URL here.
// Example: const placeholderBlankPdfUrl = "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/blank.pdf?alt=media&token=your-token";
// Public sample PDF for testing (replace later):
const placeholderBlankPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  status: z.enum(["reading", "finished", "want-to-read"]),
  rating: z.number().min(0).max(5).optional(), // Rating 0-5, optional
  notes: z.string().optional(),
  coverUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')), // Optional URL
  isbn: z.string().optional(),
  // No need to explicitly add blankPdfUrl to the *form schema* as it's not user-editable here.
  // It will be handled during the save logic.
});

type BookFormData = z.infer<typeof bookSchema>;

interface AddBookFormProps {
  onBookSave: (book: Book) => void;
  initialBook?: Book | null; // For editing
  isOpen: boolean; // Control dialog visibility externally
  setIsOpen: (open: boolean) => void; // Handler to change visibility
}

export function AddBookForm({ onBookSave, initialBook, isOpen, setIsOpen }: AddBookFormProps) {
  // Removed internal isOpen state, now controlled by props
  const { toast } = useToast();
  const form = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    // Default values are set based on initialBook when the form is reset
    defaultValues: {
      title: "",
      author: "",
      status: "want-to-read",
      rating: 0,
      notes: "",
      coverUrl: "",
      isbn: "",
    },
  });

  // Watch status to conditionally show rating
  const watchStatus = form.watch("status");

  React.useEffect(() => {
    // Reset form when dialog opens or initialBook changes
    if (isOpen) {
        form.reset({
          title: initialBook?.title ?? "",
          author: initialBook?.author ?? "",
          status: initialBook?.status ?? "want-to-read",
          rating: initialBook?.rating ?? 0,
          notes: initialBook?.notes ?? "",
          coverUrl: initialBook?.coverUrl ?? "",
          isbn: initialBook?.isbn ?? "",
        });
    } else {
        // Optionally clear form when closing if not editing (or always clear if desired)
        // This might need adjustment depending on desired behavior when closing without saving edits
        // form.reset({...}); // Reset to defaults or previous state if needed
    }
  }, [initialBook, form, isOpen]); // Depend on isOpen to reset when dialog opens

  const onSubmit = (data: BookFormData) => {
    const bookData: Book = {
      // Use existing ID and addedDate if editing, otherwise generate new ones
      id: initialBook?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`, // Generate simple ID if new
      addedDate: initialBook?.addedDate || new Date(),
      ...data,
      // Only include rating if status is 'finished'
      rating: data.status === 'finished' ? data.rating : undefined,
      // Preserve existing blankPdfUrl if editing, otherwise use the placeholder
      // IMPORTANT: This assumes the placeholder is set correctly above.
      blankPdfUrl: initialBook?.blankPdfUrl || placeholderBlankPdfUrl,
      // Preserve other potential fields not directly in the form
      pageCount: initialBook?.pageCount,
      authorBio: initialBook?.authorBio,
    };

    onBookSave(bookData);
    toast({
      title: initialBook ? "Book Updated" : "Book Added",
      description: `${data.title} has been successfully ${initialBook ? 'updated' : 'added'}.`,
    });
    setIsOpen(false); // Close dialog on successful save
  };

  // Handle programmatic closing via the X button or overlay click
  const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
      // If closing, ensure the parent knows to clear the editingBook state
      // This is implicitly handled by setIsOpen(false) triggering useEffect in parent
  };

  return (
    // Dialog open state and change handler are now controlled by props
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* Trigger is now handled externally in the parent (Bookshelf) */}
      {/* However, we might still need a visible trigger for ADDING a book */}
      {!initialBook && (
        <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
            </Button>
        </DialogTrigger>
      )}
      {/* The Edit button on the card triggers the dialog via parent state */}

      <DialogContent className="sm:max-w-[480px] max-h-[90vh] flex flex-col"> {/* Added max-h and flex */}
        <DialogHeader>
          <DialogTitle>{initialBook ? "Edit Book" : "Add New Book"}</DialogTitle>
          <DialogDescription>
            {initialBook ? "Update the details for this book." : "Enter the details for the new book you want to add."}
          </DialogDescription>
        </DialogHeader>
        {/* Wrap form content in ScrollArea */}
        <ScrollArea className="flex-1 overflow-y-auto pr-6"> {/* Added pr-6 for scrollbar space */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Great Gatsby" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Author</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., F. Scott Fitzgerald" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/cover.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 978-3-16-148410-0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reading status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="finished">Finished</SelectItem>
                        <SelectItem value="want-to-read">Want to Read</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditionally render Rating */}
              {watchStatus === 'finished' && (
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (Optional)</FormLabel>
                      <FormControl>
                        {/* Pass field.value and field.onChange directly */}
                        <StarRating rating={field.value ?? 0} onRatingChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes/Review (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Your thoughts on the book..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Footer is outside the form but needs access to submit */}
              <DialogFooter className="mt-auto pt-4 border-t sticky bottom-0 bg-background z-10"> {/* Made footer sticky */}
                {/* DialogClose now implicitly calls onOpenChange(false) */}
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">{initialBook ? "Save Changes" : "Add Book"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
