
"use client";

import type { Book } from "@/interfaces/book";
import { SimpleBookCard } from "./simple-book-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Import ScrollArea

interface BookCategorySectionProps {
  title: string;
  books: Book[];
}

export function BookCategorySection({ title, books }: BookCategorySectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      {books.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
           <div className="flex space-x-3 pb-4"> {/* Adjusted spacing slightly */}
            {books.map((book) => (
              <SimpleBookCard
                key={book.id}
                book={book}
                className="w-[100px] sm:w-[120px] flex-shrink-0" // Reduced width further
              />
            ))}
           </div>
           <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No books to display in this category right now.</p>
        </div>
      )}
    </section>
  );
}
