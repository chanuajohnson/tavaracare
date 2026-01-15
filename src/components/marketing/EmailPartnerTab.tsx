import React from 'react';
import { AssetCard } from './AssetCard';

interface EmailPartnerTabProps {
  onDownloadRequest: (assetType: string, downloadUrl: string) => void;
  hasAccess: boolean;
}

export const EmailPartnerTab: React.FC<EmailPartnerTabProps> = ({ 
  onDownloadRequest, 
  hasAccess 
}) => {
  return (
    <div className="space-y-8">
      {/* Section: Email Signatures */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Signatures</h2>
        <p className="text-muted-foreground mb-6">
          Professional email signatures with Tavara branding
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Full Email Signature"
            description="Complete signature with logo and contact details"
            downloadFormat="HTML"
            fileSize="8 KB"
            assetType="email_signature_full"
            downloadUrl="/marketing/email/signature-full.html"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Text-Only Signature"
            description="Simple text version for plain email clients"
            downloadFormat="TXT"
            fileSize="2 KB"
            assetType="email_signature_text"
            downloadUrl="/marketing/email/signature-text.txt"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Minimal Signature"
            description="Compact version with essential details only"
            downloadFormat="HTML"
            fileSize="5 KB"
            assetType="email_signature_minimal"
            downloadUrl="/marketing/email/signature-minimal.html"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Partner One-Pagers */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Partner One-Pagers</h2>
        <p className="text-muted-foreground mb-6">
          Printable overview sheets for partnerships and corporate clients
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Tavara.care Overview"
            description="Mission, services, coverage, and partnership opportunities"
            downloadFormat="PDF"
            fileSize="2.8 MB"
            assetType="partner_tavara_overview"
            downloadUrl="/marketing/partners/tavara-overview.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Errands Service Sheet"
            description="Service menu, pricing, booking process, and corporate options"
            downloadFormat="PDF"
            fileSize="2.4 MB"
            assetType="partner_errands_sheet"
            downloadUrl="/marketing/partners/errands-corporate.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Community Volunteer Info"
            description="Volunteer opportunities and community care circle details"
            downloadFormat="PDF"
            fileSize="1.9 MB"
            assetType="partner_volunteer_info"
            downloadUrl="/marketing/partners/volunteer-info.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: QR Code Library */}
      <div>
        <h2 className="text-2xl font-bold mb-2">QR Code Library</h2>
        <p className="text-muted-foreground mb-6">
          High-resolution QR codes with tracking parameters for various uses
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Main Site QR (300px)"
            description="Links to tavara.care homepage with tracking"
            downloadFormat="PNG"
            fileSize="45 KB"
            assetType="qr_code_main_300"
            downloadUrl="/marketing/qr/main-site-300.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Main Site QR (600px)"
            description="Medium resolution for print materials"
            downloadFormat="PNG"
            fileSize="120 KB"
            assetType="qr_code_main_600"
            downloadUrl="/marketing/qr/main-site-600.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Main Site QR (1200px)"
            description="High resolution for large format printing"
            downloadFormat="PNG"
            fileSize="340 KB"
            assetType="qr_code_main_1200"
            downloadUrl="/marketing/qr/main-site-1200.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Errands Page QR (600px)"
            description="Direct link to errands booking page"
            downloadFormat="PNG"
            fileSize="125 KB"
            assetType="qr_code_errands_600"
            downloadUrl="/marketing/qr/errands-page-600.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="WhatsApp Direct QR (600px)"
            description="Opens WhatsApp with pre-filled booking message"
            downloadFormat="PNG"
            fileSize="130 KB"
            assetType="qr_code_whatsapp_600"
            downloadUrl="/marketing/qr/whatsapp-direct-600.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>
    </div>
  );
};
