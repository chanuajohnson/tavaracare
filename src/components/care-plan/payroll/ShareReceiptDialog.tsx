import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Mail, File, FileImage } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkLog, PayrollEntry } from '@/services/care-plans/types/workLogTypes';

interface ShareReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string | null;
  workLog: WorkLog | PayrollEntry | null;
}

type FileFormat = 'pdf' | 'jpg';

export const ShareReceiptDialog: React.FC<ShareReceiptDialogProps> = ({
  open,
  onOpenChange,
  receiptUrl,
  workLog
}) => {
  const [email, setEmail] = useState('');
  const [fileFormat, setFileFormat] = useState<FileFormat>('pdf');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyLink = () => {
    if (!receiptUrl) return;
    
    navigator.clipboard.writeText(receiptUrl)
      .then(() => toast.success('Receipt link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleDownload = async () => {
    if (!receiptUrl || !workLog) return;

    try {
      setIsDownloading(true);

      const link = document.createElement('a');
      const mimeType = fileFormat === 'pdf' ? 'application/pdf' : 'image/jpeg';
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));

      link.href = blobUrl;
      link.download = `receipt-${workLog.id.slice(0, 8)}.${fileFormat}`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success(`Receipt downloaded as ${fileFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailShare = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    toast.success(`Receipt would be sent to ${email}`);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="border rounded-md overflow-hidden">
            {receiptUrl ? (
              fileFormat === 'pdf' ? (
                <iframe 
                  src={receiptUrl} 
                  className="w-full h-64"
                  title="Receipt Preview"
                />
              ) : (
                <img 
                  src={receiptUrl} 
                  alt="Receipt Preview"
                  className="w-full h-64 object-contain"
                />
              )
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No receipt available
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCopyLink}
                disabled={!receiptUrl}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <div className="flex-1 flex space-x-2">
                <Select value={fileFormat} onValueChange={(value: FileFormat) => setFileFormat(value)}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="jpg">
                      <div className="flex items-center">
                        <FileImage className="h-4 w-4 mr-2" />
                        JPG
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!receiptUrl || isDownloading}
                  className="flex-1"
                >
                  {isDownloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download
                </Button>
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email Receipt</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleEmailShare}
                disabled={!receiptUrl}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
