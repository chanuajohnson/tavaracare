import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { HorizontalTabs, HorizontalTabsList, HorizontalTabsTrigger, HorizontalTabsContent } from '@/components/ui/horizontal-scroll-tabs';
import { Button } from '@/components/ui/button';
import { MarketingLeadCaptureModal } from '@/components/marketing/MarketingLeadCaptureModal';
import { TavaraBrandTab } from '@/components/marketing/TavaraBrandTab';
import { ErrandsMaterialsTab } from '@/components/marketing/ErrandsMaterialsTab';
import { SocialTemplatesTab } from '@/components/marketing/SocialTemplatesTab';
import { EmailPartnerTab } from '@/components/marketing/EmailPartnerTab';
import { useTracking } from '@/hooks/useTracking';
import { Download, Package } from 'lucide-react';

const MarketingKit = () => {
  const { trackEngagement } = useTracking();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ assetType: string; downloadUrl: string } | null>(null);
  const [activeTab, setActiveTab] = useState('brand');

  useEffect(() => {
    // Check if user has already unlocked marketing kit
    const unlocked = localStorage.getItem('marketing_kit_unlocked');
    setHasAccess(!!unlocked);

    // Track page view
    trackEngagement('marketing_kit_page_view', {
      hasAccess: !!unlocked,
      referrer: document.referrer
    });
  }, [trackEngagement]);

  const handleDownloadRequest = (assetType: string, downloadUrl: string) => {
    if (!hasAccess) {
      // User needs to complete lead capture first
      setPendingDownload({ assetType, downloadUrl });
      setShowLeadModal(true);
    } else {
      // Process download immediately
      processDownload(assetType, downloadUrl);
    }
  };

  const processDownload = (assetType: string, downloadUrl: string) => {
    // Track the download
    trackEngagement('marketing_asset_download', {
      assetType,
      downloadFormat: downloadUrl.split('.').pop(),
      timestamp: new Date().toISOString()
    });

    // Initiate download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = downloadUrl.split('/').pop() || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLeadCaptureSuccess = () => {
    // Grant access
    localStorage.setItem('marketing_kit_unlocked', 'true');
    setHasAccess(true);

    // Track access granted
    trackEngagement('marketing_kit_access_granted', {
      timestamp: new Date().toISOString(),
      referrer: document.referrer
    });

    // Process pending download if any
    if (pendingDownload) {
      processDownload(pendingDownload.assetType, pendingDownload.downloadUrl);
      setPendingDownload(null);
    }
  };

  const handleTabChange = (newTab: string) => {
    trackEngagement('marketing_kit_tab_switch', {
      fromTab: activeTab,
      toTab: newTab
    });
    setActiveTab(newTab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Container className="py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Package className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Marketing Resources</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-foreground to-primary bg-clip-text text-transparent">
            Tavara Marketing Resources
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Professional marketing materials for promoting Tavara.care services. Perfect for partners, affiliates, and business marketing.
            {!hasAccess && ' Unlock access to download all assets.'}
          </p>

          {!hasAccess && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground mb-4">
                📧 Business contact details required to access marketing materials
              </p>
              <Button 
                onClick={() => setShowLeadModal(true)}
                size="lg"
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                Get Marketing Kit Access
              </Button>
            </div>
          )}
        </div>

        {/* Tabbed Content */}
        <HorizontalTabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <HorizontalTabsList className="w-full justify-start mb-8">
            <HorizontalTabsTrigger value="brand">Tavara Brand</HorizontalTabsTrigger>
            <HorizontalTabsTrigger value="errands">Errands Materials</HorizontalTabsTrigger>
            <HorizontalTabsTrigger value="social">Social Templates</HorizontalTabsTrigger>
            <HorizontalTabsTrigger value="email">Email & Partner</HorizontalTabsTrigger>
          </HorizontalTabsList>

          <HorizontalTabsContent value="brand">
            <TavaraBrandTab onDownloadRequest={handleDownloadRequest} hasAccess={hasAccess} />
          </HorizontalTabsContent>

          <HorizontalTabsContent value="errands">
            <ErrandsMaterialsTab onDownloadRequest={handleDownloadRequest} hasAccess={hasAccess} />
          </HorizontalTabsContent>

          <HorizontalTabsContent value="social">
            <SocialTemplatesTab onDownloadRequest={handleDownloadRequest} hasAccess={hasAccess} />
          </HorizontalTabsContent>

          <HorizontalTabsContent value="email">
            <EmailPartnerTab onDownloadRequest={handleDownloadRequest} hasAccess={hasAccess} />
          </HorizontalTabsContent>
        </HorizontalTabs>

        {/* Footer CTA */}
        <div className="mt-16 text-center bg-card border border-border rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-2">Need Custom Materials?</h3>
          <p className="text-muted-foreground mb-4">
            Contact us for personalized marketing assets or partnership opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="https://wa.me/18687127677" target="_blank" rel="noopener noreferrer">
                WhatsApp Us
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:admin@tavara.care">
                Email Us
              </a>
            </Button>
          </div>
        </div>
      </Container>

      {/* Marketing Lead Capture Modal */}
      <MarketingLeadCaptureModal
        open={showLeadModal}
        onOpenChange={setShowLeadModal}
        onSuccess={handleLeadCaptureSuccess}
      />
    </div>
  );
};

export default MarketingKit;
