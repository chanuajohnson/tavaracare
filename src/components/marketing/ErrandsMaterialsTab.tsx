import React from 'react';
import { AssetCard } from './AssetCard';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface ErrandsMaterialsTabProps {
  onDownloadRequest: (assetType: string, downloadUrl: string) => void;
  hasAccess: boolean;
}

export const ErrandsMaterialsTab: React.FC<ErrandsMaterialsTabProps> = ({ 
  onDownloadRequest, 
  hasAccess 
}) => {
  return (
    <div className="space-y-8">
      {/* AI Generation Notice */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              🎨 Generate Custom Marketing Materials
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Use AI to create professional pricing guides, QR codes, and social media templates in minutes.
            </p>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link to="/admin/generate-marketing">
              Generate Assets
            </Link>
          </Button>
        </div>
      </div>

      {/* Section: Pricing Guide */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Pricing Guide</h2>
        <p className="text-muted-foreground mb-6">
          Printable pricing breakdown with all service tiers and examples
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Errands Pricing Guide"
            description="Complete pricing breakdown for all errands services"
            downloadFormat="PDF"
            fileSize="2.1 MB"
            assetType="errands_pricing_guide"
            downloadUrl="/marketing/errands/errands-pricing-guide.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Service Menu */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Services Menu</h2>
        <p className="text-muted-foreground mb-6">
          Visual grid of all available errands services with icons
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Full Services Menu"
            description="All 10+ services with icons, descriptions, and pricing ranges"
            downloadFormat="PDF"
            fileSize="2.1 MB"
            assetType="errands_service_menu"
            downloadUrl="/marketing/errands/service-menu.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Services Grid (Social)"
            description="Square format for Instagram and WhatsApp sharing"
            downloadFormat="PNG"
            fileSize="650 KB"
            assetType="errands_services_grid"
            downloadUrl="/marketing/errands/services-grid.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: WhatsApp Templates */}
      <div>
        <h2 className="text-2xl font-bold mb-2">WhatsApp Booking Templates</h2>
        <p className="text-muted-foreground mb-6">
          Pre-written message templates for easy booking and inquiries
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="WhatsApp Message Templates"
            description="Standard booking, urgent requests, and deposit confirmations"
            downloadFormat="TXT"
            fileSize="12 KB"
            assetType="errands_whatsapp_templates"
            downloadUrl="/marketing/errands/whatsapp-templates.txt"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: QR Codes */}
      <div>
        <h2 className="text-2xl font-bold mb-2">QR Codes</h2>
        <p className="text-muted-foreground mb-6">
          Scannable QR codes linking to errands page and WhatsApp booking
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Errands Landing Page QR"
            description="Links to tavara.care/errands with tracking"
            downloadFormat="PNG"
            fileSize="180 KB"
            assetType="errands_qr_landing"
            downloadUrl="/marketing/errands/qr-landing.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="WhatsApp Booking QR"
            description="Direct WhatsApp link with pre-filled message"
            downloadFormat="PNG"
            fileSize="185 KB"
            assetType="errands_qr_whatsapp"
            downloadUrl="/marketing/errands/qr-whatsapp.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>
    </div>
  );
};
