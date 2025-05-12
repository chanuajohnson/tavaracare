
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message }: { message: string }) => {
  return (
    <div className="container max-w-md mx-auto mt-16 flex items-center justify-center min-h-[55vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
