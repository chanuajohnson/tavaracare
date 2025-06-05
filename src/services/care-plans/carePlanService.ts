import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CarePlan, CarePlanMetadata } from "@/types/carePlan";
import { Json } from "@/utils/json";

export type CarePlanDto = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  family_id: string;
  status: 'active' | 'inactive' | 'completed';
  metadata: Json | null;
};

// DTO for creating a new care plan
export type CreateCarePlanDto = {
  title: string;
  description?: string | null;
  family_id: string;
  status?: 'active' | 'inactive' | 'completed';
  metadata?: CarePlanMetadata;
};

// DTO for updating an existing care plan
export type UpdateCarePlanDto = {
  title?: string;
  description?: string | null;
  status?: 'active' | 'inactive' | 'completed';
  metadata?: CarePlanMetadata;
};

const adaptCarePlanFromDb = (dbCarePlan: CarePlanDto): CarePlan => ({
  id: dbCarePlan.id,
  createdAt: new Date(dbCarePlan.created_at),
  updatedAt: new Date(dbCarePlan.updated_at),
  title: dbCarePlan.title,
  description: dbCarePlan.description,
  familyId: dbCarePlan.family_id,
  status: dbCarePlan.status,
  metadata: dbCarePlan.metadata as CarePlanMetadata || {},
});

export const fetchCarePlans = async (familyId: string): Promise<CarePlan[]> => {
  try {
    console.log('[fetchCarePlans] Fetching care plans for family:', familyId);
    
    // Verify authentication before querying
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('[fetchCarePlans] No session found');
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchCarePlans] Database error:', error);
      throw error;
    }

    console.log('[fetchCarePlans] Successfully fetched plans:', data?.length || 0);
    return (data || []).map(plan => adaptCarePlanFromDb(plan as CarePlanDto));
  } catch (error: any) {
    console.error('[fetchCarePlans] Error:', error);
    
    if (error.message?.includes('auth.uid()') || error.message?.includes('authentication')) {
      toast.error("Authentication issue. Please try logging out and back in.");
    } else {
      toast.error("Failed to load care plans");
    }
    return [];
  }
};

export const fetchCarePlanById = async (planId: string): Promise<CarePlan | null> => {
  try {
    console.log('[fetchCarePlanById] Fetching care plan:', planId);
    console.log('[fetchCarePlanById] Environment:', window.location.hostname);
    
    // Verify authentication before querying
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[fetchCarePlanById] Session check:', { 
      hasSession: !!session, 
      sessionUserId: session?.user?.id,
      sessionError: sessionError?.message 
    });
    
    if (!session || sessionError) {
      console.error('[fetchCarePlanById] No valid session found');
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('care_plans')
      .select('*')
      .eq('id', planId)
      .maybeSingle();

    if (error) {
      console.error('[fetchCarePlanById] Database error:', error);
      
      // Check if this is an RLS policy violation
      if (error.message?.includes('auth.uid()')) {
        console.error('[fetchCarePlanById] RLS policy blocked - auth.uid() is null');
        console.log('[fetchCarePlanById] This indicates a session/authentication mismatch');
        throw new Error('Authentication session issue - please try logging out and back in');
      }
      
      throw error;
    }

    console.log('[fetchCarePlanById] Query result:', { 
      found: !!data, 
      planId: data?.id,
      familyId: data?.family_id 
    });

    return data ? adaptCarePlanFromDb(data as CarePlanDto) : null;
  } catch (error: any) {
    console.error('[fetchCarePlanById] Error:', error);
    
    if (error.message?.includes('Authentication') || error.message?.includes('auth.uid()')) {
      toast.error("Authentication issue detected. Please try logging out and back in.");
    } else if (error.message?.includes('session')) {
      toast.error("Session expired. Please refresh and try again.");
    } else {
      toast.error("Failed to load care plan");
    }
    return null;
  }
};

export const createCarePlan = async (carePlan: CreateCarePlanDto): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .insert([carePlan])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating care plan:', error);
      toast.error("Failed to create care plan");
      return null;
    }

    toast.success("Care plan created successfully!");
    return adaptCarePlanFromDb(data as CarePlanDto);
  } catch (error) {
    console.error('Error creating care plan:', error);
    toast.error("Failed to create care plan");
    return null;
  }
};

export const updateCarePlan = async (planId: string, updates: UpdateCarePlanDto): Promise<CarePlan | null> => {
  try {
    const { data, error } = await supabase
      .from('care_plans')
      .update(updates)
      .eq('id', planId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating care plan:', error);
      toast.error("Failed to update care plan");
      return null;
    }

    toast.success("Care plan updated successfully!");
    return adaptCarePlanFromDb(data as CarePlanDto);
  } catch (error) {
    console.error('Error updating care plan:', error);
    toast.error("Failed to update care plan");
    return null;
  }
};

export const deleteCarePlan = async (planId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('care_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      console.error('Error deleting care plan:', error);
      toast.error("Failed to delete care plan");
      return false;
    }

    toast.success("Care plan deleted successfully!");
    return true;
  } catch (error) {
    console.error('Error deleting care plan:', error);
    toast.error("Failed to delete care plan");
    return false;
  }
};
