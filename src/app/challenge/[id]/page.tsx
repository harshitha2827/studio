
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CalendarDays, Gift, Star, UserCircle, Users, BookOpen, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { SimpleBookCard } from '@/components/simple-book-card';
import type { Book } from '@/interfaces/book';
import { format } from 'date-fns';

// Re-define the Challenge interface here for this page's use
// Ensure structure matches the data stored in localStorage from readers-club/page.tsx
interface StoredChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  startDate: string; // Stored as ISO string
  endDate: string; // Stored as ISO string
  host: { id: string; name: string; avatarUrl?: string };
  rewardPoints: number;
  requiredBooks?: (Omit<Book, 'addedDate'> & { addedDate: string })[]; // Books with string dates
  participants: { id: string; name: string; avatarUrl?: string }[];
  // icon is not stored
}

// Interface for the hydrated challenge data with Date objects
interface ChallengeDetails extends Omit<StoredChallenge, 'startDate' | 'endDate' | 'requiredBooks'> {
  startDate: Date;
  endDate: Date;
  requiredBooks?: Book[]; // Hydrated books with Date objects
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

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = typeof params.id === 'string' ? params.id : '';
  const [challenge, setChallenge] = React.useState<ChallengeDetails | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!challengeId) {
        setLoading(false);
        return;
    }

    setLoading(true);
    let foundChallenge: ChallengeDetails | null = null;

    // --- Fetch challenge data (using localStorage for mock) ---
    if (typeof window !== 'undefined') {
        const storedChallengesRaw = localStorage.getItem('mockChallenges');
        if (storedChallengesRaw) {
            try {
                const storedChallenges: StoredChallenge[] = JSON.parse(storedChallengesRaw);
                const targetChallenge = storedChallenges.find(c => c.id === challengeId);

                if (targetChallenge) {
                     // Hydrate dates and book dates
                     foundChallenge = {
                         ...targetChallenge,
                         startDate: new Date(targetChallenge.startDate),
                         endDate: new Date(targetChallenge.endDate),
                         requiredBooks: targetChallenge.requiredBooks?.map(b => ({
                             ...b,
                             addedDate: new Date(b.addedDate) // Convert book addedDate back to Date
                         }))
                     };
                }
            } catch (e) {
                console.error("Failed to parse challenges from localStorage:", e);
            }
        }
    }
    // --- End Fetch ---

    setChallenge(foundChallenge);
    setLoading(false);

  }, [challengeId]);

  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <p className="text-lg text-muted-foreground">Loading challenge details...</p>
        </div>
    );
  }

  if (!challenge) {
    return (
        <div className="flex min-h-screen flex-col bg-secondary/30">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Go back">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="ml-4 truncate text-lg font-semibold">Challenge Not Found</h1>
                </div>
            </header>
            <main className="container mx-auto max-w-4xl flex-1 px-4 py-8">
                <Card className="text-center shadow-lg">
                    <CardHeader>
                        <CardTitle>Oops! Challenge Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">We couldn't find the challenge you were looking for (ID: {challengeId}).</p>
                        <Button onClick={() => router.push('/readers-club')} className="mt-6">Back to Readers Club</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
  }

  const isCompleted = challenge.progress === 100;
  const isUpcoming = challenge.startDate > new Date();
  const isActive = !isCompleted && !isUpcoming;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
            <div className="container flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Readers Club
            </Button>
            <h1 className="truncate text-xl font-semibold">{challenge.title}</h1>
            <div> {/* Placeholder for potential future actions */} </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto max-w-4xl flex-1 space-y-8 px-4 py-8">
            {/* Main Challenge Details Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl">{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     {/* Status and Progress */}
                     <div className="space-y-2">
                         <div className="flex justify-between items-center text-sm font-medium">
                            <span className="flex items-center">
                                {isCompleted ? <CheckCircle className="mr-1.5 h-4 w-4 text-green-500" /> :
                                 isActive ? <BookOpen className="mr-1.5 h-4 w-4 text-blue-500" /> :
                                 <CalendarDays className="mr-1.5 h-4 w-4 text-orange-500" />}
                                Status: {isCompleted ? 'Completed' : isActive ? 'Active' : 'Upcoming'}
                            </span>
                            <span>{challenge.progress}% Complete</span>
                         </div>
                         <Progress value={challenge.progress} aria-label={`${challenge.title} progress`} className="h-3" />
                     </div>

                    {/* Dates */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4" />
                            <span>Starts: {format(challenge.startDate, 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                             <CalendarDays className="h-4 w-4" />
                             <span>Ends: {format(challenge.endDate, 'PPP')}</span>
                        </div>
                    </div>

                     {/* Host Details */}
                     <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
                        <UserCircle className="h-5 w-5 text-primary flex-shrink-0"/>
                        <span className="font-medium mr-2">Hosted by:</span>
                        <Avatar className="h-7 w-7 border">
                            <AvatarImage src={challenge.host.avatarUrl} alt={challenge.host.name} />
                            <AvatarFallback>{getInitials(challenge.host.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">{challenge.host.name}</span>
                    </div>

                    {/* Reward */}
                    <div className="flex items-center gap-2 text-sm">
                        <Gift className="h-4 w-4 text-yellow-500"/>
                         <span className="font-medium">Reward:</span>
                         <span className="flex items-center gap-1 text-foreground font-semibold">
                             {challenge.rewardPoints} <Star className="h-3 w-3 text-yellow-400 fill-yellow-400"/> points
                         </span>
                    </div>

                    {/* Required Books (if any) */}
                    {challenge.requiredBooks && challenge.requiredBooks.length > 0 && (
                        <div>
                            <h3 className="mb-3 text-lg font-semibold">Required Reading</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {challenge.requiredBooks.map(book => (
                                    <SimpleBookCard key={book.id} book={book} className="w-full"/>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
                 <CardFooter className="flex justify-end">
                     {/* Add action buttons like "Join Challenge", "Mark as Complete", etc. later */}
                      <Button disabled={isCompleted || !isActive}>
                        {isActive ? 'Update Progress' : isUpcoming ? 'Starts Soon' : 'View Results'}
                      </Button>
                 </CardFooter>
            </Card>

             {/* Participants Section */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Participants ({challenge.participants.length})</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {challenge.participants.map(participant => (
                        <div key={participant.id} className="flex flex-col items-center gap-1 text-center w-16">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                                <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate w-full">{participant.name}</span>
                        </div>
                    ))}
                </CardContent>
                 {/* Optionally add an "Invite More" button if the user is the host */}
                 {/* <CardFooter> <Button variant="outline" size="sm">Invite More Participants</Button> </CardFooter> */}
            </Card>

             {/* Optional: Add a discussion section specific to this challenge later */}

        </main>
    </div>
  );
}
