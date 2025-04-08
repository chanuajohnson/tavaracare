
// Re-export all services from care-plans directory

export * from './carePlanService';
export * from './careShiftService';
export * from './careTeamService';

// Re-export the types from the types/careTypes.ts file
export type { 
  CarePlan, 
  CarePlanMetadata, 
  CareShift, 
  CareTeamMember,
  CareTeamMemberWithProfile 
} from '@/types/careTypes';

// For backward compatibility
export { 
  fetchCarePlans, fetchCarePlanById, createCarePlan, 
  updateCarePlan, deleteCarePlan 
} from './carePlanService';

export {
  fetchCareShifts, createCareShift, 
  updateCareShift, deleteCareShift
} from './careShiftService';

export {
  fetchCareTeamMembers, inviteCareTeamMember, updateCareTeamMember, 
  removeCareTeamMember
} from './careTeamService';
