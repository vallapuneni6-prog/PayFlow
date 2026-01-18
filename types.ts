
export type PaymentType = 'RECEIVE' | 'PAY';

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
  completedIds: string[]; // IDs completed in the current active month
  lastResetMonth: string; // Tracks the last month (YYYY-MM) the app was opened
}
