import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface FormSyncOptions {
  onFieldUpdate?: (fieldName: string, value: any) => void;
  showVisualFeedback?: boolean;
}

export const useRealTimeFormSync = (
  extractedData: Record<string, any>,
  setFormValue: (field: string, value: any) => void,
  options: FormSyncOptions = {}
) => {
  const { onFieldUpdate, showVisualFeedback = true } = options;

  // Map TAV field names to form field names
  const fieldMapping: Record<string, string> = {
    first_name: 'first_name',
    last_name: 'last_name',
    email: 'email',
    phone_number: 'phone',
    address: 'address',
    care_recipient_name: 'care_recipient_name',
    relationship: 'relationship'
  };

  // Capitalize and format names properly
  const formatName = useCallback((name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }, []);

  // Format field values based on field type
  const formatValue = useCallback((fieldName: string, value: any): any => {
    if (fieldName === 'first_name' || fieldName === 'last_name' || fieldName === 'care_recipient_name') {
      return formatName(value);
    }
    if (fieldName === 'email') {
      return value.toLowerCase().trim();
    }
    if (fieldName === 'phone_number' || fieldName === 'phone') {
      // Format phone number
      const digits = value.replace(/\D/g, '');
      if (digits.length === 10) {
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      }
      return value;
    }
    return value;
  }, [formatName]);

  // Real-time sync effect
  useEffect(() => {
    if (!extractedData || Object.keys(extractedData).length === 0) return;

    console.log('🔄 Real-time form sync triggered:', extractedData);

    Object.entries(extractedData).forEach(([tavField, value]) => {
      const formField = fieldMapping[tavField];
      if (formField && value) {
        const formattedValue = formatValue(formField, value);
        
        console.log(`📝 Syncing field: ${tavField} → ${formField} = "${formattedValue}"`);
        
        // Update the form field
        setFormValue(formField, formattedValue);
        
        // Visual feedback
        if (showVisualFeedback) {
          const fieldLabel = formField.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          toast.success(`✨ ${fieldLabel} filled from conversation!`, {
            duration: 2000,
            style: {
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              border: 'none'
            }
          });
        }
        
        // Callback for additional actions
        onFieldUpdate?.(formField, formattedValue);
      }
    });
  }, [extractedData, setFormValue, fieldMapping, formatValue, showVisualFeedback, onFieldUpdate]);

  // Save extracted data to localStorage for persistence
  useEffect(() => {
    if (Object.keys(extractedData).length > 0) {
      const sessionId = new URLSearchParams(window.location.search).get('session');
      if (sessionId) {
        localStorage.setItem(`tavara_chat_realtime_${sessionId}`, JSON.stringify(extractedData));
        console.log('💾 Saved real-time data to localStorage:', extractedData);
      }
    }
  }, [extractedData]);

  return {
    mappedFields: Object.keys(extractedData).filter(key => fieldMapping[key]),
    syncedCount: Object.keys(extractedData).filter(key => fieldMapping[key]).length,
    formatValue
  };
};