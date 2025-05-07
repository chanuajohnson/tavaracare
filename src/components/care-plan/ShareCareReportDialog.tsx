
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, FileText, Share } from 'lucide-react';
import { toast } from 'sonner';
import { shareReportViaWhatsApp } from '@/services/care-plans/careReportService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface ShareCareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportUrl: string | null;
  isGenerating: boolean;
}

export const ShareCareReportDialog: React.FC<ShareCareReportDialogProps> = ({
  open,
  onOpenChange,
  reportUrl,
  isGenerating
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showWhatsAppHelp, setShowWhatsAppHelp] = useState(false);
  
  // Handle WhatsApp sharing
  const handleShareViaWhatsApp = async () => {
    if (!reportUrl) return;
    
    try {
      setIsSharing(true);
      const shared = await shareReportViaWhatsApp(reportUrl);
      
      if (shared) {
        toast.success('Report shared via WhatsApp');
        // Close dialog after successful share
        setTimeout(() => onOpenChange(false), 1500);
      } else {
        // Show help dialog for WhatsApp sharing
        setShowWhatsAppHelp(true);
      }
    } catch (error) {
      console.error('Error sharing care report:', error);
      toast.error('Failed to share report');
      setShowWhatsAppHelp(true);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle direct download
  const handleDownload = async () => {
    if (!reportUrl) return;

    try {
      const link = document.createElement('a');
      link.href = reportUrl;
      link.download = `tavara-care-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };
  
  // Render help content for desktop users
  const renderHelpContent = () => {
    return (
      <div className="space-y-4">
        <h3 className="font-medium">To share via WhatsApp:</h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Download the report using the Download button</li>
          <li>Open WhatsApp on your device</li>
          <li>Select the contact or group you want to share with</li>
          <li>Use the attachment or document option to share the downloaded PDF</li>
        </ol>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Care Report</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4">
            {isGenerating ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p>Generating comprehensive care report...</p>
              </div>
            ) : !reportUrl ? (
              <div className="py-8 flex items-center justify-center">
                <p>Failed to generate report. Please try again.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <FileText size={48} className="text-primary" />
                </div>
                
                <p className="text-center text-sm">
                  Your comprehensive care report includes plan details, 
                  care team members, and weekly schedule.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  
                  <Button 
                    onClick={handleShareViaWhatsApp}
                    className="w-full"
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Share className="mr-2 h-4 w-4" />
                    )}
                    Share via WhatsApp
                  </Button>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Help dialog for WhatsApp sharing */}
      <AlertDialog open={showWhatsAppHelp} onOpenChange={setShowWhatsAppHelp}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>WhatsApp Sharing</AlertDialogTitle>
            <AlertDialogDescription>
              {renderHelpContent()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWhatsAppHelp(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
