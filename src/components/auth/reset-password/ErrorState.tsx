
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface ErrorStateProps {
  error: string;
}

export const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-md mx-auto mt-16 flex items-center justify-center min-h-[55vh]">
      <Card className="w-full">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <CardTitle>Invalid Reset Link</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => navigate("/auth/reset-password")}
          >
            Request New Reset Link
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
