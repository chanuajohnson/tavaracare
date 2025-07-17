
import { FamilyProfileData, CareAssessmentData, CareRecipientData } from './types';

export const isRegistrationComplete = (profile: FamilyProfileData | null): boolean => {
  if (!profile) {
    console.log(`✅ Family Registration Complete: false - no profile data`);
    return false;
  }
  
  const hasRequiredFields = !!(
    profile.full_name &&
    profile.phone_number &&
    profile.address &&
    profile.care_recipient_name &&
    profile.relationship
  );
  
  console.log(`✅ Family Registration Complete: ${hasRequiredFields}`, {
    fullName: !!profile.full_name,
    phoneNumber: !!profile.phone_number,
    address: !!profile.address,
    careRecipientName: !!profile.care_recipient_name,
    relationship: !!profile.relationship
  });
  
  return hasRequiredFields;
};

export const isCareAssessmentComplete = (assessment: CareAssessmentData | null): boolean => {
  if (!assessment) {
    console.log(`📋 Care Assessment Complete: false - no assessment data`);
    return false;
  }
  
  const hasAssessment = !!(
    assessment.id &&
    (assessment.care_recipient_name || assessment.primary_contact_name)
  );
  
  console.log(`📋 Care Assessment Complete: ${hasAssessment}`, {
    hasAssessmentId: !!assessment.id,
    hasCareRecipientName: !!assessment.care_recipient_name,
    hasPrimaryContact: !!assessment.primary_contact_name
  });
  
  return hasAssessment;
};

export const isStoryComplete = (story: CareRecipientData | null): boolean => {
  if (!story) {
    console.log(`💖 Story Complete: false - no story data`);
    return false;
  }
  
  const hasStory = !!(
    story.id &&
    story.full_name &&
    story.birth_year
  );
  
  console.log(`💖 Story Complete: ${hasStory}`, {
    hasStoryId: !!story.id,
    hasFullName: !!story.full_name,
    hasBirthYear: !!story.birth_year
  });
  
  return hasStory;
};

export const getFamilyReadinessStatus = (
  profile: FamilyProfileData | null,
  assessment: CareAssessmentData | null,
  story: CareRecipientData | null
) => {
  const registrationComplete = isRegistrationComplete(profile);
  const careAssessmentComplete = isCareAssessmentComplete(assessment);
  const storyComplete = isStoryComplete(story);
  
  const allReady = registrationComplete && careAssessmentComplete;
  
  console.log('📊 Family Readiness Status:', {
    registrationComplete,
    careAssessmentComplete,
    storyComplete,
    allReady
  });
  
  return {
    registrationComplete,
    careAssessmentComplete,
    storyComplete,
    allReady
  };
};
