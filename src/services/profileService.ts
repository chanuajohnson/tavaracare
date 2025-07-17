
import { supabase } from "@/lib/supabase";
import { Profile } from "../types/profile";
import { DbProfile, DbProfileInsert } from "../types/profile";
import { adaptProfileFromDb, adaptProfileToDb } from "../adapters/profileAdapter";
import { UserRole } from "../utils/supabaseTypes";

/**
 * Service for managing user profiles
 */
export class ProfileService {
  
  /**
   * Get a profile by ID
   */
  async getProfile(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error("[ProfileService] getProfile error:", error);
        throw error;
      }
      
      return data ? adaptProfileFromDb(data) : null;
    } catch (error) {
      console.error("[ProfileService] getProfile exception:", error);
      throw error;
    }
  }
  
  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<Profile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }
      
      return this.getProfile(user.id);
    } catch (error) {
      console.error("[ProfileService] getCurrentUserProfile error:", error);
      throw error;
    }
  }
  
  /**
   * Create or update a profile
   */
  async saveProfile(profile: Partial<Profile>): Promise<Profile> {
    if (!profile.id) {
      throw new Error("Profile ID is required");
    }
    
    const dbProfile = adaptProfileToDb(profile);
    
    try {
      // Check if profile exists
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profile.id)
        .maybeSingle();
        
      if (data) {
        // Update existing profile
        return this.updateProfile(profile.id, dbProfile);
      } else {
        // Create new profile
        return this.insertProfile(dbProfile);
      }
    } catch (error) {
      console.error("[ProfileService] saveProfile error:", error);
      throw error;
    }
  }
  
  /**
   * Insert a new profile
   */
  private async insertProfile(profile: DbProfileInsert): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile as any]) // Cast to any to fix type error
        .select()
        .single();
      
      if (error) {
        console.error("[ProfileService] insertProfile error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error(`Inserted profile with ID ${profile.id} not found`);
      }
      
      return adaptProfileFromDb(data);
    } catch (error) {
      console.error("[ProfileService] insertProfile exception:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing profile using safe update function
   */
  private async updateProfile(id: string, updates: Partial<DbProfileInsert>): Promise<Profile> {
    try {
      // Use the safe profile update function to avoid RLS infinite recursion
      const { data, error } = await supabase.rpc('update_user_profile', {
        profile_data: { ...updates, id }
      });
      
      if (error) {
        console.error("[ProfileService] updateProfile error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error(`Updated profile with ID ${id} not found`);
      }
      
      // Cast the JSON response to DbProfile type
      return adaptProfileFromDb(data as unknown as DbProfile);
    } catch (error) {
      console.error("[ProfileService] updateProfile exception:", error);
      throw error;
    }
  }
  
  /**
   * Get profiles by role
   */
  async getProfilesByRole(role: UserRole, limit: number = 50): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .limit(limit);
        
      if (error) {
        console.error("[ProfileService] getProfilesByRole error:", error);
        throw error;
      }
      
      return (data || []).map(item => adaptProfileFromDb(item));
    } catch (error) {
      console.error("[ProfileService] getProfilesByRole exception:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const profileService = new ProfileService();
