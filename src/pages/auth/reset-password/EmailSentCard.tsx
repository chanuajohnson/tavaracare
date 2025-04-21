
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface EmailSentCardProps {
  email: string;
  onBack: () => void;
}

export const EmailSentCard: React.FC<EmailSentCardProps> = ({ email, onBack }) => {
  return (
    <div className="container max-w-md mx-auto mt-16 flex items-center min-h-[55vh]">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Password Reset Email Sent</CardTitle>
          <CardDescription className="text-center">
            Please check your inbox for a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-2 space-y-4">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">We've sent a password reset link to:</p>
            <p className="font-medium">{email}</p>
            <p className="mt-4">
              Follow the instructions in the email to set a new password.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              If you don't see the email, check your spam folder.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={onBack}
            type="button"
          >
            Back to Reset Form
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
