
'use client';

import * as React from 'react';
import { Bookshelf } from '@/components/bookshelf';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookshelfPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
       {/* Simple Header for Bookshelf Page */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
         <div className="container flex h-16 items-center justify-between">
            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 Back to Discovery
              </Link>
            </Button>
            {/* Can add other header elements if needed later */}
         </div>
      </header>

      {/* Main Content - The Bookshelf Component */}
      <main className="flex-1">
        <Bookshelf />
      </main>
    </div>
  );
}
