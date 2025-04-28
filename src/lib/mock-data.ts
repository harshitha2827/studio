
import type { Book, ReadingStatus } from "@/interfaces/book";
import type { RewardTransaction, TransactionType } from "@/interfaces/reward"; // Import Reward types

// --- !!! IMPORTANT: Replace this placeholder URL !!! ---
// This MUST match the placeholder URL used in add-book-form.tsx and bookshelf.tsx
// Upload your blank PDF to Firebase Storage and paste the Download URL here.
// Example: const placeholderBlankPdfUrl = "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/blank.pdf?alt=media&token=your-token";
const placeholderBlankPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

/**
 * Generates a list of sample books for demonstration purposes.
 * Ensures deterministic output based on the seed prefix.
 * @param count The number of books to generate.
 * @param seedPrefix A prefix string to ensure deterministic randomness based on category/seed.
 * @returns An array of Book objects.
 */
export const generateSampleBooks = (count: number, seedPrefix: string): Book[] => {
  const books: Book[] = [];
  const baseDate = new Date("2023-01-01").getTime(); // Use a fixed base date for reproducibility

  // Simple pseudo-random number generator based on seed prefix + index for consistency
  const pseudoRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }


  for (let i = 1; i <= count; i++) {
    // Combine prefix and index for a unique seed per book
    const seed = seedPrefix.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i;
    const randomValue = pseudoRandom(seed);

    const randomOffset = randomValue * (new Date("2024-01-01").getTime() - baseDate); // Use a fixed future date for consistency
    const randomDate = new Date(baseDate + randomOffset);
    const status: ReadingStatus = ['reading', 'finished', 'want-to-read'][Math.floor(pseudoRandom(seed + 3) * 3)] as ReadingStatus;
    const hasCover = pseudoRandom(seed + 9) > 0.1; // 90% chance of cover
    const authorNum = Math.floor(pseudoRandom(seed + 4) * 50) + 1;
    const pageCount = Math.floor(pseudoRandom(seed + 2) * 400) + 150;
    const authorName = `Author ${authorNum}`;
    const hasRating = status === 'finished' && pseudoRandom(seed + 5) > 0.3;
    const rating = hasRating ? Math.floor(pseudoRandom(seed + 6) * 5) + 1 : undefined;
    const hasNotes = pseudoRandom(seed + 7) > 0.5;
    const notes = hasNotes ? `This is a sample note for book ${i} in the '${seedPrefix}' category. It reflects some deterministically generated thoughts.` : undefined;
    const bookId = `${seedPrefix}-${i}`; // Deterministic ID

    books.push({
      id: bookId, // Use deterministic ID
      title: `${seedPrefix.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Book ${i}`,
      author: authorName,
      status: status,
      rating: rating,
      addedDate: randomDate, // Date is generated deterministically based on seed
      coverUrl: hasCover ? `https://picsum.photos/seed/${bookId}/300/400` : undefined, // Use bookId for consistent cover URL
      isbn: `978-0-${Math.floor(pseudoRandom(seed + 1) * 100000000).toString().padStart(8, '0')}-${i % 10}`,
      pageCount: pageCount,
      authorBio: `${authorName} is a renowned author known for their captivating stories in the ${seedPrefix.split('-')[0] || 'various'} genre. Born on a deterministically generated date, they enjoy predictable hobbies like reading code.`,
      notes: notes,
      // Add the placeholder URL to every mock book record
      blankPdfUrl: placeholderBlankPdfUrl,
    });
  }
  // Sort by ID primarily to ensure stable order during hydration, then by date for display preference
  return books.sort((a, b) => {
    // Simple string comparison for IDs generated like 'prefix-N'
    const [prefixA, numA] = a.id.split('-');
    const [prefixB, numB] = b.id.split('-');
    if (prefixA !== prefixB) {
        return prefixA.localeCompare(prefixB);
    }
    const idNumA = parseInt(numA, 10);
    const idNumB = parseInt(numB, 10);
    if (idNumA !== idNumB) {
        return idNumA - idNumB;
    }

    // Fallback sort by date if IDs were somehow identical or parsing failed
    return b.addedDate.getTime() - a.addedDate.getTime();
  });
};


/**
 * Generates a list of sample reward transactions.
 * @param count The number of transactions to generate.
 * @returns An array of RewardTransaction objects.
 */
export const generateSampleTransactions = (count: number): RewardTransaction[] => {
    const transactions: RewardTransaction[] = [];
    const descriptionsEarn = [
        "Completed 'Read 5 Books' Challenge",
        "Weekly Discussion Participation Bonus",
        "Finished 'War and Peace' Marathon",
        "Milestone: Read 50 Books",
        "Weekend Reading Marathon Reward",
        "Joined Readers Club",
    ];
    const descriptionsSpend = [
        "Entered 'Fantasy Quiz'",
        "Hosted 'Mystery Readers' Challenge",
        "Purchased Profile Badge: Avid Reader", // Future feature example
        "Entered 'Classics Trivia'",
    ];
    const baseDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(); // Start 30 days ago

    // Simple pseudo-random number generator for consistency
    const pseudoRandom = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }

    for (let i = 1; i <= count; i++) {
        const seed = 12345 + i; // Simple seed
        const randomValue = pseudoRandom(seed);
        const type: TransactionType = pseudoRandom(seed + 1) > 0.4 ? 'earn' : 'spend'; // More earns than spends
        const dateOffset = randomValue * (Date.now() - baseDate);
        const timestamp = new Date(baseDate + dateOffset);
        let description = '';
        let amount = 0;

        if (type === 'earn') {
            description = descriptionsEarn[Math.floor(pseudoRandom(seed + 2) * descriptionsEarn.length)];
            amount = [10, 25, 50, 100][Math.floor(pseudoRandom(seed + 3) * 4)];
        } else {
            // Ensure there are spend descriptions before trying to access
            if (descriptionsSpend.length > 0) {
              description = descriptionsSpend[Math.floor(pseudoRandom(seed + 4) * descriptionsSpend.length)];
              amount = [-15, -30, -50][Math.floor(pseudoRandom(seed + 5) * 3)]; // Spend amounts (negative)
            } else {
              // Fallback if descriptionsSpend is empty
              description = "Generic Spend Action";
              amount = -20;
            }
        }

        transactions.push({
            id: `txn-${seed}-${timestamp.getTime()}`,
            timestamp: timestamp,
            description: description,
            type: type,
            amount: amount,
        });
    }

    // Sort by timestamp, most recent first
    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Store transactions in localStorage for the history page
if (typeof window !== 'undefined') {
    try {
        const existingTransactions = localStorage.getItem('mockRewardTransactions');
        if (!existingTransactions) {
            const mockTransactions = generateSampleTransactions(15); // Generate 15 sample transactions
            const transactionsToStore = mockTransactions.map(t => ({
                ...t,
                timestamp: t.timestamp.toISOString(), // Serialize date
            }));
            localStorage.setItem('mockRewardTransactions', JSON.stringify(transactionsToStore));
        }
    } catch (e) {
        console.error("Failed to store mock transactions in localStorage", e);
    }
}
