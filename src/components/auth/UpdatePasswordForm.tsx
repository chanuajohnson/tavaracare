
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UpdatePasswordFormProps {
  onSuccess?: () => void;
  email?: string;
}

export const UpdatePasswordForm = ({ onSuccess, email }: UpdatePasswordFormProps) => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password is too short", {
        description: "Please use at least 6 characters"
      });
      return;
    }
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // Sign out after reset for safety
      await supabase.auth.signOut({ scope: "global" });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      toast.error("Failed to update password", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {email && (
        <div className="mb-2 text-muted-foreground text-xs text-center">
          Resetting for: <span className="font-medium text-foreground">{email}</span>
        </div>
      )}
      <div className="space-y-2">
        <Input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
          autoFocus
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Updating password..." : "Update Password"}
      </Button>
    </form>
  );
};
