
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<any>;
  isLoading: boolean;
  onForgotPassword: (email: string) => void;
}

export function LoginForm({ onSubmit, isLoading, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setLocalLoading(true);
      console.log("[LoginForm] Submitting login form...");
      await onSubmit(email, password);
      console.log("[LoginForm] Login form submission completed");
    } catch (error: any) {
      console.error("[LoginForm] Error during form submission:", error);
      toast.error(error.message || "Failed to log in");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    onForgotPassword(email);
  };

  // Use either the passed in loading state or our local one
  const showLoading = isLoading || localLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={showLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={showLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={showLoading}
          >
            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="link" 
          className="p-0 h-auto text-sm text-muted-foreground"
          onClick={handleForgotPassword}
          disabled={showLoading}
        >
          Forgot password?
        </Button>
      </div>
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={showLoading}
      >
        {showLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Log in"
        )}
      </Button>
    </form>
  );
}
