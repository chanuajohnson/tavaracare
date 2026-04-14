
// Types related to care team functionality
import { CareTeamMemberDto, CareTeamMember, CareTeamMemberInput, CareTeamMemberWithProfile } from "@/types/careTypes";

// Re-export types for easy access
export type { 
  CareTeamMemberDto, 
  CareTeamMember, 
  CareTeamMemberInput, 
  CareTeamMemberWithProfile 
};

// Adapters for converting between domain and database models
export const adaptCareTeamMemberFromDb = (dbMember: CareTeamMemberDto): CareTeamMember => ({
  id: dbMember.id!,
  carePlanId: dbMember.care_plan_id,
  familyId: dbMember.family_id,
  caregiverId: dbMember.caregiver_id,
  role: dbMember.role || 'caregiver',
  status: dbMember.status || 'invited',
  notes: dbMember.notes,
  createdAt: dbMember.created_at || new Date().toISOString(),
  updatedAt: dbMember.updated_at || new Date().toISOString(),
  nisNumber: dbMember.nis_number,
  dateOfBirth: dbMember.date_of_birth,
  dateEmployed: dbMember.date_employed,
  isNisRegistered: dbMember.is_nis_registered ?? false,
});

export const adaptCareTeamMemberToDb = (member: Partial<CareTeamMember>): Partial<CareTeamMemberDto> => ({
  id: member.id,
  care_plan_id: member.carePlanId,
  family_id: member.familyId,
  caregiver_id: member.caregiverId,
  role: member.role,
  status: member.status,
  notes: member.notes,
  nis_number: member.nisNumber,
  date_of_birth: member.dateOfBirth,
  date_employed: member.dateEmployed,
  is_nis_registered: member.isNisRegistered,
});
