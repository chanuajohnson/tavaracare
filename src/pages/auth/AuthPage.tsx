
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { WhatsAppAuth } from '@/components/auth/WhatsAppAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useWhatsAppAuth } from '@/hooks/useWhatsAppAuth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthPage = () => {
  const [authMethod, setAuthMethod] = useState<'email' | 'whatsapp'>('email');
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'login';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { authenticateWithWhatsApp } = useWhatsAppAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const returnPath = location.state?.returnPath || '/dashboard/family';
      navigate(returnPath, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Successfully logged in!');
        const returnPath = location.state?.returnPath || '/dashboard/family';
        navigate(returnPath, { replace: true });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error; // Re-throw to let LoginForm handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string, 
    role: string, 
    adminCode?: string
  ) => {
    setIsLoading(true);
    try {
      // Validate admin code if admin role
      if (role === 'admin' && adminCode) {
        const validAdminCode = 'TAVARA_ADMIN_2024'; // You should store this securely
        if (adminCode !== validAdminCode) {
          throw new Error('Invalid admin signup code');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
            role: role,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Account created! Please check your email for verification.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error; // Re-throw to let SignupForm handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
    }
  };

  const handleWhatsAppSuccess = async (authUrl: string) => {
    try {
      await authenticateWithWhatsApp(authUrl);
    } catch (error) {
      toast.error('Failed to complete WhatsApp authentication');
    }
  };

  const renderAuthMethodSelector = () => (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Tavara</CardTitle>
        <CardDescription>
          Choose how you'd like to {activeTab === 'login' ? 'sign in' : 'sign up'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant="outline"
          className="w-full flex items-center gap-3 h-12"
          onClick={() => setAuthMethod('whatsapp')}
        >
          <MessageCircle className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <div className="font-medium">Continue with WhatsApp</div>
            <div className="text-xs text-muted-foreground">Quick & secure verification</div>
          </div>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full flex items-center gap-3 h-12"
          onClick={() => setAuthMethod('email')}
        >
          <Mail className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <div className="font-medium">Continue with Email</div>
            <div className="text-xs text-muted-foreground">Traditional email & password</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  );

  if (authMethod === 'whatsapp') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <WhatsAppAuth 
          onSuccess={handleWhatsAppSuccess}
          onBack={() => setAuthMethod('email')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to Tavara</h1>
          <p className="text-muted-foreground mt-2">
            Your trusted care coordination platform
          </p>
        </div>

        {authMethod === 'email' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm 
                onSubmit={handleLogin}
                isLoading={isLoading}
                onForgotPassword={handleForgotPassword}
              />
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setAuthMethod('whatsapp')}
                  className="text-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Sign in with WhatsApp instead
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <SignupForm 
                onSubmit={handleSignup}
                isLoading={isLoading}
              />
              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setAuthMethod('whatsapp')}
                  className="text-sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Sign up with WhatsApp instead
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          renderAuthMethodSelector()
        )}
      </div>
    </div>
  );
};

export default AuthPage;
