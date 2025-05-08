import { CarePlan, CarePlanMetadata, DbCarePlan, DbCarePlanInsert, DbCarePlanMetadata } from "../types/carePlan";
import { fromJson, toJson, Json } from "../utils/json";

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
      weekday_8am_to_4pm: metadata.additionalShifts.weekday8amTo4pm,
      weekday_8am_to_6pm: metadata.additionalShifts.weekday8amTo6pm
    } : undefined,
    custom_shifts: metadata.customShifts ? 
      metadata.customShifts.map(shift => ({
        days: shift.days,
        start_time: shift.startTime,
        end_time: shift.endTime,
        title: shift.title
      })) : undefined
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
      weekday8amTo4pm: dbMetadata.additional_shifts.weekday_8am_to_4pm,
      weekday8amTo6pm: dbMetadata.additional_shifts.weekday_8am_to_6pm
    } : undefined,
    customShifts: dbMetadata.custom_shifts ?
      dbMetadata.custom_shifts.map(shift => ({
        days: shift.days,
        startTime: shift.start_time,
        endTime: shift.end_time,
        title: shift.title
      })) : undefined
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
export function adaptCarePlanFromDb(dbCarePlan: any): CarePlan {
  let metadata: CarePlanMetadata | undefined = undefined;
  
  if (dbCarePlan.metadata) {
    const parsedMetadata = fromJson(dbCarePlan.metadata, {} as DbCarePlanMetadata);
    metadata = adaptCarePlanMetadataFromDb(parsedMetadata);
  }

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
