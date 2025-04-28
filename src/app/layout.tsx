
'use client'; // Add 'use client' for useEffect

import * as React from 'react'; // Import React for useEffect
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter font
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" }); // Setup Inter font

// Metadata is typically defined outside the component for static export,
// but can be left here for simplicity in this context.
// export const metadata: Metadata = {
//   title: "BookBurst",
//   description: "Your personal reading log and discovery platform.",
// };
// If using dynamic metadata based on client state, you'd use the useMetadata hook or similar pattern.


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Effect to apply theme from localStorage on initial client load
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Default to light theme if no preference or preference is 'light'
      document.documentElement.classList.remove('dark');
      // Optionally explicitly save 'light' if nothing is saved
      if (!savedTheme) {
          localStorage.setItem('theme', 'light');
      }
    }
  }, []);


  return (
    // No need to dynamically add 'dark' class here anymore, handled by useEffect
    <html lang="en" suppressHydrationWarning>
       {/* Metadata setup is usually handled by Next.js layout/page structure or hooks, not manually in <html> */}
      <head>
            {/* Basic meta tags can go here, but title/description are better handled by Next.js Metadata API */}
            {/* <meta charSet="utf-8" /> */}
            {/* <meta name="viewport" content="width=device-width, initial-scale=1" /> */}
            {/* Favicon links etc. might be needed here if not handled by Metadata API */}
       </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
