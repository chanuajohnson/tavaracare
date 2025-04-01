import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2, MailIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/types/database";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface SignupFormProps {
  onSubmit: (email: string, password: string, firstName: string, lastName: string, role: string) => Promise<any>;
  isLoading: boolean;
}

export function SignupForm({ onSubmit, isLoading }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("family");
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !firstName || !lastName || !role) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setFormSubmitted(true);
      setSubmissionStatus("submitting");
      console.log('SignupForm submitting with role:', role);
      
      // Store the registration role in localStorage for redirect handling after email verification
      localStorage.setItem('registeringAs', role);
      localStorage.setItem('registrationRole', role);
      
      // Set up user metadata with role and name for profile creation
      const metadata = {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        role: role
      };
      
      console.log('Setting user metadata:', metadata);
      
      // Pass the registration to the parent component
      await onSubmit(email, password, firstName, lastName, role);
      
      // Show success message
      toast.success("Account created successfully! Please check your email to confirm your account.");
      setSubmissionStatus("success");
      
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account. Please try again.");
      setFormSubmitted(false);
      setSubmissionStatus("error");
    }
  };

  // If signup was successful, show a confirmation page with next steps
  if (submissionStatus === "success") {
    return (
      <div className="space-y-4 text-center py-8">
        <div className="flex justify-center">
          <div className="bg-primary-100 text-primary-800 p-4 rounded-md">
            <h3 className="font-medium text-lg">Registration Started!</h3>
            <div className="mt-2 space-y-4">
              <p>
                Your account has been created successfully. We've sent a confirmation email to <strong>{email}</strong>.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm">
                <h4 className="font-medium mb-1 flex items-center">
                  <MailIcon className="h-4 w-4 mr-1" /> Next Steps:
                </h4>
                <ol className="list-decimal list-inside text-left space-y-1">
                  <li>Check your email inbox for a confirmation link</li>
                  <li>Click the confirmation link to verify your email</li>
                  <li>You'll be redirected to complete your {role} profile</li>
                </ol>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                If you don't see the email, please check your spam folder.
              </p>
            </div>
          </div>
        </div>
        <Button 
          className="mt-4" 
          onClick={() => {
            // Reset form state and tell the parent component to switch to login tab
            setFormSubmitted(false);
            setSubmissionStatus("idle");
            const tabsList = document.querySelector('[role="tablist"]');
            const loginTab = tabsList?.querySelector('[value="login"]') as HTMLButtonElement;
            if (loginTab) {
              loginTab.click();
            }
          }}
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading || formSubmitted}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading || formSubmitted}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading || formSubmitted}
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading || formSubmitted}
            autoComplete="new-password"
            minLength={6}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading || formSubmitted}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select 
          value={role} 
          onValueChange={(value) => {
            console.log('Role selected:', value);
            setRole(value as UserRole);
          }}
          disabled={isLoading || formSubmitted}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family">Family Member</SelectItem>
            <SelectItem value="professional">Care Professional</SelectItem>
            <SelectItem value="community">Community Member</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={isLoading || formSubmitted}
      >
        {isLoading || formSubmitted ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
