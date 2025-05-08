import { FamilyCareNeeds, DbFamilyCareNeeds } from "../types/carePlan";

/**
 * Adapts a frontend family care needs object to a database-ready object
 */
export function adaptFamilyCareNeedsToDb(careNeeds: FamilyCareNeeds): DbFamilyCareNeeds {
  return {
    profile_id: careNeeds.profileId,
    
    // Daily Living Assistance
    assistance_bathing: careNeeds.assistanceBathing,
    assistance_dressing: careNeeds.assistanceDressing,
    assistance_toileting: careNeeds.assistanceToileting,
    assistance_oral_care: careNeeds.assistanceOralCare,
    assistance_feeding: careNeeds.assistanceFeeding,
    assistance_mobility: careNeeds.assistanceMobility,
    assistance_medication: careNeeds.assistanceMedication,
    assistance_companionship: careNeeds.assistanceCompanionship,
    assistance_naps: careNeeds.assistanceNaps,
    
    // Cognitive & Memory Support
    dementia_redirection: careNeeds.dementiaRedirection,
    memory_reminders: careNeeds.memoryReminders,
    gentle_engagement: careNeeds.gentleEngagement,
    wandering_prevention: careNeeds.wanderingPrevention,
    cognitive_notes: careNeeds.cognitiveNotes,
    
    // Medical & Special Conditions
    diagnosed_conditions: careNeeds.diagnosedConditions,
    equipment_use: careNeeds.equipmentUse,
    fall_monitoring: careNeeds.fallMonitoring,
    vitals_check: careNeeds.vitalsCheck,
    
    // Housekeeping & Transportation
    tidy_room: careNeeds.tidyRoom,
    laundry_support: careNeeds.laundrySupport,
    grocery_runs: careNeeds.groceryRuns,
    meal_prep: careNeeds.mealPrep,
    escort_to_appointments: careNeeds.escortToAppointments,
    fresh_air_walks: careNeeds.freshAirWalks,
    
    // Emergency & Communication
    emergency_contact_name: careNeeds.emergencyContactName,
    emergency_contact_relationship: careNeeds.emergencyContactRelationship,
    emergency_contact_phone: careNeeds.emergencyContactPhone,
    communication_method: careNeeds.communicationMethod,
    daily_report_required: careNeeds.dailyReportRequired,
    additional_notes: careNeeds.additionalNotes,

    // Shift Info
    preferred_days: careNeeds.preferredDays,
    preferred_time_start: careNeeds.preferredTimeStart,
    preferred_time_end: careNeeds.preferredTimeEnd
  };
}

/**
 * Adapts a database family care needs object to a frontend-ready object
 */
export function adaptFamilyCareNeedsFromDb(dbCareNeeds: DbFamilyCareNeeds): FamilyCareNeeds {
  return {
    id: dbCareNeeds.id,
    profileId: dbCareNeeds.profile_id,
    
    // Daily Living Assistance
    assistanceBathing: dbCareNeeds.assistance_bathing,
    assistanceDressing: dbCareNeeds.assistance_dressing,
    assistanceToileting: dbCareNeeds.assistance_toileting,
    assistanceOralCare: dbCareNeeds.assistance_oral_care,
    assistanceFeeding: dbCareNeeds.assistance_feeding,
    assistanceMobility: dbCareNeeds.assistance_mobility,
    assistanceMedication: dbCareNeeds.assistance_medication,
    assistanceCompanionship: dbCareNeeds.assistance_companionship,
    assistanceNaps: dbCareNeeds.assistance_naps,
    
    // Cognitive & Memory Support
    dementiaRedirection: dbCareNeeds.dementia_redirection,
    memoryReminders: dbCareNeeds.memory_reminders,
    gentleEngagement: dbCareNeeds.gentle_engagement,
    wanderingPrevention: dbCareNeeds.wandering_prevention,
    cognitiveNotes: dbCareNeeds.cognitive_notes,
    
    // Medical & Special Conditions
    diagnosedConditions: dbCareNeeds.diagnosed_conditions,
    equipmentUse: dbCareNeeds.equipment_use,
    fallMonitoring: dbCareNeeds.fall_monitoring,
    vitalsCheck: dbCareNeeds.vitals_check,
    
    // Housekeeping & Transportation
    tidyRoom: dbCareNeeds.tidy_room,
    laundrySupport: dbCareNeeds.laundry_support,
    groceryRuns: dbCareNeeds.grocery_runs,
    mealPrep: dbCareNeeds.meal_prep,
    escortToAppointments: dbCareNeeds.escort_to_appointments,
    freshAirWalks: dbCareNeeds.fresh_air_walks,
    
    // Emergency & Communication
    emergencyContactName: dbCareNeeds.emergency_contact_name,
    emergencyContactRelationship: dbCareNeeds.emergency_contact_relationship,
    emergencyContactPhone: dbCareNeeds.emergency_contact_phone,
    communicationMethod: dbCareNeeds.communication_method,
    dailyReportRequired: dbCareNeeds.daily_report_required,
    additionalNotes: dbCareNeeds.additional_notes,

    // Shift Info
    preferredDays: dbCareNeeds.preferred_days,
    preferredTimeStart: dbCareNeeds.preferred_time_start,
    preferredTimeEnd: dbCareNeeds.preferred_time_end,
    
    // Metadata
    createdAt: dbCareNeeds.created_at,
    updatedAt: dbCareNeeds.updated_at
  };
}
