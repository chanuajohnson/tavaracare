
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestResetForm } from '@/components/auth/RequestResetForm';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';
import { extractResetTokens, clearAuthTokens } from '@/utils/authResetUtils';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    const validateResetToken = async () => {
      const { accessToken, refreshToken, type } = extractResetTokens();
      
      if (!accessToken || !refreshToken || type !== 'recovery') {
        setIsValidatingToken(false);
        return;
      }

      try {
        // Verify the token without creating a session
        const { error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'recovery'
        });

        if (error) throw error;

        // If verification successful, allow password reset
        setIsResetMode(true);
        clearAuthTokens();
      } catch (error: any) {
        console.error('Token validation error:', error);
        toast.error("Invalid or expired reset link", {
          description: "Please request a new password reset link"
        });
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateResetToken();
  }, []);

  if (isValidatingToken) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verifying your reset link...</CardTitle>
          <CardDescription>Please wait while we validate your request.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          {isResetMode ? "Create New Password" : "Reset Password"}
        </CardTitle>
        <CardDescription>
          {isResetMode 
            ? "Please enter your new password"
            : "Enter your email and we'll send you a reset link"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isResetMode ? <UpdatePasswordForm /> : <RequestResetForm />}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Link 
          to="/auth" 
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}
