
export async function extractResetTokens(): Promise<{ access_token?: string; error?: string }> {
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
    searchParams.get("token");
  
  console.log("Token extraction results:", { 
    hasToken: !!access_token,
    tokenLocation: access_token ? 
      (hashParams.get('access_token') || hashParams.get('token') ? 'hash' : 'search') 
      : 'none'
  });
  
  if (!access_token) {
    return { 
      error: "No access token found in URL. Please check the reset link or request a new one." 
    };
  }
  
  return { access_token };
}
