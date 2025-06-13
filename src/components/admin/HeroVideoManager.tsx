
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Upload, 
  Play, 
  Pause, 
  Trash2, 
  Eye, 
  GripVertical,
  FileVideo,
  Cloud,
  Settings
} from "lucide-react";
import { VideoPreviewModal } from "./VideoPreviewModal";
import { VideoUploadDialog } from "./VideoUploadDialog";

interface StaticVideo {
  id: string;
  type: 'static';
  filename: string;
  displayName: string;
  isActive: boolean;
  path: string;
}

interface DatabaseVideo {
  id: string;
  type: 'database';
  file_path: string;
  file_name: string;
  title: string;
  description: string;
  is_active: boolean;
  display_order: number;
  duration_seconds?: number;
  upload_status: string;
}

type VideoItem = StaticVideo | DatabaseVideo;

const STATIC_VIDEOS: Omit<StaticVideo, 'isActive'>[] = [
  { id: 'static-1', type: 'static', filename: 'your-video.MP4', displayName: 'Hero Video 1', path: '/your-video.MP4' },
  { id: 'static-2', type: 'static', filename: 'your-video2.MP4', displayName: 'Hero Video 2', path: '/your-video2.MP4' },
  { id: 'static-3', type: 'static', filename: 'your-video3.MP4', displayName: 'Hero Video 3', path: '/your-video3.MP4' },
  { id: 'static-4', type: 'static', filename: 'your-video4.MP4', displayName: 'Hero Video 4', path: '/your-video4.MP4' },
];

export const HeroVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [draggedItem, setDraggedItem] = useState<VideoItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      
      // Load static video preferences from localStorage
      const savedPreferences = localStorage.getItem('heroVideoPreferences');
      let staticPreferences: Record<string, boolean> = {};
      
      if (savedPreferences) {
        try {
          staticPreferences = JSON.parse(savedPreferences);
        } catch (error) {
          console.error('Error parsing video preferences:', error);
        }
      }

      // Create static video items with active status
      const staticVideos: StaticVideo[] = STATIC_VIDEOS.map(video => ({
        ...video,
        isActive: staticPreferences[video.filename] !== false, // Default to true unless explicitly disabled
      }));

      // Load database videos
      const { data: dbVideos, error } = await supabase
        .from('hero_videos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error loading database videos:', error);
        toast.error('Failed to load uploaded videos');
      }

      const databaseVideos: DatabaseVideo[] = dbVideos || [];
      
      // Combine and sort all videos
      const allVideos: VideoItem[] = [
        ...staticVideos,
        ...databaseVideos
      ];

      setVideos(allVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const toggleStaticVideoActive = async (video: StaticVideo) => {
    try {
      const savedPreferences = localStorage.getItem('heroVideoPreferences');
      let preferences: Record<string, boolean> = {};
      
      if (savedPreferences) {
        try {
          preferences = JSON.parse(savedPreferences);
        } catch (error) {
          console.error('Error parsing preferences:', error);
        }
      }

      // Toggle the preference
      preferences[video.filename] = !video.isActive;
      
      // Save to localStorage
      localStorage.setItem('heroVideoPreferences', JSON.stringify(preferences));
      
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, isActive: !video.isActive } : v
      ));

      // Emit event for homepage to update
      window.dispatchEvent(new CustomEvent('heroVideoPreferencesUpdated'));
      
      toast.success(`${video.displayName} ${!video.isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling static video:', error);
      toast.error('Failed to update video status');
    }
  };

  const toggleDatabaseVideoActive = async (video: DatabaseVideo) => {
    try {
      const { error } = await supabase
        .from('hero_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id);

      if (error) throw error;

      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, is_active: !video.is_active } : v
      ));

      // Emit event for homepage to update
      window.dispatchEvent(new CustomEvent('heroVideoPreferencesUpdated'));
      
      toast.success(`${video.title} ${!video.is_active ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling database video:', error);
      toast.error('Failed to update video status');
    }
  };

  const deleteVideo = async (video: DatabaseVideo) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('hero-videos')
        .remove([video.file_path]);

      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('hero_videos')
        .delete()
        .eq('id', video.id);

      if (dbError) throw dbError;

      // Update local state
      setVideos(prev => prev.filter(v => v.id !== video.id));
      
      // Emit event for homepage to update
      window.dispatchEvent(new CustomEvent('heroVideoPreferencesUpdated'));
      
      toast.success(`${video.title} deleted successfully`);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleUploadSuccess = () => {
    loadVideos(); // Reload videos after successful upload
    setShowUploadDialog(false);
  };

  const getVideoPath = (video: VideoItem): string => {
    if (video.type === 'static') {
      return video.path;
    } else {
      return `${supabase.supabaseUrl}/storage/v1/object/public/hero-videos/${video.file_path}`;
    }
  };

  const isVideoActive = (video: VideoItem): boolean => {
    return video.type === 'static' ? video.isActive : video.is_active;
  };

  const getVideoTitle = (video: VideoItem): string => {
    return video.type === 'static' ? video.displayName : video.title;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Video Library</h3>
          <p className="text-sm text-muted-foreground">
            Manage static and uploaded hero videos. Active videos will appear on the homepage.
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload New Video
        </Button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className={`relative ${isVideoActive(video) ? 'ring-2 ring-green-500' : ''}`}>
            <CardContent className="p-4">
              <div className="aspect-video bg-black rounded-md mb-3 overflow-hidden relative group">
                <video 
                  src={getVideoPath(video)}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewVideo(video)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
                
                {/* Video Type Badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2"
                >
                  {video.type === 'static' ? (
                    <>
                      <FileVideo className="h-3 w-3 mr-1" />
                      Static
                    </>
                  ) : (
                    <>
                      <Cloud className="h-3 w-3 mr-1" />
                      Uploaded
                    </>
                  )}
                </Badge>

                {/* Active Badge */}
                {isVideoActive(video) && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    Active
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium truncate">{getVideoTitle(video)}</h4>
                  {video.type === 'database' && video.description && (
                    <p className="text-sm text-muted-foreground truncate">{video.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {video.type === 'static' ? video.filename : video.file_name}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isVideoActive(video)}
                      onCheckedChange={() => {
                        if (video.type === 'static') {
                          toggleStaticVideoActive(video);
                        } else {
                          toggleDatabaseVideoActive(video);
                        }
                      }}
                    />
                    <span className="text-sm">
                      {isVideoActive(video) ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewVideo(video)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {video.type === 'database' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteVideo(video)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {videos.length === 0 && (
        <div className="text-center py-12">
          <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first hero video to get started
          </p>
          <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Video
          </Button>
        </div>
      )}

      {/* Modals */}
      {previewVideo && (
        <VideoPreviewModal
          video={previewVideo}
          videoPath={getVideoPath(previewVideo)}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {showUploadDialog && (
        <VideoUploadDialog
          onClose={() => setShowUploadDialog(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};
