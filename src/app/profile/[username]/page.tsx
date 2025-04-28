
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Book } from "@/interfaces/book";
import { SimpleBookCard } from "@/components/simple-book-card";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, BookOpen, CheckCircle, Bookmark, UserPlus, UserCheck, Frown } from 'lucide-react'; // Added icons
import { generateSampleBooks } from '@/lib/mock-data'; // Import mock data generator
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast'; // For potential follow actions

// --- Mock Data (Replace with actual API/backend fetching) ---

// Mock user profile structure (similar to search results)
interface MockUserProfile {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    bio?: string;
    // joinDate?: Date; // Removed joinDate
    // Bookshelf data will be generated separately
}

// Function to find/generate a mock user profile based on username
// In a real app, you'd fetch this from your backend API using the username param
const findMockUserByUsername = (username: string): MockUserProfile | null => {
    // Simple generation based on username for consistency
    if (!username) return null;
    const usernameLower = username.toLowerCase();
    const parts = usernameLower.split('_');
    const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'User';
    const lastNameInitial = parts[1] ? parts[1].charAt(0).toUpperCase() : 'X';
    const seed = usernameLower.length; // Very simple seed

    // Simple pseudo-random number generator based on seed
    const pseudoRandom = (s: number) => {
      let x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    }

    return {
        id: `user-${usernameLower}`,
        name: `${firstName} ${lastNameInitial}.`, // Generate a plausible name
        username: username,
        avatarUrl: `https://i.pravatar.cc/150?u=${usernameLower}`, // Consistent avatar
        bio: `Mock bio for ${firstName}. A dedicated reader on BookBurst. Currently exploring the world of ${['fiction', 'non-fiction', 'fantasy'][Math.floor(pseudoRandom(seed+2)*3)]}.`,
        // joinDate: joinDate, // Removed joinDate
    };
}

// Function to get initials for avatars
const getInitials = (name: string | undefined): string => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    return names
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
};

// --- Component ---

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const username = typeof params.username === 'string' ? params.username : '';

    const [userProfile, setUserProfile] = React.useState<MockUserProfile | null>(null);
    const [booksReading, setBooksReading] = React.useState<Book[]>([]);
    const [booksFinished, setBooksFinished] = React.useState<Book[]>([]);
    const [booksWantToRead, setBooksWantToRead] = React.useState<Book[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isClient, setIsClient] = React.useState(false);
    const [isFollowing, setIsFollowing] = React.useState(false); // Mock follow state
    const [isCurrentUserProfile, setIsCurrentUserProfile] = React.useState(false); // Is this the logged-in user's own profile?
    const [loggedInUserExists, setLoggedInUserExists] = React.useState(false); // Is anyone logged in?

    // Effect for client mount and loading data
    React.useEffect(() => {
        setIsClient(true);

        // Check if a user is logged in
        const loggedInData = localStorage.getItem('userProfile');
        setLoggedInUserExists(!!loggedInData);
        let currentUsername = '';
        if (loggedInData) {
            try {
                currentUsername = JSON.parse(loggedInData).username || '';
            } catch (e) { console.error("Error parsing logged in user data"); }
        }
        setIsCurrentUserProfile(!!currentUsername && currentUsername === username);

        if (username) {
            setIsLoading(true);
            // Simulate fetching user profile
            const foundUser = findMockUserByUsername(username);
            setUserProfile(foundUser);

            if (foundUser) {
                // Simulate fetching user's bookshelves (using mock generator with user-specific seed)
                setBooksReading(generateSampleBooks(8, `${username}-reading`));
                setBooksFinished(generateSampleBooks(15, `${username}-finished`));
                setBooksWantToRead(generateSampleBooks(20, `${username}-want`));

                // TODO: Implement actual follow status check against logged-in user
                // setIsFollowing(checkIfFollowing(currentUser.id, foundUser.id));
                setIsFollowing(false); // Default to not following for mock
            }
            setIsLoading(false);
        } else {
            setIsLoading(false); // No username param
        }
    }, [username]);


    const handleFollowToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent potential link navigation if button is inside a link/card
        if (!loggedInUserExists) {
            toast({ title: "Login Required", description: "Please log in to follow users.", variant: "destructive" });
            return;
        }
        // TODO: Implement actual follow/unfollow API call
        setIsFollowing(prev => !prev);
        toast({ title: isFollowing ? "Unfollowed" : "Followed", description: `You are now ${isFollowing ? 'unfollowing' : 'following'} ${userProfile?.name}.` });
    };


    if (isLoading || !isClient) { // Show loading until client mounted and data fetched
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <p className="text-lg text-muted-foreground">Loading user profile...</p>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex min-h-screen flex-col bg-secondary/30">
                 <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center justify-between">
                       <Button variant="ghost" size="sm" onClick={() => router.back()}>
                           <ArrowLeft className="mr-2 h-4 w-4" /> Back
                       </Button>
                       <h1 className="text-lg font-semibold">User Not Found</h1>
                       <div></div> {/* Placeholder */}
                    </div>
                 </header>
                <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
                     <Card className="text-center shadow-lg">
                         <CardHeader>
                             <CardTitle>Oops! User Not Found</CardTitle>
                         </CardHeader>
                         <CardContent>
                             <Frown className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                             <p className="text-muted-foreground">We couldn't find a user with the username "@{username}".</p>
                             <Button onClick={() => router.push('/')} className="mt-6">Go to Home</Button>
                         </CardContent>
                     </Card>
                 </main>
            </div>
        );
    }


    return (
        <div className="flex min-h-screen flex-col bg-secondary/30">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
                <div className="container flex h-16 items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="truncate text-xl font-semibold">{userProfile.name}'s Profile</h1>
                    <div> {/* Placeholder */} </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto max-w-4xl flex-1 space-y-8 px-4 py-8">
                {/* Profile Info Card */}
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6 p-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md sm:h-28 sm:w-28">
                            <AvatarImage src={userProfile.avatarUrl} alt={`${userProfile.name}'s avatar`} />
                            <AvatarFallback className="text-3xl">{getInitials(userProfile.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <CardTitle className="text-2xl sm:text-3xl">{userProfile.name}</CardTitle>
                            <CardDescription className="text-lg text-primary">@{userProfile.username}</CardDescription>
                            {userProfile.bio && <p className="text-sm text-muted-foreground pt-1">{userProfile.bio}</p>}
                             {/* Removed Join Date Display */}
                             {/* Follow/Unfollow Button - Show only if logged in and not the current user's profile */}
                             {loggedInUserExists && !isCurrentUserProfile && (
                                <Button
                                    size="sm"
                                    variant={isFollowing ? "secondary" : "default"}
                                    onClick={handleFollowToggle}
                                    className="mt-3"
                                >
                                    {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Button>
                             )}
                             {/* Link to edit profile if this IS the current user's profile */}
                             {isCurrentUserProfile && (
                                 <Button size="sm" variant="outline" asChild className="mt-3">
                                     <Link href="/profile">Edit Your Profile</Link>
                                 </Button>
                             )}
                        </div>
                    </CardHeader>
                    {/* Optional: Add follower/following counts here if needed */}
                    {/* <CardContent> <Separator /> ... counts ... </CardContent> */}
                </Card>

                {/* Bookshelves Tabs */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Bookshelves</CardTitle>
                        <CardDescription>Explore {userProfile.name}'s reading journey.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="reading" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="reading">
                                    <BookOpen className="mr-1.5 h-4 w-4" /> Reading ({booksReading.length})
                                </TabsTrigger>
                                <TabsTrigger value="finished">
                                    <CheckCircle className="mr-1.5 h-4 w-4" /> Finished ({booksFinished.length})
                                </TabsTrigger>
                                <TabsTrigger value="want-to-read">
                                    <Bookmark className="mr-1.5 h-4 w-4" /> Want to Read ({booksWantToRead.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Reading Tab */}
                            <TabsContent value="reading">
                                {booksReading.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                        {booksReading.map(book => (
                                            <SimpleBookCard key={book.id} book={book} className="w-full" isLoggedIn={loggedInUserExists} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-6 text-muted-foreground">Not currently reading any books.</p>
                                )}
                            </TabsContent>

                            {/* Finished Tab */}
                            <TabsContent value="finished">
                                {booksFinished.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                        {booksFinished.map(book => (
                                            <SimpleBookCard key={book.id} book={book} className="w-full" isLoggedIn={loggedInUserExists} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-6 text-muted-foreground">No finished books yet.</p>
                                )}
                            </TabsContent>

                            {/* Want to Read Tab */}
                            <TabsContent value="want-to-read">
                                {booksWantToRead.length > 0 ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                        {booksWantToRead.map(book => (
                                            <SimpleBookCard key={book.id} book={book} className="w-full" isLoggedIn={loggedInUserExists} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center py-6 text-muted-foreground">No books on the want to read list.</p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
