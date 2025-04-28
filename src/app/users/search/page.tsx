
'use client'; // Keep as client component for Suspense boundary

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserSearch } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter for back button
import { UserSearchResults } from '@/components/user-search-results'; // Import the new component

// This is now a simple wrapper component that uses Suspense
export default function UserSearchPage() {
  const router = useRouter();
  // The query will be read inside UserSearchResults component via useSearchParams
  // We don't need useSearchParams here anymore

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
          {/* Search Title - Static part, query added in results component */}
           <h1 className="text-lg font-semibold text-primary truncate flex items-center gap-2">
             <UserSearch className="h-5 w-5" /> User Search Results
           </h1>
           {/* Placeholder */}
           <div></div>
        </div>
      </header>

      {/* Main Content Area with Suspense */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <React.Suspense fallback={<LoadingState />}>
          <UserSearchResults />
        </React.Suspense>
      </main>
    </div>
  );
}

// Simple loading component for Suspense fallback
function LoadingState() {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p className="text-lg">Searching for users...</p>
      {/* Optional: Add a spinner */}
    </div>
  );
}

