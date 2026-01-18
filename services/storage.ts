
import { AppState, PaymentItem, MonthRecord } from '../types';

const STORAGE_KEY = 'payflow_data';

const DEFAULT_STATE: AppState = {
  payments: [
    { id: '1', title: 'Monthly Salary', amount: 5000, type: 'RECEIVE', dueDate: 1, category: 'Work' },
    { id: '2', title: 'House Rent', amount: 1500, type: 'PAY', dueDate: 5, category: 'Housing' },
    { id: '3', title: 'Internet Bill', amount: 60, type: 'PAY', dueDate: 10, category: 'Utilities' },
  ],
  history: []
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_STATE;
  try {
    return JSON.parse(saved);
  } catch (e) {
    return DEFAULT_STATE;
  }
};

export const getMonthKey = (date: Date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
