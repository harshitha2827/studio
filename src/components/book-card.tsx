
import type { Book } from "@/interfaces/book";
import Image from "next/image";
import { useRouter } from 'next/navigation'; // Import useRouter
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, BookOpen, CheckCircle, Bookmark, FileText } from "lucide-react"; // Added FileText
import { StarRating } from "./star-rating";
import { cn } from "@/lib/utils"; // Import cn for conditional classnames

interface BookCardProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Book['status']) => void;
   onRatingChange: (id: string, rating: number) => void;
}

const statusIcons = {
  reading: <BookOpen className="h-4 w-4 mr-1" />,
  finished: <CheckCircle className="h-4 w-4 mr-1" />,
  'want-to-read': <Bookmark className="h-4 w-4 mr-1" />,
};

const statusLabels: Record<Book['status'], string> = {
    reading: 'Reading',
    finished: 'Finished',
    'want-to-read': 'Want to Read',
}

export function BookCard({ book, onEdit, onDelete, onStatusChange, onRatingChange }: BookCardProps) {
  const router = useRouter(); // Get router instance
  const handleRatingChange = (newRating: number) => {
    onRatingChange(book.id, newRating);
  }

  // Determine if this card represents an "empty" book with a PDF link
  const isEmptyBookWithPdf = !book.coverUrl && book.blankPdfUrl;

  // Handle clicking the image/placeholder area: open PDF or navigate to detail page
  const handleImageAreaClick = () => {
    if (isEmptyBookWithPdf && book.blankPdfUrl) {
       window.open(book.blankPdfUrl, '_blank', 'noopener,noreferrer');
    } else if (!isEmptyBookWithPdf) { // Only navigate if it's not a blank PDF book
       router.push(`/book/${book.id}`);
    }
     // If it's an empty book *without* a PDF URL, clicking does nothing currently.
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold leading-tight flex-1">{book.title}</CardTitle>
          <Badge variant="secondary" className="whitespace-nowrap flex items-center shrink-0">
            {statusIcons[book.status]}
            {statusLabels[book.status]}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{book.author}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow space-y-4">
         {/* Image/Placeholder Area - Now handles navigation too */}
         <div
           className={cn(
             "mb-4 h-40 relative overflow-hidden rounded bg-muted",
             // Add cursor pointer for both PDF and normal books now
             "cursor-pointer",
             isEmptyBookWithPdf && "flex items-center justify-center"
           )}
           onClick={handleImageAreaClick}
           title={isEmptyBookWithPdf ? "Click to open blank PDF" : `View details for ${book.title}`}
           role="button" // Role button is appropriate now for navigation/action
           tabIndex={0} // Make it focusable
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageAreaClick(); }} // Keyboard accessibility
           aria-label={isEmptyBookWithPdf ? `Open blank PDF for ${book.title}` : `View details for ${book.title}`}
         >
            {isEmptyBookWithPdf ? (
                <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
            ) : (
                <Image
                  // Use cover URL or a generic placeholder if no cover AND no PDF
                  src={book.coverUrl || `https://picsum.photos/seed/${book.id}/300/400`}
                  alt={`${book.title} cover`}
                  fill
                  sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  // Prevent image drag interfering with click
                  draggable="false"
                  // Prioritize images in the viewport? Maybe not for bookshelf view.
                  // priority={/* condition based on viewport */}
                />
            )}
          </div>

        {/* Rating (only if finished) */}
        {book.rating !== undefined && book.status === 'finished' && (
          <div className="mb-2">
             <StarRating rating={book.rating} onRatingChange={handleRatingChange} size={18} />
          </div>
        )}

        {/* Notes */}
        {book.notes && (
          <p className="text-sm text-foreground line-clamp-3">{book.notes}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-end space-x-2 border-t mt-auto bg-muted/30">
        {/* Keep Edit and Delete buttons */}
        <Button variant="ghost" size="icon" onClick={() => onEdit(book)} aria-label={`Edit ${book.title}`}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(book.id)} aria-label={`Delete ${book.title}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
