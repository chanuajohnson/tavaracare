
import React from 'react';
import { DocumentUploadCard } from './DocumentUploadCard';
import { BackgroundCheckCard } from './BackgroundCheckCard';
import { Award, Shield, IdCard } from 'lucide-react';

interface CertificateUploadProps {
  onUploadSuccess?: () => void;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({ onUploadSuccess }) => {
  return (
    <div className="space-y-6">
      {/* Background Check Card - Priority position at top */}
      <BackgroundCheckCard onUploadSuccess={onUploadSuccess} />
      
      {/* Valid Identification Card - Second position */}
      <DocumentUploadCard
        title="Valid Identification"
        description="National ID, Driver's Permit, or Passport - Upload a valid form of identification"
        icon={<IdCard className="h-6 w-6 text-primary" />}
        documentType="identification"
        allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
        maxFileSize={5 * 1024 * 1024}
        multiple={false}
        onUploadSuccess={onUploadSuccess}
      />
      
      {/* Professional Certifications Card - Third position */}
      <DocumentUploadCard
        title="Professional Certifications"
        description="Upload your nursing licenses, care certificates, or other professional credentials"
        icon={<Award className="h-6 w-6 text-primary" />}
        documentType="certification"
        allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
        maxFileSize={5 * 1024 * 1024}
        multiple={true}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};
