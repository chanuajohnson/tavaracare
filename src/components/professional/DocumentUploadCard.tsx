
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface DocumentUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  documentType: string;
  allowedTypes: string[];
  maxFileSize: number;
  multiple?: boolean;
  onUploadSuccess?: () => void;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  title,
  description,
  icon,
  documentType,
  allowedTypes,
  maxFileSize,
  multiple = false,
  onUploadSuccess
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid format. Please upload ${allowedTypes.join(', ')} files.`);
        }

        // Validate file size
        if (file.size > maxFileSize) {
          throw new Error(`File ${file.name} is too large. Please upload files under ${Math.round(maxFileSize / (1024 * 1024))}MB.`);
        }

        const fileName = `${documentType}/${user.id}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('professional-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save to database
        const { error: dbError } = await supabase
          .from('professional_documents')
          .insert({
            user_id: user.id,
            document_type: documentType,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type
          });

        if (dbError) throw dbError;

        return file.name;
      });

      const uploadedFileNames = await Promise.all(uploadPromises);
      setUploadedFiles(prev => [...prev, ...uploadedFileNames]);
      
      toast.success(`Successfully uploaded ${uploadedFileNames.length} ${documentType} file(s)`);
      onUploadSuccess?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || `Failed to upload ${documentType} files`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getAcceptString = () => {
    const extensions = allowedTypes.map(type => {
      switch (type) {
        case 'application/pdf': return '.pdf';
        case 'image/jpeg': return '.jpg,.jpeg';
        case 'image/png': return '.png';
        default: return '';
      }
    }).filter(Boolean).join(',');
    return extensions;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              {icon}
            </div>
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple={multiple}
              accept={getAcceptString()}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : `Upload ${title}`}
            </Button>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600">Recently Uploaded:</h4>
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  {fileName}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
