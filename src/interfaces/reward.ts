
export type TransactionType = 'earn' | 'spend';

export interface RewardTransaction {
  id: string;
  timestamp: Date;
  description: string; // e.g., "Completed 'Read 5 Books' Challenge", "Entered 'Sci-Fi Quiz'"
  type: TransactionType;
  amount: number; // Positive for earn, negative for spend (or always positive and use type)
}
