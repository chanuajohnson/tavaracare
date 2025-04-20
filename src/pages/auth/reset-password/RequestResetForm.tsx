
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Reset Your Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="email"
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
