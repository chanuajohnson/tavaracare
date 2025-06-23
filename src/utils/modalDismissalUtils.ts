
// Utility functions for tracking modal dismissal states
export const getModalDismissalKey = (userId: string, modalType: 'professional' | 'family') => {
  return `${modalType}_readiness_modal_dismissed_${userId}`;
};

export const isModalDismissed = (userId: string, modalType: 'professional' | 'family'): boolean => {
  if (!userId) return false;
  const key = getModalDismissalKey(userId, modalType);
  return localStorage.getItem(key) === 'true';
};

export const setModalDismissed = (userId: string, modalType: 'professional' | 'family'): void => {
  if (!userId) return;
  const key = getModalDismissalKey(userId, modalType);
  localStorage.setItem(key, 'true');
};

export const clearModalDismissal = (userId: string, modalType: 'professional' | 'family'): void => {
  if (!userId) return;
  const key = getModalDismissalKey(userId, modalType);
  localStorage.removeItem(key);
};
