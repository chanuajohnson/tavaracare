
// Re-export all services from care-plans directory

export * from './carePlanService';
export * from './careShiftService';
export * from './careTeamService';

// For backward compatibility
export { 
  fetchCarePlans, fetchCarePlanById, createCarePlan, 
  updateCarePlan, deleteCarePlan 
} from './carePlanService';

export type { CarePlan, CarePlanMetadata } from './carePlanService';

export {
  fetchCareShifts, createCareShift, 
  updateCareShift, deleteCareShift
} from './careShiftService';

export type { CareShift } from './careShiftService';

export {
  fetchCareTeamMembers, inviteCareTeamMember, updateCareTeamMember, 
  removeCareTeamMember
} from './careTeamService';

export type { CareTeamMember } from './careTeamService';
