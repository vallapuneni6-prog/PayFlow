
export type PaymentType = 'RECEIVE' | 'PAY';
export type ThemeType = 'light' | 'dark';

export interface AuthUser {
  name: string;
  email: string;
  picture: string;
  id: string;
}

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
  completedIds: string[]; 
  lastResetMonth: string;
  theme: ThemeType;
  user?: AuthUser | null;
}
