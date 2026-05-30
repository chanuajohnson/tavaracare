import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-client-env',
};

// When `referenceImageUrl` is supplied, we switch to Gemini 3 Pro Image and
// pass the reference as an image part so the model performs image-to-image
// style transfer. This is what the blog cover generator uses to inherit the
// look of our committed Tavara photo anchors. Callers that don't send a
// reference keep their existing behavior unchanged.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      prompt,
      width = 1024,
      height = 1024,
      outputFormat = 'png',
      referenceImageUrl,
    } = body as {
      prompt: string;
      width?: number;
      height?: number;
      outputFormat?: string;
      referenceImageUrl?: string;
    };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const hasReference = typeof referenceImageUrl === 'string' && referenceImageUrl.length > 0;
    const model = hasReference
      ? 'google/gemini-3-pro-image-preview'
      : 'google/gemini-2.5-flash-image-preview';

    // Either a plain string (text-only) or an array of content parts including
    // the reference image. OpenRouter image-chat shape applies to both Gemini
    // image models.
    const userContent: unknown = hasReference
      ? [
          { type: 'image_url', image_url: { url: referenceImageUrl } },
          { type: 'text', text: prompt },
        ]
      : prompt;

    console.log('Generating image', {
      model,
      hasReference,
      promptPreview: prompt?.substring(0, 100),
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: userContent }],
        modalities: ['image', 'text'],
        output_format: outputFormat,
        quality: 'high',
        size: `${width}x${height}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit hit. Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Lovable AI credits exhausted. Add credits in Settings > Workspace > Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', JSON.stringify(data).slice(0, 400));
      throw new Error('No image URL in response');
    }

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
