
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Eye, BarChart3 } from 'lucide-react';
import { metaPixelService } from '@/services/metaPixelService';

interface TrackingConsentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackingConsentManager: React.FC<TrackingConsentManagerProps> = ({
  isOpen,
  onClose
}) => {
  const [googleAnalyticsEnabled, setGoogleAnalyticsEnabled] = useState(true);
  const [metaPixelEnabled, setMetaPixelEnabled] = useState(true);
  const [functionalCookiesEnabled, setFunctionalCookiesEnabled] = useState(true);

  useEffect(() => {
    // Load current tracking preferences
    const metaPixelDisabled = localStorage.getItem('tavara_disable_pixel_tracking') === 'true';
    const gaDisabled = localStorage.getItem('tavara_disable_ga_tracking') === 'true';
    
    setMetaPixelEnabled(!metaPixelDisabled);
    setGoogleAnalyticsEnabled(!gaDisabled);
  }, []);

  const handleSavePreferences = () => {
    // Handle Meta Pixel preferences
    if (metaPixelEnabled) {
      metaPixelService.enableTracking();
    } else {
      metaPixelService.disableTracking();
    }

    // Handle Google Analytics preferences
    if (googleAnalyticsEnabled) {
      localStorage.removeItem('tavara_disable_ga_tracking');
    } else {
      localStorage.setItem('tavara_disable_ga_tracking', 'true');
    }

    // Functional cookies are required for the platform to work
    if (!functionalCookiesEnabled) {
      setFunctionalCookiesEnabled(true);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Tracking Preferences
          </DialogTitle>
          <DialogDescription>
            Control how TavaraCare tracks your interactions to improve our services and provide relevant content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics & Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Google Analytics</p>
                  <p className="text-sm text-gray-600">
                    Helps us understand how users interact with our platform to improve user experience.
                  </p>
                </div>
                <Switch
                  checked={googleAnalyticsEnabled}
                  onCheckedChange={setGoogleAnalyticsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Meta Pixel (Facebook)</p>
                  <p className="text-sm text-gray-600">
                    Enables us to measure ad effectiveness and provide relevant care service information.
                  </p>
                </div>
                <Switch
                  checked={metaPixelEnabled}
                  onCheckedChange={setMetaPixelEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Essential Functionality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Functional Cookies</p>
                  <p className="text-sm text-gray-600">
                    Required for authentication, user preferences, and core platform functionality.
                  </p>
                </div>
                <Switch
                  checked={functionalCookiesEnabled}
                  onCheckedChange={setFunctionalCookiesEnabled}
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Your Privacy Matters:</strong> We only collect data necessary to improve your caregiving experience. 
              You can change these preferences anytime in your account settings.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSavePreferences}>
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
