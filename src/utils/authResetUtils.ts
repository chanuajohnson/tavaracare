
/**
 * Extracts authentication tokens from URL parameters with enhanced logging
 */
export const extractResetTokens = (): { access_token?: string; refresh_token?: string; error?: string } => {
  const hash = window.location.hash;
  const search = window.location.search;
  
  console.log("[extractResetTokens] URL components:", {
    hash,
    search,
    pathname: window.location.pathname
  });

  // First try hash-based tokens (Supabase's default format)
  const hashParams = new URLSearchParams(hash.replace('#', ''));
  
  // Also check URL search params as fallback
  const searchParams = new URLSearchParams(search);
  
  console.log("[extractResetTokens] Parameters found:", {
    hashParams: Object.fromEntries(hashParams.entries()),
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Check for recovery type in either location
  const isRecoveryFlow = 
    hashParams.get('type') === 'recovery' || 
    searchParams.get('type') === 'recovery';

  // Get access token from hash or search params
  const access_token = 
    hashParams.get('access_token') || 
    searchParams.get('access_token');
    
  // Get refresh token if present
  const refresh_token = 
    hashParams.get('refresh_token') || 
    searchParams.get('refresh_token');

  console.log("[extractResetTokens] Extraction results:", {
    isRecoveryFlow,
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token
  });

  if (!access_token && !isRecoveryFlow) {
    return { error: "No valid reset token found. Please request a new password reset link." };
  }

  return { 
    access_token: access_token || undefined,
    refresh_token: refresh_token || undefined
  };
};

