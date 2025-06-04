
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, ExternalLink } from 'lucide-react';
import { DocumentUploadCard } from './DocumentUploadCard';

interface BackgroundCheckCardProps {
  onUploadSuccess?: () => void;
}

export const BackgroundCheckCard: React.FC<BackgroundCheckCardProps> = ({ onUploadSuccess }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Background Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ttps-info">
            <AccordionTrigger>
              Certificate of Character from T&T Police - Application Process
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Don't have the actual certificate yet?
                </p>
                <p className="text-sm text-amber-700">
                  If you don't have the actual certificate as it takes time, proof from the police of your application for it is required.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">How do I apply for a Certificate of Character?</h4>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Important:</strong> ALL Certificate of Character applications are to be made online on the TTPS website ONLY, and not at any police stations.</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-blue-800 mb-2">Application Link:</p>
                    <a 
                      href="https://www.ttps.gov.tt/Services/Certificates/Certificate-of-Character-Request" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      TTPS Certificate of Character Request Form
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  
                  <div className="space-y-2">
                    <p><strong>Application Process:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Complete the online request form</li>
                      <li>Choose your appointment date and preferred police station for fingerprints</li>
                      <li>You will receive a receipt with a unique tracking number</li>
                      <li>Print your application forms on legal size paper</li>
                      <li>Bring printed forms to your appointment</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-medium text-green-800">Processing Fee: TT$50</p>
                    <p className="text-sm text-green-700">To be paid at the police station on the day of your appointment</p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4">
                    Source: <a href="https://www.ttps.gov.tt/Services/Certificates/Certificate-of-Character" target="_blank" rel="noopener noreferrer" className="underline">TTPS Official Website</a> (as of June 2025)
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DocumentUploadCard
          title="Certificate or Proof of Application"
          description="Upload either your Certificate of Character or proof of application"
          icon={<Shield className="h-6 w-6 text-primary" />}
          documentType="background_check"
          allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
          maxFileSize={5 * 1024 * 1024}
          multiple={false}
          onUploadSuccess={onUploadSuccess}
        />
      </CardContent>
    </Card>
  );
};
