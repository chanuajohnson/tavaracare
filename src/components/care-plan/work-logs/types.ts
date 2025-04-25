
export interface ExpenseItem {
  category: 'medical_supplies' | 'food' | 'transportation' | 'other';
  amount: number;
  description: string;
}
