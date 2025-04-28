
import type { Book } from "@/interfaces/book";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SimpleBookCardProps {
  book: Book;
  className?: string;
}

export function SimpleBookCard({ book, className }: SimpleBookCardProps) {
  return (
    <Card className={cn("flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden group", className)}>
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
       <div className="p-3 flex flex-col flex-grow">
         <CardTitle className="text-sm font-medium leading-tight line-clamp-2 mb-1 flex-grow">
           {book.title}
         </CardTitle>
         <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
       </div>
    </Card>
  );
}
