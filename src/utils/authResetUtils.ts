
export const extractResetTokens = () => {
  // First try to get tokens from URL hash
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  let accessToken = params.get('access_token');
  let refreshToken = params.get('refresh_token');
  let type = params.get('type');

  // If not in hash, try URL search params
  if (!accessToken || !refreshToken) {
    const searchParams = new URLSearchParams(window.location.search);
    accessToken = searchParams.get('access_token');
    refreshToken = searchParams.get('refresh_token');
    type = searchParams.get('type');
  }
  
  return {
    accessToken,
    refreshToken,
    type,
  };
};

export const clearAuthTokens = () => {
  // Clear both hash and search parameters without triggering a reload
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname);
  }
  if (window.location.search) {
    window.history.replaceState(null, '', window.location.pathname);
  }
};
