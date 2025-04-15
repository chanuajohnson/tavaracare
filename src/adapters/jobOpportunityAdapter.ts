
import { JobOpportunity, DbJobOpportunity, DbJobOpportunityInsert } from "../types/jobOpportunity";

/**
 * Adapts a frontend job opportunity to a database-ready object
 */
export function adaptJobOpportunityToDb(job: Partial<JobOpportunity>): DbJobOpportunityInsert {
  return {
    id: job.id,
    title: job.title!,
    location: job.location!,
    type: job.type!,
    details: job.details,
    posted_at: job.postedAt,
    salary: job.salary,
    urgency: job.urgency,
    source_name: job.sourceName,
    source_url: job.sourceUrl,
    match_percentage: job.matchPercentage,
    tags: job.tags
  };
}

/**
 * Adapts a database job opportunity to a frontend-ready object
 */
export function adaptJobOpportunityFromDb(dbJob: DbJobOpportunity): JobOpportunity {
  return {
    id: dbJob.id,
    title: dbJob.title,
    location: dbJob.location,
    type: dbJob.type,
    details: dbJob.details,
    postedAt: dbJob.posted_at,
    salary: dbJob.salary,
    urgency: dbJob.urgency,
    sourceName: dbJob.source_name,
    sourceUrl: dbJob.source_url,
    matchPercentage: dbJob.match_percentage,
    tags: dbJob.tags
  };
}
