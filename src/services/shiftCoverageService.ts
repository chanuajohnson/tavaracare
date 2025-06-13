
import { supabase } from '@/lib/supabase';
import { 
  ShiftCoverageRequest, 
  ShiftCoverageClaim, 
  CoverageRequestInput, 
  ClaimShiftInput, 
  ApprovalInput,
  ShiftNotification 
} from '@/types/shiftCoverage';
import { toast } from 'sonner';

export const shiftCoverageService = {
  // Create a time-off request
  async createCoverageRequest(input: CoverageRequestInput): Promise<{ success: boolean; request?: ShiftCoverageRequest; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shift_coverage_requests')
        .insert({
          shift_id: input.shift_id,
          requesting_caregiver_id: user.id,
          reason: input.reason,
          request_message: input.request_message,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger notification to family
      await this.notifyFamilyOfRequest(data.id);
      
      toast.success('Time-off request submitted successfully');
      return { success: true, request: data as ShiftCoverageRequest };
    } catch (error: any) {
      console.error('Error creating coverage request:', error);
      toast.error('Failed to submit time-off request');
      return { success: false, error: error.message };
    }
  },

  // Get coverage requests for a caregiver
  async getCoverageRequestsForCaregiver(caregiverId: string): Promise<ShiftCoverageRequest[]> {
    try {
      const { data, error } = await supabase
        .from('shift_coverage_requests')
        .select(`
          *,
          shift:care_shifts(title, start_time, end_time, family_id),
          requesting_caregiver:profiles!requesting_caregiver_id(full_name)
        `)
        .eq('requesting_caregiver_id', caregiverId)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ShiftCoverageRequest[];
    } catch (error) {
      console.error('Error fetching coverage requests:', error);
      return [];
    }
  },

  // Get pending coverage requests for family approval
  async getPendingRequestsForFamily(familyId: string): Promise<ShiftCoverageRequest[]> {
    try {
      const { data, error } = await supabase
        .from('shift_coverage_requests')
        .select(`
          *,
          shift:care_shifts!inner(title, start_time, end_time, family_id),
          requesting_caregiver:profiles!requesting_caregiver_id(full_name, phone_number)
        `)
        .eq('shift.family_id', familyId)
        .eq('status', 'pending_family_approval')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ShiftCoverageRequest[];
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return [];
    }
  },

  // Approve or deny a coverage request
  async respondToCoverageRequest(input: ApprovalInput): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const status = input.approved ? 'approved' : 'denied';
      
      const { error } = await supabase
        .from('shift_coverage_requests')
        .update({
          status,
          family_response_at: new Date().toISOString(),
          family_response_by: user.id,
        })
        .eq('id', input.request_id);

      if (error) throw error;

      if (input.approved) {
        // Broadcast to care team members
        await this.broadcastAvailableShift(input.request_id);
      }

      toast.success(`Request ${input.approved ? 'approved' : 'denied'} successfully`);
      return { success: true };
    } catch (error: any) {
      console.error('Error responding to coverage request:', error);
      toast.error('Failed to respond to request');
      return { success: false, error: error.message };
    }
  },

  // Claim an available shift
  async claimShift(input: ClaimShiftInput): Promise<{ success: boolean; claim?: ShiftCoverageClaim; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('shift_coverage_claims')
        .insert({
          coverage_request_id: input.coverage_request_id,
          claiming_caregiver_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Notify family of the claim
      await this.notifyFamilyOfClaim(data.id);
      
      toast.success('Shift claimed successfully! Awaiting family confirmation');
      return { success: true, claim: data as ShiftCoverageClaim };
    } catch (error: any) {
      console.error('Error claiming shift:', error);
      toast.error('Failed to claim shift');
      return { success: false, error: error.message };
    }
  },

  // Get available shifts for a care team member
  async getAvailableShifts(caregiverId: string): Promise<ShiftCoverageRequest[]> {
    try {
      const { data, error } = await supabase
        .from('shift_coverage_requests')
        .select(`
          *,
          shift:care_shifts!inner(
            title, start_time, end_time, location, care_plan_id,
            care_plan:care_plans(title)
          ),
          requesting_caregiver:profiles!requesting_caregiver_id(full_name),
          claims:shift_coverage_claims(id, claiming_caregiver_id)
        `)
        .eq('status', 'approved')
        .neq('requesting_caregiver_id', caregiverId)
        .filter('claims.claiming_caregiver_id', 'is', null)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ShiftCoverageRequest[];
    } catch (error) {
      console.error('Error fetching available shifts:', error);
      return [];
    }
  },

  // Get pending claims for family confirmation
  async getPendingClaimsForFamily(familyId: string): Promise<ShiftCoverageClaim[]> {
    try {
      const { data, error } = await supabase
        .from('shift_coverage_claims')
        .select(`
          *,
          coverage_request:shift_coverage_requests!inner(
            shift_id, 
            shift:care_shifts!inner(title, start_time, end_time, family_id)
          ),
          claiming_caregiver:profiles!claiming_caregiver_id(full_name, phone_number)
        `)
        .eq('coverage_request.shift.family_id', familyId)
        .eq('status', 'pending_family_confirmation')
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ShiftCoverageClaim[];
    } catch (error) {
      console.error('Error fetching pending claims:', error);
      return [];
    }
  },

  // Confirm or decline a claim
  async respondToClaim(claimId: string, confirmed: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const status = confirmed ? 'confirmed' : 'declined';
      
      const { error } = await supabase
        .from('shift_coverage_claims')
        .update({
          status,
          family_confirmed_at: new Date().toISOString(),
          family_confirmed_by: user.id,
        })
        .eq('id', claimId);

      if (error) throw error;

      if (confirmed) {
        // Update the original shift with new caregiver
        await this.updateShiftAssignment(claimId);
      }

      toast.success(`Claim ${confirmed ? 'confirmed' : 'declined'} successfully`);
      return { success: true };
    } catch (error: any) {
      console.error('Error responding to claim:', error);
      toast.error('Failed to respond to claim');
      return { success: false, error: error.message };
    }
  },

  // Private helper methods
  async notifyFamilyOfRequest(requestId: string): Promise<void> {
    // This will be handled by the Edge Function
    await supabase.functions.invoke('shift-coverage-handler', {
      body: { 
        action: 'notify_family_request',
        request_id: requestId
      }
    });
  },

  async broadcastAvailableShift(requestId: string): Promise<void> {
    // This will be handled by the Edge Function
    await supabase.functions.invoke('shift-coverage-handler', {
      body: { 
        action: 'broadcast_available_shift',
        request_id: requestId
      }
    });
  },

  async notifyFamilyOfClaim(claimId: string): Promise<void> {
    // This will be handled by the Edge Function
    await supabase.functions.invoke('shift-coverage-handler', {
      body: { 
        action: 'notify_family_claim',
        claim_id: claimId
      }
    });
  },

  async updateShiftAssignment(claimId: string): Promise<void> {
    // Get claim details and update the original shift
    const { data: claim } = await supabase
      .from('shift_coverage_claims')
      .select(`
        claiming_caregiver_id,
        coverage_request:shift_coverage_requests!inner(shift_id)
      `)
      .eq('id', claimId)
      .single();

    if (claim) {
      await supabase
        .from('care_shifts')
        .update({ caregiver_id: claim.claiming_caregiver_id })
        .eq('id', claim.coverage_request.shift_id);
    }
  },

  // Get notifications for a user
  async getNotificationsForUser(userId: string): Promise<ShiftNotification[]> {
    try {
      const { data, error } = await supabase
        .from('shift_notifications')
        .select('*')
        .eq('sent_to', userId)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as ShiftNotification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
};
