import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MAX_RESET_ATTEMPTS, 
  getResetAttempts, 
  incrementResetAttempts, 
  clearResetAttempts,
  isPasswordStrong 
} from '@/utils/passwordResetUtils';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface PasswordResetFormProps {
  emailAddress: string | null;
}

export const PasswordResetForm = ({ emailAddress }: PasswordResetFormProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const attempts = getResetAttempts();
    if (attempts >= MAX_RESET_ATTEMPTS) {
      toast.error("Too many attempts", {
        description: "Please request a new password reset link"
      });
      navigate('/auth/reset-password');
      return;
    }

    if (!isPasswordStrong(password)) {
      toast.error("Password is too weak", {
        description: "Please use at least 8 characters"
      });
      return;
    }
    
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
      console.log("🔒 Updating password");
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("❌ Password update error:", error);
        throw error;
      }

      console.log("✅ Password updated successfully, signing out");
      
      // Sign out after reset for safety, using global scope to clear on all devices
      await supabase.auth.signOut({ scope: "global" });
      
      // Clean up all reset-related storage
      clearResetAttempts();
      sessionStorage.removeItem('skipPostLoginRedirect');
      
      navigate("/auth", { 
        replace: true,
        state: { resetSuccess: true }
      });
      
      toast.success("Password has been reset successfully", {
        description: "You can now log in with your new password"
      });
    } catch (error: any) {
      console.error('❌ Password update error:', error);
      
      // Increment attempts counter
      const newAttempts = incrementResetAttempts();
      
      // Show appropriate error message based on attempts
      if (newAttempts >= MAX_RESET_ATTEMPTS) {
        toast.error("Too many failed attempts", {
          description: "Please request a new password reset link"
        });
        navigate('/auth/reset-password');
      } else {
        toast.error("Failed to update password", {
          description: error.message || "Please try again"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};
