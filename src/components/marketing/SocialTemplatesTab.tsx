import React from 'react';
import { AssetCard } from './AssetCard';

interface SocialTemplatesTabProps {
  onDownloadRequest: (assetType: string, downloadUrl: string) => void;
  hasAccess: boolean;
}

export const SocialTemplatesTab: React.FC<SocialTemplatesTabProps> = ({ 
  onDownloadRequest, 
  hasAccess 
}) => {
  return (
    <div className="space-y-8">
      {/* Section: Instagram Feed */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Instagram Feed Posts (1080x1080)</h2>
        <p className="text-muted-foreground mb-6">
          Square format posts optimized for Instagram feed and WhatsApp
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Your Errands Buddy"
            description="Hero image with pricing and service highlights"
            downloadFormat="PNG"
            fileSize="890 KB"
            assetType="social_instagram_feed_1"
            downloadUrl="/marketing/social/instagram/feed-1.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="TT$50 Base Fee"
            description="Pricing highlight card with clear call-to-action"
            downloadFormat="PNG"
            fileSize="720 KB"
            assetType="social_instagram_feed_2"
            downloadUrl="/marketing/social/instagram/feed-2.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="All Services Grid"
            description="Icon-based services overview with visual appeal"
            downloadFormat="PNG"
            fileSize="950 KB"
            assetType="social_instagram_feed_3"
            downloadUrl="/marketing/social/instagram/feed-3.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Monthly Plans Available"
            description="Subscription promotion highlighting savings"
            downloadFormat="PNG"
            fileSize="810 KB"
            assetType="social_instagram_feed_4"
            downloadUrl="/marketing/social/instagram/feed-4.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="T&T Wide Coverage"
            description="Map visual showing service availability across Trinidad"
            downloadFormat="PNG"
            fileSize="1.1 MB"
            assetType="social_instagram_feed_5"
            downloadUrl="/marketing/social/instagram/feed-5.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Testimonial Template"
            description="Customizable template for customer reviews"
            downloadFormat="PNG"
            fileSize="680 KB"
            assetType="social_instagram_feed_6"
            downloadUrl="/marketing/social/instagram/feed-6.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Instagram Stories */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Instagram Stories (1080x1920)</h2>
        <p className="text-muted-foreground mb-6">
          Portrait format for Instagram stories and WhatsApp status
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Book Today - Swipe Up"
            description="Call-to-action story with booking prompt"
            downloadFormat="PNG"
            fileSize="1.4 MB"
            assetType="social_instagram_story_1"
            downloadUrl="/marketing/social/instagram/story-1.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Urgent? WhatsApp Now"
            description="Direct WhatsApp booking promotion"
            downloadFormat="PNG"
            fileSize="1.2 MB"
            assetType="social_instagram_story_2"
            downloadUrl="/marketing/social/instagram/story-2.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="How Pricing Works"
            description="Educational explainer story with visual breakdown"
            downloadFormat="PNG"
            fileSize="1.5 MB"
            assetType="social_instagram_story_3"
            downloadUrl="/marketing/social/instagram/story-3.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="This Week's Special"
            description="Customizable announcement template"
            downloadFormat="PNG"
            fileSize="1.3 MB"
            assetType="social_instagram_story_4"
            downloadUrl="/marketing/social/instagram/story-4.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>

      {/* Section: Facebook Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Facebook Posts (1200x630)</h2>
        <p className="text-muted-foreground mb-6">
          Landscape format optimized for Facebook feed and sharing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AssetCard
            title="Full Service Menu"
            description="Comprehensive services overview for Facebook audience"
            downloadFormat="PNG"
            fileSize="980 KB"
            assetType="social_facebook_1"
            downloadUrl="/marketing/social/facebook/post-1.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="On-Demand vs Subscription"
            description="Pricing comparison highlighting value of monthly plans"
            downloadFormat="PNG"
            fileSize="850 KB"
            assetType="social_facebook_2"
            downloadUrl="/marketing/social/facebook/post-2.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Working Parents?"
            description="Targeted message for busy parents needing support"
            downloadFormat="PNG"
            fileSize="790 KB"
            assetType="social_facebook_3"
            downloadUrl="/marketing/social/facebook/post-3.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
          
          <AssetCard
            title="Caregiver Relief"
            description="Community-focused message for caregiver support"
            downloadFormat="PNG"
            fileSize="820 KB"
            assetType="social_facebook_4"
            downloadUrl="/marketing/social/facebook/post-4.png"
            onDownload={onDownloadRequest}
            hasAccess={hasAccess}
          />
        </div>
      </div>
    </div>
  );
};
