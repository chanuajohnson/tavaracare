
import { ProfileData, ProfessionalDocument, CareTeamAssignment } from './types';

export const isAccountCreated = (userId: string): boolean => {
  const completed = !!userId;
  console.log(`✅ Step 1 (Account): ${completed} - userId exists: ${!!userId}`);
  return completed;
};

export const isProfileComplete = (profile: ProfileData | null): boolean => {
  const hasProfileType = !!profile?.professional_type;
  const hasYearsExp = !!profile?.years_of_experience;
  const completed = hasProfileType && hasYearsExp;
  
  console.log(`🔍 Step 2 (Profile): ${completed}`, {
    professionalType: profile?.professional_type,
    yearsExperience: profile?.years_of_experience,
    hasProfileType,
    hasYearsExp
  });
  
  return completed;
};

export const isAvailabilitySet = (profile: ProfileData | null): boolean => {
  const careScheduleData = profile?.care_schedule;
  const careScheduleLength = typeof careScheduleData === 'string' 
    ? careScheduleData.split(',').filter(s => s.trim()).length 
    : Array.isArray(careScheduleData) ? careScheduleData.length : 0;
  const completed = careScheduleLength > 0;
  
  console.log(`📅 Step 3 (Availability): ${completed}`, {
    careScheduleData,
    careScheduleLength,
    isString: typeof careScheduleData === 'string',
    isArray: Array.isArray(careScheduleData)
  });
  
  return completed;
};

export const hasDocuments = (documents: ProfessionalDocument[]): boolean => {
  const completed = documents.length > 0;
  console.log(`📄 Step 4 (Documents): ${completed} (count: ${documents.length})`);
  return completed;
};

export const getDocumentCount = (documents: ProfessionalDocument[]): number => {
  return documents.length;
};

export const hasAssignments = (assignments: CareTeamAssignment[]): boolean => {
  const completed = assignments.length > 0;
  console.log(`💼 Step 5 (Assignments): ${completed} (count: ${assignments.length})`);
  return completed;
};

export const hasCertifications = (profile: ProfileData | null): boolean => {
  const certificationsArray = profile?.certifications;
  const certificationsCount = Array.isArray(certificationsArray) ? certificationsArray.length : 0;
  const hasProfileTypeForTraining = !!profile?.professional_type;
  const completed = hasProfileTypeForTraining && certificationsCount > 0;
  
  console.log(`🎓 Step 6 (Training/Certifications): ${completed}`, {
    certificationsArray,
    certificationsCount,
    hasProfileTypeForTraining,
    isArray: Array.isArray(certificationsArray)
  });
  
  return completed;
};

export const checkStepAccessibility = (
  stepId: number,
  userId: string,
  profile: ProfileData | null,
  documents: ProfessionalDocument[]
): boolean => {
  // Step 5 is only accessible if steps 1-4 are completed
  if (stepId === 5) {
    const step1Complete = isAccountCreated(userId);
    const step2Complete = isProfileComplete(profile);
    const step3Complete = isAvailabilitySet(profile);
    const step4Complete = hasDocuments(documents);
    
    const accessible = step1Complete && step2Complete && step3Complete && step4Complete;
    
    console.log(`🔒 Step 5 accessibility check:`, {
      step1Complete,
      step2Complete,
      step3Complete,
      step4Complete,
      accessible
    });
    
    return accessible;
  }
  
  return true;
};
