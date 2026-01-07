import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Download, Image, FileText, QrCode, Users, Eye } from 'lucide-react';
import { 
  generateErrandsPricingSheet,
  generateErrandsQRCodes,
  generateInstagramTemplates
} from '@/utils/marketing/generateMarketingAssets';
import { CaregivingFlyerTemplate } from '@/components/marketing/CaregivingFlyerTemplate';
import html2canvas from 'html2canvas';

const GenerateMarketingAssets = () => {
  const [loading, setLoading] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<{
    pricingSheet?: string;
    qr1?: string;
    qr2?: string;
    instagramTemplates?: Array<{ name: string; imageUrl: string }>;
  }>({});
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [showFlyerPreview, setShowFlyerPreview] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    toast.info('Generating marketing assets... This may take 2-3 minutes.');

    try {
      // Generate pricing sheet
      toast.info('Creating pricing guide...');
      const pricingSheet = await generateErrandsPricingSheet();
      setGeneratedAssets(prev => ({ ...prev, pricingSheet }));
      toast.success('Pricing guide generated!');
      
      // Generate QR codes
      toast.info('Generating QR codes...');
      const qrCodes = await generateErrandsQRCodes();
      setGeneratedAssets(prev => ({ ...prev, qr1: qrCodes.qr1, qr2: qrCodes.qr2 }));
      toast.success('QR codes generated!');
      
      // Generate Instagram templates
      toast.info('Creating Instagram templates... (this takes the longest)');
      const igTemplates = await generateInstagramTemplates();
      setGeneratedAssets(prev => ({ ...prev, instagramTemplates: igTemplates }));
      toast.success('Instagram templates generated!');

      toast.success('All assets generated successfully! Click Download All to save them.');

    } catch (error) {
      console.error('Asset generation error:', error);
      toast.error('Failed to generate some assets. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = () => {
    if (!generatedAssets.pricingSheet && !generatedAssets.qr1 && !generatedAssets.instagramTemplates) {
      toast.error('No assets generated yet. Click Generate All first.');
      return;
    }

    let downloadCount = 0;

    if (generatedAssets.pricingSheet) {
      downloadImage(generatedAssets.pricingSheet, 'tavara-errands-pricing-guide.png');
      downloadCount++;
    }

    if (generatedAssets.qr1) {
      downloadImage(generatedAssets.qr1, 'tavara-qr-errands-page.png');
      downloadCount++;
    }

    if (generatedAssets.qr2) {
      downloadImage(generatedAssets.qr2, 'tavara-qr-whatsapp-booking.png');
      downloadCount++;
    }

    if (generatedAssets.instagramTemplates) {
      generatedAssets.instagramTemplates.forEach((template, index) => {
        setTimeout(() => {
          downloadImage(template.imageUrl, `tavara-${template.name}.png`);
        }, index * 500);
      });
      downloadCount += generatedAssets.instagramTemplates.length;
    }

    toast.success(`Downloading ${downloadCount} assets...`);
  };

  const handleDownloadFlyer = async () => {
    const flyerElement = document.getElementById('caregiving-flyer');
    if (!flyerElement) {
      toast.error('Flyer not found. Please show preview first.');
      return;
    }

    setFlyerLoading(true);
    toast.info('Generating print-ready flyer...');

    try {
      const canvas = await html2canvas(flyerElement, {
        scale: 2, // Higher resolution for print
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = 'tavara-caregiving-flyer.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Flyer downloaded! Ready for printing.');
    } catch (error) {
      console.error('Flyer download error:', error);
      toast.error('Failed to download flyer.');
    } finally {
      setFlyerLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Marketing Assets</h1>
        <p className="text-muted-foreground">
          Create professional marketing materials for Tavara.care and Errands service
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Marketing Asset Generator</CardTitle>
          <CardDescription>
            Generate all marketing materials in one click. This will create pricing guides, QR codes, and social media templates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateAll} 
              disabled={loading}
              size="lg"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Image className="mr-2 h-4 w-4" />
                  Generate All Marketing Materials
                </>
              )}
            </Button>

            <Button 
              onClick={handleDownloadAll}
              disabled={!generatedAssets.pricingSheet && !generatedAssets.qr1 && !generatedAssets.instagramTemplates}
              size="lg"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>

          {/* Caregiving Flyer Generator */}
          <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Users className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold">Caregiving Services Flyer</p>
                  <p className="text-sm text-muted-foreground">Half-page (5.5x8.5") with authentic Tavara imagery</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowFlyerPreview(!showFlyerPreview)} 
                  size="sm"
                  variant="outline"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showFlyerPreview ? 'Hide' : 'Preview'}
                </Button>
                <Button 
                  onClick={handleDownloadFlyer} 
                  disabled={flyerLoading}
                  size="sm"
                >
                  {flyerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PNG
                    </>
                  )}
                </Button>
              </div>
            </div>
            {showFlyerPreview && (
              <div className="mt-4 flex justify-center">
                <div className="transform scale-50 origin-top" ref={flyerRef}>
                  <CaregivingFlyerTemplate />
                </div>
              </div>
            )}
          </div>

          {/* Hidden full-size flyer for download */}
          <div className="fixed -left-[9999px] -top-[9999px]">
            <CaregivingFlyerTemplate />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm">This will generate:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Errands Pricing Guide</p>
                  <p className="text-xs text-muted-foreground">PNG format, print-ready</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <QrCode className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">2 QR Codes</p>
                  <p className="text-xs text-muted-foreground">Errands page + WhatsApp booking</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Image className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">6 Instagram Templates</p>
                  <p className="text-xs text-muted-foreground">1080x1080, post-ready</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">WhatsApp Templates</p>
                  <p className="text-xs text-muted-foreground">Text file with 8 message templates</p>
                </div>
              </div>
            </div>
          </div>

          {generatedAssets.pricingSheet || generatedAssets.qr1 || generatedAssets.instagramTemplates ? (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">✅ Assets Generated</h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                {generatedAssets.pricingSheet && <li>• Pricing Guide</li>}
                {generatedAssets.qr1 && <li>• QR Code (Errands Page)</li>}
                {generatedAssets.qr2 && <li>• QR Code (WhatsApp)</li>}
                {generatedAssets.instagramTemplates && (
                  <li>• {generatedAssets.instagramTemplates.length} Instagram Templates</li>
                )}
              </ul>
            </div>
          ) : null}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>⏱️ <strong>Estimated time:</strong> 2-3 minutes for all assets</p>
            <p>💡 <strong>Tip:</strong> Generated images use Tavara blue (#6B9FDB) for consistent branding</p>
            <p>📱 <strong>Note:</strong> Assets are high-resolution and suitable for both digital and print use</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Templates</CardTitle>
          <CardDescription>
            Pre-written message templates are already available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a 
            href="/marketing/errands/whatsapp-templates.txt" 
            download
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Download className="h-4 w-4" />
            Download WhatsApp Templates (TXT)
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateMarketingAssets;
