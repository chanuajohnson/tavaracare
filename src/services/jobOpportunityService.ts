
import { supabase } from "@/lib/supabase";
import { JobOpportunity } from "../types/jobOpportunity";
import { DbJobOpportunity, DbJobOpportunityInsert } from "../types/jobOpportunity";
import { adaptJobOpportunityFromDb, adaptJobOpportunityToDb } from "../adapters/jobOpportunityAdapter";

/**
 * Service for managing job opportunities
 */
export class JobOpportunityService {
  
  /**
   * Get a job opportunity by ID
   */
  async getJobOpportunity(id: string): Promise<JobOpportunity | null> {
    try {
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error("[JobOpportunityService] getJobOpportunity error:", error);
        throw error;
      }
      
      return data ? adaptJobOpportunityFromDb(data) : null;
    } catch (error) {
      console.error("[JobOpportunityService] getJobOpportunity exception:", error);
      throw error;
    }
  }
  
  /**
   * Get job opportunities for a location
   */
  async getJobOpportunitiesByLocation(location: string, limit: number = 10): Promise<JobOpportunity[]> {
    try {
      const { data, error } = await supabase
        .from('job_opportunities')
        .select('*')
        .ilike('location', `%${location}%`)
        .order('posted_at', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error("[JobOpportunityService] getJobOpportunitiesByLocation error:", error);
        throw error;
      }
      
      return (data || []).map(adaptJobOpportunityFromDb);
    } catch (error) {
      console.error("[JobOpportunityService] getJobOpportunitiesByLocation exception:", error);
      throw error;
    }
  }
}

// Create a singleton instance
export const jobOpportunityService = new JobOpportunityService();
