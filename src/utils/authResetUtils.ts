
/**
 * Extracts and validates reset tokens from URL query parameters
 */
export const extractResetTokens = (): { 
  access_token?: string; 
  refresh_token?: string; 
  type?: string;
  token?: string;
  email?: string;
  error?: string 
} => {
  console.log("[Reset] Starting token extraction...");
  console.log("[Reset] URL:", window.location.href);
  
  // Extract query parameters from the URL
  const searchParams = new URLSearchParams(window.location.search);
  
  // Try to extract Supabase's standard access_token and refresh_token
  const access_token = searchParams.get('access_token') || undefined;
  const refresh_token = searchParams.get('refresh_token') || undefined;
  
  // Try to extract both legacy token format and new otp format
  const token = searchParams.get('token') || searchParams.get('otp') || undefined;
  const type = searchParams.get('type') || undefined;
  
  // Extract email which is now required for recovery token verification
  const email = searchParams.get('email') || undefined;

  console.log("[Reset] Token validation results:", {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    hasToken: !!token,
    tokenSource: searchParams.get('token') ? 'token param' : searchParams.get('otp') ? 'otp param' : 'none',
    hasEmail: !!email,
    type
  });

  // Case 1: We have the modern Supabase token format
  if (access_token && refresh_token) {
    console.log("[Reset] Found modern access_token format");
    return { access_token, refresh_token, type };
  }
  
  // Case 2: We have either legacy token format or new otp format
  if (token && type === 'recovery') {
    console.log("[Reset] Found recovery token format, will attempt to convert");
    if (!email) {
      console.warn("[Reset] Email parameter is missing, which is required for recovery verification");
      return { 
        error: "Invalid recovery link. The email parameter is missing. Please request a new password reset link." 
      };
    }
    return { token, type, email };
  }

  // Case 3: Check for any recovery-related parameters to provide helpful error
  if (type === 'recovery' && !token) {
    console.error("[Reset] Recovery type found but no token parameter");
    return { 
      error: "Invalid recovery link. The token is missing. Please request a new password reset link." 
    };
  }

  // No valid tokens found
  console.error("[Reset] No valid token format found");
  return { 
    error: "Invalid or expired reset link. Please request a new password reset link." 
  };
};
