
export const extractResetTokens = () => {
  console.log("🔍 Extracting auth reset tokens from URL");
  
  // Extract from URL hash (fragment) which is how Supabase delivers tokens
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  
  // Also check URL search params as fallback (some configurations use this)
  const searchParams = new URLSearchParams(window.location.search);
  
  // Get access token from either source
  const access_token = hashParams.get('access_token') || searchParams.get('access_token');
  
  console.log("Token extraction results:", { 
    hasToken: !!access_token,
    source: access_token ? (hashParams.get('access_token') ? 'hash' : 'search') : 'none' 
  });
  
  if (!access_token) {
    return { error: "No access token found in URL" };
  }
  
  return { access_token };
};

