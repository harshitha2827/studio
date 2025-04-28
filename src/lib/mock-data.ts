
import type { Book, ReadingStatus } from "@/interfaces/book";

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

   // --- !!! IMPORTANT: Replace this placeholder URL !!! ---
   // Upload your blank PDF to Firebase Storage and paste the Download URL here.
   const placeholderBlankPdfUrl = "https://firebasestorage.googleapis.com/v0/b/your-project-id.appspot.com/o/blank.pdf?alt=media&token=your-token";
   // If you don't have one yet, you can use a public sample PDF for testing:
   // const placeholderBlankPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";


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
