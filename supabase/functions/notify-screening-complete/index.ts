import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '@supabase/supabase-js/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/telegram';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const TELEGRAM_API_KEY = Deno.env.get('TELEGRAM_API_KEY');
    if (!TELEGRAM_API_KEY) throw new Error('TELEGRAM_API_KEY is not configured');

    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!TELEGRAM_CHAT_ID) throw new Error('TELEGRAM_CHAT_ID is not configured');

    const { session_id } = await req.json();
    if (!session_id) {
      return new Response(JSON.stringify({ error: 'session_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the completed session with template info
    const { data: session, error: sessionErr } = await supabase
      .from('screening_sessions')
      .select('*, screening_question_templates(title, questions)')
      .eq('id', session_id)
      .single();

    if (sessionErr || !session) {
      throw new Error(`Session not found: ${sessionErr?.message}`);
    }

    // Fetch professional name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.professional_id)
      .single();

    const professionalName = profile?.full_name || 'Unknown Professional';

    // Count sibling sessions for progress context
    const { data: siblings } = await supabase
      .from('screening_sessions')
      .select('id, status, created_at')
      .eq('professional_id', session.professional_id)
      .order('created_at', { ascending: true });

    const totalTemplates = siblings?.length || 1;
    const position = siblings ? siblings.findIndex((s: any) => s.id === session_id) + 1 : 1;
    const completedCount = siblings ? siblings.filter((s: any) => s.status === 'completed' || s.status === 'reviewed').length : 1;

    // Count response types
    const responses = Array.isArray(session.responses) ? session.responses : [];
    const totalAnswered = responses.length;
    const voiceCount = responses.filter((r: any) => r.voice_url).length;
    const textCount = responses.filter((r: any) => r.text_response && !r.voice_url).length;

    const templateName = (session.screening_question_templates as any)?.title || 'Screening';
    const candidateName = session.candidate_name || 'Unknown';
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Port_of_Spain' });

    // Build Telegram message
    const message = `✅ <b>SCREENING COMPLETED</b>

👤 <b>${professionalName}</b>
📋 "${templateName}" (Template ${position} of ${totalTemplates})
🧑‍⚕️ Candidate: ${candidateName}
⏰ ${timestamp}

${totalAnswered} questions answered (${voiceCount} voice, ${textCount} text)
✅ ${completedCount} of ${totalTemplates} templates completed`;

    // Send via Telegram gateway
    const tgResponse = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': TELEGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const tgData = await tgResponse.json();
    if (!tgResponse.ok) {
      throw new Error(`Telegram API failed [${tgResponse.status}]: ${JSON.stringify(tgData)}`);
    }

    console.log('Telegram notification sent successfully for session:', session_id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending Telegram notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
