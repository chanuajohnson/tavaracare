
import { supabase } from '@/lib/supabase';

export const fetchFamilyUsers = async () => {
  const { data: familyUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, full_name, visit_scheduling_status, visit_notes, created_at, family_readiness_profile, client_stage')
    .eq('role', 'family');

  if (usersError) throw usersError;
  return familyUsers || [];
};
