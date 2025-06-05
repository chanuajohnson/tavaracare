
export const MAX_RESET_ATTEMPTS = 3;
export const VALIDATION_TIMEOUT_MS = 10000;

export const getResetAttempts = (): number => {
  return parseInt(sessionStorage.getItem('passwordResetAttempts') || '0');
};

export const incrementResetAttempts = (): number => {
  const attempts = getResetAttempts() + 1;
  sessionStorage.setItem('passwordResetAttempts', attempts.toString());
  return attempts;
};

export const clearResetAttempts = () => {
  sessionStorage.removeItem('passwordResetAttempts');
};

export const isPasswordStrong = (password: string): boolean => {
  return password.length >= 8;
};
