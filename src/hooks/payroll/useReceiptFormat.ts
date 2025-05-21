
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
  const [lastAttemptedConversion, setLastAttemptedConversion] = useState<string | null>(null);

  useEffect(() => {
    if (initialReceiptUrl) {
      // If we have a new URL that's different from what triggered the last conversion attempt
      // then reset our error state
      if (initialReceiptUrl !== lastAttemptedConversion) {
        setConversionError(null);
      }
      
      // Handle preview URLs based on format
      if (fileFormat === 'pdf') {
        // For PDF format, always use the original receipt URL if it's a PDF
        if (initialReceiptUrl.startsWith('data:application/pdf')) {
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        } else if (initialReceiptUrl.startsWith('data:image/jpeg')) {
          // If we have a JPG but want PDF preview, use what we have
          // We can't convert JPG to PDF in browser easily
          setPreviewUrl(initialReceiptUrl);
          console.log('Using JPG for PDF preview as conversion is not supported');
          setIsConverting(false);
        } else {
          // For any other format, just use what we have
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        }
      } else if (fileFormat === 'jpg') {
        // For JPG format
        if (initialReceiptUrl.startsWith('data:image/jpeg')) {
          // If we already have a JPG, use it directly
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        } else if (initialReceiptUrl.startsWith('data:application/pdf')) {
          // If we have a PDF but want JPG
          // Indicate that conversion is needed, but don't start it here
          // The actual conversion happens in ShareReceiptDialog
          setPreviewUrl(initialReceiptUrl); // Keep using PDF until conversion completes
          setIsConverting(true);
          setLastAttemptedConversion(initialReceiptUrl);
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
  }, [initialReceiptUrl, fileFormat, lastAttemptedConversion]);

  // Define a helper to update file format with proper type checking
  const updateFileFormat = (newFormat: ReceiptFormat) => {
    if (newFormat === 'pdf' || newFormat === 'jpg') {
      setFileFormat(newFormat);
      
      // Reset conversion error when switching formats
      // This gives users another chance to try conversion
      setConversionError(null);
    } else {
      console.error(`Invalid format: ${newFormat}, using default 'pdf'`);
      setFileFormat('pdf');
    }
  };

  // Function to update the preview URL after a successful conversion
  const updateConvertedPreview = (convertedUrl: string) => {
    setPreviewUrl(convertedUrl);
    setIsConverting(false);
    setConversionError(null);
  };

  return {
    fileFormat,
    setFileFormat: updateFileFormat,
    isConverting,
    setIsConverting,
    previewUrl,
    setPreviewUrl,
    conversionError,
    setConversionError,
    updateConvertedPreview
  };
};

export default useReceiptFormat;
