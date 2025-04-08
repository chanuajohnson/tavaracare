
import { DatabaseService } from "./databaseService";
import { JobOpportunity } from "../types/jobOpportunity";
import { DbJobOpportunity, DbJobOpportunityInsert } from "../types/jobOpportunity";
import { adaptJobOpportunityFromDb, adaptJobOpportunityToDb } from "../adapters/jobOpportunityAdapter";
import { supabase } from "@/lib/supabase";

export class JobOpportunityService extends DatabaseService<JobOpportunity, DbJobOpportunityInsert, 'job_opportunities'> {
  constructor() {
    super('job_opportunities', adaptJobOpportunityFromDb);
  }
  
  /**
   * Get a job opportunity by ID
   */
  async getJobOpportunity(id: string): Promise<JobOpportunity | null> {
    return this.getSingle(id);
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
