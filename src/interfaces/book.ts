export type ReadingStatus = 'reading' | 'finished' | 'want-to-read';

export interface Book {
  id: string; // Use string IDs (e.g., UUID or timestamp-based)
  title: string;
  author: string;
  status: ReadingStatus;
  rating?: number; // Optional rating (e.g., 1-5)
  notes?: string; // Optional personal notes/review
  coverUrl?: string; // Optional cover image URL
  isbn?: string; // Optional ISBN
  addedDate: Date; // Track when the book was added
  pageCount?: number; // Optional page count
  authorBio?: string; // Optional short author bio
  blankPdfUrl?: string; // Optional URL to a blank PDF stored in Firebase Storage
}
