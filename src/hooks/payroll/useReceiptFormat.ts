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
          // For PDF, we'll just keep the URL as is - conversion happens in ShareReceiptDialog
          setPreviewUrl(initialReceiptUrl);
          setIsConverting(false);
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
    setIsConverting,
    previewUrl,
    setPreviewUrl,
    conversionError,
    setConversionError
  };
};

export default useReceiptFormat;
