
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface VideoUploadDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadProgress {
  progress: number;
  stage: 'selecting' | 'uploading' | 'processing' | 'complete';
  error?: string;
}

export const VideoUploadDialog: React.FC<VideoUploadDialogProps> = ({
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    stage: 'selecting'
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/mov', 'video/avi'];
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please select a valid video file (MP4, WebM, MOV, or AVI)';
    }
    
    if (file.size > MAX_SIZE) {
      return 'File size must be less than 100MB';
    }
    
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      toast.error(error);
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Auto-generate title from filename
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadVideo = async () => {
    if (!file || !title.trim() || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setUploadProgress({ progress: 10, stage: 'uploading' });

      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // Upload to storage
      setUploadProgress({ progress: 30, stage: 'uploading' });
      
      const { error: uploadError } = await supabase.storage
        .from('hero-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress({ progress: 70, stage: 'processing' });

      // Get video duration (optional)
      let duration_seconds: number | undefined;
      try {
        duration_seconds = await getVideoDuration(file);
      } catch (error) {
        console.warn('Could not determine video duration:', error);
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('hero_videos')
        .insert({
          file_path: filePath,
          file_name: fileName,
          title: title.trim(),
          description: description.trim() || null,
          is_active: false, // Default to inactive
          display_order: 0,
          duration_seconds,
          upload_status: 'completed',
          uploaded_by: user.id,
          file_size: file.size,
          mime_type: file.type
        });

      if (dbError) {
        // If database save fails, try to clean up the uploaded file
        await supabase.storage
          .from('hero-videos')
          .remove([filePath]);
        
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      setUploadProgress({ progress: 100, stage: 'complete' });
      
      toast.success('Video uploaded successfully!');
      
      // Wait a moment to show completion, then close
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({ 
        progress: 0, 
        stage: 'selecting', 
        error: errorMessage 
      });
      toast.error(errorMessage);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration));
      };
      
      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('Could not load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const isUploading = uploadProgress.stage === 'uploading' || uploadProgress.stage === 'processing';
  const isComplete = uploadProgress.stage === 'complete';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Hero Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          {!file && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop your video here</h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Supports MP4, WebM, MOV, AVI (max 100MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Selected File Info */}
          {file && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                {!isUploading && !isComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {(isUploading || isComplete) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {uploadProgress.stage === 'uploading' && 'Uploading...'}
                  {uploadProgress.stage === 'processing' && 'Processing...'}
                  {uploadProgress.stage === 'complete' && 'Upload Complete!'}
                </span>
                {isComplete && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
              <Progress value={uploadProgress.progress} className="w-full" />
            </div>
          )}

          {/* Error Message */}
          {uploadProgress.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{uploadProgress.error}</p>
            </div>
          )}

          {/* Form Fields */}
          {file && !isComplete && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  disabled={isUploading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description (optional)"
                  rows={3}
                  disabled={isUploading}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isUploading}
            >
              {isComplete ? 'Close' : 'Cancel'}
            </Button>
            
            {file && !isComplete && (
              <Button 
                onClick={uploadVideo}
                disabled={isUploading || !title.trim()}
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
