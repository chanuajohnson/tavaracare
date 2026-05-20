import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  SOCIAL_PLATFORMS,
  PLATFORM_LABELS,
  CAMPAIGN_PRESETS,
  buildSocialUtmUrl,
  slugify,
  type SocialPlatform,
} from "@/lib/blog/socialCampaigns";

interface Props {
  postId: string;
  postSlug: string;
  postTitle: string;
}

export function SocialSharePanel({ postId, postSlug, postTitle }: Props) {
  const [platform, setPlatform] = useState<SocialPlatform>("facebook");
  const [campaign, setCampaign] = useState<string>("blog-launch");
  const [contentSlug, setContentSlug] = useState<string>(slugify(`${postTitle}-${platform}`));
  const [caption, setCaption] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const utmUrl = buildSocialUtmUrl({ slug: postSlug, platform, campaign, content: contentSlug });

  const handlePlatformChange = (p: SocialPlatform) => {
    setPlatform(p);
    setContentSlug(slugify(`${postTitle}-${p}`));
  };

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-social-caption", {
        body: { postId, platform },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCaption(data.caption ?? "");
      if (data.suggestedCampaign) setCampaign(data.suggestedCampaign);
      if (data.suggestedContentSlug) setContentSlug(slugify(data.suggestedContentSlug));
      toast.success("Caption generated");
    } catch (e: any) {
      const msg = e?.message ?? "Failed to generate caption";
      if (msg.includes("429")) toast.error("Rate limited. Try again in a moment.");
      else if (msg.includes("402")) toast.error("AI credits exhausted. Add credits in Settings.");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logCopy = async (full: boolean) => {
    try {
      const { error } = await supabase.from("social_share_links").insert({
        post_id: postId,
        platform,
        campaign: slugify(campaign),
        content_slug: slugify(contentSlug),
        full_url: utmUrl,
        caption: full ? caption : null,
        generated_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        copied_at: new Date().toISOString(),
      });
      if (error) console.error("[social-share log]", error);
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(utmUrl);
    await logCopy(false);
    toast.success("Tracked link copied");
  };

  const copyCaptionAndLink = async () => {
    const text = caption ? `${caption}\n\n${utmUrl}` : utmUrl;
    await navigator.clipboard.writeText(text);
    await logCopy(true);
    toast.success("Caption + link copied");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Share2 className="h-4 w-4" />
          Social share (AI-tuned)
        </CardTitle>
        <CardDescription className="text-xs">
          Platform-aware caption + UTM-tracked link. Every copy is logged for attribution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Platform</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {SOCIAL_PLATFORMS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={platform === p ? "default" : "outline"}
                onClick={() => handlePlatformChange(p)}
                type="button"
              >
                {PLATFORM_LABELS[p]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs">Campaign</Label>
            <Select value={campaign} onValueChange={setCampaign}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CAMPAIGN_PRESETS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Content slug (utm_content)</Label>
            <Input
              value={contentSlug}
              onChange={(e) => setContentSlug(e.target.value)}
              placeholder="when-help-feels-pressure-fb"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Caption</Label>
            <Button size="sm" variant="ghost" onClick={generate} disabled={loading} type="button">
              {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
              {caption ? "Regenerate" : "Generate"}
            </Button>
          </div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={6}
            placeholder="AI-generated caption will appear here. You can edit before copying."
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Tracked URL preview</Label>
          <div className="mt-1 p-2 rounded bg-muted text-xs break-all font-mono">{utmUrl}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={copyCaptionAndLink} size="sm" type="button">
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy caption + link
          </Button>
          <Button onClick={copyLink} size="sm" variant="outline" type="button">
            <Copy className="h-3.5 w-3.5 mr-1" />
            Copy link only
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
