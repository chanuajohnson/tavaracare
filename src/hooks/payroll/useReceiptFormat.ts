import { useState, useEffect } from 'react';

type ReceiptFormat = 'pdf' | 'jpg';

export const useReceiptFormat = (
  initialReceiptUrl: string | null,
  initialFormat: ReceiptFormat = 'pdf'
) => {
  const [fileFormat, setFileFormat] = useState<ReceiptFormat>(initialFormat);
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialReceiptUrl);
  const [conversionError, setConversionError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReceiptUrl) {
      // Reset error state
      setConversionError(null);
      
      // Handle preview URLs based on format
      if (fileFormat === 'pdf') {
        // For PDF format, always use the original receipt URL if it's a PDF
        if (initialReceiptUrl.startsWith('data:application/pdf')) {
          setPreviewUrl(initialReceiptUrl);
        } else if (initialReceiptUrl.startsWith('data:image/jpeg') && previewUrl !== initialReceiptUrl) {
          // If we have a JPG but want PDF preview, use what we have
          // We can't convert JPG to PDF in browser easily
          setPreviewUrl(initialReceiptUrl);
          // Optionally warn about format mismatch
          console.log('Warning: Using JPG for PDF preview as conversion is not supported');
        } else {
          // For any other format, just use what we have
          setPreviewUrl(initialReceiptUrl);
        }
        setIsConverting(false);
      } else if (fileFormat === 'jpg') {
        // For JPG format
        if (initialReceiptUrl.startsWith('data:image/jpeg')) {
          // If we already have a JPG, use it directly
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        } else if (initialReceiptUrl.startsWith('data:application/pdf')) {
          // If we have a PDF but want JPG
          // Keep the PDF URL for preview, actual conversion happens in ShareReceiptDialog
          // This avoids duplicate conversion attempts
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(true);
          console.log('PDF detected for JPG format. Conversion will be handled by dialog.');
        } else {
          // For any other format, just use what we have
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        }
      }
    } else {
      setPreviewUrl(null);
      setIsConverting(false);
    }
  }, [initialReceiptUrl, fileFormat]);

  // Define a helper to update file format with proper type checking
  const updateFileFormat = (newFormat: ReceiptFormat) => {
    if (newFormat === 'pdf' || newFormat === 'jpg') {
      setFileFormat(newFormat);
    } else {
      console.error(`Invalid format: ${newFormat}, using default 'pdf'`);
      setFileFormat('pdf');
    }
  };

  return {
    fileFormat,
    setFileFormat: updateFileFormat,
    isConverting,
    setIsConverting,
    previewUrl,
    setPreviewUrl,
    conversionError,
    setConversionError
  };
};

export default useReceiptFormat;
