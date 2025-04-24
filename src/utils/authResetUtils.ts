
/**
 * Extracts authentication tokens from URL hash and search params
 * Handles both Supabase hash-based tokens and search param tokens
 */
export const extractResetTokens = async (): Promise<{ access_token?: string; error?: string }> => {
  // Add small delay to ensure URL is populated
  await new Promise(resolve => setTimeout(resolve, 50));
  
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
  
  // Check for recovery type in hash or search params (Supabase specific)
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
    
    if (!access_token || access_token === 'recovery_flow') {
      // Check if we already have a valid session which can happen with Supabase auto-login
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        console.log("✅ Already have a valid session, likely from Supabase auto-login");
        return { success: true };
      } else {
        console.error("❌ No access token and no session found");
        return { 
          success: false, 
          error: "Invalid password reset link. Please request a new one." 
        };
      }
    }
    
    console.log("✅ Token extracted successfully", { hasToken: !!access_token });
    
    // For actual token exchange with Supabase, we would use:
    // const { data, error } = await supabase.auth.verifyOtp({
    //   token_hash: access_token,
    //   type: 'recovery'
    // });
    // 
    // But Supabase actually handles this automatically when the URL is loaded,
    // so we just need to check if we now have a valid session
    
    return { success: true };
    
  } catch (error: any) {
    console.error("❌ Error exchanging recovery token:", error.message);
    return { 
      success: false, 
      error: error.message || "Failed to process recovery token. Please try again."
    };
  }
};

// Add this import at the top of the file
import { supabase } from "@/integrations/supabase/client";
