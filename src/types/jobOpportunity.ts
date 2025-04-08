
/**
 * Frontend model for job opportunities (camelCase)
 */
export interface JobOpportunity {
  id: string;
  title: string;
  location: string;
  type: string;
  details?: string;
  postedAt?: string;
  salary?: string;
  urgency?: string;
  sourceName?: string;
  sourceUrl?: string;
  matchPercentage?: number;
  tags?: string[];
}

/**
 * Database model for job opportunity inserts (snake_case)
 */
export interface DbJobOpportunityInsert {
  id?: string;
  title: string;
  location: string;
  type: string;
  details?: string;
  posted_at?: string;
  salary?: string;
  urgency?: string;
  source_name?: string;
  source_url?: string;
  match_percentage?: number;
  tags?: string[];
}

/**
 * Database model for job opportunities (snake_case)
 */
export type DbJobOpportunity = Required<Pick<DbJobOpportunityInsert, "id" | "title" | "location" | "type">> & 
  Omit<DbJobOpportunityInsert, "id" | "title" | "location" | "type">;
