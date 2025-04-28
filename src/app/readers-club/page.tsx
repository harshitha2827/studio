
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, CalendarDays, MessageSquare, Target, Trophy, Users, UserCheck, Star } from 'lucide-react'; // Added Star icon
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SimpleBookCard } from '@/components/simple-book-card'; // For displaying books
import { generateSampleBooks } from '@/lib/mock-data'; // For mock data
import { Input } from '@/components/ui/input'; // For discussion input
import { Textarea } from '@/components/ui/textarea'; // For discussion input
import type { Book } from '@/interfaces/book';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import { format } from 'date-fns'; // Import date-fns format function
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components


// --- Enhanced Mock Data (Could be moved to a separate file later) ---

// Assume some base user data for hosts/participants
const mockUsers = [
  { id: 'user1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
  { id: 'user2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
  { id: 'user3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/40?u=charlie' },
  { id: 'user4', name: 'Diana', avatarUrl: 'https://i.pravatar.cc/40?u=diana' },
  { id: 'user5', name: 'Evan', avatarUrl: 'https://i.pravatar.cc/40?u=evan' },
];

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

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number; // Percentage completion (0-100)
  icon: React.ReactNode;
  startDate: Date;
  endDate: Date;
  host: typeof mockUsers[0]; // Use one of the mock users
  rewardPoints: number;
  requiredBooks?: Book[];
  participants: typeof mockUsers; // Array of participants
}

const mockChallenges: Challenge[] = [
  {
    id: 'challenge-monthly-5',
    title: 'Read 5 Books This Month',
    description: 'Challenge yourself to read at least five books of any genre before the month ends. Track your progress and discuss your reads!',
    progress: 60,
    icon: <Target className="h-5 w-5 text-primary" />,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59), // End of current month
    host: mockUsers[0], // Alice hosts
    rewardPoints: 50,
    requiredBooks: undefined, // No specific books required
    participants: [mockUsers[0], mockUsers[2], mockUsers[4]], // Alice, Charlie, Evan
  },
  {
    id: 'challenge-war-peace',
    title: 'Finish "War and Peace"',
    description: 'A marathon challenge to conquer Leo Tolstoy\'s epic novel. Share your thoughts on characters, themes, and historical context.',
    progress: 25,
    icon: <BookOpen className="h-5 w-5 text-primary" />,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Started 15 days ago
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // Ends in 45 days
    host: mockUsers[1], // Bob hosts
    rewardPoints: 100,
    requiredBooks: generateSampleBooks(1, 'war-and-peace'), // Generate a mock 'War and Peace'
    participants: [mockUsers[1], mockUsers[3]], // Bob, Diana
  },
  {
    id: 'marathon-weekend',
    title: 'Weekend Reading Marathon',
    description: 'See how many pages or books you can read over the weekend! Post your updates and cheer each other on.',
    progress: 100, // Assume completed last weekend
    icon: <Trophy className="h-5 w-5 text-yellow-500" />,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Last Friday
    endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last Sunday
    host: mockUsers[3], // Diana hosts
    rewardPoints: 25,
    requiredBooks: undefined,
    participants: mockUsers, // Everyone participated
  },
];

// Store challenges in localStorage for the detail page to potentially access
// Note: This is a workaround for mock data. Real apps would fetch from a backend.
if (typeof window !== 'undefined') {
    try {
        const challengesToStore = mockChallenges.map(c => ({
            ...c,
            startDate: c.startDate.toISOString(),
            endDate: c.endDate.toISOString(),
            icon: undefined, // Remove React node before storing
            requiredBooks: c.requiredBooks?.map(b => ({ ...b, addedDate: b.addedDate.toISOString() })), // Serialize dates
        }));
        localStorage.setItem('mockChallenges', JSON.stringify(challengesToStore));
    } catch (e) {
        console.error("Failed to store mock challenges in localStorage", e);
    }
}


// --- Other Mock Data (remains the same) ---
const mockCurrentlyReading = generateSampleBooks(5, 'readers-club-reading'); // 5 books being read
const mockDiscussionPosts = [
    { id: 'p1', userId: 'user1', userName: 'Alice', text: "Just started 'Dune'! Anyone else reading it?", timestamp: new Date(Date.now() - 3600 * 1000 * 2), avatarUrl: 'https://i.pravatar.cc/40?u=alice'},
    { id: 'p2', userId: 'user2', userName: 'Bob', text: "I finished 'Project Hail Mary' last week - amazing!", timestamp: new Date(Date.now() - 3600 * 1000 * 5), avatarUrl: 'https://i.pravatar.cc/40?u=bob'},
    { id: 'p3', userId: 'user3', userName: 'Charlie', text: "Thinking about joining the 5-book challenge!", timestamp: new Date(Date.now() - 3600 * 1000 * 8), avatarUrl: 'https://i.pravatar.cc/40?u=charlie'},
];

// Mock reward balance
const mockRewardBalance = 175;

export default function ReadersClubPage() {
    const [discussionPost, setDiscussionPost] = React.useState('');
    const [isClient, setIsClient] = React.useState(false); // State to track client mount

    React.useEffect(() => {
        setIsClient(true); // Set client state to true once mounted
    }, []);

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!discussionPost.trim()) return;
        console.log("Posting to discussion:", discussionPost);
        // TODO: Implement actual post submission logic
        setDiscussionPost(''); // Clear input
        // Maybe add optimistic update to mockDiscussionPosts
    };

    // Function to scroll to the challenges section
    const scrollToChallenges = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent default link behavior
        const challengesSection = document.getElementById('challenges-section');
        if (challengesSection) {
            challengesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };


  return (
    <TooltipProvider> {/* Wrap the page with TooltipProvider */}
      <div className="flex min-h-screen flex-col bg-secondary/30">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <div className="container flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Readers Club</h1>
             {/* Header Actions: Challenges & Reward Icons */}
             <div className="flex items-center gap-1"> {/* Reduced gap slightly */}
                {/* Reward Balance Button with Tooltip */}
                 <Tooltip>
                    <TooltipTrigger asChild>
                       <Button
                         variant="ghost"
                         size="icon"
                         aria-label={`Reward Balance: ${mockRewardBalance} points`}
                         className="text-yellow-500 hover:text-yellow-600"
                         // onClick={() => console.log("Navigate to rewards page?")} // Optional: Add click handler later
                       >
                         <Star className="h-5 w-5" />
                       </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reward Balance: {mockRewardBalance} points</p>
                    </TooltipContent>
                 </Tooltip>

                {/* Challenges Icon Button */}
               <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={scrollToChallenges}
                       aria-label="View reading challenges and marathons"
                       asChild // Use asChild to allow Link behavior
                       >
                       <Link href="#challenges-section"> {/* Link to the anchor ID */}
                           <Trophy className="h-5 w-5 text-primary" />
                       </Link>
                     </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                     <p>View Challenges</p>
                  </TooltipContent>
               </Tooltip>

               {/* Other icons could go here */}
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex-1 space-y-8 px-4 py-8">

          {/* Currently Reading Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> What We're Reading</CardTitle>
              <CardDescription>See the books members are currently diving into.</CardDescription>
            </CardHeader>
            <CardContent>
               {mockCurrentlyReading.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                      {mockCurrentlyReading.map(book => (
                          <SimpleBookCard key={book.id} book={book} className="w-full"/>
                      ))}
                  </div>
              ) : (
                  <p className="text-muted-foreground text-sm">No books currently being read by the club.</p>
              )}
            </CardContent>
          </Card>

          {/* Discussion Forum Section */}
          <Card className="shadow-lg">
              <CardHeader>
                  <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" /> Club Discussion</CardTitle>
                  <CardDescription>Chat about books, challenges, and more.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {/* Post Input */}
                  <form onSubmit={handlePostSubmit} className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 border mt-1">
                           {/* TODO: Use actual logged-in user avatar */}
                          <AvatarImage src={mockUsers[0].avatarUrl} alt={mockUsers[0].name} />
                          <AvatarFallback>{getInitials(mockUsers[0].name)}</AvatarFallback>
                      </Avatar>
                      <Textarea
                          placeholder="Start a discussion..."
                          value={discussionPost}
                          onChange={(e) => setDiscussionPost(e.target.value)}
                          rows={2}
                          className="flex-1 resize-none"
                       />
                      <Button type="submit" size="sm" disabled={!discussionPost.trim()} className="mt-1">Post</Button>
                  </form>

                  <hr className="my-4 border-border" />

                  {/* Existing Posts */}
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                      {mockDiscussionPosts.map(post => (
                          <div key={post.id} className="flex items-start gap-3">
                               <Avatar className="h-8 w-8 border">
                                  <AvatarImage src={post.avatarUrl} alt={post.userName} />
                                  <AvatarFallback>{getInitials(post.userName)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 rounded-md border bg-muted/30 p-3">
                                  <p className="text-sm font-medium text-foreground">{post.userName}</p>
                                  <p className="mt-1 text-sm text-foreground/90">{post.text}</p>
                                  <p className="mt-1 text-xs text-muted-foreground/70">
                                      {/* Format date/time consistently only on the client */}
                                      {isClient ? `${format(post.timestamp, 'p')} - ${format(post.timestamp, 'P')}` : 'Loading date...'}
                                  </p>
                              </div>
                          </div>
                      ))}
                       {mockDiscussionPosts.length === 0 && (
                           <p className="text-muted-foreground text-sm text-center py-4">No discussion posts yet.</p>
                      )}
                  </div>
              </CardContent>
          </Card>

          {/* Challenges & Marathons Section - Added ID here */}
          <Card id="challenges-section" className="shadow-lg scroll-mt-20"> {/* Added scroll-mt for header offset */}
            <CardHeader>
              <CardTitle className="flex items-center"><Trophy className="mr-2 h-5 w-5 text-primary" /> Challenges & Marathons</CardTitle>
              <CardDescription>Track group goals and participate in reading events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockChallenges.length > 0 ? (
                  mockChallenges.map(challenge => (
                      <div key={challenge.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border rounded-md bg-muted/40">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                              <div className="text-primary flex-shrink-0">
                                  {challenge.icon}
                              </div>
                              <div className="flex-1">
                                  <p className="font-medium text-foreground">{challenge.title}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{challenge.progress}% complete</p>
                              </div>
                          </div>
                          <div className="w-full sm:flex-1">
                               <Progress value={challenge.progress} aria-label={`${challenge.title} progress`} className="h-2"/>
                          </div>
                          {/* Link to the challenge detail page */}
                          <Button variant="outline" size="sm" asChild className="w-full mt-2 sm:w-auto sm:mt-0 sm:ml-auto">
                             <Link href={`/challenge/${challenge.id}`}>
                                 View Details
                             </Link>
                          </Button>
                      </div>
                  ))
              ) : (
                  <p className="text-muted-foreground text-sm">No active challenges or marathons.</p>
              )}
            </CardContent>
             <CardFooter>
                  <Button variant="secondary">
                      <CalendarDays className="mr-2 h-4 w-4" /> Create New Challenge/Event
                  </Button>
              </CardFooter>
          </Card>

          {/* Members Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Club Members ({mockUsers.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {mockUsers.map(member => (
                <div key={member.id} className="flex flex-col items-center gap-1 text-center w-16">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate w-full">{member.name}</span>
                </div>
              ))}
            </CardContent>
             <CardFooter>
                  <Button variant="outline" size="sm">Invite Members</Button>
              </CardFooter>
          </Card>

        </main>
      </div>
    </TooltipProvider>
  );
}


