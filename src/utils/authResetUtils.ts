
/**
 * Extracts authentication tokens from URL hash and search params
 * Handles both Supabase hash-based tokens and search param tokens
 */
export const extractResetTokens = (): { access_token?: string; refresh_token?: string; error?: string } => {
  // Get full URL components for detailed debugging
  const fullUrl = window.location.href;
  const hash = window.location.hash;
  const search = window.location.search;
  const pathname = window.location.pathname;
  
  console.log("🔍 Reset URL Full Debug Info:", {
    fullUrl,
    hash,
    search,
    pathname,
    origin: window.location.origin
  });
  
  // Handle hash-based tokens (Supabase's default format)
  const hashParams = new URLSearchParams(hash.replace('#', ''));
  
  // Also check URL search params as fallback
  const searchParams = new URLSearchParams(search);
  
  console.log("🔐 Token Parameter Debug:", { 
    hashParams: Object.fromEntries(hashParams.entries()),
    searchParams: Object.fromEntries(searchParams.entries())
  });
  
  // Check for recovery type in hash or search params
  const isRecoveryFlow = 
    hashParams.get('type') === 'recovery' || 
    searchParams.get('type') === 'recovery' ||
    search.includes('type=recovery') ||
    hash.includes('type=recovery') ||
    pathname.includes('reset-password');
  
  // Look for token in multiple possible locations and formats
  const access_token =
    hashParams.get("access_token") ||
    hashParams.get("token") ||
    searchParams.get("access_token") ||
    searchParams.get("token") ||
    // Extract token from Supabase standard format "#access_token=xxx&type=recovery"
    hash.match(/access_token=([^&]*)/)?.[1] ||
    search.match(/access_token=([^&]*)/)?.[1];
  
  // Also look for refresh token if present
  const refresh_token =
    hashParams.get("refresh_token") ||
    searchParams.get("refresh_token");
  
  console.log("🔐 Token Extraction Results:", { 
    hasToken: !!access_token,
    tokenLength: access_token?.length || 0,
    isRecoveryFlow,
    pathname
  });
  
  if (!access_token && !isRecoveryFlow) {
    console.error("❌ No access token found in URL parameters:", { hash, search });
    return { 
      error: "No access token found in reset link. Please request a new password reset link." 
    };
  }
  
  return { 
    access_token: access_token || (isRecoveryFlow ? 'recovery_flow' : undefined),
    refresh_token 
  };
};

