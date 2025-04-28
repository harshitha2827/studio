
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

  for (let i = 1; i <= count; i++) {
    // Combine prefix and index for a unique seed per book
    const seed = seedPrefix.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i;
    const randomValue = pseudoRandom(seed);

    const randomOffset = randomValue * (new Date().getTime() - baseDate);
    const randomDate = new Date(baseDate + randomOffset);
    const status: ReadingStatus = 'want-to-read'; // Consistent status for demo
    const hasCover = (i % 10 !== 0); // Predictable cover assignment (e.g., 90%)
    const authorNum = Math.floor(i / 5) + 1; // Predictable author

    books.push({
      id: `${seedPrefix}-${i}`, // Use predictable IDs
      title: `${seedPrefix.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Book ${i}`, // Nicer title
      author: `Author ${authorNum}`,
      status: status,
      addedDate: randomDate, // Date can vary, but generation logic is deterministic per seed
      coverUrl: hasCover ? `https://picsum.photos/seed/${seedPrefix}${i}/300/400` : `https://picsum.photos/seed/defaultBook/300/400`, // Consistent URL generation
      isbn: `978-0-${Math.floor(pseudoRandom(seed + 1) * 100000000).toString().padStart(8, '0')}-${i % 10}`, // Consistent ISBN-like string
    });
  }
  // Consistent sorting by ID ensures deterministic order if dates were somehow equal
  return books.sort((a, b) => a.id.localeCompare(b.id));
};
