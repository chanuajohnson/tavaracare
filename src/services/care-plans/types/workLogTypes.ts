export interface WorkLog {
  id: string;
  care_team_member_id: string;
  care_plan_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | string; // Added string to make it compatible with the data from Supabase
  created_at?: string;
  updated_at?: string;
  caregiver_name?: string;
  shift_id?: string;
  expenses?: WorkLogExpense[];
  rate_type?: 'regular' | 'overtime' | 'holiday';
  base_rate?: number;
  rate_multiplier?: number;
}

export interface WorkLogExpense {
  id: string;
  work_log_id: string;
  category: 'medical_supplies' | 'food' | 'transportation' | 'other';
  amount: number;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface PayrollEntry {
  id: string;
  work_log_id: string;
  care_team_member_id: string;
  care_plan_id: string;
  regular_hours: number;
  overtime_hours: number;
  regular_rate: number;
  overtime_rate?: number;
  holiday_hours?: number;
  holiday_rate?: number;
  expense_total?: number;
  total_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  caregiver_name?: string;
  pay_period_start?: string;
  pay_period_end?: string;
}

export interface WorkLogInput {
  care_team_member_id: string;
  care_plan_id: string;
  shift_id?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  base_rate?: number;
  rate_multiplier?: number;
}

export interface WorkLogExpenseInput {
  work_log_id: string;
  category: 'medical_supplies' | 'food' | 'transportation' | 'other';
  amount: number;
  description: string;
  receipt_url?: string;
}

export interface Holiday {
  date: string;
  name: string;
  pay_multiplier: number;
}
