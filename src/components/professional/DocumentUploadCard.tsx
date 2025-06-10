import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, FileText, Check, X, Download, Eye, Trash2 } from 'lucide-react';
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

interface UploadedDocument {
  id: string;
  file_name: string;
  file_path: string;
  verification_status?: string;
  document_subtype?: string;
  created_at: string;
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
  const [existingDocuments, setExistingDocuments] = useState<UploadedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchExistingDocuments();
    }
  }, [user, documentType]);

  const fetchExistingDocuments = async () => {
    if (!user) return;

    try {
      setLoadingDocuments(true);
      const { data, error } = await supabase
        .from('professional_documents')
        .select('id, file_name, file_path, verification_status, document_subtype, created_at')
        .eq('user_id', user.id)
        .eq('document_type', documentType)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        setExistingDocuments([]);
        return;
      }
      
      // Safely map the data with fallbacks for missing properties
      const mappedData: UploadedDocument[] = (data || []).map(doc => ({
        id: doc.id,
        file_name: doc.file_name,
        file_path: doc.file_path,
        verification_status: doc.verification_status || 'not_started',
        document_subtype: doc.document_subtype || undefined,
        created_at: doc.created_at
      }));
      
      setExistingDocuments(mappedData);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      setExistingDocuments([]);
      toast.error('Failed to load existing documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const checkForDuplicates = (fileName: string): boolean => {
    return existingDocuments.some(doc => doc.file_name === fileName);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Check for duplicates
        if (checkForDuplicates(file.name)) {
          throw new Error(`File "${file.name}" already exists. Please rename the file or delete the existing one first.`);
        }

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

        // Determine verification status and document subtype for background checks
        let verificationStatus = 'not_started';
        let documentSubtype = '';

        if (documentType === 'background_check') {
          // Check if it's likely a receipt/proof vs actual certificate
          const isReceipt = file.name.toLowerCase().includes('receipt') || 
                           file.name.toLowerCase().includes('proof') ||
                           file.name.toLowerCase().includes('application');
          
          if (isReceipt) {
            verificationStatus = 'in_progress';
            documentSubtype = 'application_receipt';
          } else {
            verificationStatus = 'verified';
            documentSubtype = 'certificate';
          }
        }

        // Save to database
        const { error: dbError } = await supabase
          .from('professional_documents')
          .insert({
            user_id: user.id,
            document_type: documentType,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
            verification_status: verificationStatus,
            document_subtype: documentSubtype
          });

        if (dbError) throw dbError;

        return file.name;
      });

      const uploadedFileNames = await Promise.all(uploadPromises);
      
      toast.success(`Successfully uploaded ${uploadedFileNames.length} ${documentType} file(s)`);
      await fetchExistingDocuments(); // Refresh the list
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

  const downloadDocument = async (document: UploadedDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('professional-documents')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
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

  const deleteDocument = async (document: UploadedDocument) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('professional-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('professional_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      await fetchExistingDocuments(); // Refresh the list
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
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"><Eye className="h-3 w-3" /> In Progress</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"><X className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Not Started</span>;
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

          {/* Existing Documents List */}
          {loadingDocuments ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Loading documents...</p>
            </div>
          ) : existingDocuments.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
              {existingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{doc.file_name}</span>
                      {getVerificationBadge(doc.verification_status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      {doc.document_subtype && ` • ${doc.document_subtype.replace('_', ' ')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => downloadDocument(doc)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteDocument(doc)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No documents uploaded yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
