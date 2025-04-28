
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Book } from "@/interfaces/book";
import { SimpleBookCard } from "@/components/simple-book-card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Frown } from 'lucide-react';
import { generateSampleBooks } from '@/lib/mock-data'; // Import mock data generator

// Define known seeds to pull data from for search
const searchSeeds = ['trending', 'popular', 'top-100', 'bookshelf-initial', 'readers-club-reading'];
// Define how many books per seed to generate for the search pool
const booksPerSeedSearch = 100; // Adjust for broader search vs performance

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || ''; // Get search query from URL

  const [searchResults, setSearchResults] = React.useState<Book[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false); // Track client mount
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Track login status

  // --- Search Logic ---
  React.useEffect(() => {
     setIsClient(true); // Mark as client-mounted

     // Check login status (needed for SimpleBookCard like button)
     const userProfileExists = localStorage.getItem('userProfile');
     setIsLoggedIn(!!userProfileExists);

     setIsLoading(true);
     if (query) {
        // 1. Combine mock data from various sources
        const allSampleBooksMap = new Map<string, Book>();

        // Generate books from predefined seeds
        searchSeeds.forEach(seed => {
          const books = generateSampleBooks(booksPerSeedSearch, seed);
          books.forEach(book => {
             if (!allSampleBooksMap.has(book.id)) {
                allSampleBooksMap.set(book.id, book);
             }
          });
        });

        // 2. Include books from the user's bookshelf (localStorage)
        const savedBooksRaw = localStorage.getItem('bookshelfBooks');
        if (savedBooksRaw) {
           try {
               const bookshelfBooks: Book[] = JSON.parse(savedBooksRaw).map((b: any) => ({
                   ...b,
                   addedDate: new Date(b.addedDate),
                   blankPdfUrl: b.blankPdfUrl || undefined, // Ensure field exists
               }));
               bookshelfBooks.forEach(book => {
                    // Prioritize bookshelf version if ID conflicts
                    allSampleBooksMap.set(book.id, book);
               });
           } catch (e) {
               console.error("Failed to parse bookshelf books for search:", e);
           }
        }

        // Convert map values to an array
        const allBooks = Array.from(allSampleBooksMap.values());

        // 3. Filter the combined list based on the search query (case-insensitive)
        const lowerCaseQuery = query.toLowerCase();
        const results = allBooks.filter(book =>
          book.title.toLowerCase().includes(lowerCaseQuery) ||
          book.author.toLowerCase().includes(lowerCaseQuery)
        );

        // 4. Sort results (optional, e.g., by relevance or title)
        results.sort((a, b) => a.title.localeCompare(b.title)); // Simple title sort

        setSearchResults(results);
     } else {
         setSearchResults([]); // No query, no results
     }
     setIsLoading(false);
  }, [query]); // Re-run search when the query changes

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-4">
          {/* Back Button */}
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {/* Search Title */}
           <h1 className="text-lg font-semibold text-primary truncate flex items-center gap-2">
             <Search className="h-5 w-5" /> Search Results for "{query}"
           </h1>
           {/* Placeholder for potential future actions */}
           <div></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Searching...</p>
            {/* Optional: Add a spinner */}
          </div>
        ) : searchResults.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
             {/* Use SimpleBookCard for consistency */}
            {searchResults.map((book) => (
              <SimpleBookCard
                key={book.id}
                book={book}
                isLoggedIn={isLoggedIn} // Pass login status
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Frown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium">No books found matching "{query}".</p>
            <p className="text-sm">Try searching for a different title or author.</p>
             <Button variant="link" asChild className="mt-4">
                <Link href="/">Go Back Home</Link>
             </Button>
          </div>
        )}
      </main>
    </div>
  );
}
