
// Utility functions for managing different authentication flows
export const AUTH_FLOW_FLAGS = {
  SKIP_PASSWORD_RESET_REDIRECT: 'skipPasswordResetRedirect',
  SKIP_REGISTRATION_REDIRECT: 'skipRegistrationRedirect',
  SKIP_CARE_ASSESSMENT_REDIRECT: 'skipCareAssessmentRedirect',
  SKIP_EMAIL_VERIFICATION_REDIRECT: 'skipEmailVerificationRedirect'
} as const;

export const setAuthFlowFlag = (flag: string) => {
  sessionStorage.setItem(flag, 'true');
};

export const clearAuthFlowFlag = (flag: string) => {
  sessionStorage.removeItem(flag);
};

export const hasAuthFlowFlag = (flag: string): boolean => {
  return sessionStorage.getItem(flag) === 'true';
};

export const clearAllAuthFlowFlags = () => {
  Object.values(AUTH_FLOW_FLAGS).forEach(flag => {
    sessionStorage.removeItem(flag);
  });
  // Also clear the legacy flag
  sessionStorage.removeItem('skipPostLoginRedirect');
};

export const shouldSkipRedirectForCurrentFlow = (): boolean => {
  return Object.values(AUTH_FLOW_FLAGS).some(flag => hasAuthFlowFlag(flag));
};
