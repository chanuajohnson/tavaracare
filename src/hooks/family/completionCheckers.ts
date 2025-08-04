
import { FamilyProfileData, CareAssessmentData, CareRecipientData } from './types';

export const isRegistrationComplete = (profile: FamilyProfileData | null): boolean => {

  if (!profile) {
    console.log('❌ Family Registration: No profile data');
    return false;
  }

  // Core required fields (must have all)
  const requiredFields = {
    full_name: profile.full_name,
    phone_number: profile.phone_number,
    address: profile.address,
    care_recipient_name: profile.care_recipient_name,
    relationship: profile.relationship
  };

  const hasAllRequiredFields = Object.entries(requiredFields).every(([field, value]) => {
    const hasValue = !!(value && String(value).trim());
    if (!hasValue) {
      console.log(`❌ Registration: Missing required field ${field}:`, value);
    }
    return hasValue;
  });

  // Enhanced completion indicators (at least one should be present for comprehensive registration)
  const enhancedFields = {
    care_types: profile.care_types && Array.isArray(profile.care_types) && profile.care_types.length > 0,
    care_schedule: profile.care_schedule && String(profile.care_schedule).trim(),
    budget_preferences: profile.budget_preferences && String(profile.budget_preferences).trim(),
    caregiver_type: profile.caregiver_type && String(profile.caregiver_type).trim()
  };

  const hasEnhancedData = Object.values(enhancedFields).some(Boolean);
  const isComplete = hasAllRequiredFields && hasEnhancedData;

  console.log(`✅ Family Registration Complete: ${isComplete}`, {
    hasAllRequiredFields,
    hasEnhancedData,
    requiredFields: Object.entries(requiredFields).map(([k, v]) => [k, !!v]),
    enhancedFields: Object.entries(enhancedFields).map(([k, v]) => [k, !!v])
  });
  
  return isComplete;

};

export const isCareAssessmentComplete = (assessment: CareAssessmentData | null): boolean => {
  const hasAssessment = !!(
    assessment?.id &&
    (assessment?.care_recipient_name || assessment?.primary_contact_name)
  );
  
  console.log(`📋 Care Assessment Complete: ${hasAssessment}`, {
    hasAssessmentId: !!assessment?.id,
    hasCareRecipientName: !!assessment?.care_recipient_name,
    hasPrimaryContact: !!assessment?.primary_contact_name
  });
  
  return hasAssessment;
};

export const isStoryComplete = (story: CareRecipientData | null): boolean => {
  const hasStory = !!(
    story?.id &&
    story?.full_name &&
    story?.birth_year
  );
  
  console.log(`💖 Story Complete: ${hasStory}`, {
    hasStoryId: !!story?.id,
    hasFullName: !!story?.full_name,
    hasBirthYear: !!story?.birth_year
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
  

  // User is ready if they have registration AND assessment complete
  // Story is optional but recommended

  const allReady = registrationComplete && careAssessmentComplete;
  
  console.log('📊 Family Readiness Status:', {
    registrationComplete,
    careAssessmentComplete,
    storyComplete,

    allReady,
    profile: profile ? 'exists' : 'null',
    assessment: assessment ? 'exists' : 'null',
    story: story ? 'exists' : 'null'

  });
  
  return {
    registrationComplete,
    careAssessmentComplete,
    storyComplete,
    allReady
  };
};
