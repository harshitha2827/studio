
"use client";

import type { Book } from "@/interfaces/book";
import { SimpleBookCard } from "./simple-book-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Import ScrollArea
import { Button } from "@/components/ui/button"; // Import Button
import Link from "next/link"; // Import Link

interface BookCategorySectionProps {
  title: string;
  books: Book[];
  slug: string; // Add slug prop for linking
  isLoggedIn: boolean; // Add isLoggedIn prop
}

export function BookCategorySection({ title, books, slug, isLoggedIn }: BookCategorySectionProps) {
  return (
    <section className="space-y-4">
       {/* Wrap the Button with Link */}
       <Link href={`/category/${slug}`} passHref legacyBehavior>
         <Button
           as="a" // Render Button as an anchor tag
           variant="ghost"
           className="text-2xl font-semibold tracking-tight text-primary h-auto p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 hover:underline" // Added underline on hover
           aria-label={`View all ${title}`} // Add accessibility label
         >
           {title}
         </Button>
       </Link>
      {books.length > 0 ? (
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
           <div className="flex space-x-3 pb-4"> {/* Adjusted spacing slightly */}
            {books.map((book) => (
              <SimpleBookCard
                key={book.id}
                book={book}
                className="w-[100px] sm:w-[120px] flex-shrink-0" // Reduced width further
                isLoggedIn={isLoggedIn} // Pass isLoggedIn down
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

