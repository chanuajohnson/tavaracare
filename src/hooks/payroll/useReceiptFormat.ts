
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
      
      // If format is PDF, just use the receipt URL directly
      if (fileFormat === 'pdf') {
        setPreviewUrl(initialReceiptUrl);
        setIsConverting(false);
      } else {
        // For JPG, check if the URL already starts with data:image/jpeg
        if (initialReceiptUrl.startsWith('data:image/jpeg')) {
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        } else if (initialReceiptUrl.startsWith('data:application/pdf')) {
          // Need to convert - we'll simulate this with a loading state
          setIsConverting(true);
          setPreviewUrl(null); // Clear preview while converting
          
          // Signal that conversion is happening but don't actually perform it here
          // The actual conversion happens in the ShareReceiptDialog component
          setTimeout(() => {
            setPreviewUrl(initialReceiptUrl);
            setIsConverting(false);
          }, 800);
        } else {
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
        }
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
    previewUrl,
    conversionError,
    setConversionError
  };
};

export default useReceiptFormat;
