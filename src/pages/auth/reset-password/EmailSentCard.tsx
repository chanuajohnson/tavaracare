
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail } from 'lucide-react';

interface EmailSentCardProps {
  email: string;
  onBack: () => void;
}

export const EmailSentCard = ({ email, onBack }: EmailSentCardProps) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="mr-2 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Check Your Email</CardTitle>
        </div>
        <CardDescription>
          We've sent password reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 pb-6 space-y-4">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <p className="text-center">
          We've sent a password reset link to:
        </p>
        <p className="text-center font-medium bg-muted/50 py-2 px-4 rounded">
          {email}
        </p>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Please check your email inbox and spam folder. The link will expire in 24 hours.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
            <p className="font-medium">Important:</p>
            <p>If you click the link and see "Invalid Reset Link", please copy the entire link from your email and paste it directly into your browser's address bar.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          type="button" 
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          Use a different email address
        </Button>
      </CardFooter>
    </Card>
  );
};
