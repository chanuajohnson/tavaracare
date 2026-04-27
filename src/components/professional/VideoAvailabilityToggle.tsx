
import { Button } from '@/components/ui/button';
import { Video, VideoOff } from 'lucide-react';
import { useVideoAvailability } from '@/hooks/useVideoAvailability';

export const VideoAvailabilityToggle = () => {
  const { isVideoAvailable, isLoading, isInitialLoading, toggleVideoAvailability } = useVideoAvailability();

  if (isInitialLoading) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-1">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Loading...
      </Button>
    );
  }

  return (
    <Button
      variant={isVideoAvailable ? "default" : "outline"}
      className={`flex items-center gap-1 ${
        isVideoAvailable 
          ? "bg-green-600 hover:bg-green-700 text-white" 
          : "border-gray-300 text-gray-600 hover:border-gray-400"
      }`}
      onClick={toggleVideoAvailability}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isVideoAvailable ? (
        <Video className="h-4 w-4" />
      ) : (
        <VideoOff className="h-4 w-4" />
      )}
      {isVideoAvailable ? "Video Calls Enabled" : "Enable Video Calls"}
    </Button>
  );
};
