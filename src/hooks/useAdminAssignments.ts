import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

export interface AdminAssignmentData {
  family_user_id: string;
  caregiver_id: string;
  match_score: number;
  admin_override_score?: number;
  assignment_reason?: string;
  assignment_notes?: string;
}

export interface TriggerAutomaticAssignmentParams {
  family_user_id?: string; // If not provided, processes all family users
}

export const useAdminAssignments = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create admin-controlled assignment
  const createAdminAssignment = useCallback(async (assignmentData: AdminAssignmentData) => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: assignmentId, error: assignmentError } = await supabase
        .rpc('create_admin_assignment', {
          target_family_user_id: assignmentData.family_user_id,
          target_caregiver_id: assignmentData.caregiver_id,
          calculated_match_score: assignmentData.match_score,
          admin_override_score: assignmentData.admin_override_score,
          assignment_reason: assignmentData.assignment_reason,
          assignment_notes: assignmentData.assignment_notes
        });

      if (assignmentError) {
        console.error('Error creating admin assignment:', assignmentError);
        setError(assignmentError.message);
        toast.error('Failed to create admin assignment: ' + assignmentError.message);
        return null;
      }

      console.log('Successfully created admin assignment:', assignmentId);
      toast.success('Admin assignment created successfully');
      return assignmentId;

    } catch (error) {
      console.error('Error in createAdminAssignment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error('Failed to create admin assignment: ' + errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Trigger automatic assignment process via edge function
  const triggerAutomaticAssignment = useCallback(async (params: TriggerAutomaticAssignmentParams = {}) => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke(
        'automatic-caregiver-assignment',
        {
          body: {
            family_user_id: params.family_user_id,
            trigger_type: params.family_user_id ? 'admin_single_user' : 'admin_batch_process'
          }
        }
      );

      if (functionError) {
        console.error('Error triggering automatic assignment:', functionError);
        setError(functionError.message);
        toast.error('Failed to trigger automatic assignment: ' + functionError.message);
        return null;
      }

      console.log('Successfully triggered automatic assignment:', result);
      
      if (result.success) {
        toast.success(
          params.family_user_id 
            ? 'Automatic assignment created successfully' 
            : 'Batch assignment process completed successfully'
        );
      } else {
        toast.warning(result.message || 'No suitable matches found');
      }
      
      return result;

    } catch (error) {
      console.error('Error in triggerAutomaticAssignment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error('Failed to trigger automatic assignment: ' + errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Get all family users for assignment selection
  const getFamilyUsers = useCallback(async () => {
    try {
      const { data: familyUsers, error: familyError } = await supabase
        .from('profiles')
        .select('id, full_name, care_recipient_name, relationship, created_at')
        .eq('role', 'family')
        .order('created_at', { ascending: false });

      if (familyError) {
        console.error('Error fetching family users:', familyError);
        setError(familyError.message);
        return [];
      }

      return familyUsers || [];
    } catch (error) {
      console.error('Error in getFamilyUsers:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }, []);

  // Get all professional caregivers for assignment selection
  const getProfessionalCaregivers = useCallback(async () => {
    try {
      const { data: professionals, error: professionalError } = await supabase
        .from('profiles')
        .select('id, full_name, location, care_types, years_of_experience, hourly_rate, created_at')
        .eq('role', 'professional')
        .order('created_at', { ascending: false });

      if (professionalError) {
        console.error('Error fetching professional caregivers:', professionalError);
        setError(professionalError.message);
        return [];
      }

      return professionals || [];
    } catch (error) {
      console.error('Error in getProfessionalCaregivers:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return [];
    }
  }, []);

  // Get existing assignments for a family user
  const getExistingAssignments = useCallback(async (familyUserId: string) => {
    try {
      const [automaticResult, adminResult] = await Promise.all([
        // Get automatic assignments
        supabase
          .from('automatic_assignments')
          .select(`
            *,
            caregiver:profiles!automatic_assignments_caregiver_id_fkey(id, full_name, location)
          `)
          .eq('family_user_id', familyUserId)
          .eq('is_active', true),
        
        // Get admin interventions
        supabase
          .from('admin_match_interventions')
          .select(`
            *,
            caregiver:profiles!admin_match_interventions_caregiver_id_fkey(id, full_name, location),
            admin:profiles!admin_match_interventions_admin_id_fkey(id, full_name)
          `)
          .eq('family_user_id', familyUserId)
          .eq('status', 'active')
      ]);

      return {
        automatic: automaticResult.data || [],
        admin: adminResult.data || [],
        errors: {
          automatic: automaticResult.error,
          admin: adminResult.error
        }
      };
    } catch (error) {
      console.error('Error in getExistingAssignments:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      return { automatic: [], admin: [], errors: { automatic: null, admin: null } };
    }
  }, []);

  return {
    createAdminAssignment,
    triggerAutomaticAssignment,
    getFamilyUsers,
    getProfessionalCaregivers,
    getExistingAssignments,
    isLoading,
    error
  };
};