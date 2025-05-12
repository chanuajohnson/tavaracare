
import type { Holiday } from './types/workLogTypes';

// US holidays (simplified example)
export const HOLIDAYS: Holiday[] = [
  { date: '2024-01-01', name: 'New Year\'s Day', pay_multiplier: 1.5 },
  { date: '2024-07-04', name: 'Independence Day', pay_multiplier: 1.5 },
  { date: '2024-12-25', name: 'Christmas Day', pay_multiplier: 2.0 },
];

export type { Holiday };
