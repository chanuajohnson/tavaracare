
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Upload, FileText, Check, X, Download, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface BackgroundCheckCardProps {
  onUploadSuccess?: () => void;
}

interface BackgroundCheckDocument {
  id: string;
  file_name: string;
  file_path: string;
  verification_status?: string;
  created_at: string;
}

export const BackgroundCheckCard: React.FC<BackgroundCheckCardProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [existingDocument, setExistingDocument] = useState<BackgroundCheckDocument | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchExistingDocument();
    }
  }, [user]);

  const fetchExistingDocument = async () => {
    if (!user) return;

    try {
      setLoadingDocument(true);
      const { data, error } = await supabase
        .from('professional_documents')
        .select('id, file_name, file_path, created_at, verification_status')
        .eq('user_id', user.id)
        .eq('document_type', 'background_check')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching background check document:', error);
        setExistingDocument(null);
        return;
      }
      
      // Map the data with fallbacks for missing properties
      if (data) {
        setExistingDocument({
          id: data.id,
          file_name: data.file_name,
          file_path: data.file_path,
          verification_status: data.verification_status || 'not_started',
          created_at: data.created_at
        });
      } else {
        setExistingDocument(null);
      }
    } catch (error: any) {
      console.error('Error fetching background check document:', error);
      setExistingDocument(null);
      toast.error('Failed to load background check document');
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, JPEG, or PNG file.');
      }

      // Validate file size (5MB limit)
      const maxFileSize = 5 * 1024 * 1024;
      if (file.size > maxFileSize) {
        throw new Error('File size must be under 5MB.');
      }

      const fileName = `background_check/${user.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('professional-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert document record
      const { error: dbError } = await supabase
        .from('professional_documents')
        .insert({
          user_id: user.id,
          document_type: 'background_check',
          file_name: file.name,
          file_path: fileName,
          file_size: file.size,
          mime_type: file.type,
          verification_status: 'not_started'
        });

      if (dbError) throw dbError;

      toast.success('Background check document uploaded successfully');
      await fetchExistingDocument();
      onUploadSuccess?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload background check document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadDocument = async (document: BackgroundCheckDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('professional-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Document downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const deleteDocument = async (document: BackgroundCheckDocument) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('professional-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('professional_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      await fetchExistingDocument();
      onUploadSuccess?.();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"><Check className="h-3 w-3" /> Verified</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"><FileText className="h-3 w-3" /> Under Review</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"><X className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Pending Review</span>;
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Certificate of Character (Background Check)
          <span className="text-sm font-normal text-red-600">*Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Trinidad & Tobago Police Certificate Required</p>
              <p>Upload your Certificate of Character from the Trinidad & Tobago Police Service. This is required for all professional caregivers.</p>
              <p className="mt-2 text-xs">Accepted formats: PDF, JPEG, PNG (max 5MB)</p>
            </div>
          </div>
        </div>

        {!existingDocument && (
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Certificate of Character'}
            </Button>
          </div>
        )}

        {loadingDocument ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading document...</p>
          </div>
        ) : existingDocument ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Document:</h4>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{existingDocument.file_name}</span>
                  {getVerificationBadge(existingDocument.verification_status)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded: {new Date(existingDocument.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => downloadDocument(existingDocument)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteDocument(existingDocument)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!existingDocument.verification_status || existingDocument.verification_status === 'not_started' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  Your document has been uploaded and is pending verification. We'll notify you once it's reviewed.
                </p>
              </div>
            ) : existingDocument.verification_status === 'verified' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ Your background check has been verified! You can now receive care assignments.
                </p>
              </div>
            ) : existingDocument.verification_status === 'rejected' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  ❌ Your document was rejected. Please upload a new Certificate of Character or contact support.
                </p>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-2 w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Document
                </Button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  🔍 Your document is currently under review. We'll notify you once verification is complete.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No background check document uploaded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
