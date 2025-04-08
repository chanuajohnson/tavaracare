
import { DatabaseService } from "./databaseService";
import { Profile } from "../types/profile";
import { DbProfile, DbProfileInsert } from "../types/profile";
import { adaptProfileFromDb, adaptProfileToDb } from "../adapters/profileAdapter";
import { supabase } from "@/lib/supabase";

export class ProfileService extends DatabaseService<Profile, DbProfileInsert, 'profiles'> {
  constructor() {
    super('profiles', adaptProfileFromDb);
  }
  
  /**
   * Get a profile by ID
   */
  async getProfile(id: string): Promise<Profile | null> {
    return this.getSingle(id);
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
        return this.update(profile.id, dbProfile);
      } else {
        // Create new profile
        return this.insert(dbProfile);
      }
    } catch (error) {
      console.error("[ProfileService] saveProfile error:", error);
      throw error;
    }
  }
  
  /**
   * Get profiles by role
   */
  async getProfilesByRole(role: string, limit: number = 50): Promise<Profile[]> {
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
      
      return (data || []).map(adaptProfileFromDb);
    } catch (error) {
      console.error("[ProfileService] getProfilesByRole exception:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const profileService = new ProfileService();
