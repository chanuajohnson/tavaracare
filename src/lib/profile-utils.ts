
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/database';

/**
 * Ensures a user profile exists in the database
 * @param userId The user ID to check/create a profile for
 * @param role Optional role to set for the profile (defaults to 'family' if not provided)
 * @returns Object with success status and error message if applicable
 */
export const ensureUserProfile = async (userId: string, role: UserRole = 'family') => {
  try {
    console.log('Ensuring profile exists for user:', userId, 'with role:', role);
    
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
        
        // Also update user metadata to keep roles in sync
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { role: role }
        });
        
        if (metadataError) {
          console.error('Error updating user metadata role:', metadataError);
          // Continue anyway as profile was updated
        }
      }
      
      return { success: true };
    }
    
    // Create profile if it doesn't exist
    console.log('Creating new profile for user:', userId, 'with role:', role);
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        role: role,
        full_name: session.user?.user_metadata?.full_name || '',
        first_name: session.user?.user_metadata?.first_name || '',
        last_name: session.user?.user_metadata?.last_name || '',
        email: session.user?.email || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
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
    console.log('Updating profile for user:', userId, 'with data:', profileData);
    
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
    
    // Update the profile
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
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
