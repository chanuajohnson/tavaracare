
import { useState, useEffect } from 'react';

export const useReceiptFormat = (initialReceiptUrl: string | null) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialReceiptUrl);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  useEffect(() => {
    // Update preview URL when initial URL changes
    if (initialReceiptUrl) {
      setPreviewUrl(initialReceiptUrl);
      setConversionError(null);
    } else {
      setPreviewUrl(null);
    }
    setIsConverting(false);
  }, [initialReceiptUrl]);

  return {
    previewUrl,
    setPreviewUrl,
    isConverting,
    setIsConverting,
    conversionError,
    setConversionError
  };
};

export default useReceiptFormat;
