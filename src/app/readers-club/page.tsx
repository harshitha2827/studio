
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, CalendarDays, MessageSquare, Target, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SimpleBookCard } from '@/components/simple-book-card'; // For displaying books
import { generateSampleBooks } from '@/lib/mock-data'; // For mock data
import { Input } from '@/components/ui/input'; // For discussion input
import { Textarea } from '@/components/ui/textarea'; // For discussion input

// Mock Data (replace with actual data fetching)
const mockCurrentlyReading = generateSampleBooks(5, 'readers-club-reading'); // 5 books being read
const mockMembers = [
  { id: 'user1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/40?u=alice' },
  { id: 'user2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/40?u=bob' },
  { id: 'user3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/40?u=charlie' },
  { id: 'user4', name: 'Diana', avatarUrl: 'https://i.pravatar.cc/40?u=diana' },
];
const mockChallenges = [
  { id: 'c1', title: 'Read 5 Books This Month', progress: 60, icon: <Target className="h-5 w-5 text-primary" /> },
  { id: 'c2', title: 'Finish "War and Peace"', progress: 25, icon: <BookOpen className="h-5 w-5 text-primary" /> },
  { id: 'm1', title: 'Weekend Reading Marathon', progress: 100, icon: <Trophy className="h-5 w-5 text-yellow-500" /> },
];
const mockDiscussionPosts = [
    { id: 'p1', userId: 'user1', userName: 'Alice', text: "Just started 'Dune'! Anyone else reading it?", timestamp: new Date(Date.now() - 3600 * 1000 * 2), avatarUrl: 'https://i.pravatar.cc/40?u=alice'},
    { id: 'p2', userId: 'user2', userName: 'Bob', text: "I finished 'Project Hail Mary' last week - amazing!", timestamp: new Date(Date.now() - 3600 * 1000 * 5), avatarUrl: 'https://i.pravatar.cc/40?u=bob'},
    { id: 'p3', userId: 'user3', userName: 'Charlie', text: "Thinking about joining the 5-book challenge!", timestamp: new Date(Date.now() - 3600 * 1000 * 8), avatarUrl: 'https://i.pravatar.cc/40?u=charlie'},
];

export default function ReadersClubPage() {
    const [discussionPost, setDiscussionPost] = React.useState('');

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!discussionPost.trim()) return;
        console.log("Posting to discussion:", discussionPost);
        // TODO: Implement actual post submission logic
        setDiscussionPost(''); // Clear input
        // Maybe add optimistic update to mockDiscussionPosts
    };

    const getInitials = (name: string | undefined): string => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        return names
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
      };

  return (
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
          {/* Add Header Actions like "Create Challenge" or "Invite Members" later */}
          <div></div>
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
                        <AvatarImage src={mockMembers[0].avatarUrl} alt={mockMembers[0].name} />
                        <AvatarFallback>{getInitials(mockMembers[0].name)}</AvatarFallback>
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
                                    {post.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {post.timestamp.toLocaleDateString()}
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

        {/* Challenges & Marathons Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Trophy className="mr-2 h-5 w-5 text-primary" /> Challenges & Marathons</CardTitle>
            <CardDescription>Track group goals and participate in reading events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockChallenges.length > 0 ? (
                mockChallenges.map(challenge => (
                    <div key={challenge.id} className="flex items-center gap-4 p-3 border rounded-md bg-muted/40">
                        <div className="text-primary">
                            {challenge.icon}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-foreground">{challenge.title}</p>
                             {/* Simple progress bar (replace with actual Progress component later if needed) */}
                            <div className="h-2 mt-1 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${challenge.progress}%` }}></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{challenge.progress}% complete</p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
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
            <CardTitle className="flex items-center">Club Members ({mockMembers.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {mockMembers.map(member => (
              <div key={member.id} className="flex flex-col items-center gap-1">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{member.name}</span>
              </div>
            ))}
          </CardContent>
           <CardFooter>
                <Button variant="outline" size="sm">Invite Members</Button>
            </CardFooter>
        </Card>

      </main>
    </div>
  );
}
