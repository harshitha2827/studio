
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, UserSearch, Frown, User, BookOpen, CheckCircle, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// --- Mock Data (Replace with actual API/backend fetching) ---

// Mock user profile structure (ensure this aligns with data generation)
interface MockUserProfile {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    readingCount: number;
    finishedCount: number;
    wantToReadCount: number;
}

// Function to generate mock users based on search term
const generateMockUsers = (count: number, searchTerm: string): MockUserProfile[] => {
    const users: MockUserProfile[] = [];
    if (!searchTerm) return users; // Return empty if no search term

    const termLower = searchTerm.toLowerCase();

    // Simple pseudo-random number generator based on seed
    const pseudoRandom = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    // Create a larger pool to filter from, ensuring some variety
    const potentialUsersCount = Math.max(count * 5, 50);
    for (let i = 1; i <= potentialUsersCount; i++) {
        const seed = i + termLower.length;
        const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Laura', 'Mike', 'Nora', 'Oscar', 'Penny', 'Quinn', 'Rachel', 'Steve', 'Tina'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Martin', 'Jackson'];

        const firstName = firstNames[Math.floor(pseudoRandom(seed) * firstNames.length)];
        const lastName = lastNames[Math.floor(pseudoRandom(seed + 1) * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase().substring(0, 3)}${i}`;
        const userId = `user-${username}`; // More specific ID
        const avatarUrl = `https://i.pravatar.cc/150?u=${userId}`;

        // Only add if name or username contains the search term
        if (name.toLowerCase().includes(termLower) || username.toLowerCase().includes(termLower)) {
            users.push({
                id: userId,
                name: name,
                username: username,
                avatarUrl: avatarUrl,
                bio: `Mock bio for ${name}. ${['Passionate reader', 'Book enthusiast', 'Casual browser', 'Genre explorer'][Math.floor(pseudoRandom(seed+2)*4)]} on BookBurst. Currently into ${['sci-fi', 'fantasy', 'mystery', 'history', 'romance', 'thrillers'][Math.floor(pseudoRandom(seed+3)*6)]}.`,
                readingCount: Math.floor(pseudoRandom(seed + 4) * 10),
                finishedCount: Math.floor(pseudoRandom(seed + 5) * 50) + 5,
                wantToReadCount: Math.floor(pseudoRandom(seed + 6) * 30) + 10,
            });
        }

        if (users.length >= count) break;
    }
    return users.sort((a, b) => a.name.localeCompare(b.name));
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

export function UserSearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
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
            // Simulate API call by generating mock users
            const results = generateMockUsers(20, query); // Generate up to 20 mock results matching query
            setSearchResults(results);
        } else {
            setSearchResults([]); // Clear results if no query or not client-side
        }
        setIsLoading(false);
    }, [query, isClient]); // Re-run when query or client status changes

    // Handle clicking on a user card
    const handleUserClick = (username: string) => {
        // Navigate to the user's profile page
        router.push(`/profile/${username}`); // Assuming profile page uses username slug
    };

    if (isLoading) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Searching for users...</p>
          {/* Optional: Add a spinner */}
        </div>
      );
    }

    if (!isClient) {
        // Render nothing or a placeholder during initial server render/hydration mismatch phase
        return null;
    }

    return (
        <>
            {/* Dynamically update title or add a header here if needed */}
            {/* <h2 className="text-xl font-medium mb-4">Results for "{query}"</h2> */}
             {searchResults.length > 0 ? (
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
                                    <div className="flex-1 overflow-hidden"> {/* Added overflow-hidden */}
                                        <CardTitle className="text-xl truncate">{user.name}</CardTitle> {/* Added truncate */}
                                        <CardDescription className="truncate">@{user.username}</CardDescription> {/* Added truncate */}
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
        </>
    );
}

