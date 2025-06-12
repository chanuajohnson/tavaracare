import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock,
  Settings,
  FileVideo
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
  upload_status: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

interface PublicVideo {
  filename: string;
  path: string;
  isActive: boolean;
  isDefault: boolean;
}

export default function AdminHeroVideoManagement() {
  const [videos, setVideos] = useState<HeroVideo[]>([]);
  const [publicVideos, setPublicVideos] = useState<PublicVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchVideos();
    loadPublicVideos();
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

  const loadPublicVideos = () => {
    // Default public videos that should be available
    const defaultVideos = [
      'your-video.MP4',
      'your-video2.MP4', 
      'your-video3.MP4',
      'your-video4.MP4'
    ];

    // Load video preferences from localStorage if available
    const savedPreferences = localStorage.getItem('heroVideoPreferences');
    let preferences: Record<string, boolean> = {};
    
    if (savedPreferences) {
      try {
        preferences = JSON.parse(savedPreferences);
      } catch (error) {
        console.error('Error parsing video preferences:', error);
      }
    }

    const publicVideosList: PublicVideo[] = defaultVideos.map(filename => ({
      filename,
      path: `/${filename}`,
      isActive: preferences[filename] !== false, // Default to true unless explicitly disabled
      isDefault: true
    }));

    setPublicVideos(publicVideosList);
  };

  const savePublicVideoPreferences = (updatedVideos: PublicVideo[]) => {
    const preferences: Record<string, boolean> = {};
    updatedVideos.forEach(video => {
      preferences[video.filename] = video.isActive;
    });
    
    // CRITICAL FIX: Ensure minimum 2 videos are always active
    const activeCount = Object.values(preferences).filter(Boolean).length;
    if (activeCount < 2) {
      toast.error('At least 2 videos must be active to prevent transition issues. Enabling all videos.');
      // Force all videos to be active
      updatedVideos.forEach(video => {
        preferences[video.filename] = true;
        video.isActive = true;
      });
      setPublicVideos([...updatedVideos]);
    }
    
    localStorage.setItem('heroVideoPreferences', JSON.stringify(preferences));
    
    // Trigger a refresh of the hero video on the main page
    window.dispatchEvent(new CustomEvent('heroVideoPreferencesUpdated', { 
      detail: { preferences } 
    }));
  };

  const togglePublicVideo = (filename: string) => {
    const updatedVideos = publicVideos.map(video => 
      video.filename === filename 
        ? { ...video, isActive: !video.isActive }
        : video
    );
    
    // Check if we would have less than 2 active videos
    const wouldBeActiveCount = updatedVideos.filter(v => v.isActive).length;
    
    if (wouldBeActiveCount < 2) {
      toast.error('At least 2 videos must remain active to prevent transition issues.');
      return;
    }
    
    setPublicVideos(updatedVideos);
    savePublicVideoPreferences(updatedVideos);
    
    const activeCount = updatedVideos.filter(v => v.isActive).length;
    toast.success(`${filename} ${updatedVideos.find(v => v.filename === filename)?.isActive ? 'enabled' : 'disabled'}. ${activeCount} videos active.`);
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

  const activePublicVideosCount = publicVideos.filter(v => v.isActive).length;
  const activeDatabaseVideosCount = videos.filter(v => v.is_active).length;
  const totalActiveVideos = activePublicVideosCount + activeDatabaseVideosCount;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hero Video Management</h1>
        <p className="text-muted-foreground">
          Manage videos displayed on the homepage hero section.
        </p>
        
        <div className="mt-4 flex gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Total Active: {totalActiveVideos}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <FileVideo className="h-4 w-4" />
            Public Videos: {activePublicVideosCount}/{publicVideos.length}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Uploaded Videos: {activeDatabaseVideosCount}/{videos.length}
          </Badge>
          {activePublicVideosCount < 2 && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Warning: Less than 2 videos active
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="public" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public" className="flex items-center gap-2">
            <FileVideo className="h-4 w-4" />
            Public Videos ({publicVideos.length})
          </TabsTrigger>
          <TabsTrigger value="uploaded" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Uploaded Videos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="h-5 w-5" />
                Public Video Files
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Control which videos from the public folder are displayed in the hero section. 
                <strong className="text-red-600"> At least 2 videos must remain active to prevent transition issues.</strong>
              </p>
            </CardHeader>
            <CardContent>
              {publicVideos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileVideo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No public videos found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {publicVideos.map((video) => (
                    <div key={video.filename} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{video.filename}</h3>
                            <Badge variant={video.isActive ? "default" : "secondary"}>
                              {video.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {video.isDefault && (
                              <Badge variant="outline">Default</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Path: {video.path}</span>
                            <span>Type: Static File</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(video.path, '_blank')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          
                          <Switch
                            checked={video.isActive}
                            onCheckedChange={() => togglePublicVideo(video.filename)}
                            disabled={video.isActive && activePublicVideosCount <= 2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploaded" className="space-y-6">
          {/* Upload Section */}
          <Card>
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

          {/* Uploaded Videos List */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
