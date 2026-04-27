import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FormInput, CheckCircle2, AlertCircle } from 'lucide-react';
import { DetectedForm, FormField } from '../types/core';

interface FormDetectorProps {
  onFormDetected?: (form: DetectedForm) => void;
  showStatus?: boolean;
  className?: string;
}

export const FormDetector: React.FC<FormDetectorProps> = ({
  onFormDetected,
  showStatus = true,
  className = ''
}) => {
  const [detectedForm, setDetectedForm] = useState<DetectedForm | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const detectForms = () => {
      setIsScanning(true);
      
      // Simulate form detection delay
      setTimeout(() => {
        const forms = document.querySelectorAll('form');
        const detectedForms: DetectedForm[] = [];

        forms.forEach((form, index) => {
          const fields: FormField[] = [];
          
          // Detect input fields
          const inputs = form.querySelectorAll('input, textarea, select');
          inputs.forEach((input) => {
            const element = input as HTMLInputElement;
            const label = form.querySelector(`label[for="${element.id}"]`)?.textContent || 
                         element.getAttribute('placeholder') || 
                         element.getAttribute('name') || 
                         'Unknown Field';
            
            const fieldType = element.type === 'textarea' ? 'textarea' : 
                            element.tagName.toLowerCase() === 'select' ? 'select' :
                            element.type || 'text';

            fields.push({
              name: element.name || element.id || `field_${fields.length}`,
              label: label.trim(),
              type: fieldType as any,
              required: element.hasAttribute('required'),
              placeholder: element.getAttribute('placeholder') || undefined
            });
          });

          if (fields.length > 0) {
            const formTitle = form.getAttribute('data-form-title') ||
                            form.querySelector('h1, h2, h3')?.textContent ||
                            `Form ${index + 1}`;

            detectedForms.push({
              formId: form.id || `form_${index}`,
              formTitle: formTitle.trim(),
              fields,
              priority: fields.length // Higher field count = higher priority
            });
          }
        });

        // Select the most complex form (most fields)
        const selectedForm = detectedForms.sort((a, b) => b.priority - a.priority)[0] || null;
        
        setDetectedForm(selectedForm);
        setIsScanning(false);

        if (selectedForm && onFormDetected) {
          onFormDetected(selectedForm);
        }
      }, 1000);
    };

    // Initial detection
    detectForms();

    // Re-detect on DOM changes
    const observer = new MutationObserver(() => {
      detectForms();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [onFormDetected]);

  if (!showStatus) return null;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <FormInput className="h-4 w-4 text-blue-600" />
          <div className="flex-1">
            {isScanning ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-xs text-blue-700">Scanning for forms...</span>
              </div>
            ) : detectedForm ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-medium text-green-800">Form Detected</span>
                </div>
                <p className="text-xs text-green-700">{detectedForm.formTitle}</p>
                <p className="text-xs text-green-600">{detectedForm.fields.length} fields ready for assistance</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span className="text-xs text-amber-700">No forms detected on this page</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};