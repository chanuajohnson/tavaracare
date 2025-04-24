
/**
 * Extracts authentication tokens from URL hash and search params
 * Handles both Supabase hash-based tokens and search param tokens
 */
export const extractResetTokens = async (): Promise<{ access_token?: string; error?: string }> => {
  // Add small delay to ensure URL is populated
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Get full URL components for debugging
  const fullUrl = window.location.href;
  const hash = window.location.hash;
  const search = window.location.search;
  
  console.log("🔍 Reset URL Debug Info:", {
    fullUrl,
    hash,
    search,
    origin: window.location.origin,
    pathname: window.location.pathname
  });
  
  // Handle hash-based tokens (Supabase's default format)
  const hashParams = new URLSearchParams(hash.replace('#', '?'));
  
  // Also check URL search params as fallback
  const searchParams = new URLSearchParams(search);
  
  // Check for recovery type in hash (Supabase specific)
  const isRecoveryFlow = hashParams.get('type') === 'recovery' || search.includes('type=recovery');
  
  // Look for token in multiple possible locations
  const access_token =
    hashParams.get("access_token") ||
    hashParams.get("token") ||
    searchParams.get("access_token") ||
    searchParams.get("token");
  
  console.log("🔐 Token Extraction Results:", { 
    hasToken: !!access_token,
    isRecoveryFlow,
    tokenSource: access_token ? 
      (hashParams.get('access_token') ? 'hash_access_token' : 
       hashParams.get('token') ? 'hash_token' :
       searchParams.get('access_token') ? 'search_access_token' :
       'search_token') 
      : 'none'
  });
  
  if (!access_token && !isRecoveryFlow) {
    console.error("❌ No access token found in URL parameters:", { hash, search });
    return { 
      error: "No access token found in reset link. Please request a new password reset link." 
    };
  }
  
  return { access_token: access_token || (isRecoveryFlow ? 'recovery_flow' : undefined) };
};

/**
 * Safely exchanges a Supabase recovery token for a session
 */
export const exchangeRecoveryToken = async (): Promise<{ 
  success: boolean; 
  error?: string;
}> => {
  try {
    // First extract the token from the URL
    const { access_token, error: extractError } = await extractResetTokens();
    
    if (extractError) {
      console.error("❌ Error extracting token:", extractError);
      return { success: false, error: extractError };
    }
    
    console.log("✅ Token extracted successfully:", { hasToken: !!access_token });
    return { success: true };
    
  } catch (error: any) {
    console.error("❌ Error exchanging recovery token:", error.message);
    return { 
      success: false, 
      error: error.message || "Failed to process recovery token. Please try again."
    };
  }
};
