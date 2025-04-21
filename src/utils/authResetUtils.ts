
export const extractResetTokens = () => {
  console.log("🔍 Extracting auth reset tokens from URL");
  
  // First try to get tokens from URL hash (fragment) - most common for Supabase reset links
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  let accessToken = params.get('access_token');
  let refreshToken = params.get('refresh_token');
  let type = params.get('type');

  console.log("📝 Hash parameters:", { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken, 
    type,
    rawHash: hash // Add raw hash for debugging
  });

  // If not in hash, try URL search params (query string)
  if (!accessToken || !refreshToken) {
    console.log("🔍 No tokens in hash, checking query string");
    const searchParams = new URLSearchParams(window.location.search);
    accessToken = searchParams.get('access_token');
    refreshToken = searchParams.get('refresh_token');
    type = searchParams.get('type');
    
    // Check for error parameters
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error || errorDescription) {
      console.error("❌ Error parameters found:", { error, errorDescription });
      throw new Error(errorDescription || 'Invalid reset link');
    }
    
    console.log("📝 Query parameters:", { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      type,
      rawSearch: window.location.search // Add raw search for debugging
    });
  }
  
  return {
    accessToken,
    refreshToken,
    type,
  };
};

export const clearAuthTokens = () => {
  console.log("🧹 Clearing auth tokens from URL");
  
  // Clear both hash and search parameters without triggering a reload
  const currentPath = window.location.pathname;
  
  if (window.location.hash || window.location.search) {
    console.log("📝 Current URL has hash or search params, cleaning");
    window.history.replaceState(null, '', currentPath);
  }
};

