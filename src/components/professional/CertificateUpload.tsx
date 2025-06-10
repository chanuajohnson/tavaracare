import React from 'react';
import { DocumentUploadCard } from './DocumentUploadCard';
import { BackgroundCheckCard } from './BackgroundCheckCard';
import { FileText, Award, Shield, GraduationCap } from 'lucide-react';

interface CertificateUploadProps {
  onUploadSuccess?: () => void;
}

export const CertificateUpload: React.FC<CertificateUploadProps> = ({ onUploadSuccess }) => {
  return (
    <div className="space-y-6">
      {/* Background Check Card - Priority position at top */}
      <BackgroundCheckCard onUploadSuccess={onUploadSuccess} />
      
      {/* Other Document Types */}
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
      
      <DocumentUploadCard
        title="Educational Transcripts"
        description="Upload transcripts, diplomas, or educational certificates"
        icon={<GraduationCap className="h-6 w-6 text-primary" />}
        documentType="education"
        allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
        maxFileSize={5 * 1024 * 1024}
        multiple={true}
        onUploadSuccess={onUploadSuccess}
      />
      
      <DocumentUploadCard
        title="Professional References"
        description="Upload reference letters from previous employers or colleagues"
        icon={<FileText className="h-6 w-6 text-primary" />}
        documentType="reference"
        allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
        maxFileSize={5 * 1024 * 1024}
        multiple={true}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};
