
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { extractResetTokens } from "@/utils/authResetUtils";

export default function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    async function validateResetSession() {
      try {
        // First check if we have valid tokens in the URL
        const { access_token, error: tokenError } = await extractResetTokens();
        if (tokenError) {
          console.error('[ResetPasswordConfirm] Token extraction error:', tokenError);
          throw new Error(tokenError);
        }

        // Check for valid session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No valid reset session found');
        }

        console.log('[ResetPasswordConfirm] Valid reset session detected');
        setValidSession(true);
      } catch (error: any) {
        console.error('[ResetPasswordConfirm] Session validation error:', error);
        toast.error("Invalid or expired reset link", {
          description: "Please request a new password reset link"
        });
        navigate("/auth/reset-password", { replace: true });
      } finally {
        setIsLoading(false);
      }
    }

    validateResetSession();
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
      
      // Sign out immediately after password update
      await supabase.auth.signOut();
      
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password"
      });
      
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

  if (!validSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Set New Password</CardTitle>
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
