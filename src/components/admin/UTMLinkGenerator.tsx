import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Link2, ExternalLink, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateUTMLink, UTM_PLATFORM_PRESETS, UTMPlatform } from '@/utils/utmTracking';

interface GeneratedLink {
  id: string;
  platform: string;
  medium: string;
  campaign: string;
  url: string;
  createdAt: string;
}

const STORAGE_KEY = 'tavara_generated_utm_links';

export function UTMLinkGenerator() {
  const [platform, setPlatform] = useState<UTMPlatform>('instagram');
  const [medium, setMedium] = useState<string>('paid');
  const [campaign, setCampaign] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState<GeneratedLink[]>([]);

  // Load recent links from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentLinks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent links:', error);
    }
  }, []);

  // Save recent links to localStorage
  const saveRecentLinks = (links: GeneratedLink[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      setRecentLinks(links);
    } catch (error) {
      console.error('Error saving recent links:', error);
    }
  };

  // Update medium options when platform changes
  useEffect(() => {
    const preset = UTM_PLATFORM_PRESETS[platform];
    if (preset && preset.mediums.length > 0) {
      setMedium(preset.mediums[0]);
    }
  }, [platform]);

  // Generate URL in real-time
  useEffect(() => {
    if (campaign.trim()) {
      const url = generateUTMLink({
        source: platform,
        medium,
        campaign: campaign.trim(),
        content: content.trim() || undefined
      });
      setGeneratedUrl(url);
    } else {
      setGeneratedUrl('');
    }
  }, [platform, medium, campaign, content]);

  const handleCopy = async () => {
    if (!generatedUrl) return;
    
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Save to recent links
      const newLink: GeneratedLink = {
        id: Date.now().toString(),
        platform,
        medium,
        campaign: campaign.trim(),
        url: generatedUrl,
        createdAt: new Date().toISOString()
      };
      
      const updatedLinks = [newLink, ...recentLinks.slice(0, 9)]; // Keep last 10
      saveRecentLinks(updatedLinks);
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteLink = (id: string) => {
    const updatedLinks = recentLinks.filter(link => link.id !== id);
    saveRecentLinks(updatedLinks);
    toast.success('Link removed');
  };

  const handleCopyRecentLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const platformOptions = Object.keys(UTM_PLATFORM_PRESETS) as UTMPlatform[];
  const mediumOptions = UTM_PLATFORM_PRESETS[platform]?.mediums || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            UTM Link Generator
          </CardTitle>
          <CardDescription>
            Create tracked links for your social media campaigns. Copy and paste these links into your ad manager or bio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as UTMPlatform)}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medium">Type</Label>
              <Select value={medium} onValueChange={setMedium}>
                <SelectTrigger id="medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {mediumOptions.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign">Campaign Name *</Label>
            <Input
              id="campaign"
              placeholder="e.g., jan_30_family_care, garden_ohm_collab"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use a descriptive name like "jan_30_family" or "tiktok_caregiver_tips"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content ID (Optional)</Label>
            <Input
              id="content"
              placeholder="e.g., video_1, reel_dance, cta_button"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use to differentiate between multiple creatives in the same campaign
            </p>
          </div>

          {generatedUrl && (
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
              <Label className="text-sm font-medium">Generated Link</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedUrl}
                  readOnly
                  className="font-mono text-sm bg-background"
                />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(generatedUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {recentLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Links</CardTitle>
            <CardDescription>Your recently generated campaign links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {link.platform} / {link.medium} / {link.campaign}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {link.url}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyRecentLink(link.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
