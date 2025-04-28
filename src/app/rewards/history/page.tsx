
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, History, TrendingUp, TrendingDown, Gift, LogIn } from 'lucide-react'; // Added LogIn
import { format } from 'date-fns';
import type { RewardTransaction } from '@/interfaces/reward'; // Import RewardTransaction type
import { cn } from '@/lib/utils';
import { generateSampleTransactions } from '@/lib/mock-data'; // Import mock data generator
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Interface for hydrated transaction data with Date objects
interface HydratedTransaction extends Omit<RewardTransaction, 'timestamp'> {
  timestamp: Date;
}


export default function RewardHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true); // Loading state
  const [transactions, setTransactions] = React.useState<HydratedTransaction[]>([]);
  // Removed internal loading state, use isLoading

  React.useEffect(() => {
    // Check login status on client mount
    const userProfileExists = localStorage.getItem('userProfile');
    const loggedIn = !!userProfileExists;
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
        toast({
            title: "Login Required",
            description: "Please log in to view your points history.",
            variant: "destructive",
        });
        setIsLoading(false); // Stop loading
        return; // Don't fetch data if not logged in
    }

    // Proceed if logged in
    setIsLoading(true); // Start loading transactions
    let loadedTransactions: HydratedTransaction[] = [];

    // --- Fetch transaction data (using localStorage for mock) ---
    if (typeof window !== 'undefined') {
        const storedTransactionsRaw = localStorage.getItem('mockRewardTransactions');
        if (storedTransactionsRaw) {
            try {
                const storedTransactions: RewardTransaction[] = JSON.parse(storedTransactionsRaw);
                 // Hydrate dates and sort again just in case
                loadedTransactions = storedTransactions
                    .map(t => ({
                        ...t,
                        timestamp: new Date(t.timestamp) // Convert back to Date object
                    }))
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            } catch (e) {
                console.error("Failed to parse transactions from localStorage:", e);
                // Fallback to generating default data if parsing fails
                loadedTransactions = generateSampleTransactions(15);
            }
        } else {
            // Generate default data if nothing is in localStorage
            loadedTransactions = generateSampleTransactions(15);
             // Store the generated data back into localStorage for future consistency
            const transactionsToStore = loadedTransactions.map(t => ({
                ...t,
                timestamp: t.timestamp.toISOString(), // Serialize date
            }));
             localStorage.setItem('mockRewardTransactions', JSON.stringify(transactionsToStore));
        }
    }
    // --- End Fetch ---

    setTransactions(loadedTransactions);
    setIsLoading(false); // Finish loading transactions

  }, [router, toast]); // Empty dependency array ensures this runs once on mount, add router/toast

    if (isLoading) {
     return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-lg text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
      return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
              <div className="text-center max-w-md bg-background p-8 rounded-lg shadow-lg border">
                  <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
                  <p className="text-muted-foreground mb-6">You need to be logged in to view your points history.</p>
                  <Button onClick={() => router.push('/login')} size="lg">
                      <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                  </Button>
                   <Button variant="link" size="sm" onClick={() => router.back()} className="mt-4">
                      <ArrowLeft className="mr-1 h-4 w-4" /> Back to Rewards
                  </Button>
              </div>
         </div>
      );
  }


  // Render history page only if logged in
  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
            <div className="container flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Rewards
            </Button>
            <h1 className="truncate text-xl font-semibold">Points History</h1>
            <div> {/* Placeholder for potential future actions like filtering/exporting */} </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto max-w-4xl flex-1 space-y-8 px-4 py-8">

            {/* Transaction History Card */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                         <History className="h-5 w-5 text-primary" /> Transaction Log
                    </CardTitle>
                    <CardDescription>View your recent point earnings and spending.</CardDescription>
                </CardHeader>
                <CardContent>
                    {transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right w-[100px]">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((txn) => (
                                    <TableRow key={txn.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(txn.timestamp, 'PP')} {/* Format date e.g., Jan 1, 2024 */}
                                            <br />
                                            <span className="text-[10px]">{format(txn.timestamp, 'p')}</span> {/* Format time */}
                                        </TableCell>
                                        <TableCell className="font-medium">{txn.description}</TableCell>
                                        <TableCell className={cn(
                                            "text-right font-semibold",
                                            txn.amount > 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            <span className="inline-flex items-center gap-1">
                                                {txn.amount > 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                                 {txn.amount > 0 ? `+${txn.amount}` : txn.amount}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <div className="text-center py-12 text-muted-foreground">
                             <Gift className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                             <p className="text-lg font-medium">No transaction history yet.</p>
                             <p className="text-sm">Start participating in challenges or discussions to earn points!</p>
                             <Button variant="link" asChild className="mt-2">
                                <Link href="/readers-club">Go to Readers Club</Link>
                             </Button>
                         </div>
                    )}
                </CardContent>
                 {/* Optional: Add pagination if history grows long */}
                 {/* <CardFooter> ... </CardFooter> */}
            </Card>

        </main>
    </div>
  );
}
