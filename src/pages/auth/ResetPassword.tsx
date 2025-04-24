
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { EmailSentCard } from './reset-password/EmailSentCard';
import { RequestResetForm } from './reset-password/RequestResetForm';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const getResetRedirectUrl = () => {
    // Always use absolute URLs for email links
    return `${window.location.origin}/auth/reset-password/confirm`;
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔄 Sending reset password email to:", email);
      console.log("🔗 Using redirect URL:", getResetRedirectUrl());
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getResetRedirectUrl(),
      });

      if (error) throw error;
      
      setEmailSent(true);
      toast.success('Reset link sent', {
        description: 'Please check your email inbox and spam folder for the password reset link.',
        duration: 8000,
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset link', {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto mt-16 flex items-center min-h-[55vh]">
      {emailSent ? (
        <EmailSentCard 
          email={email}
          onBack={() => setEmailSent(false)}
        />
      ) : (
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/auth')}
                className="mr-2 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Reset Your Password</CardTitle>
            </div>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <RequestResetForm
            email={email}
            isLoading={isLoading}
            onEmailChange={setEmail}
            onSubmit={handleSendResetLink}
          />
        </Card>
      )}
    </div>
  );
};

export default ResetPassword;
