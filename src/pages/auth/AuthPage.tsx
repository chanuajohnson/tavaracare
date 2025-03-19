
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (user) {
      console.log("[AuthPage] User already logged in, AuthProvider will handle redirection");
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("[AuthPage] Starting login process...");
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthPage] Login error:", error.message);
        throw error;
      }

      console.log("[AuthPage] Login successful:", data.session ? "Has session" : "No session");
      // No need to navigate here, the AuthProvider will handle it based on user role

    } catch (error: any) {
      console.error("[AuthPage] Login error:", error);
      toast.error(error.message || "Failed to log in");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[AuthPage] Login process completed");
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: string) => {
    try {
      console.log("[AuthPage] Starting signup process...");
      setIsLoading(true);

      const fullName = `${firstName} ${lastName}`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName
          },
        },
      });

      if (error) {
        console.error("[AuthPage] Signup error:", error.message);
        throw error;
      }

      console.log("[AuthPage] Signup successful:", data.user ? "User created" : "No user created");
      
      if (data.session) {
        console.log("[AuthPage] Session created after signup - auto-confirm must be enabled");
        toast.success("Account created successfully! You'll be redirected to your dashboard shortly.");
        
        console.log("[AuthPage] Auth provider will handle redirects");
        // No need for explicit redirect - the auth provider will handle it
        return true;
      } else {
        console.log("[AuthPage] No session after signup - auto-confirm may be disabled");
        toast.success("Account created! Please check your email to confirm your account.");
        // We'll stay on the signup page but the component will show a success message
        return true;
      }

    } catch (error: any) {
      console.error("[AuthPage] Signup error:", error);
      toast.error(error.message || "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[AuthPage] Signup process completed");
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      console.log("[AuthPage] Starting password reset process...");
      setIsLoading(true);

      // Get the main domain (not preview domain)
      // This ensures we use the actual production URL and not the preview URL
      const currentDomain = window.location.hostname;
      // Extract the base domain by removing any preview subdomain
      const baseDomain = currentDomain.includes('preview--') 
        ? currentDomain.replace('preview--', '') 
        : currentDomain;
      
      // Construct the site URL using either https://domain or http://localhost for development
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${baseDomain}${port}`;
      
      const resetPath = "/auth/reset-password";
      const resetPasswordUrl = `${baseUrl}${resetPath}`;
      
      console.log("[AuthPage] Using reset password redirect URL:", resetPasswordUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetPasswordUrl,
      });

      if (error) {
        console.error("[AuthPage] Password reset error:", error.message);
        throw error;
      }

      console.log("[AuthPage] Password reset email sent successfully");
      toast.success("Password reset email sent. Please check your inbox.");
      setShowResetForm(false);
      
    } catch (error: any) {
      console.error("[AuthPage] Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[AuthPage] Password reset process completed");
    }
  };

  const handleForgotPassword = (email: string) => {
    setResetEmail(email);
    setShowResetForm(true);
  };

  if (user) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            {showResetForm ? 
              "Reset your password" : 
              "Sign in to your account or create a new one"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showResetForm ? (
            <ResetPasswordForm 
              onSubmit={handleResetPassword} 
              onBack={() => setShowResetForm(false)}
              email={resetEmail}
              isLoading={isLoading}
            />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm 
                  onSubmit={handleLogin} 
                  isLoading={isLoading}
                  onForgotPassword={handleForgotPassword} 
                />
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm 
                  onSubmit={handleSignup} 
                  isLoading={isLoading} 
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Tavara &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
    </div>
  );
}
