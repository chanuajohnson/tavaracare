import React from 'react';
import { AssetCard } from './AssetCard';

interface TavaraBrandTabProps {
  onDownloadRequest: (assetType: string, downloadUrl: string) => void;
  hasAccess: boolean;
}

export const TavaraBrandTab: React.FC<TavaraBrandTabProps> = ({ onDownloadRequest, hasAccess }) => {
  return (
    <div className="space-y-8">
      {/* Section: Logo Package */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Logo Package</h2>
        <p className="text-muted-foreground mb-6">
          Official Tavara.care logos in various formats and color variations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Primary Logo Package"
            description="Color, white, and black variations with tagline"
            downloadFormat="ZIP"
            fileSize="2.4 MB"
            assetType="tavara_logo_package"
            downloadUrl="/marketing/logos/tavara-logos.zip"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Logo Spacing Guide"
            description="Minimum clear space and usage guidelines"
            downloadFormat="PDF"
            fileSize="890 KB"
            assetType="tavara_logo_spacing"
            downloadUrl="/marketing/logos/tavara-logo-guide.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Brand Colors */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Brand Colors</h2>
        <p className="text-muted-foreground mb-6">
          Complete color palette with hex codes and usage notes
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Color Palette Guide"
            description="Primary, secondary, and accent colors with accessibility notes"
            downloadFormat="PDF"
            fileSize="1.2 MB"
            assetType="tavara_color_palette"
            downloadUrl="/marketing/brand/tavara-colors.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Typography */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Typography</h2>
        <p className="text-muted-foreground mb-6">
          Font specifications and heading hierarchy
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Typography Guide"
            description="Font family, sizes, and usage examples"
            downloadFormat="PDF"
            fileSize="780 KB"
            assetType="tavara_typography_guide"
            downloadUrl="/marketing/brand/tavara-typography.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Brand Voice */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Brand Voice & Messaging</h2>
        <p className="text-muted-foreground mb-6">
          Taglines, core messaging pillars, and tone of voice guidelines
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Brand Voice Guidelines"
            description="Messaging pillars, taglines, and communication style"
            downloadFormat="PDF"
            fileSize="1.5 MB"
            assetType="tavara_brand_voice"
            downloadUrl="/marketing/brand/tavara-brand-voice.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Complete Brand Guidelines"
            description="Comprehensive guide with all brand elements"
            downloadFormat="PDF"
            fileSize="5.8 MB"
            assetType="tavara_complete_guidelines"
            downloadUrl="/marketing/brand/tavara-complete-guidelines.pdf"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>
    </div>
  );
};
