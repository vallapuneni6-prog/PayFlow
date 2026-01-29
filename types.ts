
export type PaymentType = 'RECEIVE' | 'PAY';
export type ThemeType = 'light' | 'dark';

export interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  type: PaymentType;
  dueDate: number; // Day of the month (1-31)
  category: string;
}

export interface AppState {
  payments: PaymentItem[];
  completedIds: string[]; // IDs marked as "done" for the CURRENT month only
  lastResetMonth: string; // Used to detect month transitions for auto-reset
  theme: ThemeType; // Persisted user preference
}
