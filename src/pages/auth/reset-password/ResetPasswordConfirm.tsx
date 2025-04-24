
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, AlertTriangle } from "lucide-react";
import { extractResetTokens } from "@/utils/authResetUtils";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validSession, setValidSession] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);

  useEffect(() => {
    async function validateResetSession() {
      try {
        console.log('[ResetPasswordConfirm] Starting session validation...');
        
        // Prevent any automatic redirects while on this page
        sessionStorage.setItem('skipPostLoginRedirect', 'true');
        
        // First check if we have a valid recovery token
        const { access_token, refresh_token, error } = extractResetTokens();
        
        if (error) {
          throw new Error(error);
        }

        // Set up session with the token
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: access_token || '',
          refresh_token: refresh_token || ''
        });

        if (sessionError) {
          throw new Error(sessionError.message);
        }
        
        // Check if we have a valid session
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          throw new Error('No valid session found after token exchange');
        }
        
        // Store the email address for display
        if (data.session.user?.email) {
          setEmailAddress(data.session.user.email);
        }
        
        console.log('[ResetPasswordConfirm] Valid recovery session detected:', {
          hasUser: !!data.session.user,
          email: data.session.user?.email,
          hasSession: !!data.session
        });
        
        setValidSession(true);
        setValidationError(null);
      } catch (error: any) {
        console.error('[ResetPasswordConfirm] Session validation error:', error);
        setValidationError(error.message || 'Invalid or expired reset link');
        
        // Add a short delay before redirect to ensure error is seen
        setTimeout(() => {
          toast.error("Invalid or expired reset link", {
            description: "Please request a new password reset link"
          });
          navigate("/auth/reset-password", { replace: true });
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    }

    // Start validation immediately
    validateResetSession();
    
    // Add hook to warn user before leaving if they haven't submitted the form
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (validSession && !isLoading && (password || confirmPassword)) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Clear the skip redirect flag when leaving this page
      sessionStorage.removeItem('skipPostLoginRedirect');
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('[ResetPasswordConfirm] Updating password...');
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      // Set session flag to explicitly allow redirection after password update
      sessionStorage.setItem('passwordResetComplete', 'true');
      sessionStorage.removeItem('skipPostLoginRedirect');
      
      // Sign out immediately after password update
      await supabase.auth.signOut({ scope: 'local' });
      
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password"
      });
      
      // Navigate to auth page with success state
      navigate("/auth", { 
        replace: true,
        state: { resetSuccess: true }
      });
      
    } catch (error: any) {
      console.error('[ResetPasswordConfirm] Password update error:', error);
      toast.error("Failed to update password", {
        description: error.message || "Please try again or request a new reset link"
      });
      
      if (error.message?.includes("expired")) {
        navigate("/auth/reset-password", { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto mt-16 flex items-center justify-center min-h-[55vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (validationError) {
    return (
      <div className="container max-w-md mx-auto mt-16 flex items-center justify-center min-h-[55vh]">
        <Card className="w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>{validationError}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate("/auth/reset-password")}
            >
              Request New Reset Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Skip rendering form if session validation failed
  if (!validSession) {
    return null;
  }

  // Show password reset form
  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/auth/reset-password")}
              className="mr-2 h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Set New Password</CardTitle>
          </div>
          <CardDescription>
            {emailAddress ? `Update password for ${emailAddress}` : "Please enter your new password below"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">New Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isLoading}
                minLength={6}
                required
                className="focus:ring-2 focus:ring-blue-500"
                autoComplete="new-password"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isLoading}
                minLength={6}
                required
                className="focus:ring-2 focus:ring-blue-500"
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/auth/reset-password")}
              className="w-full"
              disabled={isLoading}
            >
              Request New Reset Link
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
