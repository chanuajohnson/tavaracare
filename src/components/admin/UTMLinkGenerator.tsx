import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Link2, ExternalLink, Trash2, MessageCircle, Facebook, Send } from 'lucide-react';
import { toast } from 'sonner';
import { generateUTMLink, UTM_PLATFORM_PRESETS, UTMPlatform } from '@/utils/utmTracking';
import { locations } from '@/pages/locations/locationsData';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedLink {
  id: string;
  platform: string;
  medium: string;
  campaign: string;
  url: string;
  note?: string;
  createdAt: string;
}

const STORAGE_KEY = 'tavara_generated_utm_links';
const PRODUCTION_BASE_URL = 'https://tavara.care';

type DestinationType = 'location' | 'blog' | 'custom';

// Channel presets that set platform + medium + campaign in one click
const CHANNEL_PRESETS: Array<{
  id: string;
  label: string;
  source: UTMPlatform;
  medium: string;
  campaign: string;
}> = [
  { id: 'whatsapp-dm', label: 'WhatsApp DM', source: 'whatsapp', medium: 'dm', campaign: 'direct-outreach' },
  { id: 'whatsapp-status', label: 'WhatsApp Status', source: 'whatsapp', medium: 'status', campaign: 'status-share' },
  { id: 'facebook-post', label: 'Facebook Post', source: 'facebook', medium: 'post', campaign: 'founder-share' },
  { id: 'facebook-group', label: 'Facebook Group', source: 'facebook', medium: 'group', campaign: 'community-post' },
  { id: 'instagram-bio', label: 'Instagram Bio', source: 'instagram', medium: 'bio', campaign: 'bio-link' },
  { id: 'instagram-story', label: 'Instagram Story', source: 'instagram', medium: 'story', campaign: 'story-share' },
  { id: 'tiktok-video', label: 'TikTok Caption', source: 'tiktok', medium: 'video', campaign: 'tiktok-screenroll' },
  { id: 'email', label: 'Email', source: 'email', medium: 'newsletter', campaign: 'newsletter' },
];

interface BlogOption { slug: string; title: string }

export function UTMLinkGenerator() {
  // Destination
  const [destinationType, setDestinationType] = useState<DestinationType>('location');
  const [locationSlug, setLocationSlug] = useState<string>('care/diamond-vale');
  const [blogSlug, setBlogSlug] = useState<string>('');
  const [customPath, setCustomPath] = useState<string>('/');
  const [blogOptions, setBlogOptions] = useState<BlogOption[]>([]);

  // UTM fields
  const [platform, setPlatform] = useState<UTMPlatform>('whatsapp');
  const [medium, setMedium] = useState<string>('dm');
  const [campaign, setCampaign] = useState<string>('direct-outreach');
  const [recipient, setRecipient] = useState<string>('');
  const [content, setContent] = useState<string>('');

  // Output
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [recentLinks, setRecentLinks] = useState<GeneratedLink[]>([]);

  // Load blog list
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('slug,title')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(50);
      if (data) {
        setBlogOptions(data as BlogOption[]);
        if (!blogSlug && data.length > 0) setBlogSlug(data[0].slug);
      }
    })();
  }, []);

  // Load recent links
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setRecentLinks(JSON.parse(stored));
    } catch (e) {
      console.error('Error loading recent links:', e);
    }
  }, []);

  const saveRecentLinks = (links: GeneratedLink[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      setRecentLinks(links);
    } catch (e) {
      console.error('Error saving recent links:', e);
    }
  };

  // Destination → full base URL + a default content slug
  const { destinationUrl, destinationSlug } = useMemo(() => {
    if (destinationType === 'location') {
      const loc = locations.find(l => l.slug === locationSlug);
      const slugTail = locationSlug.replace(/^care\//, '');
      return {
        destinationUrl: `${PRODUCTION_BASE_URL}/locations/${slugTail}`,
        destinationSlug: slugTail || loc?.areaServed || 'location',
      };
    }
    if (destinationType === 'blog') {
      return {
        destinationUrl: `${PRODUCTION_BASE_URL}/blog/${blogSlug}`,
        destinationSlug: blogSlug ? `blog-${blogSlug.split('-').slice(0, 4).join('-')}` : 'blog',
      };
    }
    const path = customPath.startsWith('/') ? customPath : `/${customPath}`;
    return {
      destinationUrl: `${PRODUCTION_BASE_URL}${path}`,
      destinationSlug: 'custom',
    };
  }, [destinationType, locationSlug, blogSlug, customPath]);

  // Medium options when platform changes
  useEffect(() => {
    const preset = UTM_PLATFORM_PRESETS[platform];
    if (preset && !preset.mediums.includes(medium as any)) {
      setMedium(preset.mediums[0]);
    }
  }, [platform]);

  // Generate URL in real-time
  useEffect(() => {
    if (!campaign.trim()) {
      setGeneratedUrl('');
      return;
    }
    // utm_content priority: explicit content > recipient > destinationSlug
    const finalContent =
      (content.trim() || recipient.trim() || destinationSlug).toLowerCase().replace(/\s+/g, '-');

    const url = generateUTMLink({
      baseUrl: destinationUrl,
      source: platform,
      medium,
      campaign: campaign.trim(),
      content: finalContent,
    });
    setGeneratedUrl(url);
  }, [platform, medium, campaign, content, recipient, destinationUrl, destinationSlug]);

  const applyChannelPreset = (id: string) => {
    const p = CHANNEL_PRESETS.find(c => c.id === id);
    if (!p) return;
    setPlatform(p.source);
    setMedium(p.medium);
    setCampaign(p.campaign);
  };

  const persistLink = () => {
    if (!generatedUrl) return;
    const note = recipient ? `to: ${recipient} via ${platform}` : `${platform} / ${medium}`;
    const newLink: GeneratedLink = {
      id: Date.now().toString(),
      platform,
      medium,
      campaign: campaign.trim(),
      url: generatedUrl,
      note,
      createdAt: new Date().toISOString(),
    };
    saveRecentLinks([newLink, ...recentLinks.slice(0, 19)]);
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast.success('Link copied');
      persistLink();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareMessage = useMemo(() => {
    if (destinationType === 'blog') {
      const title = blogOptions.find(b => b.slug === blogSlug)?.title;
      return title ? `${title}\n\n${generatedUrl}` : generatedUrl;
    }
    if (destinationType === 'location') {
      const loc = locations.find(l => l.slug === locationSlug);
      return loc ? `${loc.h1} — ${loc.kicker}\n\n${generatedUrl}` : generatedUrl;
    }
    return generatedUrl;
  }, [destinationType, blogSlug, locationSlug, blogOptions, generatedUrl]);

  const openWhatsApp = () => {
    if (!generatedUrl) return;
    persistLink();
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const openFacebookShare = () => {
    if (!generatedUrl) return;
    persistLink();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedUrl)}`, '_blank');
  };

  const openTelegram = () => {
    if (!generatedUrl) return;
    persistLink();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(generatedUrl)}&text=${encodeURIComponent(shareMessage)}`,
      '_blank',
    );
  };

  const handleDeleteLink = (id: string) =>
    saveRecentLinks(recentLinks.filter(l => l.id !== id));

  const handleCopyRecentLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Failed to copy');
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
            Pick a destination, choose who you are sending it to, and share — every click is tracked back to the right person and channel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Destination */}
          <div className="space-y-2">
            <Label>Destination</Label>
            <Tabs value={destinationType} onValueChange={(v) => setDestinationType(v as DestinationType)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="blog">Blog post</TabsTrigger>
                <TabsTrigger value="custom">Custom URL</TabsTrigger>
              </TabsList>
              <TabsContent value="location" className="pt-3">
                <Select value={locationSlug} onValueChange={setLocationSlug}>
                  <SelectTrigger><SelectValue placeholder="Pick a location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => (
                      <SelectItem key={l.slug} value={l.slug}>
                        {l.h1} — {l.areaServed}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="blog" className="pt-3">
                <Select value={blogSlug} onValueChange={setBlogSlug}>
                  <SelectTrigger><SelectValue placeholder="Pick a blog post" /></SelectTrigger>
                  <SelectContent>
                    {blogOptions.map(b => (
                      <SelectItem key={b.slug} value={b.slug}>{b.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="custom" className="pt-3">
                <Input
                  placeholder="/some/path"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                />
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground font-mono break-all">{destinationUrl}</p>
          </div>

          {/* Channel presets */}
          <div className="space-y-2">
            <Label>Channel preset (one click)</Label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_PRESETS.map(p => (
                <Button
                  key={p.id}
                  size="sm"
                  variant="outline"
                  onClick={() => applyChannelPreset(p.id)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Sending to (recipient or audience)</Label>
            <Input
              id="recipient"
              placeholder="e.g. scully, ria, newsletter-may"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Fills <span className="font-mono">utm_content</span> so you can tell Scully's click apart from Ria's.
            </p>
          </div>

          {/* Advanced UTM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Source (platform)</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as UTMPlatform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {platformOptions.map(p => (
                    <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Medium</Label>
              <Select value={medium} onValueChange={setMedium}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mediumOptions.map(m => (
                    <SelectItem key={m} value={m}>
                      {m.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentOverride">Override utm_content (optional)</Label>
            <Input
              id="contentOverride"
              placeholder="leave blank to auto-fill from recipient / destination"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Output */}
          {generatedUrl && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
              <Label className="text-sm font-medium">Generated link</Label>
              <div className="flex gap-2">
                <Input value={generatedUrl} readOnly className="font-mono text-sm bg-background" />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.open(generatedUrl, '_blank')}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Share with prefilled message</Label>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="default" onClick={openWhatsApp}>
                    <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={openFacebookShare}>
                    <Facebook className="h-4 w-4 mr-1.5" /> Facebook
                  </Button>
                  <Button size="sm" variant="outline" onClick={openTelegram}>
                    <Send className="h-4 w-4 mr-1.5" /> Telegram
                  </Button>
                </div>
                <Textarea
                  readOnly
                  rows={3}
                  value={shareMessage}
                  className="font-mono text-xs bg-background"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {recentLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent links</CardTitle>
            <CardDescription>Last 20 you generated. Stored locally in this browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLinks.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {link.note || `${link.platform} / ${link.medium} / ${link.campaign}`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono">{link.url}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyRecentLink(link.url)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteLink(link.id)}>
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
