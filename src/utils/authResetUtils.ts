
/**
 * Extracts and validates reset tokens from URL query parameters
 */
export const extractResetTokens = (): { 
  access_token?: string; 
  refresh_token?: string; 
  type?: string;
  error?: string 
} => {
  console.log("[Reset] Starting token extraction...");
  
  // Only check URL search params since template uses query params
  const searchParams = new URLSearchParams(window.location.search);
  
  // Extract tokens from query parameters
  const access_token = searchParams.get('access_token') || undefined;
  const refresh_token = searchParams.get('refresh_token') || undefined;
  const type = searchParams.get('type') || undefined;

  console.log("[Reset] Token validation results:", {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    type
  });

  // Validate required parameters
  if (!access_token || !refresh_token || type !== 'recovery') {
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
