
import { ProfileData, ProfessionalDocument, CareTeamAssignment, ProfessionalReference, ProfessionalScreening } from './types';

// Define required document types that professionals must upload
export const REQUIRED_DOCUMENT_TYPES = [
  'identification',
  'certificate',
  'background_check'
] as const;

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

export const hasAllRequiredDocuments = (documents: ProfessionalDocument[]): { hasAll: boolean; missing: string[] } => {
  const documentTypes = documents.map(doc => doc.document_type);
  const missing: string[] = [];
  
  REQUIRED_DOCUMENT_TYPES.forEach(requiredType => {
    if (!documentTypes.includes(requiredType)) {
      missing.push(requiredType);
    }
  });
  
  const hasAll = missing.length === 0;
  
  console.log(`📄 Document type check:`, {
    availableTypes: documentTypes,
    requiredTypes: REQUIRED_DOCUMENT_TYPES,
    missing,
    hasAll
  });
  
  return { hasAll, missing };
};

export const hasDocuments = (documents: ProfessionalDocument[]): boolean => {
  const { hasAll, missing } = hasAllRequiredDocuments(documents);
  
  console.log(`📄 Step 4 (Documents): ${hasAll}`, {
    totalDocuments: documents.length,
    requiredTypes: REQUIRED_DOCUMENT_TYPES,
    missingTypes: missing,
    hasAllRequired: hasAll
  });
  
  return hasAll;
};

export const getDocumentCount = (documents: ProfessionalDocument[]): number => {
  return documents.length;
};

export const getMissingDocumentTypes = (documents: ProfessionalDocument[]): string[] => {
  const { missing } = hasAllRequiredDocuments(documents);
  return missing;
};

export const hasRequiredReferences = (references: ProfessionalReference[]): boolean => {
  const completed = references.length >= 2;
  console.log(`📋 Step 5 (References): ${completed} (count: ${references.length}, need 2+)`);
  return completed;
};

export const hasPassedScreening = (screenings: ProfessionalScreening[], screeningSessions?: { status: string }[]): boolean => {
  // Primary check: explicit 'passed' record in professional_screening
  const passed = screenings.some(
    s => s.screening_type === 'head_nurse_interview' && s.status === 'passed'
  );
  
  // Fallback: if all screening sessions are 'reviewed' or 'completed', treat as passed
  const hasReviewedSessions = !passed && screeningSessions && screeningSessions.length > 0 &&
    screeningSessions.every(s => s.status === 'reviewed' || s.status === 'completed');
  
  const result = passed || !!hasReviewedSessions;
  
  console.log(`🩺 Step 6 (Screening): ${result}`, {
    screeningCount: screenings.length,
    statuses: screenings.map(s => ({ type: s.screening_type, status: s.status })),
    screeningSessionCount: screeningSessions?.length || 0,
    sessionStatuses: screeningSessions?.map(s => s.status),
    passedViaScreening: passed,
    passedViaSessions: !!hasReviewedSessions,
  });
  return result;
};

export const hasAssignments = (assignments: CareTeamAssignment[]): boolean => {
  const completed = assignments.length > 0;
  console.log(`💼 Step 7 (Assignments): ${completed} (count: ${assignments.length})`);
  return completed;
};

export const hasCertifications = (profile: ProfileData | null): boolean => {
  const certificationsArray = profile?.certifications;
  const certificationsCount = Array.isArray(certificationsArray) ? certificationsArray.length : 0;
  const hasProfileTypeForTraining = !!profile?.professional_type;
  const completed = hasProfileTypeForTraining && certificationsCount > 0;
  
  console.log(`🎓 Step 8 (Training/Certifications): ${completed}`, {
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
  documents: ProfessionalDocument[],
  references: ProfessionalReference[] = [],
  screenings: ProfessionalScreening[] = []
): boolean => {
  // Step 7 (matching) is only accessible if steps 1-6 are completed
  if (stepId === 7) {
    const step1Complete = isAccountCreated(userId);
    const step2Complete = isProfileComplete(profile);
    const step3Complete = isAvailabilitySet(profile);
    const step4Complete = hasDocuments(documents);
    const step5Complete = hasRequiredReferences(references);
    const step6Complete = hasPassedScreening(screenings);
    
    const accessible = step1Complete && step2Complete && step3Complete && step4Complete && step5Complete && step6Complete;
    
    console.log(`🔒 Step 7 accessibility check:`, {
      step1Complete,
      step2Complete,
      step3Complete,
      step4Complete,
      step5Complete,
      step6Complete,
      accessible,
      missingDocumentTypes: getMissingDocumentTypes(documents)
    });
    
    return accessible;
  }
  
  return true;
};
