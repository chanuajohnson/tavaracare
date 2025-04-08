
import { CarePlan, CarePlanMetadata, DbCarePlan, DbCarePlanInsert, DbCarePlanMetadata } from "../types/carePlan";
import { fromJson, toJson } from "../utils/json";

/**
 * Adapts a care plan metadata from frontend to database format
 */
function adaptCarePlanMetadataToDb(metadata: CarePlanMetadata): DbCarePlanMetadata {
  return {
    plan_type: metadata.planType,
    weekday_coverage: metadata.weekdayCoverage,
    weekend_coverage: metadata.weekendCoverage,
    additional_shifts: metadata.additionalShifts ? {
      weekday_evening_4pm_to_6am: metadata.additionalShifts.weekdayEvening4pmTo6am,
      weekday_evening_4pm_to_8am: metadata.additionalShifts.weekdayEvening4pmTo8am,
      weekday_evening_6pm_to_6am: metadata.additionalShifts.weekdayEvening6pmTo6am,
      weekday_evening_6pm_to_8am: metadata.additionalShifts.weekdayEvening6pmTo8am,
    } : undefined
  };
}

/**
 * Adapts care plan metadata from database to frontend format
 */
function adaptCarePlanMetadataFromDb(dbMetadata: DbCarePlanMetadata): CarePlanMetadata {
  return {
    planType: dbMetadata.plan_type,
    weekdayCoverage: dbMetadata.weekday_coverage,
    weekendCoverage: dbMetadata.weekend_coverage,
    additionalShifts: dbMetadata.additional_shifts ? {
      weekdayEvening4pmTo6am: dbMetadata.additional_shifts.weekday_evening_4pm_to_6am,
      weekdayEvening4pmTo8am: dbMetadata.additional_shifts.weekday_evening_4pm_to_8am,
      weekdayEvening6pmTo6am: dbMetadata.additional_shifts.weekday_evening_6pm_to_6am,
      weekdayEvening6pmTo8am: dbMetadata.additional_shifts.weekday_evening_6pm_to_8am,
    } : undefined
  };
}

/**
 * Adapts a frontend care plan to a database-ready object
 */
export function adaptCarePlanToDb(carePlan: Partial<CarePlan>): DbCarePlanInsert {
  return {
    id: carePlan.id,
    title: carePlan.title!,
    description: carePlan.description!,
    family_id: carePlan.familyId!,
    status: carePlan.status,
    metadata: carePlan.metadata ? toJson(adaptCarePlanMetadataToDb(carePlan.metadata)) : undefined
  };
}

/**
 * Adapts a database care plan to a frontend-ready object
 */
export function adaptCarePlanFromDb(dbCarePlan: DbCarePlan): CarePlan {
  const metadata = dbCarePlan.metadata ? 
    adaptCarePlanMetadataFromDb(fromJson(dbCarePlan.metadata, {} as DbCarePlanMetadata)) : 
    undefined;

  return {
    id: dbCarePlan.id,
    createdAt: dbCarePlan.created_at,
    updatedAt: dbCarePlan.updated_at,
    title: dbCarePlan.title,
    description: dbCarePlan.description,
    familyId: dbCarePlan.family_id,
    status: dbCarePlan.status || 'active',
    metadata
  };
}
