
import { supabase } from '@/lib/supabase';

/**
 * Resolves caregiver names for a list of records that have caregiver IDs.
 * Uses RPC fallback (get_public_professional_profiles) when direct profile
 * queries return NULL due to RLS restrictions.
 *
 * Resolution order:
 * 1. Already-joined profile name from the query
 * 2. RPC fallback via get_public_professional_profiles
 * 3. 'Unknown' as last resort
 */
export const resolveCaregiverNames = async (
  records: Array<{
    caregiverId: string | null;
    joinedName: string | null | undefined;
  }>
): Promise<Map<string, string>> => {
  const nameMap = new Map<string, string>();

  // Collect IDs that already have names
  for (const r of records) {
    if (r.caregiverId && r.joinedName) {
      nameMap.set(r.caregiverId, r.joinedName);
    }
  }

  // Find IDs still missing names
  const missingIds = records
    .filter(r => r.caregiverId && !nameMap.has(r.caregiverId))
    .map(r => r.caregiverId as string);

  const uniqueMissingIds = [...new Set(missingIds)];

  if (uniqueMissingIds.length > 0) {
    try {
      const { data: rpcProfiles, error } = await supabase
        .rpc('get_public_professional_profiles', { ids: uniqueMissingIds });

      if (!error && rpcProfiles) {
        for (const p of rpcProfiles) {
          if (p.full_name) {
            nameMap.set(p.id, p.full_name);
          }
        }
      }
    } catch (err) {
      console.error('RPC fallback for caregiver names failed:', err);
    }
  }

  return nameMap;
};
