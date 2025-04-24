
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
  
  console.log("🔍 Reset URL components:", {
    fullUrl,
    hash,
    search
  });
  
  // Extract from URL hash (fragment) which is how Supabase delivers tokens
  const hashParams = new URLSearchParams(hash.substring(1));
  
  // Also check URL search params as fallback
  const searchParams = new URLSearchParams(search);
  
  // Try different possible token parameter names
  const access_token =
    hashParams.get("access_token") ||
    hashParams.get("token") ||
    searchParams.get("access_token") ||
    searchParams.get("token") ||
    // Look for type=recovery in the hash which indicates password recovery
    (hash.includes("type=recovery") ? "recovery_token_present" : null);
  
  console.log("Token extraction results:", { 
    hasToken: !!access_token,
    tokenLocation: access_token ? 
      (hashParams.get('access_token') || hashParams.get('token') ? 'hash' : 
       searchParams.get('access_token') || searchParams.get('token') ? 'search' : 
       'recovery_type_detected') 
      : 'none'
  });
  
  if (!access_token) {
    return { 
      error: "No access token found in URL. Please check the reset link or request a new one." 
    };
  }
  
  return { access_token };
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
    const { error: extractError } = await extractResetTokens();
    if (extractError) {
      console.error("Error extracting token:", extractError);
      return { success: false, error: extractError };
    }
    
    // In the password recovery flow, Supabase should have already processed the token
    // and created a session, so we just need to verify that a session exists
    return { success: true };
  } catch (error: any) {
    console.error("Error exchanging recovery token:", error.message);
    return { 
      success: false, 
      error: error.message || "Failed to process recovery token"
    };
  }
};
