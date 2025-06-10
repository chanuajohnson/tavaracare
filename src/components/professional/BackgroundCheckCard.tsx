
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, ExternalLink, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { DocumentUploadCard } from './DocumentUploadCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BackgroundCheckCardProps {
  onUploadSuccess?: () => void;
}

export const BackgroundCheckCard: React.FC<BackgroundCheckCardProps> = ({ onUploadSuccess }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Background Check - Certificate of Character
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Importance Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <p className="font-semibold">IMPORTANT: Your Certificate of Character is required for verification</p>
              <p className="text-sm">
                This is a mandatory document from the Trinidad & Tobago Police Service (TTPS) that verifies your criminal background. 
                Without this certificate, you cannot receive assignments or earn your verification badge.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Verification Stages */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">Verification Process Stages:</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">🔴 Not Started</p>
                <p className="text-xs text-red-600">No background check documents uploaded</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-3 w-3 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">🟡 In Progress</p>
                <p className="text-xs text-yellow-600">Receipt or proof of application uploaded (while waiting for certificate)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">🟢 Verified</p>
                <p className="text-xs text-green-600">Actual Certificate of Character uploaded and verified - Badge earned!</p>
              </div>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ttps-info">
            <AccordionTrigger>
              Certificate of Character from T&T Police - How to Get It
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-2">
                  Don't have the actual certificate yet?
                </p>
                <p className="text-sm text-amber-700">
                  If you don't have the actual certificate (as it takes time to process), you can upload proof of your application 
                  to get "In Progress" status while you wait. However, you'll need the actual certificate to get verified and earn your badge.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Step-by-Step Process:</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-blue-800 mb-2">⚠️ Important Note:</p>
                    <p className="text-blue-700">ALL Certificate of Character applications must be made online through the TTPS website ONLY. Do not go to police stations first.</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-medium text-green-800 mb-2">Step 1: Apply Online</p>
                    <a 
                      href="https://www.ttps.gov.tt/Services/Certificates/Certificate-of-Character-Request" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      Complete the TTPS online application form
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-green-700">
                      <li>Fill out the online request form completely</li>
                      <li>Choose your appointment date for fingerprints</li>
                      <li>Select your preferred police station</li>
                      <li>You'll receive a receipt with tracking number</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="font-medium text-blue-800 mb-2">Step 2: Prepare for Appointment</p>
                    <ul className="list-disc pl-5 space-y-1 text-blue-700">
                      <li>Print your application forms on legal size paper</li>
                      <li>Bring printed forms to your appointment</li>
                      <li>Bring valid ID (National ID, Driver's Permit, or Passport)</li>
                      <li>Bring TT$50 for the processing fee (cash)</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="font-medium text-yellow-800 mb-2">Step 3: Attend Appointment</p>
                    <ul className="list-disc pl-5 space-y-1 text-yellow-700">
                      <li>Go to your chosen police station on your appointment date</li>
                      <li>Complete fingerprinting process</li>
                      <li>Pay TT$50 processing fee</li>
                      <li>Keep your receipt for tracking</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="font-medium text-green-800 mb-2">Step 4: Collect Certificate</p>
                    <ul className="list-disc pl-5 space-y-1 text-green-700">
                      <li>Processing typically takes 2-4 weeks</li>
                      <li>You can track status using your receipt number</li>
                      <li>Return to collect your certificate when ready</li>
                      <li>Upload the actual certificate here for verification</li>
                    </ul>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4 p-2 bg-gray-50 rounded">
                    Source: <a href="https://www.ttps.gov.tt/Services/Certificates/Certificate-of-Character" target="_blank" rel="noopener noreferrer" className="underline">TTPS Official Website</a> (as of June 2025)
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <DocumentUploadCard
          title="Certificate of Character or Proof of Application"
          description="Upload your Certificate of Character for verification, or proof of application while you wait"
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
