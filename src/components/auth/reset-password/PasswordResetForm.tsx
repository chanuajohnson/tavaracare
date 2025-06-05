
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
  isPasswordStrong,
  logResetAttempt
} from '@/utils/passwordResetUtils';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface PasswordResetFormProps {
  emailAddress: string | null;
}

export const PasswordResetForm = ({ emailAddress }: PasswordResetFormProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      console.log("🔒 Updating password for user");
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error("❌ Password update error:", error);
        throw error;
      }

      console.log("✅ Password updated successfully, signing out");
      
      // Log successful reset
      logResetAttempt(true);
      
      // Sign out after reset for security, using global scope to clear on all devices
      await supabase.auth.signOut({ scope: "global" });
      
      // Clean up all reset-related storage
      clearResetAttempts();
      sessionStorage.removeItem('skipPostLoginRedirect');
      localStorage.removeItem('recentResetAttempts');
      
      navigate("/auth", { 
        replace: true,
        state: { resetSuccess: true, email: emailAddress }
      });
      
      toast.success("Password has been reset successfully", {
        description: "You can now log in with your new password"
      });
    } catch (error: any) {
      console.error('❌ Password update error:', error);
      
      // Increment attempts counter and log the failure
      const newAttempts = incrementResetAttempts();
      logResetAttempt(false, error.message);
      
      // Show appropriate error message based on attempts
      if (newAttempts >= MAX_RESET_ATTEMPTS) {
        toast.error("Too many failed attempts", {
          description: "Please request a new password reset link"
        });
        navigate('/auth/reset-password');
      } else {
        let errorMessage = "Please try again";
        if (error.message.includes('same password')) {
          errorMessage = "Please choose a different password";
        } else if (error.message.includes('weak password')) {
          errorMessage = "Please choose a stronger password";
        }
        
        toast.error("Failed to update password", {
          description: errorMessage
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/auth/reset-password")}
            className="mr-2 h-8 w-8"
            disabled={isLoading}
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                disabled={isLoading}
                minLength={6}
                required
                className="focus:ring-2 focus:ring-blue-500 pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {password && (
              <p className={`text-xs ${isPasswordStrong(password) ? 'text-green-600' : 'text-yellow-600'}`}>
                {isPasswordStrong(password) ? '✓ Password strength: Good' : '⚠ Use at least 8 characters for better security'}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                disabled={isLoading}
                minLength={6}
                required
                className="focus:ring-2 focus:ring-blue-500 pr-10"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {confirmPassword && (
              <p className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
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
