
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<any>;
  onBack: () => void;
  email?: string;
  isLoading: boolean;
}

export function ResetPasswordForm({ onSubmit, onBack, email = "", isLoading }: ResetPasswordFormProps) {
  const [emailValue, setEmailValue] = useState(email);
  const [localLoading, setLocalLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValue) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setLocalLoading(true);
      console.log("[ResetPasswordForm] Submitting reset password request...");
      await onSubmit(emailValue);
      console.log("[ResetPasswordForm] Reset password request completed");
      setEmailSent(true);
    } catch (error: any) {
      console.error("[ResetPasswordForm] Error during form submission:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setLocalLoading(false);
    }
  };

  // Use either the passed in loading state or our local one
  const showLoading = isLoading || localLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="mr-2 p-0 h-8 w-8"
          onClick={onBack}
          disabled={showLoading}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-medium">Reset Your Password</h3>
      </div>
      
      {emailSent ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
            <p className="font-medium">Reset link sent!</p>
            <p className="text-sm mt-2">
              We've sent a password reset link to <strong>{emailValue}</strong>. Please check your email
              and click the link to reset your password.
            </p>
            <p className="text-sm mt-2">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
          </div>
          <Button 
            type="button" 
            onClick={onBack}
            className="w-full mt-2" 
          >
            Return to Login
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Your email address"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                required
                autoComplete="email"
                disabled={showLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={showLoading}
            >
              {showLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
