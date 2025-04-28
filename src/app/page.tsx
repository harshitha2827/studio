
'use client'; // Need client component for state

import * as React from 'react'; // Import React for state
import { Bookshelf } from "@/components/bookshelf";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle } from "lucide-react"; // Import user icon

export default function Home() {
  // Simulate authentication state - replace with actual auth logic later
  const [isLoggedIn, setIsLoggedIn] = React.useState(true); // Set to true for demonstration

  // Simulate checking auth state on mount (e.g., from localStorage/cookie)
  // React.useEffect(() => {
  //   // Replace with your actual check, e.g., check for a token
  //   const userIsAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  //   setIsLoggedIn(userIsAuthenticated);
  // }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12">
      {/* Conditional Top Right Content: Profile Icon or Login Button */}
      <div className="absolute top-4 right-4">
        {isLoggedIn ? (
          <Button variant="ghost" size="icon" aria-label="User Profile">
            <UserCircle className="h-6 w-6" />
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
      <Bookshelf />
    </main>
  );
}
