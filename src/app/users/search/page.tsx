
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, UserSearch, Frown, User, BookOpen, CheckCircle, Bookmark } from 'lucide-react'; // Added icons
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// --- Mock Data (Replace with actual API/backend fetching) ---

// Mock user profile structure
interface MockUserProfile {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    readingCount: number;
    finishedCount: number;
    wantToReadCount: number;
    // Add more fields if needed (e.g., join date)
}

// Function to generate mock users
const generateMockUsers = (count: number, searchTerm: string): MockUserProfile[] => {
    const users: MockUserProfile[] = [];
    const termLower = searchTerm.toLowerCase();

    // Simple pseudo-random number generator based on seed
    const pseudoRandom = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    // Create a larger pool to filter from, ensuring some variety
    const potentialUsersCount = Math.max(count * 5, 20);
    for (let i = 1; i <= potentialUsersCount; i++) {
        const seed = i + termLower.length; // Simple seed based on index and search term length
        const userId = `user${i}`;
        const firstName = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia'][Math.floor(pseudoRandom(seed) * 10)];
        const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'][Math.floor(pseudoRandom(seed + 1) * 8)];
        const name = `${firstName} ${lastName}`;
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase().substring(0, 3)}${i}`;
        const avatarUrl = `https://i.pravatar.cc/150?u=${userId}`; // Consistent avatar

        // Only add if name or username matches the search term
        if (name.toLowerCase().includes(termLower) || username.toLowerCase().includes(termLower)) {
            users.push({
                id: userId,
                name: name,
                username: username,
                avatarUrl: avatarUrl,
                bio: `Mock bio for ${name}. Passionate reader and member of BookBurst since a random date. Loves ${['sci-fi', 'fantasy', 'mystery', 'history'][Math.floor(pseudoRandom(seed+2)*4)]}.`,
                readingCount: Math.floor(pseudoRandom(seed + 3) * 10),
                finishedCount: Math.floor(pseudoRandom(seed + 4) * 50) + 5,
                wantToReadCount: Math.floor(pseudoRandom(seed + 5) * 30) + 10,
            });
        }

        // Stop if we have enough results
        if (users.length >= count) break;
    }
    return users;
}


// Function to get initials for avatars
const getInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
};

// --- Component ---

export default function UserSearchResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const query = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = React.useState<MockUserProfile[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isClient, setIsClient] = React.useState(false); // Track client mount
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Check if current user is logged in

    // Effect for client mount and login status check
    React.useEffect(() => {
        setIsClient(true);
        const userProfileExists = localStorage.getItem('userProfile');
        setIsLoggedIn(!!userProfileExists);
    }, []);

    // Effect for searching users
    React.useEffect(() => {
        setIsLoading(true);
        if (query && isClient) { // Only search on client and if query exists
            // Simulate API call
            const results = generateMockUsers(20, query); // Generate up to 20 mock results
            setSearchResults(results);
        } else {
            setSearchResults([]); // Clear results if no query or not client-side
        }
        setIsLoading(false);
    }, [query, isClient]);

    // Handle clicking on a user card
    const handleUserClick = (username: string) => {
        // Navigate to the user's profile page
        router.push(`/profile/${username}`); // Assuming profile page uses username slug
    };

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-lg font-semibold text-primary truncate flex items-center gap-2">
                        <UserSearch className="h-5 w-5" /> User Search Results for "{query}"
                    </h1>
                    <div></div> {/* Placeholder */}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">Searching for users...</p>
                        {/* Optional: Add a spinner */}
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((user) => (
                            <Card
                                key={user.id}
                                className="shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                onClick={() => handleUserClick(user.username)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleUserClick(user.username); }}
                                role="link" // Semantically it acts like a link
                                tabIndex={0} // Make it focusable
                            >
                                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                    <Avatar className="h-16 w-16 border">
                                        <AvatarImage src={user.avatarUrl} alt={`${user.name}'s avatar`} />
                                        <AvatarFallback className="text-xl">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{user.name}</CardTitle>
                                        <CardDescription>@{user.username}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {user.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{user.bio}</p>}
                                    <Separator className="mb-4" />
                                    <div className="flex justify-around text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1" title="Currently Reading">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            <span>{user.readingCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Finished Reading">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            <span>{user.finishedCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Want to Read">
                                            <Bookmark className="h-3.5 w-3.5" />
                                            <span>{user.wantToReadCount}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                 {/* Add Follow button if needed and user is logged in */}
                                 {/*
                                 {isLoggedIn && (
                                    <CardFooter>
                                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); console.log(`Follow ${user.username}`); }}>
                                            Follow
                                        </Button>
                                    </CardFooter>
                                 )}
                                 */}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Frown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-lg font-medium">No users found matching "{query}".</p>
                        <p className="text-sm">Try searching for a different name or username.</p>
                        <Button variant="link" asChild className="mt-4">
                            <Link href="/">Go Back Home</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}

    