
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkLog, PayrollEntry } from '@/services/care-plans/types/workLogTypes';

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

  const handleCopyLink = () => {
    if (!receiptUrl) return;
    
    navigator.clipboard.writeText(receiptUrl)
      .then(() => toast.success('Receipt link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleDownload = () => {
    if (!receiptUrl) return;

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `receipt-${workLog?.id.slice(0, 8) || 'download'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEmailShare = () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    // In a real implementation, this would send the receipt via email
    // For now, just show a success toast
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
              <iframe 
                src={receiptUrl} 
                className="w-full h-64"
                title="Receipt Preview"
              />
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
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownload}
                disabled={!receiptUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
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
