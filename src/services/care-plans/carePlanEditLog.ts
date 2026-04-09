
import { supabase } from "@/integrations/supabase/client";

export interface CarePlanEditLogEntry {
  id: string;
  care_plan_id: string;
  edited_by: string;
  editor_role: string;
  edit_type: string;
  edit_summary: string;
  created_at: string;
  editor_name?: string;
}

export const logCarePlanEdit = async (
  carePlanId: string,
  editType: 'care_plan' | 'medication' | 'meal_plan',
  editSummary: string,
  editorRole: 'admin' | 'family'
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('care_plan_edit_log')
      .insert({
        care_plan_id: carePlanId,
        edited_by: user.id,
        editor_role: editorRole,
        edit_type: editType,
        edit_summary: editSummary,
      });

    if (error) {
      console.error('[logCarePlanEdit] Error:', error);
    }
  } catch (err) {
    console.error('[logCarePlanEdit] Exception:', err);
  }
};

export const fetchCarePlanEditLogs = async (
  carePlanId: string
): Promise<CarePlanEditLogEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('care_plan_edit_log')
      .select('*')
      .eq('care_plan_id', carePlanId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[fetchCarePlanEditLogs] Error:', error);
      return [];
    }

    // Fetch editor names
    const editorIds = [...new Set((data || []).map(d => d.edited_by))];
    if (editorIds.length === 0) return data || [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', editorIds);

    const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name]));

    return (data || []).map(entry => ({
      ...entry,
      editor_name: nameMap.get(entry.edited_by) || 'Unknown',
    }));
  } catch (err) {
    console.error('[fetchCarePlanEditLogs] Exception:', err);
    return [];
  }
};

export const fetchRecentAdminEditsForFamily = async (
  familyId: string
): Promise<CarePlanEditLogEntry[]> => {
  try {
    // Get care plans for this family
    const { data: carePlans } = await supabase
      .from('care_plans')
      .select('id')
      .eq('family_id', familyId);

    if (!carePlans || carePlans.length === 0) return [];

    const planIds = carePlans.map(cp => cp.id);

    const { data, error } = await supabase
      .from('care_plan_edit_log')
      .select('*')
      .in('care_plan_id', planIds)
      .eq('editor_role', 'admin')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('[fetchRecentAdminEditsForFamily] Error:', error);
      return [];
    }

    // Fetch editor names
    const editorIds = [...new Set((data || []).map(d => d.edited_by))];
    if (editorIds.length === 0) return data || [];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', editorIds);

    const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name]));

    return (data || []).map(entry => ({
      ...entry,
      editor_name: nameMap.get(entry.edited_by) || 'Admin',
    }));
  } catch (err) {
    console.error('[fetchRecentAdminEditsForFamily] Exception:', err);
    return [];
  }
};
