
export type PaymentType = 'RECEIVE' | 'PAY';

export interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  type: PaymentType;
  dueDate: number; // Day of the month (1-31)
  category: string;
}

export interface MonthRecord {
  monthKey: string; // YYYY-MM
  completedIds: string[];
}

export interface AppState {
  payments: PaymentItem[];
  history: MonthRecord[];
}
