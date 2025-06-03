
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, Mail, MessageCircle, Check, Award } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { DocumentUploadCard } from './DocumentUploadCard';
import { BackgroundCheckCard } from './BackgroundCheckCard';

interface CertificateUploadProps {
  onUploadSuccess?: () => void;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');

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

  const handleUploadSuccess = () => {
    setUploadedFiles(prev => [...prev, 'document']);
    onUploadSuccess?.();
  };

  return (
    <div className="space-y-6">
      {/* Valid Identification Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Valid Identification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadCard
            title="National ID, Driver's Permit, or Passport"
            description="Upload a valid form of identification"
            icon={<FileText className="h-6 w-6 text-primary" />}
            documentType="identification"
            allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
            maxFileSize={5 * 1024 * 1024}
            multiple={false}
            onUploadSuccess={handleUploadSuccess}
          />
        </CardContent>
      </Card>

      {/* Certificates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Professional Certificates & Licenses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DocumentUploadCard
            title="Certificates"
            description="Upload your professional certificates (you may upload multiple certificates)"
            icon={<Award className="h-6 w-6 text-primary" />}
            documentType="certificate"
            allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
            maxFileSize={5 * 1024 * 1024}
            multiple={true}
            onUploadSuccess={handleUploadSuccess}
          />

          {uploadedFiles.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Background Check Section */}
      <BackgroundCheckCard onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};
