
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const getResetRedirectUrl = () => {
    const { origin } = window.location;
    return `${origin}/auth/reset-password/confirm`;
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
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getResetRedirectUrl(),
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success('Reset link sent', {
        description: 'Please check your email for the password reset link.',
      });
    } catch (error: any) {
      console.error('Reset password error:', error);

      let errorMessage = "We couldn't send the reset link. Please try again.";

      if (error.message.includes("Email rate limit exceeded")) {
        errorMessage = "Too many requests. Please wait a few minutes and try again.";
      }

      toast.error('Reset link failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="container max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">
              Reset link sent successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <p className="text-center text-muted-foreground text-sm">
              Check your inbox and follow the link to reset your password.
              The link will expire after 24 hours.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={() => setEmailSent(false)}
            >
              Back to Reset Form
            </Button>
            <Button 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto mt-16">
      <Card>
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
        <form onSubmit={handleSendResetLink}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
