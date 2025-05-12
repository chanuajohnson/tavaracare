
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
  
  // Also try to extract the legacy token format (token and type)
  const token = searchParams.get('token') || undefined;
  const type = searchParams.get('type') || undefined;
  
  // Extract email which is now required for recovery token verification
  const email = searchParams.get('email') || undefined;

  console.log("[Reset] Token validation results:", {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    hasLegacyToken: !!token,
    hasEmail: !!email,
    type
  });

  // Case 1: We have the modern Supabase token format
  if (access_token && refresh_token) {
    return { access_token, refresh_token, type };
  }
  
  // Case 2: We have the legacy token format (token and type)
  if (token && type === 'recovery') {
    console.log("[Reset] Found legacy token format, will attempt to convert");
    if (!email) {
      console.warn("[Reset] Email parameter is missing, which is required for recovery verification");
    }
    return { token, type, email };
  }

  // No valid tokens found
  return { 
    error: "Invalid or expired reset link. Please request a new password reset link." 
  };
};
