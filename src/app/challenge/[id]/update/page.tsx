
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BookOpenCheck, LogIn } from 'lucide-react'; // Added LogIn
import { useToast } from '@/hooks/use-toast';
import type { Book } from '@/interfaces/book';

// Re-define the StoredChallenge interface to match localStorage structure
interface StoredChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  host: { id: string; name: string; avatarUrl?: string };
  rewardPoints: number;
  requiredBooks?: (Omit<Book, 'addedDate'> & { addedDate: string })[];
  participants: { id: string; name: string; avatarUrl?: string }[];
}

// Mock function to generate chapters based on page count or a fixed number
const generateMockChapters = (book: Book | undefined): { id: string; title: string }[] => {
    if (!book) return [];
    // Simple logic: 1 chapter per 25 pages, or minimum 5, max 50
    const pages = book.pageCount || 250; // Default to 250 pages if none specified
    const count = Math.max(5, Math.min(50, Math.ceil(pages / 25)));
    return Array.from({ length: count }, (_, i) => ({
        id: `${book.id}-chap-${i + 1}`,
        title: `Chapter ${i + 1}`,
    }));
};

export default function UpdateChallengeProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const challengeId = typeof params.id === 'string' ? params.id : '';

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Loading state
  const [challengeTitle, setChallengeTitle] = React.useState<string>('');
  const [chapters, setChapters] = React.useState<{ bookTitle: string; bookId: string; chapters: { id: string; title: string }[] }[]>([]);
  const [checkedChapters, setCheckedChapters] = React.useState<Record<string, boolean>>({});
  // Removed internal loading state, use isLoading for auth check first

  React.useEffect(() => {
    // Check login status on client mount
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);

     if (!loggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to update challenge progress.",
            variant: "destructive",
        });
        setIsLoading(false); // Stop loading
        return; // Don't fetch data if not logged in
     }

    // Proceed if logged in
    if (!challengeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true); // Start loading challenge data
    let foundChallenge: StoredChallenge | null = null;

    // --- Fetch challenge data (using localStorage for mock) ---
    if (typeof window !== 'undefined') {
      const storedChallengesRaw = localStorage.getItem('mockChallenges');
      if (storedChallengesRaw) {
        try {
          const storedChallenges: StoredChallenge[] = JSON.parse(storedChallengesRaw);
          foundChallenge = storedChallenges.find(c => c.id === challengeId) ?? null;
        } catch (e) {
          console.error("Failed to parse challenges from localStorage:", e);
        }
      }

      // Load saved progress if available
      const savedProgressRaw = localStorage.getItem(`challengeProgress_${challengeId}`);
      if (savedProgressRaw) {
          try {
              const savedChecked = JSON.parse(savedProgressRaw);
              if (typeof savedChecked === 'object' && savedChecked !== null) {
                 setCheckedChapters(savedChecked);
              }
          } catch (e) {
              console.error("Failed to parse saved progress:", e);
          }
      }
    }
    // --- End Fetch ---

    if (foundChallenge) {
       setChallengeTitle(foundChallenge.title);
       // Process required books to generate chapter lists
       const bookChapters = (foundChallenge.requiredBooks ?? [])
           .map(book => ({
               bookTitle: book.title,
               bookId: book.id,
               chapters: generateMockChapters(book), // Generate chapters for each book
           }))
           .filter(bc => bc.chapters.length > 0); // Only include books with chapters

       setChapters(bookChapters);

    } else {
       // Handle challenge not found (maybe redirect or show error)
       console.warn(`Challenge with ID ${challengeId} not found.`);
       toast({ title: "Challenge Not Found", variant: "destructive" });
    }
    setIsLoading(false); // Finish loading challenge data
  }, [challengeId, toast, router]); // Add router to dependencies

  const handleCheckboxChange = (chapterId: string) => {
    setCheckedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleSaveChanges = () => {
    // --- Save progress to localStorage ---
    if (typeof window !== 'undefined') {
        localStorage.setItem(`challengeProgress_${challengeId}`, JSON.stringify(checkedChapters));
    }

    // --- Update overall challenge progress (mock implementation) ---
    const totalChapters = chapters.reduce((sum, book) => sum + book.chapters.length, 0);
    const completedChapters = Object.values(checkedChapters).filter(Boolean).length;
    const newProgress = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

     if (typeof window !== 'undefined') {
        const storedChallengesRaw = localStorage.getItem('mockChallenges');
        if (storedChallengesRaw) {
            try {
                let storedChallenges: StoredChallenge[] = JSON.parse(storedChallengesRaw);
                const challengeIndex = storedChallenges.findIndex(c => c.id === challengeId);
                if (challengeIndex > -1) {
                    storedChallenges[challengeIndex].progress = newProgress;
                    // Resave the updated challenges list
                    localStorage.setItem('mockChallenges', JSON.stringify(storedChallenges));
                }
            } catch (e) {
                console.error("Failed to update challenge progress in localStorage:", e);
            }
        }
     }
    // --- End Update ---

    toast({
      title: 'Progress Saved',
      description: `Your progress for "${challengeTitle}" has been updated. (${newProgress}% complete)`,
    });
    router.back(); // Go back to the challenge detail page
  };

  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <p className="text-lg text-muted-foreground">Loading progress tracker...</p>
        </div>
    );
  }

  if (!isLoggedIn) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
              <div className="text-center max-w-md bg-background p-8 rounded-lg shadow-lg border">
                  <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
                  <p className="text-muted-foreground mb-6">You need to be logged in to update challenge progress.</p>
                  <Button onClick={() => router.push('/login')} size="lg">
                      <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                  </Button>
                  <Button variant="link" size="sm" onClick={() => router.back()} className="mt-4">
                      <ArrowLeft className="mr-1 h-4 w-4" /> Back to Challenge Details
                  </Button>
              </div>
         </div>
      );
  }


   if (!chapters || chapters.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary/30">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <div className="container flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Challenge
            </Button>
            <h1 className="truncate text-xl font-semibold">Update Progress</h1>
            <div></div>
          </div>
        </header>
        <main className="container mx-auto max-w-2xl flex-1 px-4 py-8">
          <Card className="shadow-lg text-center">
             <CardHeader>
                <CardTitle>No Trackable Chapters</CardTitle>
             </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This challenge doesn't seem to have specific books or chapters to track progress against.</p>
              <Button onClick={() => router.back()} className="mt-6">Back to Challenge Details</Button>
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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Challenge
          </Button>
          <h1 className="truncate text-xl font-semibold">Update Progress</h1>
           {/* Save Button */}
           <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl flex-1 space-y-8 px-4 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><BookOpenCheck className="mr-2 h-5 w-5 text-primary" />{challengeTitle}</CardTitle>
            <CardDescription>Mark the chapters you have completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {chapters.map((bookData) => (
               <div key={bookData.bookId} className="space-y-3 rounded-md border p-4 bg-muted/20">
                   <h3 className="font-semibold text-lg text-foreground">{bookData.bookTitle}</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                       {bookData.chapters.map((chapter) => (
                           <div key={chapter.id} className="flex items-center space-x-2">
                               <Checkbox
                                   id={chapter.id}
                                   checked={!!checkedChapters[chapter.id]}
                                   onCheckedChange={() => handleCheckboxChange(chapter.id)}
                               />
                               <Label
                                   htmlFor={chapter.id}
                                   className="text-sm font-normal cursor-pointer text-foreground/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                               >
                                   {chapter.title}
                               </Label>
                           </div>
                       ))}
                   </div>
               </div>
            ))}
          </CardContent>
           <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
           </CardFooter>
        </Card>
      </main>
    </div>
  );
}
