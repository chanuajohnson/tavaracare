
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';

interface RequestResetFormProps {
  email: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const RequestResetForm: React.FC<RequestResetFormProps> = ({
  email,
  isLoading,
  onEmailChange,
  onSubmit
}) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email Address</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Enter your email address"
            disabled={isLoading}
            required
            className="w-full"
            autoComplete="email"
          />
        </div>
        
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
            "Send Password Reset Link"
          )}
        </Button>
        
        <div className="text-sm text-center text-muted-foreground">
          We'll send you an email with a link to reset your password
        </div>
      </form>
      
      <div className="pt-4 mt-4 border-t text-center">
        <Button 
          type="button" 
          variant="link"
          onClick={() => window.location.href = '/auth'}
          className="text-sm"
        >
          Back to Login
        </Button>
      </div>
    </>
  );
};
