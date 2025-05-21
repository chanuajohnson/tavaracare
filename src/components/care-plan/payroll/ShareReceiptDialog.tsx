
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Mail, File, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import useReceiptFormat from "@/hooks/payroll/useReceiptFormat";
import type { WorkLog, PayrollEntry } from '@/services/care-plans/types/workLogTypes';
import { Skeleton } from "@/components/ui/skeleton";

interface ShareReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string | null;
  workLog: WorkLog | PayrollEntry | null;
}

export const ShareReceiptDialog: React.FC<ShareReceiptDialogProps> = ({
  open,
  onOpenChange,
  receiptUrl,
  workLog
}) => {
  const [email, setEmail] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const { 
    previewUrl, 
    conversionError
  } = useReceiptFormat(receiptUrl);
  
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
      
      // Create a blob from the data URL
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      
      // Use the Blob object and createObjectURL for more reliable downloading
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `receipt-${workLog.id.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast.success('Receipt downloaded as PDF');
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

  const renderPreview = () => {
    if (conversionError) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100">
          <Alert variant="destructive" className="max-w-xs">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{conversionError}</AlertDescription>
          </Alert>
        </div>
      );
    }
    
    if (!previewUrl) {
      return (
        <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
          No receipt available
        </div>
      );
    }
    
    return (
      <iframe 
        src={previewUrl} 
        className="w-full h-64"
        title="Receipt Preview"
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="border rounded-md overflow-hidden">
            {renderPreview()}
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
                Download PDF
              </Button>
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

export default ShareReceiptDialog;
