
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Mail, MessageCircle, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

interface CertificateUploadProps {
  onUploadSuccess?: () => void;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a valid format. Please upload PDF or image files.`);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Please upload files under 5MB.`);
        }

        const fileName = `certificates/${user.id}/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('professional-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save to database
        const { error: dbError } = await supabase
          .from('professional_documents')
          .insert({
            user_id: user.id,
            document_type: 'certificate',
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
      
      toast.success(`Successfully uploaded ${uploadedFileNames.length} certificate(s)`);
      onUploadSuccess?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload certificates');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmailShare = async () => {
    if (!shareEmail || !user) return;

    try {
      const { error } = await supabase.functions.invoke('send-certificate-notification', {
        body: {
          to_email: shareEmail,
          message: shareMessage,
          user_name: user.email,
          document_count: uploadedFiles.length
        }
      });

      if (error) throw error;

      toast.success('Certificates shared via email successfully');
      setIsShareDialogOpen(false);
      setShareEmail('');
      setShareMessage('');
    } catch (error: any) {
      console.error('Email share error:', error);
      toast.error('Failed to share via email');
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hi! I've uploaded my professional certificates to Tavara. ${shareMessage ? `\n\nNote: ${shareMessage}` : ''}`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    toast.success('WhatsApp share link opened');
    setIsShareDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Certificates & Licenses</h3>
                <p className="text-sm text-muted-foreground">Upload your professional certificates</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Certificate'}
              </Button>

              {uploadedFiles.length > 0 && (
                <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      Share Documents
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Your Professional Certifications</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Add a message..."
                          value={shareMessage}
                          onChange={(e) => setShareMessage(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          onClick={handleEmailShare}
                          disabled={!shareEmail}
                          className="flex-1"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                        
                        <Button 
                          onClick={handleWhatsAppShare}
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
    </div>
  );
};
