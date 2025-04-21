
export const extractResetTokens = () => {
  console.log("🔍 Extracting auth reset tokens from URL");
  
  // Extract token from URL hash (fragment) - most common for Supabase reset links
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  
  // Also check URL search params (query string) as fallback
  const searchParams = new URLSearchParams(window.location.search);
  
  // Look for Supabase's password reset token
  let token = hashParams.get('token') || searchParams.get('token');
  let type = hashParams.get('type') || searchParams.get('type');
  
  console.log("📝 Token parameters:", { 
    hasToken: !!token,
    type,
    rawHash: hash,
    rawSearch: window.location.search
  });
  
  // Check for error parameters
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (error || errorDescription) {
    console.error("❌ Error parameters found:", { error, errorDescription });
    throw new Error(errorDescription || 'Invalid reset link');
  }
  
  return { token, type };
};

export const clearAuthTokens = () => {
  console.log("🧹 Clearing auth tokens from URL");
  
  // Clear both hash and search parameters without triggering a reload
  const currentPath = window.location.pathname;
  
  if (window.location.hash || window.location.search) {
    console.log("📝 Current URL has hash or search params, cleaning");
    window.history.replaceState(null, '', currentPath);
  }
};
