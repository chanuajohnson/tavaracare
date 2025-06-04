
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'GET') {
      // WhatsApp webhook verification
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'tavara_whatsapp_verify';

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp webhook verified successfully');
        return new Response(challenge, { status: 200 });
      } else {
        console.log('WhatsApp webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    if (req.method === 'POST') {
      // Handle incoming WhatsApp messages
      const body = await req.json();
      console.log('Received WhatsApp webhook:', JSON.stringify(body, null, 2));

      // Process webhook data
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        for (const change of body.entry[0].changes) {
          if (change.value && change.value.messages) {
            for (const message of change.value.messages) {
              await processIncomingMessage(supabase, message, change.value.contacts);
            }
          }

          // Handle message status updates
          if (change.value && change.value.statuses) {
            for (const status of change.value.statuses) {
              await processMessageStatus(supabase, status);
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processIncomingMessage(supabase: any, message: any, contacts: any[]) {
  console.log('Processing incoming message:', message);

  const phoneNumber = message.from;
  const messageId = message.id;
  
  let messageContent = '';
  let messageType = 'text';

  // Extract message content based on type
  if (message.text) {
    messageContent = message.text.body;
    messageType = 'text';
  } else if (message.button) {
    messageContent = message.button.text;
    messageType = 'button_reply';
  } else if (message.interactive) {
    if (message.interactive.button_reply) {
      messageContent = message.interactive.button_reply.title;
      messageType = 'button_reply';
    } else if (message.interactive.list_reply) {
      messageContent = message.interactive.list_reply.title;
      messageType = 'button_reply';
    }
  }

  // Find user by phone number
  const { data: user } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('phone_number', phoneNumber)
    .single();

  // Log the message
  await supabase
    .from('whatsapp_message_log')
    .insert({
      message_id: messageId,
      phone_number: phoneNumber,
      user_id: user?.id,
      direction: 'incoming',
      message_type: messageType,
      content: messageContent,
      processed: false
    });

  // Process the message through the shift coverage handler
  if (messageContent) {
    await supabase.functions.invoke('shift-coverage-handler', {
      body: {
        action: 'process_whatsapp_message',
        phone_number: phoneNumber,
        message_content: messageContent
      }
    });

    // Mark as processed
    await supabase
      .from('whatsapp_message_log')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('message_id', messageId);
  }
}

async function processMessageStatus(supabase: any, status: any) {
  console.log('Processing message status:', status);

  const messageId = status.id;
  const deliveryStatus = status.status; // 'sent', 'delivered', 'read', 'failed'

  // Update delivery status in notifications table
  await supabase
    .from('shift_notifications')
    .update({ delivery_status: deliveryStatus })
    .eq('whatsapp_message_id', messageId);

  // Update in message log
  await supabase
    .from('whatsapp_message_log')
    .update({ 
      processed: true,
      processed_at: new Date().toISOString()
    })
    .eq('message_id', messageId);
}
