
export const extractResetTokens = () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type'),
  };
};

export const clearAuthTokens = () => {
  // Clear the URL hash without triggering a reload
  window.history.replaceState(null, '', window.location.pathname);
};
