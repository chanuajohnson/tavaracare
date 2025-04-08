
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"request" | "reset">("request"); // Default to request mode
  const [resetComplete, setResetComplete] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Force logout immediately on mount to avoid session conflicts
  useEffect(() => {
    const clearSession = async () => {
      try {
        // Sign out with global scope to clear all sessions
        await supabase.auth.signOut({ scope: 'global' });
        console.log("[ResetPasswordPage] Successfully cleared existing sessions");
      } catch (err) {
        console.error("[ResetPasswordPage] Error during initial signout:", err);
      }
    };
    
    clearSession();
    
    // Set this page to ignore redirections in AuthProvider
    sessionStorage.setItem('ignoreRedirect', 'true');
    
    // Cleanup function
    return () => {
      sessionStorage.removeItem('ignoreRedirect');
    };
  }, []);

  useEffect(() => {
    const validateResetToken = async () => {
      try {
        setValidatingToken(true);
        console.log("[ResetPasswordPage] Starting token validation");
        
        // Parse URL parameters from different possible locations
        const currentUrl = window.location.href;
        console.log("[ResetPasswordPage] Current URL:", currentUrl);
        
        // Check hash parameters (Supabase sometimes sends tokens in hash)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        
        // Check query parameters
        const queryParams = new URLSearchParams(location.search);
        
        // Extract all possible token formats
        const type = queryParams.get("type");
        const code = queryParams.get("code") || queryParams.get("token");
        const queryAccessToken = queryParams.get("access_token");
        const hashAccessToken = hashParams.get("access_token");
        
        // Log all parameters for debugging
        console.log("[ResetPasswordPage] URL params:", { 
          type,
          code,
          queryAccessToken,
          hashAccessToken,
          hasCode: !!code,
          hasQueryAccessToken: !!queryAccessToken,
          hasHashAccessToken: !!hashAccessToken,
          hash: location.hash,
          search: location.search
        });
        
        // Determine which token to use based on priority
        const tokenValue = code || queryAccessToken || hashAccessToken;
        setToken(tokenValue);
        
        // Handle recovery token validation
        if ((type === "recovery" && tokenValue) || hashAccessToken) {
          try {
            console.log("[ResetPasswordPage] Recovery token found, validating with token:", 
              tokenValue ? `${tokenValue.substring(0, 5)}...` : 'undefined');
            
            if (tokenValue) {
              try {
                // First try with token_hash parameter
                const { data, error } = await supabase.auth.verifyOtp({
                  token_hash: tokenValue,
                  type: 'recovery'
                });
                
                if (error) {
                  console.error("[ResetPasswordPage] Token validation with token_hash failed:", error);
                  
                  // If we already have an email, try with email + token combination
                  if (email) {
                    const secondAttempt = await supabase.auth.verifyOtp({
                      email: email,
                      token: tokenValue,
                      type: 'recovery'
                    });
                    
                    if (secondAttempt.error) {
                      console.error("[ResetPasswordPage] Token validation with email+token also failed:", secondAttempt.error);
                      throw secondAttempt.error;
                    }
                  } else {
                    // If we don't have an email, just throw the original error
                    throw error;
                  }
                }
                
                if (data?.user?.email) {
                  setEmail(data.user.email);
                  console.log("[ResetPasswordPage] Found email from token validation:", data.user.email);
                }
              } catch (tokenError) {
                console.error("[ResetPasswordPage] Error validating token:", tokenError);
                throw tokenError;
              }
            }
            
            console.log("[ResetPasswordPage] Successfully validated recovery token");
            setTokenValidated(true);
            setMode("reset"); // Explicitly set mode to reset when token is valid
            setError(null);
            
            toast.info("Please set a new password you'll remember", {
              description: "Create a strong password with at least 6 characters",
              duration: 6000
            });
          } catch (error: any) {
            console.error("[ResetPasswordPage] Error validating recovery token:", error);
            setError("Invalid or expired reset link. Please request a new one.");
            setMode("request");
            setTokenValidated(false);
          }
        } else {
          // No recovery token found in URL
          console.log("[ResetPasswordPage] No valid recovery token found in URL");
          setError("No valid reset token found. Please request a password reset link.");
          setMode("request");
          setTokenValidated(false);
        }
      } catch (error: any) {
        console.error("[ResetPasswordPage] Token validation error:", error);
        setError("Invalid or expired reset link. Please request a new one.");
        setMode("request");
        setTokenValidated(false);
      } finally {
        setValidatingToken(false);
      }
    };

    // Short delay to ensure signOut completes first
    const timeout = setTimeout(() => {
      validateResetToken();
    }, 300);

    return () => clearTimeout(timeout);
  }, [location, email]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("[ResetPasswordPage] Updating password...");
      
      // Try to update user password directly
      const { error } = await supabase.auth.updateUser({ 
        password 
      });
      
      if (error) {
        console.error("[ResetPasswordPage] Error updating password:", error);
        
        // If direct update fails, try with the token we saved earlier
        if (token) {
          console.log("[ResetPasswordPage] Trying password update with explicit token verification");
          
          // Try to verify OTP again to ensure token is still valid
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery',
          });
          
          if (verifyError) {
            console.error("[ResetPasswordPage] Error reverifying token:", verifyError);
            throw verifyError;
          }
          
          // Try password update again after verification
          const { error: secondUpdateError } = await supabase.auth.updateUser({
            password: password
          });
          
          if (secondUpdateError) {
            console.error("[ResetPasswordPage] Error in second password update attempt:", secondUpdateError);
            throw secondUpdateError;
          }
        } else {
          throw error;
        }
      }
      
      // Sign out again after password reset to ensure a clean state
      await supabase.auth.signOut({ scope: 'global' });
      
      toast.success("Password has been reset successfully");
      setResetComplete(true);
    } catch (error: any) {
      console.error("[ResetPasswordPage] Error:", error);
      toast.error(error.message || "Failed to reset password");
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestReset = async (email: string) => {
    try {
      setIsLoading(true);
      console.log("[ResetPasswordPage] Requesting password reset for:", email);
      
      // Get the absolute base URL for the reset link
      const currentDomain = window.location.hostname;
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      
      // Construct the full URL for password reset
      const baseUrl = `${protocol}//${currentDomain}${port}`;
      const resetPath = "/auth/reset-password";
      const resetPasswordUrl = `${baseUrl}${resetPath}`;
      
      console.log("[ResetPasswordPage] Using reset password redirect URL:", resetPasswordUrl);
      
      // Send password reset request with the redirect URL
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetPasswordUrl,
      });
      
      if (error) throw error;
      
      console.log("[ResetPasswordPage] Password reset email sent successfully");
      toast.success("Password reset email sent", {
        description: "Please check your inbox and spam folder",
        duration: 8000
      });
      return true;
    } catch (error: any) {
      console.error("[ResetPasswordPage] Error requesting reset:", error);
      toast.error(error.message || "Failed to send password reset email");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render loading state
  if (validatingToken) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Validating your password reset link...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Render success state
  if (resetComplete) {
    return (
      <div className="container flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Password Reset Complete</CardTitle>
            <CardDescription className="text-center">
              Your password has been successfully reset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md mb-4">
              <p className="font-medium">Success!</p>
              <p className="text-sm mt-2">
                Your password has been updated. You can now log in with your new password.
              </p>
            </div>
            <div className="mt-6">
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full"
              >
                Continue to Login
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Tavara &copy; {new Date().getFullYear()}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render main form (either request or reset password mode)
  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
          <CardDescription className="text-center">
            {mode === "reset" ? "Please enter your new password below" : "Request a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "request" ? (
            // Request mode shows the email form
            <ResetPasswordForm 
              onSubmit={handleRequestReset}
              onBack={() => navigate("/auth")}
              email={email || ""}
              isLoading={isLoading}
            />
          ) : error ? (
            // Error state shows error message and options
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
              {error}
              <div className="mt-4">
                <Button 
                  onClick={() => setMode("request")} 
                  variant="secondary"
                  className="mr-2"
                >
                  Request New Link
                </Button>
                <Button 
                  onClick={() => navigate("/auth")} 
                  variant="outline"
                >
                  Return to Login
                </Button>
              </div>
            </div>
          ) : tokenValidated ? (
            // Password reset form when token is validated
            <form onSubmit={handleResetPassword} className="space-y-4">
              {email && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
                  <p className="font-medium">You're setting a new password for {email}</p>
                  <p className="text-sm mt-2">
                    Please enter a new password that you'll remember for future logins.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          ) : (
            // Fallback state when token validation failed
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md mb-4">
              <p className="font-medium">Something went wrong with your reset link</p>
              <p className="text-sm mt-2">
                We couldn't properly validate your password reset link. Please request a new one.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => setMode("request")} 
                  variant="secondary"
                >
                  Request New Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Tavara &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
    </div>
  );
}
