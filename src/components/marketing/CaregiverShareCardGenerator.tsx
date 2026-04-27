import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Download, Users, Eye, EyeOff, MessageCircle, Share2 } from 'lucide-react';
import { useSpotlightCaregivers } from '@/hooks/useSpotlightData';
import { CaregiverShareCard } from './CaregiverShareCard';
import { 
  generateCardImage, 
  downloadImage, 
  generateFilename,
  generateWhatsAppMessage,
  generateWhatsAppUrl
} from '@/utils/marketing/caregiverShareUtils';
import { SpotlightCaregiver } from '@/services/spotlightService';

export const CaregiverShareCardGenerator: React.FC = () => {
  const { data: caregivers, isLoading: loadingCaregivers } = useSpotlightCaregivers();
  const [generating, setGenerating] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState<SpotlightCaregiver | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleDownloadCard = async (caregiver: SpotlightCaregiver, format: 'square' | 'story') => {
    const cardId = `card-${caregiver.caregiverId}-${format}`;
    const element = document.getElementById(cardId);
    
    if (!element) {
      toast.error('Card not found. Please try again.');
      return;
    }

    setGenerating(caregiver.caregiverId);
    toast.info(`Generating ${format === 'story' ? 'WhatsApp Story' : 'Instagram'} card for ${caregiver.profile.firstName}...`);

    try {
      const dataUrl = await generateCardImage(element, 2);
      const firstName = caregiver.profile.firstName || 'caregiver';
      const filename = generateFilename(firstName, format);
      downloadImage(dataUrl, filename);
      toast.success(`${caregiver.profile.firstName}'s card downloaded!`);
    } catch (error) {
      console.error('Card generation error:', error);
      toast.error('Failed to generate card.');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadAll = async (format: 'square' | 'story') => {
    if (!caregivers?.length) {
      toast.error('No caregivers to generate cards for.');
      return;
    }

    setGenerating('all');
    toast.info(`Generating ${format === 'story' ? 'WhatsApp Story' : 'Instagram'} cards for all caregivers...`);

    try {
      for (const caregiver of caregivers) {
        const cardId = `card-${caregiver.caregiverId}-${format}`;
        const element = document.getElementById(cardId);
        
        if (element) {
          const dataUrl = await generateCardImage(element, 2);
          const firstName = caregiver.profile.firstName || 'caregiver';
          const filename = generateFilename(firstName, format);
          downloadImage(dataUrl, filename);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      toast.success(`All ${caregivers.length} cards downloaded!`);
    } catch (error) {
      console.error('Batch download error:', error);
      toast.error('Failed to download some cards.');
    } finally {
      setGenerating(null);
    }
  };

  const handleSendWhatsApp = (caregiver: SpotlightCaregiver) => {
    const firstName = caregiver.profile.firstName || 'there';
    const phoneNumber = caregiver.profile.phoneNumber;
    
    if (!phoneNumber) {
      toast.error(`No phone number found for ${firstName}`);
      return;
    }

    const message = generateWhatsAppMessage(firstName);
    const url = generateWhatsAppUrl(phoneNumber, message);
    window.open(url, '_blank');
  };

  if (loadingCaregivers) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading spotlight caregivers...</p>
        </CardContent>
      </Card>
    );
  }

  if (!caregivers?.length) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No spotlight caregivers found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add caregivers to the spotlight first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Caregiver Share Cards
        </CardTitle>
        <CardDescription>
          Generate personalized social media cards for caregivers to share on WhatsApp Status, Instagram, and Facebook
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleDownloadAll('square')}
            disabled={generating === 'all'}
            variant="outline"
          >
            {generating === 'all' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download All (Instagram)
          </Button>
          <Button
            onClick={() => handleDownloadAll('story')}
            disabled={generating === 'all'}
            variant="outline"
          >
            {generating === 'all' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download All (Story)
          </Button>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="ghost"
          >
            {showPreview ? (
              <><EyeOff className="mr-2 h-4 w-4" /> Hide Preview</>
            ) : (
              <><Eye className="mr-2 h-4 w-4" /> Show Preview</>
            )}
          </Button>
        </div>

        {/* Caregiver List */}
        <div className="space-y-3">
          {caregivers.map((caregiver) => {
            const firstName = caregiver.profile.firstName || caregiver.profile.fullName?.split(' ')[0] || 'Caregiver';
            const initials = caregiver.profile.fullName
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'CG';

            return (
              <div 
                key={caregiver.caregiverId}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={caregiver.profile.avatarUrl} alt={firstName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{firstName}</p>
                    <p className="text-sm text-muted-foreground">{caregiver.headline}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadCard(caregiver, 'square')}
                    disabled={generating === caregiver.caregiverId}
                  >
                    {generating === caregiver.caregiverId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>📷 IG</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadCard(caregiver, 'story')}
                    disabled={generating === caregiver.caregiverId}
                  >
                    {generating === caregiver.caregiverId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>📱 Story</>
                    )}
                  </Button>
                  {caregiver.profile.phoneNumber && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleSendWhatsApp(caregiver)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Section */}
        {showPreview && caregivers.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Card Preview ({caregivers[0].profile.firstName})</h4>
            <div className="flex gap-6 overflow-x-auto pb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">Instagram (1080×1080)</p>
                <div className="transform scale-50 origin-top-left">
                  <CaregiverShareCard 
                    caregiver={caregivers[0]} 
                    format="square"
                    id={`preview-square`}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2 text-center">WhatsApp Story (1080×1920)</p>
                <div className="transform scale-[0.35] origin-top-left">
                  <CaregiverShareCard 
                    caregiver={caregivers[0]} 
                    format="story"
                    id={`preview-story`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden cards for download */}
        <div style={{ position: 'absolute', left: '-9999px', top: '0' }}>
          {caregivers.map((caregiver) => (
            <React.Fragment key={caregiver.caregiverId}>
              <CaregiverShareCard 
                caregiver={caregiver} 
                format="square"
                id={`card-${caregiver.caregiverId}-square`}
              />
              <CaregiverShareCard 
                caregiver={caregiver} 
                format="story"
                id={`card-${caregiver.caregiverId}-story`}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
          <p>📷 <strong>Instagram/Facebook:</strong> Square format (1080×1080)</p>
          <p>📱 <strong>WhatsApp Status:</strong> Vertical format (1080×1920)</p>
          <p>💬 <strong>Send:</strong> Click the green WhatsApp button to message the caregiver directly</p>
        </div>
      </CardContent>
    </Card>
  );
};
