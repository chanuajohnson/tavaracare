export const MAX_RESET_ATTEMPTS = 5;
export const VALIDATION_TIMEOUT_MS = 15000;

export const getResetAttempts = (): number => {
  return parseInt(sessionStorage.getItem('passwordResetAttempts') || '0');
};

export const incrementResetAttempts = (): number => {
  const attempts = getResetAttempts() + 1;
  sessionStorage.setItem('passwordResetAttempts', attempts.toString());
  console.log(`[Reset] Incremented attempts to: ${attempts}`);
  return attempts;
};

export const clearResetAttempts = () => {
  sessionStorage.removeItem('passwordResetAttempts');
  console.log('[Reset] Cleared reset attempts counter');
};

export const isPasswordStrong = (password: string): boolean => {
  return password.length >= 8;
};

export const logResetAttempt = (success: boolean, error?: string) => {
  const attempt = {
    timestamp: new Date().toISOString(),
    success,
    error: error || null,
    attempts: getResetAttempts()
  };
  
  console.log('[Reset] Attempt logged:', attempt);
  
  // Store recent attempts for debugging
  const recentAttempts = JSON.parse(localStorage.getItem('recentResetAttempts') || '[]');
  recentAttempts.push(attempt);
  
  // Keep only last 10 attempts
  if (recentAttempts.length > 10) {
    recentAttempts.shift();
  }
  
  localStorage.setItem('recentResetAttempts', JSON.stringify(recentAttempts));
};
