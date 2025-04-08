
// Re-export all services from care-plans directory

export * from './carePlanService';
export * from './careShiftService';
export * from './careTeamService';

// For backward compatibility
export { 
  fetchCarePlans, fetchCarePlanById, createCarePlan, 
  updateCarePlan, deleteCarePlan, CarePlan, CarePlanMetadata
} from './carePlanService';

export {
  fetchCareShifts, createCareShift, 
  updateCareShift, deleteCareShift, CareShift
} from './careShiftService';

export {
  fetchCareTeamMembers, inviteCareTeamMember, updateCareTeamMember, 
  removeCareTeamMember, CareTeamMember
} from './careTeamService';
