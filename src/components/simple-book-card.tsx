
import type { Book } from "@/interfaces/book";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link"; // Import Link

interface SimpleBookCardProps {
  book: Book;
  className?: string;
}

export function SimpleBookCard({ book, className }: SimpleBookCardProps) {
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
                 <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1">{book.author}</p> {/* Adjusted text size */}
               </div>
            </Card>
        </a>
    </Link>
  );
}
