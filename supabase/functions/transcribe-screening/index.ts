
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2/cors";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from("screening_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responses = Array.isArray(session.responses) ? session.responses : [];
    if (responses.length === 0) {
      return new Response(JSON.stringify({ error: "No responses to process" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build summary prompt from all responses (text + any existing transcripts)
    const summaryParts: string[] = [];
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i];
      const questionText = r.question || `Question ${i + 1}`;
      const answer = r.text_response || r.transcript || "(no response)";
      const rating = r.rating ? ` [Rating: ${r.rating}]` : "";
      summaryParts.push(`Q${i + 1}: ${questionText}\nA: ${answer}${rating}`);
    }

    const fullTranscript = summaryParts.join("\n\n");

    // Use Lovable AI for summary generation
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    let aiSummary = "AI summary unavailable — review responses manually.";
    let aiRecommendation = "manual_review";

    if (lovableApiKey) {
      try {
        const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a caregiving screening evaluator for Tavara.care, a shared-care platform in Trinidad & Tobago. 
                
Analyze the head nurse's screening responses about a caregiver candidate and provide:
1. A structured summary (3-5 sentences) highlighting strengths, concerns, and overall impression
2. A recommendation: exactly one of "approve", "conditional", or "reject"

Format your response as JSON: {"summary": "...", "recommendation": "approve|conditional|reject"}`
              },
              {
                role: "user",
                content: `Screening responses for candidate "${session.candidate_name}":\n\n${fullTranscript}`
              }
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            aiSummary = parsed.summary || aiSummary;
            aiRecommendation = parsed.recommendation || aiRecommendation;
          }
        }
      } catch (aiErr) {
        console.error("AI processing error:", aiErr);
      }
    }

    // Update session with AI results
    const { error: updateError } = await supabase
      .from("screening_sessions")
      .update({
        ai_summary: aiSummary,
        ai_recommendation: aiRecommendation,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session_id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: aiSummary, 
        recommendation: aiRecommendation 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in transcribe-screening:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
