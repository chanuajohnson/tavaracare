
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-client-env, x-app-version, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    // Step 1: Transcribe any voice recordings that don't have transcripts yet
    let transcriptsUpdated = false;
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i];
      // Skip if already has text or transcript
      if (r.text_response || r.transcript) continue;
      // Skip if no voice recording
      if (!r.voice_url) continue;

      console.log(`Transcribing voice response for Q${i + 1}: ${r.voice_url}`);

      try {
        // Download the audio file
        const audioResponse = await fetch(r.voice_url);
        if (!audioResponse.ok) {
          console.error(`Failed to download audio for Q${i + 1}: ${audioResponse.status}`);
          continue;
        }

        const audioBuffer = await audioResponse.arrayBuffer();
        const audioBytes = new Uint8Array(audioBuffer);

        // Convert to base64
        let binary = "";
        for (let j = 0; j < audioBytes.length; j++) {
          binary += String.fromCharCode(audioBytes[j]);
        }
        const audioBase64 = btoa(binary);

        if (!lovableApiKey) {
          console.error("No LOVABLE_API_KEY for transcription");
          continue;
        }

        // Send to Gemini for transcription via multimodal content
        const transcribeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Transcribe this audio recording verbatim. Return only the transcription text, nothing else. If the audio is unclear, do your best to capture what was said."
                  },
                  {
                    type: "input_audio",
                    input_audio: {
                      data: audioBase64,
                      format: "webm"
                    }
                  }
                ]
              }
            ],
          }),
        });

        if (transcribeResponse.ok) {
          const transcribeData = await transcribeResponse.json();
          const transcript = transcribeData.choices?.[0]?.message?.content;
          if (transcript && transcript.trim().length > 0) {
            responses[i].transcript = transcript.trim();
            transcriptsUpdated = true;
            console.log(`Transcribed Q${i + 1}: ${transcript.trim().substring(0, 100)}...`);
          } else {
            console.error(`Empty transcript for Q${i + 1}`);
          }
        } else {
          const errorText = await transcribeResponse.text();
          console.error(`Transcription API error for Q${i + 1}:`, transcribeResponse.status, errorText);
        }
      } catch (transcribeErr) {
        console.error(`Transcription error for Q${i + 1}:`, transcribeErr);
      }
    }

    // Step 2: Save updated transcripts back to DB so they persist
    if (transcriptsUpdated) {
      const { error: updateResponsesError } = await supabase
        .from("screening_sessions")
        .update({
          responses: responses,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session_id);

      if (updateResponsesError) {
        console.error("Failed to save transcripts:", updateResponsesError);
      } else {
        console.log("Transcripts saved to database");
      }
    }

    // Step 3: Build summary prompt from all responses (text + transcripts)
    const summaryParts: string[] = [];
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i];
      const questionText = r.question || `Question ${i + 1}`;
      const answer = r.text_response || r.transcript || "(no response)";
      const rating = r.rating ? ` [Rating: ${r.rating}]` : "";
      summaryParts.push(`Q${i + 1}: ${questionText}\nA: ${answer}${rating}`);
    }

    const fullTranscript = summaryParts.join("\n\n");

    // Step 4: Generate AI summary
    let aiSummary = "AI summary unavailable — review responses manually.";
    let aiRecommendation = "manual_review";

    if (lovableApiKey) {
      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                
Analyze the professional caregiver screening responses about a candidate and provide:
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
        } else {
          const errorText = await aiResponse.text();
          console.error("AI gateway error:", aiResponse.status, errorText);
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
