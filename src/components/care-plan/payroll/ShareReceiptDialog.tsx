
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { WorkLog } from '@/services/care-plans/types/workLogTypes';

interface ShareReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptUrl: string | null;
  workLog: WorkLog | null;
}

export const ShareReceiptDialog: React.FC<ShareReceiptDialogProps> = ({
  open,
  onOpenChange,
  receiptUrl,
  workLog
}) => {
  const handleDownload = () => {
    if (!receiptUrl) return;
    
    const link = document.createElement('a');
    link.href = receiptUrl;
    link.download = `Pay_Receipt_${workLog?.caregiver_name || 'Caregiver'}_${new Date(workLog?.start_time || '').toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Receipt downloaded successfully');
  };

  const handleShare = async () => {
    if (!receiptUrl) return;
    
    try {
      if (navigator.share) {
        const blob = await fetch(receiptUrl).then(res => res.blob());
        const file = new File([blob], `Pay_Receipt_${workLog?.caregiver_name || 'Caregiver'}.pdf`, { type: 'application/pdf' });
        
        await navigator.share({
          title: `Pay Receipt for ${workLog?.caregiver_name}`,
          files: [file]
        });
        
        toast.success('Receipt shared successfully');
      } else {
        // Fallback for browsers that don't support navigator.share
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      toast.error('Could not share the receipt');
    }
  };

  const handleEmailReceipt = () => {
    if (!receiptUrl) return;
    
    const subject = encodeURIComponent(`Pay Receipt for ${workLog?.caregiver_name || 'Caregiver'}`);
    const body = encodeURIComponent(`Please find attached the pay receipt for work on ${new Date(workLog?.start_time || '').toLocaleDateString()}.`);
    
    // Note: We can't attach files via mailto, so we'll just open the email client
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast.info('Please attach the downloaded receipt to your email', {
      description: 'The receipt will be downloaded automatically',
      action: {
        label: "Download",
        onClick: handleDownload
      }
    });
    
    // Auto download for email attachment
    handleDownload();
  };

  if (!receiptUrl || !workLog) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Pay Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-center mb-4">
            <iframe 
              src={receiptUrl} 
              className="w-full h-[300px] border rounded"
              title="Pay Receipt Preview"
            />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Receipt generated for {workLog.caregiver_name || 'caregiver'} for work on {new Date(workLog.start_time).toLocaleDateString()}
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 sm:w-auto w-full"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          <Button
            variant="outline"
            className="gap-2 sm:w-auto w-full"
            onClick={handleEmailReceipt}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          
          <Button
            className="gap-2 sm:w-auto w-full"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
