
export type CoverageRequestStatus = 'pending_family_approval' | 'approved' | 'denied' | 'expired';
export type CoverageClaimStatus = 'pending_family_confirmation' | 'confirmed' | 'declined';
export type ShiftNotificationType = 'reminder_2_days' | 'reminder_night_before' | 'coverage_available' | 'assignment_confirmed' | 'time_off_request' | 'coverage_claimed';
export type DeliveryStatus = 'sent' | 'delivered' | 'failed' | 'pending';
export type CoverageReason = 'sick' | 'personal' | 'emergency' | 'vacation' | 'other';

export interface ShiftCoverageRequest {
  id: string;
  shift_id: string;
  requesting_caregiver_id: string;
  reason: CoverageReason;
  request_message?: string;
  status: CoverageRequestStatus;
  requested_at: string;
  family_response_at?: string;
  family_response_by?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftCoverageClaim {
  id: string;
  coverage_request_id: string;
  claiming_caregiver_id: string;
  claimed_at: string;
  status: CoverageClaimStatus;
  family_confirmed_at?: string;
  family_confirmed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftNotification {
  id: string;
  shift_id?: string;
  coverage_request_id?: string;
  notification_type: ShiftNotificationType;
  sent_to: string;
  sent_at: string;
  delivery_status: DeliveryStatus;
  whatsapp_message_id?: string;
  message_content?: string;
  created_at: string;
}

export interface WhatsAppMessageLog {
  id: string;
  message_id?: string;
  phone_number: string;
  user_id?: string;
  direction: 'incoming' | 'outgoing';
  message_type: 'text' | 'template' | 'button_reply';
  content: string;
  template_name?: string;
  processed: boolean;
  processed_at?: string;
  created_at: string;
}

export interface CoverageRequestInput {
  shift_id: string;
  reason: CoverageReason;
  request_message?: string;
}

export interface ClaimShiftInput {
  coverage_request_id: string;
}

export interface ApprovalInput {
  request_id: string;
  approved: boolean;
  response_message?: string;
}
