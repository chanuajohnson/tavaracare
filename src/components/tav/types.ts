
export interface TavaraState {
  isOpen: boolean;
  isMinimized: boolean;
  hasUnreadNudges: boolean;
  currentRole: 'guest' | 'family' | 'professional' | 'community' | 'admin' | null;
}

export interface AssistantNudge {
  id: string;
  user_id?: string;
  message: string;
  context: {
    role?: string;
    progress_stage?: string;
    action_type?: string;
    [key: string]: any;
  };
  sender: 'TAV' | 'Chan';
  status: 'sent' | 'seen' | 'clicked';
  created_at: string;
  updated_at: string;
}

export interface ProgressContext {
  role: string;
  completionPercentage: number;
  currentStep: string;
  totalSteps: number;
  nextAction?: string;
  isStalled?: boolean;
}
