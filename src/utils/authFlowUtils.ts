
// Utility functions for managing different authentication flows
export const AUTH_FLOW_FLAGS = {
  SKIP_PASSWORD_RESET_REDIRECT: 'skipPasswordResetRedirect',
  SKIP_REGISTRATION_REDIRECT: 'skipRegistrationRedirect',
  SKIP_CARE_ASSESSMENT_REDIRECT: 'skipCareAssessmentRedirect',
  SKIP_EMAIL_VERIFICATION_REDIRECT: 'skipEmailVerificationRedirect'
} as const;

export const setAuthFlowFlag = (flag: string) => {
  sessionStorage.setItem(flag, 'true');
  console.log('[AuthFlowUtils] Set flag:', flag);
};

export const clearAuthFlowFlag = (flag: string) => {
  sessionStorage.removeItem(flag);
  console.log('[AuthFlowUtils] Cleared flag:', flag);
};

export const hasAuthFlowFlag = (flag: string): boolean => {
  const hasFlag = sessionStorage.getItem(flag) === 'true';
  if (hasFlag) {
    console.log('[AuthFlowUtils] Flag active:', flag);
  }
  return hasFlag;
};

export const clearAllAuthFlowFlags = () => {
  console.log('[AuthFlowUtils] Clearing all auth flow flags');
  Object.values(AUTH_FLOW_FLAGS).forEach(flag => {
    sessionStorage.removeItem(flag);
  });
  // Also clear the legacy flag
  sessionStorage.removeItem('skipPostLoginRedirect');
  
  // Clear any other problematic flags
  sessionStorage.removeItem('TAVARA_REDIRECT_LOCK');
  sessionStorage.removeItem('TAVARA_REDIRECT_LOCK_TIME');
  
  console.log('[AuthFlowUtils] All flags cleared');
};

export const shouldSkipRedirectForCurrentFlow = (): boolean => {
  const shouldSkip = Object.values(AUTH_FLOW_FLAGS).some(flag => hasAuthFlowFlag(flag));
  if (shouldSkip) {
    console.log('[AuthFlowUtils] Should skip redirect due to active flags');
  }
  return shouldSkip;
};
