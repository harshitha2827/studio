
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import type { Book } from "@/interfaces/book";
import { SimpleBookCard } from "@/components/simple-book-card";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { generateSampleBooks } from '@/lib/mock-data'; // Import mock data generator

// Function to get category title from slug
const getCategoryTitle = (slug: string): string => {
  switch (slug) {
    case 'trending':
      return 'Trending Books';
    case 'popular':
      return 'Popular Books';
    case 'top-100':
      return 'Top 100 Books';
    default:
      return 'Books'; // Fallback title
  }
};

export default function CategoryPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const categoryTitle = getCategoryTitle(slug);

  // Generate books based on the slug.
  // In a real app, this would be an API call using the slug.
  // We generate more books here for a fuller page view.
  const books = React.useMemo(() => {
    if (!slug) return [];
    // Ensure different categories show different (but consistent) sets
    return generateSampleBooks(50, slug); // Generate 50 books for the category page
  }, [slug]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Back Button */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Discovery
            </Link>
          </Button>
           {/* Category Title */}
           <h1 className="text-xl font-semibold text-primary">{categoryTitle}</h1>
           {/* Placeholder for potential future actions like filtering/sorting */}
           <div></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {books.length > 0 ? (
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
             {/* Use SimpleBookCard for consistency with home page sections */}
            {books.map((book) => (
              <SimpleBookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No books found in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
}
