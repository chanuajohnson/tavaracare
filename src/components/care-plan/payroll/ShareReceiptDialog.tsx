
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Download, Mail, File, FileImage, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useReceiptFormat from "@/hooks/payroll/useReceiptFormat";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const { 
    fileFormat, 
    setFileFormat, 
    previewUrl, 
    conversionError, 
    setConversionError 
  } = useReceiptFormat(receiptUrl);
  
  // Function to convert PDF to JPG directly in the component
  const convertPdfToJpg = async (pdfDataUrl: string): Promise<string> => {
    try {
      setIsConverting(true);
      setConversionError(null);
      
      // Dynamically import pdfjs only when needed
      const pdfjs = await import('pdfjs-dist');
      
      // Set worker source using a direct CDN path
      if (!window.pdfjsWorker) {
        // Configure the worker source directly with the version from pdfjs
        const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        window.pdfjsWorker = true;
      }
      
      // Convert base64 to array buffer
      const base64Content = pdfDataUrl.split(',')[1];
      if (!base64Content) {
        throw new Error('Invalid PDF data URL format');
      }
      
      const binaryData = atob(base64Content);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      
      // Load PDF document
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      console.log(`PDF loaded successfully. Number of pages: ${pdf.numPages}`);
      
      // Get first page
      const page = await pdf.getPage(1);
      
      // Set up canvas
      const scale = 2.0;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      console.log('PDF page rendered to canvas successfully');
      
      // Convert canvas to JPG
      const jpgData = canvas.toDataURL('image/jpeg', 0.95);
      console.log('Canvas converted to JPG successfully');
      
      return jpgData;
    } catch (error) {
      console.error('Error in PDF to JPG conversion:', error);
      throw error;
    } finally {
      setIsConverting(false);
    }
  };

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
      
      let downloadUrl = receiptUrl;
      let filename = `receipt-${workLog.id.slice(0, 8)}.pdf`;
      
      // If we need to convert to JPG and have a PDF
      if (fileFormat === 'jpg' && receiptUrl.startsWith('data:application/pdf')) {
        try {
          console.log('Converting PDF to JPG for download...');
          const jpgData = await convertPdfToJpg(receiptUrl);
          downloadUrl = jpgData;
          filename = `receipt-${workLog.id.slice(0, 8)}.jpg`;
          console.log('Conversion successful, ready for download');
        } catch (error) {
          console.error('PDF to JPG conversion failed:', error);
          setConversionError('Failed to convert PDF to JPG. Downloading as PDF instead.');
          // Fall back to PDF download
          downloadUrl = receiptUrl;
          filename = `receipt-${workLog.id.slice(0, 8)}.pdf`;
        }
      }
      
      // Create a blob from the data URL
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Use the Blob object and createObjectURL for more reliable downloading
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast.success(`Receipt downloaded as ${fileFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download receipt`);
      setConversionError('Download failed. Please try again or use a different format.');
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

  // When format changes, handle conversion
  const handleFormatChange = async (value: FileFormat) => {
    setFileFormat(value);
    
    // If changing to JPG and we have a PDF, perform conversion
    if (value === 'jpg' && receiptUrl?.startsWith('data:application/pdf')) {
      try {
        setIsConverting(true);
        const jpgData = await convertPdfToJpg(receiptUrl);
        console.log('Format changed and conversion completed');
        // The hook will handle setting the preview URL
      } catch (error) {
        console.error('Format change conversion failed:', error);
        setConversionError('Failed to convert PDF to JPG. Please try again or use PDF format.');
      } finally {
        setIsConverting(false);
      }
    }
  };

  const renderPreview = () => {
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
        <div className="p-4 text-center text-muted-foreground h-64 flex items-center justify-center">
          No receipt available
        </div>
      );
    }
    
    if (fileFormat === 'pdf' || !previewUrl.startsWith('data:image/jpeg')) {
      return (
        <iframe 
          src={previewUrl} 
          className="w-full h-64"
          title="Receipt Preview"
        />
      );
    } else {
      return (
        <img 
          src={previewUrl} 
          alt="Receipt Preview"
          className="w-full h-64 object-contain"
        />
      );
    }
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
                disabled={!receiptUrl || isConverting}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <div className="flex-1 flex space-x-2">
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
                  disabled={!receiptUrl || isDownloading || isConverting}
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
                  disabled={isConverting}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleEmailShare}
                disabled={!receiptUrl || isConverting}
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
