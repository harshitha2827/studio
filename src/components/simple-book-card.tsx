
"use client"; // Need client component for the like state and potential PDF opening

import * as React from "react";
import type { Book } from "@/interfaces/book";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link"; // Import Link for navigation to detail page
import { Heart, FileText } from "lucide-react"; // Import Heart and FileText icons
import { Button } from "@/components/ui/button"; // Import Button for the icon button
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { useRouter } from 'next/navigation'; // Import useRouter

interface SimpleBookCardProps {
  book: Book;
  className?: string;
  isLoggedIn: boolean; // Add isLoggedIn prop
}

export function SimpleBookCard({ book, className, isLoggedIn }: SimpleBookCardProps) {
  const [isLiked, setIsLiked] = React.useState(false); // State for like button
  const { toast } = useToast();
  const router = useRouter();

  // Toggle like status and prevent card navigation
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent Link/anchor navigation
    e.preventDefault(); // Prevent default anchor behavior

    if (!isLoggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to like books.",
            variant: "destructive",
            action: (
                <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                    Login
                </Button>
            ),
        });
        return;
    }

    setIsLiked((prev) => !prev);
    // In a real app, you'd likely call an API here to update the like status
    console.log(`Toggled like for book ${book.id}: ${!isLiked}`);
     // Optional: Add success toast for liking/unliking
     // toast({ title: !isLiked ? "Liked!" : "Unliked" });
  };

  // Determine if this card represents an "empty" book with a PDF link
  const isEmptyBookWithPdf = !book.coverUrl && book.blankPdfUrl;

  // Handle clicking the card: open PDF if empty book, else navigate to detail page
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isEmptyBookWithPdf) {
      e.preventDefault(); // Prevent Link navigation for PDF books
      if (!isLoggedIn) {
          toast({
              title: "Login Required",
              description: "Please log in to view PDF documents.",
              variant: "destructive",
              action: (
                  <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                      Login
                  </Button>
              ),
          });
          return;
      }
      if (book.blankPdfUrl) {
        window.open(book.blankPdfUrl, '_blank', 'noopener,noreferrer');
      }
    }
    // Otherwise, allow the default Link navigation to proceed (handled by the Link component itself)
  };

  // Define the content of the card (image or placeholder)
  const CardImageContent = () => {
    if (isEmptyBookWithPdf) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted p-2">
          <FileText className="h-1/2 w-1/2 text-muted-foreground opacity-50" />
        </div>
      );
    } else {
      return (
        <Image
           // Use cover URL or a default placeholder if cover is missing but it's not an "empty PDF book"
           src={book.coverUrl || `https://picsum.photos/seed/${book.id}/300/400`}
           alt={`${book.title} cover`}
           fill // Use fill layout
           sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 15vw" // Adjusted responsive sizes
           className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      );
    }
  };


  // Use Link for detail page navigation, but override click for PDF books
  return (
    <Link
       href={`/book/${book.id}`}
       passHref
       legacyBehavior // Always use legacyBehavior when wrapping an explicit <a> tag
       >
       <a // Keep the <a> tag for styling and click handling
         className={cn("block group", className)}
         aria-label={isEmptyBookWithPdf ? `Open blank PDF for ${book.title}` : `View details for ${book.title}`}
         onClick={handleCardClick} // Handle click here for both PDF and detail navigation logic
         target={isEmptyBookWithPdf ? "_blank" : undefined} // Open PDF in new tab
         rel={isEmptyBookWithPdf ? "noopener noreferrer" : undefined}
        >
        <Card className="flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden cursor-pointer"> {/* Add cursor-pointer */}
          {/* Cover Image or PDF Placeholder */}
          <div className="aspect-[3/4] relative w-full overflow-hidden bg-muted">
             <CardImageContent />
          </div>
          {/* Content below image */}
          <div className="p-1.5 sm:p-2 flex flex-col flex-grow"> {/* Slightly reduced padding */}
            <CardTitle className="text-[10px] sm:text-[11px] font-medium leading-tight line-clamp-2 mb-0.5 sm:mb-1 flex-grow"> {/* Adjusted text size and spacing */}
              {book.title}
            </CardTitle>
            <div className="flex justify-between items-center mt-1"> {/* Container for author and like */}
              <p className="text-[9px] sm:text-[10px] text-muted-foreground line-clamp-1 flex-grow mr-1">{book.author}</p> {/* Adjusted text size */}
               {/* Like Button - Disabled if not logged in */}
               <Button
                 variant="ghost"
                 size="icon"
                 className={cn(
                    "h-5 w-5 p-0 shrink-0",
                    !isLoggedIn && "cursor-not-allowed opacity-50" // Style disabled state
                 )}
                 onClick={handleLikeClick}
                 aria-pressed={isLoggedIn ? isLiked : false}
                 aria-label={isLoggedIn ? (isLiked ? "Unlike this book" : "Like this book") : "Log in to like books"}
                 disabled={!isLoggedIn} // Disable button if not logged in
                 title={!isLoggedIn ? "Log in to like" : (isLiked ? "Unlike" : "Like")} // Tooltip
               >
                 <Heart
                   className={cn(
                     "h-3 w-3 transition-colors", // Smaller icon size
                     isLoggedIn && isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
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
