
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
      
      // If format is PDF or the URL is already a PDF, just use the receipt URL directly
      if (fileFormat === 'pdf' || initialReceiptUrl.startsWith('data:application/pdf')) {
        setPreviewUrl(initialReceiptUrl);
        setIsConverting(false);
      } 
      // If we have a JPG URL and we want JPG format
      else if (fileFormat === 'jpg' && initialReceiptUrl.startsWith('data:image/jpeg')) {
        setPreviewUrl(initialReceiptUrl);
        setIsConverting(false);
      }
      // Default fallback - just use the URL as is
      else {
        setPreviewUrl(initialReceiptUrl);
        setIsConverting(false);
      }
    } else {
      setPreviewUrl(null);
      setIsConverting(false);
    }
  }, [initialReceiptUrl, fileFormat]);

  return {
    fileFormat,
    setFileFormat,
    isConverting,
    setIsConverting,
    previewUrl,
    setPreviewUrl,
    conversionError,
    setConversionError
  };
};

export default useReceiptFormat;
