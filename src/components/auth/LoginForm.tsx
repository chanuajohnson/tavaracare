
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<any>;
  isLoading: boolean;
  onForgotPassword: (email: string) => void;
}

const PERSISTENCE_BANNER_KEY = 'tavara_persistence_banner_dismissed';

export function LoginForm({ onSubmit, isLoading, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [showPersistenceBanner, setShowPersistenceBanner] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(PERSISTENCE_BANNER_KEY);
      if (!dismissed) setShowPersistenceBanner(true);
    } catch {
      // ignore
    }
  }, []);

  const dismissPersistenceBanner = () => {
    setShowPersistenceBanner(false);
    try {
      localStorage.setItem(PERSISTENCE_BANNER_KEY, '1');
    } catch {
      // ignore
    }
  };
  
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
      {showPersistenceBanner && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs text-emerald-900">
            <p className="font-medium">Stay signed in on this device</p>
            <p className="mt-0.5 text-emerald-800">
              Tavara keeps you signed in for ~30 days. Avoid private/incognito mode and
              don't clear cookies for tavara.care if you want to stay logged in.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissPersistenceBanner}
            aria-label="Dismiss"
            className="text-emerald-700 hover:text-emerald-900 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
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
