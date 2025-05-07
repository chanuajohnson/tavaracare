
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Copy, Mail, FileText, FileImage, Share, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { shareReportViaWhatsApp } from '@/services/care-plans/careReportService';
import useReceiptFormat from "@/hooks/payroll/useReceiptFormat";

// Import pdfjs dynamically to avoid module loading issues
let pdfjs: any = null;

interface ShareCareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportUrl: string | null;
  isGenerating: boolean;
}

type FileFormat = 'pdf' | 'jpg';

export const ShareCareReportDialog: React.FC<ShareCareReportDialogProps> = ({
  open,
  onOpenChange,
  reportUrl,
  isGenerating
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showWhatsAppHelp, setShowWhatsAppHelp] = useState(false);
  const [email, setEmail] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  
  const { 
    fileFormat, 
    setFileFormat, 
    previewUrl, 
    conversionError, 
    setConversionError 
  } = useReceiptFormat(reportUrl);

  // Load PDF.js dynamically when needed
  React.useEffect(() => {
    if (open && fileFormat === 'jpg' && reportUrl?.startsWith('data:application/pdf')) {
      // Only load PDF.js when we actually need to convert a PDF
      import('pdfjs-dist').then(module => {
        pdfjs = module;
        // Set the worker source URL
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      }).catch(error => {
        console.error('Error loading PDF.js library:', error);
        setConversionError('Failed to load PDF conversion library. Please try again or use PDF format.');
      });
    }
  }, [open, fileFormat, reportUrl, setConversionError]);

  const convertPdfToJpg = async (pdfData: string): Promise<string> => {
    try {
      console.log('Starting PDF to JPG conversion with PDF.js');
      
      if (!pdfjs) {
        throw new Error('PDF.js library not loaded');
      }
      
      const base64Content = pdfData.split(',')[1];
      if (!base64Content) {
        throw new Error('Invalid PDF data URL format');
      }
      
      const binaryData = atob(base64Content);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
      
      const page = await pdf.getPage(1);
      
      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      console.log('PDF page rendered successfully');
      
      try {
        const jpgData = canvas.toDataURL('image/jpeg', 0.95);
        console.log('Canvas converted to JPG successfully');
        return jpgData;
      } catch (error) {
        console.error('Error converting canvas to JPG:', error);
        throw new Error('Failed to convert PDF to JPG');
      }
    } catch (error) {
      console.error('Error in PDF to JPG conversion:', error);
      throw error;
    }
  };

  const handlePdfToJpgConversion = async () => {
    if (!reportUrl) return null;
    
    try {
      setIsConverting(true);
      setConversionError(null);
      
      const jpgData = await convertPdfToJpg(reportUrl);
      return jpgData;
    } catch (error) {
      console.error('PDF to JPG conversion failed:', error);
      setConversionError('Failed to convert PDF to JPG. Please try using PDF format instead.');
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  // Handle direct download
  const handleDownload = async () => {
    if (!reportUrl) return;

    try {
      setIsDownloading(true);

      const fileName = `tavara-care-report-${new Date().toISOString().split('T')[0]}.${fileFormat}`;
      
      try {
        let downloadUrl = reportUrl;
        
        // If we need to convert to JPG
        if (fileFormat === 'jpg' && reportUrl.startsWith('data:application/pdf')) {
          const jpgData = await handlePdfToJpgConversion();
          if (!jpgData) {
            throw new Error('Failed to convert PDF to JPG');
          }
          downloadUrl = jpgData;
        }
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Report downloaded as ${fileFormat.toUpperCase()}`);
      } catch (error) {
        console.error('Download error:', error);
        toast.error(`Failed to download report as ${fileFormat.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Download setup error:', error);
      toast.error('Failed to prepare report for download');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle WhatsApp sharing
  const handleShareViaWhatsApp = async () => {
    if (!reportUrl) return;
    
    try {
      setIsSharing(true);
      
      // If format is jpg, try to convert first
      let shareableUrl = reportUrl;
      if (fileFormat === 'jpg' && reportUrl.startsWith('data:application/pdf')) {
        const jpgData = await handlePdfToJpgConversion();
        if (jpgData) {
          shareableUrl = jpgData;
        }
      }
      
      const shared = await shareReportViaWhatsApp(shareableUrl);
      
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

  const handleCopyLink = () => {
    if (!previewUrl) return;
    
    navigator.clipboard.writeText(previewUrl)
      .then(() => toast.success('Report link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleEmailShare = () => {
    if (!email || !previewUrl) {
      toast.error('Please enter an email address');
      return;
    }

    toast.success(`Report would be sent to ${email}`);
    setEmail('');
  };

  const handleFormatChange = (value: FileFormat) => {
    setFileFormat(value);
    
    // If changing to JPG and we have a PDF, perform conversion
    if (value === 'jpg' && reportUrl?.startsWith('data:application/pdf')) {
      handlePdfToJpgConversion();
    }
  };

  const renderPreview = () => {
    if (isGenerating) {
      return (
        <div className="py-8 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Generating comprehensive care report...</p>
        </div>
      );
    }
    
    if (isConverting) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-500">Converting to JPG...</p>
          </div>
        </div>
      );
    }
    
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
        <div className="py-8 flex items-center justify-center">
          <p>Failed to generate report. Please try again.</p>
        </div>
      );
    }
    
    if (fileFormat === 'pdf' || !previewUrl.startsWith('data:image/jpeg')) {
      return (
        <div className="border rounded-md overflow-hidden h-64">
          <iframe 
            src={previewUrl} 
            className="w-full h-full"
            title="Report Preview"
          />
        </div>
      );
    } else {
      return (
        <div className="border rounded-md overflow-hidden h-64">
          <img 
            src={previewUrl} 
            alt="Report Preview"
            className="w-full h-full object-contain"
          />
        </div>
      );
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
            {renderPreview()}
            
            {!isGenerating && previewUrl && (
              <>
                <div className="flex justify-center mb-2">
                  <FileText size={48} className="text-primary" />
                </div>
                
                <p className="text-center text-sm">
                  Your comprehensive care report includes plan details, 
                  care team members, and weekly schedule.
                </p>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCopyLink}
                    disabled={!previewUrl || isConverting}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  
                  <div className="flex w-full space-x-2">
                    <Select 
                      value={fileFormat} 
                      onValueChange={(value: FileFormat) => handleFormatChange(value)}
                      disabled={isConverting || isDownloading}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
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
                      disabled={!previewUrl || isDownloading || isConverting}
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-end space-x-2 col-span-2">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="email">Email Report</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Enter email address" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isConverting}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleEmailShare}
                      disabled={!previewUrl || isConverting}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleShareViaWhatsApp}
                    className="w-full col-span-2"
                    disabled={isSharing || isConverting}
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
