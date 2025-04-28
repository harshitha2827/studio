
import type { Book } from './book';
import type { MockUser } from './user';

export interface Recommendation {
  id: string;
  sender: MockUser;
  recipient: MockUser;
  book: Book;
  message?: string;
  timestamp: Date;
  liked?: boolean; // Track if the recipient liked the recommendation
}
