
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';

export const useProfileCompletion = (
  setUserRole: (role: UserRole | null) => void,
  setIsProfileComplete: (complete: boolean) => void
) => {
  const checkProfileCompletion = async (userId: string) => {
    try {
      console.log('[AuthProvider] Checking profile completion for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role, professional_type, first_name, last_name')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('[AuthProvider] Error checking profile completion:', error);
        console.error('[AuthProvider] Error details:', error.message, error.code);
        // Don't throw error - be resilient and assume incomplete profile
        setUserRole(null);
        setIsProfileComplete(false);
        return false;
      }
      
      if (profile?.role) {
        console.log('[AuthProvider] Setting user role from profile:', profile.role);
        setUserRole(profile.role);
      } else {
        console.log('[AuthProvider] No role found in profile, setting to null');
        setUserRole(null);
      }
      
      let profileComplete = false;
      
      if (profile) {
        if (profile.role === 'professional' || profile.role === 'community') {
          profileComplete = !!(profile.full_name || (profile.first_name && profile.last_name));
        } else {
          profileComplete = !!(profile.full_name || (profile.first_name && profile.last_name));
        }
        console.log('[AuthProvider] Profile data:', {
          full_name: profile.full_name,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          profileComplete
        });
      } else {
        console.log('[AuthProvider] No profile data found');
      }
      
      console.log('[AuthProvider] Profile complete:', profileComplete);
      setIsProfileComplete(profileComplete);
      return profileComplete;
    } catch (error) {
      console.error('[AuthProvider] Error checking profile completion:', error);
      // Be resilient - set safe defaults
      setUserRole(null);
      setIsProfileComplete(false);
      return false;
    }
  };

  return { checkProfileCompletion };
};
