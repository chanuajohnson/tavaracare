
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
import { ensureUserProfile, updateUserProfile } from "@/lib/profile-utils";
import { UserRole } from "@/types/database";
import { clearAllAuthFlowFlags } from "@/utils/authFlowUtils";
import { Sparkles, UserCheck, MessageCircle, Save } from "lucide-react";

const STAGE_SUBLINE: Record<string, string> = {
  "1": "You're exploring what care could look like. Save your result so you can pick up where you left off.",
  "2": "You're getting clearer on what's needed. Create your account to see matched caregivers and next steps.",
  "3": "You're ready to take action. Sign up so we can connect you with the right care team faster.",
  "4": "Care is already in motion. Create your account to coordinate everything in one place.",
};

function QuizContextBanner({ stage }: { stage?: string | null }) {
  const subline =
    (stage && STAGE_SUBLINE[stage]) ||
    "Save your quiz result and unlock your personalized next steps.";
  return (
    <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          Continuing from your readiness quiz
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground leading-snug">
        One quick step to unlock your next move
      </h3>
      <p className="text-sm text-muted-foreground mt-1">{subline}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-foreground/85">
        <li className="flex items-start gap-2">
          <Save className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          Save your quiz result to your profile
        </li>
        <li className="flex items-start gap-2">
          <UserCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          Get matched with the right caregivers
        </li>
        <li className="flex items-start gap-2">
          <MessageCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          Talk to TAV, your care coordinator
        </li>
      </ul>
      <p className="text-xs text-muted-foreground mt-3">
        New here? <span className="font-medium text-foreground">Sign Up</span> takes about 30 seconds. Already have an account? <span className="font-medium text-foreground">Login</span> picks up right where you left off.
      </p>
    </div>
  );
}

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
      return;
    }

   const urlParams = new URLSearchParams(window.location.search);
const action = urlParams.get('action');
const tab = urlParams.get('tab');

if (action === 'verification-pending') {
  setActiveTab("login");
  toast.info("Please check your email and click the verification link to continue.");
} else if (tab === 'signup') {
  setActiveTab("signup");
} else if (tab === 'login') {
  setActiveTab("login");
} else if (urlParams.get('role') || urlParams.get('from') === 'quiz') {
  setActiveTab("signup");
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
      
      // Clear all auth flow flags to allow normal redirection after successful login
      clearAllAuthFlowFlags();
      
    } catch (error: any) {
      console.error("[AuthPage] Login error:", error);
      toast.error(error.message || "Failed to log in");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("[AuthPage] Login process completed");
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string, role: string, adminCode?: string) => {
    try {
      console.log("[AuthPage] Starting signup process...");
      setIsLoading(true);

      const fullName = `${firstName} ${lastName}`;

      // Set up proper redirect URL for email verification
      const currentDomain = window.location.hostname;
      const baseDomain = currentDomain.includes('preview--') 
        ? currentDomain.replace('preview--', '') 
        : currentDomain;
      
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${baseDomain}${port}`;
      
      console.log("[AuthPage] Using email redirect URL:", baseUrl);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: baseUrl, // This ensures users go through RedirectHandler after email verification
          data: {
            role,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            // Include admin code in metadata for server-side validation
            ...(role === "admin" && adminCode && { admin_code: adminCode })
          },
        },
      });

      if (error) {
        console.error("[AuthPage] Signup error:", error.message);
        throw error;
      }

      console.log("[AuthPage] Signup successful:", data.user ? "User created" : "No user created");
      
      if (data.session && data.user) {
        console.log("[AuthPage] Session created after signup - auto-confirm must be enabled");
        console.log("[AuthPage] Immediate signup path detected - no email verification required");
        
        const userRole = role as UserRole;
        await ensureUserProfile(data.user.id, userRole);
        
        await supabase.auth.updateUser({
          data: { 
            role: userRole,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName
          }
        });
        
        // Send Facebook Conversions API event for family signups (only on production)
        if (userRole === 'family' && window.location.hostname === 'tavara.care') {
          console.log('[AuthPage] Triggering Facebook CAPI for family user immediate signup');
          try {
            await supabase.functions.invoke('facebook-conversions-api', {
              body: { email: data.user.email }
            });
            console.log('[AuthPage] Facebook CAPI CompleteRegistration event sent for family immediate signup');
          } catch (error) {
            console.error('[AuthPage] Failed to send Facebook CAPI event:', error);
            // Don't block the signup flow for CAPI failures
          }
        }
        
        // Clear all auth flow flags to allow normal redirection after successful signup
        clearAllAuthFlowFlags();
        
        const accountType = role === "admin" ? "administrator" : role;
        toast.success(`${accountType} account created successfully! You'll be redirected to your dashboard shortly.`);
        return true;
      } else {
        console.log("[AuthPage] No session after signup - email verification required");
        console.log("[AuthPage] Email verification signup path detected - CAPI will be triggered after email verification");
        localStorage.setItem('registeringAs', role);
        localStorage.setItem('registrationRole', role);
        
        toast.success("Account created successfully! Please check your email and click the verification link to complete your registration.");
        return true;
      }

    } catch (error: any) {
      console.error("[AuthPage] Signup error:", error);
      
      // Provide specific error message for admin code validation
      if (error.message && error.message.includes('Invalid admin signup code')) {
        toast.error("Invalid admin code provided. Please check your admin code and try again.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
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

      const currentDomain = window.location.hostname;
      const baseDomain = currentDomain.includes('preview--') 
        ? currentDomain.replace('preview--', '') 
        : currentDomain;
      
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      const baseUrl = `${protocol}//${baseDomain}${port}`;
      
      // Fix: Add the /auth prefix to the reset password redirect URL
      const resetPath = "/auth/reset-password/confirm";
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

  const _params = new URLSearchParams(window.location.search);
  const suspendedKind = _params.get('suspended');
  const suspendedReason = _params.get('reason');

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
          {suspendedKind && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
              <p className="font-semibold text-destructive">
                {suspendedKind === 'deleted' ? 'Account removed' : 'Account suspended'}
              </p>
              <p className="text-muted-foreground mt-1">
                {suspendedReason || 'Your access has been paused. Please contact support to resolve this.'}
              </p>
              <a
                href="https://wa.me/18687865357"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline mt-2 inline-block"
              >
                Contact Tavara support on WhatsApp
              </a>
            </div>
          )}
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
