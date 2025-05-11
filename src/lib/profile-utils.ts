
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';
import { getCurrentEnvironment } from '@/integrations/supabase/client';

/**
 * Ensures a user profile exists in the database
 * @param userId The user ID to check/create a profile for
 * @param role Optional role to set for the profile (defaults to 'family' if not provided)
 * @returns Object with success status and error message if applicable
 */
export const ensureUserProfile = async (userId: string, role: UserRole = 'family') => {
  try {
    const env = getCurrentEnvironment();
    console.log('Ensuring profile exists for user:', userId, 'with role:', role, 'in environment:', env);
    
    // First check if session is valid
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error when ensuring profile:', sessionError);
      return { 
        success: false, 
        error: `Authentication error: ${sessionError.message}` 
      };
    }
    
    if (!session) {
      console.error('No active session found when ensuring profile');
      return { 
        success: false, 
        error: 'No active authentication session' 
      };
    }
    
    // Check if profile exists using maybeSingle() instead of single() to handle cases where no profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error checking for existing profile:', profileError);
      return { 
        success: false, 
        error: `Database error: ${profileError.message}` 
      };
    }
    
    if (existingProfile) {
      console.log('Profile already exists:', existingProfile);
      
      // If the role doesn't match what was requested, update it
      if (existingProfile.role !== role) {
        console.log(`Updating profile role from ${existingProfile.role} to ${role}`);
        
        try {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', userId);
            
          if (updateError) {
            console.error('Error updating profile role:', updateError);
            return { 
              success: false, 
              error: `Profile update error: ${updateError.message}` 
            };
          }
        } catch (updateErr) {
          console.error('Unexpected error updating profile role:', updateErr);
          // Continue with metadata update anyway
        }
        
        // Also update user metadata to keep roles in sync
        try {
          const { error: metadataError } = await supabase.auth.updateUser({
            data: { role: role }
          });
          
          if (metadataError) {
            console.error('Error updating user metadata role:', metadataError);
            // Continue anyway as profile was updated
          }
        } catch (metaErr) {
          console.error('Unexpected error updating user metadata:', metaErr);
          // Continue anyway
        }
      }
      
      return { success: true };
    }
    
    // Create profile if it doesn't exist
    console.log('Creating new profile for user:', userId, 'with role:', role);
    
    // Build base profile object
    const profileData = {
      id: userId,
      role: role,
      full_name: session.user?.user_metadata?.full_name || '',
      first_name: session.user?.user_metadata?.first_name || '',
      last_name: session.user?.user_metadata?.last_name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileData);
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return { 
        success: false, 
        error: `Profile creation error: ${insertError.message}` 
      };
    }
    
    console.log('Profile created successfully with role:', role);
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error ensuring profile:', error);
    return { 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    };
  }
};

/**
 * Updates a user profile with the provided data
 * @param userId The user ID to update the profile for
 * @param profileData The data to update the profile with
 * @returns Object with success status and error message if applicable
 */
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const env = getCurrentEnvironment();
    console.log('Updating profile for user:', userId, 'with data:', profileData, 'in environment:', env);
    
    // Refresh the session to ensure we have the latest auth state
    const { data: authData, error: authError } = await supabase.auth.refreshSession();
    
    if (authError) {
      console.error('Auth refresh error:', authError);
      return { 
        success: false, 
        error: `Authentication error: ${authError.message}` 
      };
    }
    
    if (!authData.session) {
      console.error('No active session found for profile update');
      return { 
        success: false, 
        error: 'No active authentication session' 
      };
    }
    
    // Handle potential schema differences between environments
    // by checking which fields exist before updating
    try {
      // First, get the existing profile to determine available columns
      const { data: existingProfile, error: getError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (getError) {
        console.error('Error fetching existing profile:', getError);
        // Continue with update anyway, the error will be caught if columns don't exist
      }
      
      // Filter profileData to only include fields that exist in the database
      // or are expected to be there based on standard schema
      const safeProfileData: Record<string, any> = {};
      
      Object.keys(profileData).forEach(key => {
        // If we have an existing profile to check against
        if (existingProfile) {
          // Only include keys that already exist in the profile
          if (key in existingProfile || key === 'updated_at') {
            safeProfileData[key] = profileData[key];
          } else {
            console.warn(`Field '${key}' not found in existing profile, skipping`);
          }
        } else {
          // If we couldn't fetch the profile, include all basic fields that
          // should be present in all environments
          const basicFields = [
            'role', 'full_name', 'first_name', 'last_name', 
            'avatar_url', 'updated_at', 'professional_type'
          ];
          
          if (basicFields.includes(key)) {
            safeProfileData[key] = profileData[key];
          } else {
            // For other fields, include them but log a warning
            safeProfileData[key] = profileData[key];
            console.warn(`Including field '${key}' without verification, may cause error if not in schema`);
          }
        }
      });
      
      // Special handling for onboarding_progress to ensure it's properly saved as JSON
      if (profileData.onboarding_progress) {
        try {
          // Ensure onboarding_progress is stored as JSON
          if (typeof profileData.onboarding_progress === 'object') {
            safeProfileData.onboarding_progress = profileData.onboarding_progress;
          }
          
          // Try updating onboarding_progress separately first to test if column exists
          const testUpdate = {
            updated_at: new Date().toISOString()
          };
          
          // Try updating onboarding_progress in a separate operation
          if (existingProfile || !getError) {
            const { error: progressError } = await supabase
              .from('profiles')
              .update({ onboarding_progress: safeProfileData.onboarding_progress })
              .eq('id', userId);
              
            if (progressError) {
              if (progressError.message.includes('column') || progressError.message.includes('does not exist')) {
                console.warn('onboarding_progress column not available in this environment, skipping');
              } else {
                console.error('Error updating onboarding_progress:', progressError);
              }
            } else {
              console.log('Successfully updated onboarding_progress');
            }
          }
        } catch (progressErr) {
          console.warn('Error handling onboarding_progress:', progressErr);
        }
      }
      
      // Always include updated_at
      safeProfileData.updated_at = new Date().toISOString();
      
      // Update the profile with filtered data
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(safeProfileData)
        .eq('id', userId)
        .select();
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
        return { 
          success: false, 
          error: `Profile update error: ${updateError.message}` 
        };
      }
      
      // Force update the user's metadata to keep it in sync with profile
      if (profileData.role || profileData.full_name || profileData.first_name || profileData.last_name) {
        try {
          const metadata: any = {};
          
          if (profileData.role) {
            metadata.role = profileData.role;
          }
          
          if (profileData.full_name) {
            metadata.full_name = profileData.full_name;
          }
          
          if (profileData.first_name) {
            metadata.first_name = profileData.first_name;
          }
          
          if (profileData.last_name) {
            metadata.last_name = profileData.last_name;
          }
          
          console.log('Updating user metadata:', metadata);
          await supabase.auth.updateUser({ data: metadata });
        } catch (metadataError) {
          console.error('Error updating user metadata:', metadataError);
          // Continue anyway as profile was updated
        }
      }
      
      console.log('Profile updated successfully, response:', data);
      return { success: true, data };
    } catch (updateErr: any) {
      console.error('Error during profile update process:', updateErr);
      return { 
        success: false, 
        error: `Update process error: ${updateErr.message}` 
      };
    }
  } catch (error: any) {
    console.error('Unexpected error updating profile:', error);
    return { 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    };
  }
};

/**
 * Gets a user profile from the database
 * @param userId The user ID to get the profile for
 * @returns Object with success status, data, and error message if applicable
 */
export const getUserProfile = async (userId: string) => {
  try {
    console.log('Fetching profile for user:', userId);
    
    if (!userId) {
      console.error('No user ID provided to getUserProfile');
      return {
        success: false,
        error: 'No user ID provided'
      };
    }
    
    // Get the profile, using maybeSingle to handle cases where the profile might not exist
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return {
        success: false,
        error: `Database error: ${profileError.message}`
      };
    }
    
    if (!profile) {
      console.log('No profile found for user:', userId);
      return {
        success: false,
        error: 'Profile not found',
        notFound: true
      };
    }
    
    console.log('Profile fetched successfully:', profile);
    return {
      success: true,
      data: profile
    };
  } catch (error: any) {
    console.error('Unexpected error getting profile:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    };
  }
};
