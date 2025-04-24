import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "invalid" | "ready" | "success">("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Block automatic logins from affecting this page
    sessionStorage.setItem('skipPostLoginRedirect', 'true');
    
    const initializeReset = async () => {
      console.log("🔄 Starting password reset initialization");
      
      try {
        // First extract access token from URL
        const hash = window.location.hash.substring(1);
        const searchParams = new URLSearchParams(hash || window.location.search);
        const accessToken = searchParams.get('access_token');
        
        if (!accessToken) {
          throw new Error("No access token found");
        }

        // Set the session manually
        await supabase.auth.setSession({ 
          access_token: accessToken, 
          refresh_token: '' 
        });

        // Immediately sign out globally to prevent auto-login
        await supabase.auth.signOut({ scope: "global" });
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (mounted) {
          setStatus("ready");
        }
      } catch (err: any) {
        console.error('❌ Error verifying reset token:', err);
        if (mounted) {
          setStatus("invalid");
          toast.error(err.message || "Invalid reset link");
        }
      } finally {
        if (mounted) {
          setInitializationComplete(true);
        }
      }
    };

    initializeReset();
    
    // Cleanup function to remove the flag when component unmounts
    return () => {
      mounted = false;
      sessionStorage.removeItem('skipPostLoginRedirect');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("🔒 Updating password");
      const { token } = extractResetTokens();
      
      if (!token) {
        throw new Error("Reset token not found");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({ 
        password 
      });
      
      if (error) {
        console.error("❌ Password update failed:", error);
        throw error;
      }
      
      console.log("✅ Password updated successfully");
      setStatus("success");
      
      // Sign out after reset for security
      await supabase.auth.signOut({ scope: "global" });
      
      toast.success("Your password has been reset successfully");
      
      // Redirect to login page after a delay
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
      
    } catch (error: any) {
      console.error("❌ Password update error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state with initialization check
  if (status === "loading" || !initializationComplete) {
    return (
      <div className="container max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verifying Reset Link</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (status === "invalid") {
    return (
      <div className="container max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-500">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Button
              onClick={() => navigate("/auth/reset-password")}
              className="w-full"
            >
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="container max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-500">Password Reset Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-6">
              Your password has been reset successfully. You will be redirected to login.
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready state - show password form
  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Set Your New Password</CardTitle>
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
                disabled={isSubmitting}
                minLength={6}
                required
                autoFocus
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
                disabled={isSubmitting}
                minLength={6}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
