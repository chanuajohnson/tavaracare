
/**
 * Extracts and validates reset tokens from URL parameters
 */
export const extractResetTokens = (): { 
  access_token?: string; 
  refresh_token?: string; 
  type?: string;
  error?: string 
} => {
  const hash = window.location.hash;
  const search = window.location.search;
  
  console.log("[Reset] Full URL components:", {
    url: window.location.href,
    hash,
    search,
    pathname: window.location.pathname
  });

  // Parse both hash and search parameters
  const hashParams = new URLSearchParams(hash.replace('#', ''));
  const searchParams = new URLSearchParams(search);
  
  // Check all possible token locations
  const access_token = 
    hashParams.get('access_token') || 
    searchParams.get('access_token') ||
    hashParams.get('token') ||
    searchParams.get('token');
    
  const refresh_token = 
    hashParams.get('refresh_token') || 
    searchParams.get('refresh_token');
    
  const type = 
    hashParams.get('type') || 
    searchParams.get('type');

  const isValidRecovery = type === 'recovery' && access_token;
  
  console.log("[Reset] Token extraction results:", {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    type,
    isValidRecovery
  });

  if (!isValidRecovery) {
    return { 
      error: "Invalid or expired reset link. Please request a new password reset link." 
    };
  }

  return { 
    access_token,
    refresh_token,
    type
  };
};
