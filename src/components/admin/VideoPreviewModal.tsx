
import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, FileVideo, Cloud } from "lucide-react";

interface VideoItem {
  id: string;
  type: 'static' | 'database';
  file_path?: string;
  file_name?: string;
  filename?: string;
  title?: string;
  displayName?: string;
  description?: string;
  is_active?: boolean;
  isActive?: boolean;
  duration_seconds?: number;
}

interface VideoPreviewModalProps {
  video: VideoItem;
  videoPath: string;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  video,
  videoPath,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getVideoTitle = () => {
    return video.type === 'static' ? video.displayName : video.title;
  };

  const getVideoFilename = () => {
    return video.type === 'static' ? video.filename : video.file_name;
  };

  const isVideoActive = () => {
    return video.type === 'static' ? video.isActive : video.is_active;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {video.type === 'static' ? (
              <FileVideo className="h-5 w-5" />
            ) : (
              <Cloud className="h-5 w-5" />
            )}
            {getVideoTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoPath}
              className="w-full h-full object-cover"
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={togglePlayPause}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={toggleMute}
                  className="rounded-full w-12 h-12 p-0"
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="secondary">
                {video.type === 'static' ? 'Static Video' : 'Uploaded Video'}
              </Badge>
              <Badge className={isVideoActive() ? 'bg-green-500' : 'bg-gray-500'}>
                {isVideoActive() ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          {/* Video Info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold">{getVideoTitle()}</h3>
              <p className="text-sm text-muted-foreground">
                File: {getVideoFilename()}
              </p>
            </div>

            {video.type === 'database' && video.description && (
              <div>
                <h4 className="font-medium text-sm">Description</h4>
                <p className="text-sm text-muted-foreground">{video.description}</p>
              </div>
            )}

            {video.duration_seconds && (
              <div>
                <h4 className="font-medium text-sm">Duration</h4>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(video.duration_seconds / 60)}m {video.duration_seconds % 60}s
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span>
                <span className="ml-2 text-muted-foreground">
                  {video.type === 'static' ? 'Static File' : 'Uploaded File'}
                </span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2 text-muted-foreground">
                  {isVideoActive() ? 'Active on Homepage' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
