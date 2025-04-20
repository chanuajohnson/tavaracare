
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailSentCardProps {
  email: string;
  onBack: () => void;
}

export const EmailSentCard: React.FC<EmailSentCardProps> = ({ email, onBack }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Password Reset Email Sent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-muted-foreground">
          <p className="mb-2">We've sent a password reset link to:</p>
          <p className="font-medium">{email}</p>
          <p className="mt-4">
            Please check your inbox and click on the link to reset your password.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onBack}>
          Back to Reset Form
        </Button>
      </CardFooter>
    </Card>
  );
};
