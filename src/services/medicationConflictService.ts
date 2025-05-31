
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: MedicationConflict[];
  timeWindow: number;
}

export interface MedicationConflict {
  id: string;
  administered_at: string;
  administered_by: string;
  administered_by_role: 'family' | 'professional';
  status: string;
  notes?: string;
  profile?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface ConflictResolution {
  method: 'dual_entry' | 'override' | 'cancel';
  notes?: string;
}

export class MedicationConflictService {
  /**
   * Detect conflicts for a medication administration
   */
  async detectConflicts(
    medicationId: string, 
    administeredAt: string, 
    timeWindowHours: number = 2
  ): Promise<ConflictDetectionResult> {
    try {
      const { data: conflicts, error } = await supabase
        .rpc('detect_medication_conflicts', {
          p_medication_id: medicationId,
          p_administered_at: administeredAt,
          p_time_window_hours: timeWindowHours
        });

      if (error) {
        console.error("[MedicationConflictService] Error detecting conflicts:", error);
        throw error;
      }

      // Fetch profile information for each conflict
      const conflictsWithProfiles = await Promise.all(
        (conflicts || []).map(async (conflict: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, first_name, last_name')
            .eq('id', conflict.administered_by)
            .maybeSingle();

          return {
            ...conflict,
            profile
          };
        })
      );

      return {
        hasConflicts: conflictsWithProfiles.length > 0,
        conflicts: conflictsWithProfiles,
        timeWindow: timeWindowHours
      };
    } catch (error) {
      console.error("[MedicationConflictService] Exception in detectConflicts:", error);
      return {
        hasConflicts: false,
        conflicts: [],
        timeWindow: timeWindowHours
      };
    }
  }

  /**
   * Record administration with conflict awareness
   */
  async recordAdministrationWithConflictCheck(
    medicationId: string,
    administeredAt: string,
    administeredBy: string,
    userRole: 'family' | 'professional',
    notes?: string,
    conflictResolution?: ConflictResolution
  ) {
    try {
      // First detect conflicts
      const conflictResult = await this.detectConflicts(medicationId, administeredAt);

      if (conflictResult.hasConflicts && !conflictResolution) {
        // Return conflict information for user decision
        return {
          success: false,
          requiresResolution: true,
          conflicts: conflictResult.conflicts,
          timeWindow: conflictResult.timeWindow
        };
      }

      // Prepare administration data
      const administrationData = {
        medication_id: medicationId,
        administered_at: administeredAt,
        administered_by: administeredBy,
        administered_by_role: userRole,
        status: 'administered' as const,
        notes: notes || undefined,
        conflict_detected: conflictResult.hasConflicts,
        conflict_resolution_method: conflictResolution?.method || null,
        original_administration_id: conflictResult.hasConflicts && conflictResolution?.method === 'dual_entry' 
          ? conflictResult.conflicts[0]?.id 
          : null
      };

      const { data, error } = await supabase
        .from('medication_administrations')
        .insert([administrationData])
        .select()
        .single();

      if (error) {
        console.error("[MedicationConflictService] Error recording administration:", error);
        throw error;
      }

      // Show appropriate success message
      if (conflictResult.hasConflicts && conflictResolution?.method === 'dual_entry') {
        toast.success("Administration recorded with conflict noted for safety");
      } else {
        toast.success("Medication administration recorded successfully");
      }

      return {
        success: true,
        data,
        conflictDetected: conflictResult.hasConflicts,
        conflicts: conflictResult.conflicts
      };
    } catch (error) {
      console.error("[MedicationConflictService] Exception in recordAdministrationWithConflictCheck:", error);
      toast.error("Failed to record medication administration");
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get administration history with conflict information
   */
  async getAdministrationHistory(medicationId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('medication_administrations')
        .select(`
          *,
          profiles!administered_by (
            full_name,
            first_name,
            last_name,
            role
          )
        `)
        .eq('medication_id', medicationId)
        .order('administered_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[MedicationConflictService] Error fetching history:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("[MedicationConflictService] Exception in getAdministrationHistory:", error);
      return [];
    }
  }

  /**
   * Format conflict information for display
   */
  formatConflictMessage(conflicts: MedicationConflict[], timeWindow: number): string {
    if (conflicts.length === 0) return '';

    const conflict = conflicts[0];
    const adminName = conflict.profile?.full_name || 
                     `${conflict.profile?.first_name} ${conflict.profile?.last_name}`.trim() ||
                     'Another user';
    
    const timeStr = new Date(conflict.administered_at).toLocaleString();
    const role = conflict.administered_by_role === 'family' ? 'family member' : 'caregiver';

    return `This medication was already administered by ${adminName} (${role}) at ${timeStr} (within ${timeWindow} hour window). Recording both entries for safety.`;
  }
}

// Create singleton instance
export const medicationConflictService = new MedicationConflictService();
