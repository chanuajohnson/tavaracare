
export const extractResetTokens = () => {
  console.log("🔍 Extracting auth reset tokens from URL");
  
  // Extract from URL hash (fragment) which is how Supabase delivers tokens
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  
  // Also check URL search params as fallback (some configurations use this)
  const searchParams = new URLSearchParams(window.location.search);
  
  // Get token and type from either source
  const token = hashParams.get('token') || searchParams.get('token');
  const type = hashParams.get('type') || searchParams.get('type');
  
  console.log("Token extraction results:", { 
    hasToken: !!token, 
    type, 
    source: token ? (hashParams.get('token') ? 'hash' : 'search') : 'none' 
  });
  
  // Check for error parameters
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (error || errorDescription) {
    throw new Error(errorDescription || 'Invalid reset link');
  }
  
  return { token, type };
};

export const clearAuthTokens = () => {
  // Simply clear the URL without refreshing the page
  if (window.history && window.history.replaceState) {
    const cleanPath = window.location.pathname;
    window.history.replaceState(null, '', cleanPath);
  }
};
