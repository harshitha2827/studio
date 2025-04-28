
"use client"; // Need client component for the like state

import * as React from "react";
import type { Book } from "@/interfaces/book";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link"; // Import Link
import { Heart } from "lucide-react"; // Import Heart icon
import { Button } from "@/components/ui/button"; // Import Button for the icon button

interface SimpleBookCardProps {
  book: Book;
  className?: string;
}

export function SimpleBookCard({ book, className }: SimpleBookCardProps) {
  const [isLiked, setIsLiked] = React.useState(false); // State for like button

  // Toggle like status and prevent card navigation
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Link navigation
    e.preventDefault(); // Prevent default anchor behavior if any
    setIsLiked((prev) => !prev);
    // In a real app, you'd likely call an API here to update the like status
    console.log(`Toggled like for book ${book.id}: ${!isLiked}`);
  };

  return (
    <Link href={`/book/${book.id}`} passHref legacyBehavior>
      <a className={cn("block group", className)} aria-label={`View details for ${book.title}`}> {/* Make the link the block container */}
        <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden cursor-pointer"> {/* Add cursor-pointer */}
          {/* Cover Image */}
          <div className="aspect-[3/4] relative w-full overflow-hidden bg-muted">
            {/* Use aspect ratio for consistent height based on width */}
            <Image
              src={book.coverUrl || "https://picsum.photos/seed/defaultBook/300/400"} // Fallback image
              alt={`${book.title} cover`}
              fill // Use fill layout
              sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 15vw" // Adjusted responsive sizes based on smaller widths
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {/* Content below image */}
          <div className="p-1.5 sm:p-2 flex flex-col flex-grow"> {/* Slightly reduced padding */}
            <CardTitle className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 mb-0.5 sm:mb-1 flex-grow"> {/* Adjusted text size and spacing */}
              {book.title}
            </CardTitle>
            <div className="flex justify-between items-center mt-1"> {/* Container for author and like */}
              <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1 flex-grow mr-1">{book.author}</p> {/* Adjusted text size */}
               {/* Like Button */}
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-5 w-5 p-0 shrink-0" // Make button very small
                 onClick={handleLikeClick}
                 aria-pressed={isLiked}
                 aria-label={isLiked ? "Unlike this book" : "Like this book"}
               >
                 <Heart
                   className={cn(
                     "h-3 w-3 transition-colors", // Smaller icon size
                     isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                   )}
                 />
               </Button>
            </div>
          </div>
        </Card>
      </a>
    </Link>
  );
}
