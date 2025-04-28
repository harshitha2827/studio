
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
            <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden">
              {/* Cover Image */}
              <div className="aspect-[3/4] relative w-full overflow-hidden bg-muted">
                 {/* Use aspect ratio for consistent height based on width */}
                 <Image
                     src={book.coverUrl || "https://picsum.photos/seed/defaultBook/300/400"} // Fallback image
                     alt={`${book.title} cover`}
                     fill // Use fill layout
                     sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" // Responsive sizes
                     className="object-cover transition-transform duration-300 group-hover:scale-105"
                 />
               </div>
               {/* Content below image */}
               <div className="p-2 flex flex-col flex-grow"> {/* Reduced padding slightly */}
                 <CardTitle className="text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 mb-1 flex-grow"> {/* Adjusted text size */}
                   {book.title}
                 </CardTitle>
                 <p className="text-[10px] sm:text-[11px] text-muted-foreground line-clamp-1">{book.author}</p> {/* Adjusted text size */}
               </div>
            </Card>
        </a>
    </Link>
  );
}
