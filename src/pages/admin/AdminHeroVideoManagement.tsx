
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Video, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Play,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HeroVideo {
  id: string;
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  duration_seconds?: number;
  thumbnail_path?: string;
  is_active: boolean;
  display_order: number;
  mime_type?: string;
  upload_status: 'pending' | 'processing' | 'completed' | 'failed';
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminHeroVideoManagement() {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_videos')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a video file');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title) {
      toast.error('Please select a file and enter a title');
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-videos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hero-videos')
        .getPublicUrl(fileName);

      // Create database record
      const { error: dbError } = await supabase
        .from('hero_videos')
        .insert({
          title: uploadForm.title,
          description: uploadForm.description,
          file_name: selectedFile.name,
          file_path: publicUrl,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          upload_status: 'completed',
          display_order: videos.length
        });

      if (dbError) throw dbError;

      toast.success('Video uploaded successfully');
      setSelectedFile(null);
      setUploadForm({ title: '', description: '' });
      fetchVideos();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVideoActive = async (videoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_videos')
        .update({ is_active: !currentStatus })
        .eq('id', videoId);

      if (error) throw error;
      
      toast.success(`Video ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchVideos();
    } catch (error) {
      console.error('Error toggling video status:', error);
      toast.error('Failed to update video status');
    }
  };

  const deleteVideo = async (videoId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      // Delete from storage
      const fileName = filePath.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('hero-videos')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('hero_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      
      toast.success('Video deleted successfully');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hero Video Management</h1>
        <p className="text-muted-foreground">
          Manage videos displayed on the homepage hero section.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="video-file">Video File</Label>
            <Input
              id="video-file"
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="video-title">Title</Label>
            <Input
              id="video-title"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="video-description">Description (Optional)</Label>
            <Textarea
              id="video-description"
              value={uploadForm.description}
              onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description"
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !uploadForm.title || isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </CardContent>
      </Card>

      {/* Videos List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Uploaded Videos ({videos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No videos uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-gray-400" />
                          <h3 className="font-semibold">{video.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getStatusIcon(video.upload_status)}
                          <Badge variant={video.is_active ? "default" : "secondary"}>
                            {video.is_active ? "Live" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      
                      {video.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {video.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Size: {formatFileSize(video.file_size)}</span>
                        <span>Duration: {formatDuration(video.duration_seconds)}</span>
                        <span>Order: {video.display_order}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(video.file_path, '_blank')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      
                      <Switch
                        checked={video.is_active}
                        onCheckedChange={() => toggleVideoActive(video.id, video.is_active)}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVideo(video.id, video.file_path)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
