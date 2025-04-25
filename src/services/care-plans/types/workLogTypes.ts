
export interface WorkLog {
  id: string;
  care_team_member_id: string;
  care_plan_id: string;
  caregiver_id?: string;
  caregiver_name?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  expenses?: WorkLogExpense[];
  base_rate?: number;
  rate_multiplier?: number;
  rate_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkLogExpense {
  id: string;
  work_log_id: string;
  category: string;
  description: string;
  amount: number;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

// Add missing WorkLogExpenseInput interface
export interface WorkLogExpenseInput {
  work_log_id: string;
  category: string;
  description: string;
  amount: number;
  receipt_url?: string;
}

// Add missing WorkLogInput interface
export interface WorkLogInput {
  care_team_member_id: string;
  care_plan_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'rejected';
  base_rate?: number;
  rate_multiplier?: number;
  rate_type?: string;
  shift_id?: string;
}

export interface PayrollEntry {
  id: string;
  care_plan_id: string;
  care_team_member_id: string;
  caregiver_id?: string;
  caregiver_name?: string;
  work_log_id: string;
  regular_hours: number;
  regular_rate: number;
  overtime_hours?: number;
  overtime_rate?: number;
  holiday_hours?: number;
  holiday_rate?: number;
  shadow_hours?: number;  // Add this missing property
  expense_total?: number;
  total_amount: number;
  payment_status: 'pending' | 'approved' | 'paid';
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
  entered_at?: string;
}

// Add the Holiday type that's referenced in several files
export interface Holiday {
  date: string;
  name: string;
  pay_multiplier: number;
}
