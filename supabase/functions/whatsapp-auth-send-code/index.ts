
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WhatsApp auth send-code function called');
    
    const { phoneNumber, role, countryCode = '1' } = await req.json();
    console.log('Request data:', { phoneNumber: phoneNumber ? '[MASKED]' : 'missing', role, countryCode });

    if (!phoneNumber || !role) {
      console.error('Missing required fields:', { phoneNumber: !!phoneNumber, role: !!role });
      return new Response(
        JSON.stringify({ error: 'Phone number and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Format phone number
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    let formattedNumber = '';
    
    if (cleanNumber.startsWith('1')) {
      formattedNumber = `+${cleanNumber}`;
    } else if (cleanNumber.length === 10) {
      formattedNumber = `+1${cleanNumber}`;
    } else {
      formattedNumber = `+${countryCode}${cleanNumber}`;
    }

    console.log('Formatted phone number created');

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log(`Generated verification code for ${formattedNumber}`);

    // Store verification code in database
    const { error: dbError } = await supabase
      .from('whatsapp_auth')
      .upsert({
        phone_number: phoneNumber,
        formatted_number: formattedNumber,
        verification_code: verificationCode,
        code_expires_at: expiresAt.toISOString(),
        user_role: role,
        country_code: countryCode,
        verification_attempts: 0,
        is_verified: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verification code stored in database');

    // Try to send WhatsApp message
    try {
      const whatsappResponse = await sendWhatsAppMessage(formattedNumber, verificationCode);
      console.log('WhatsApp message sent successfully');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully',
          formatted_number: formattedNumber
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (whatsappError) {
      console.error('WhatsApp sending failed:', whatsappError);
      
      // For development, we'll still return success but include the code for testing
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code generated (WhatsApp delivery pending)',
          formatted_number: formattedNumber,
          dev_code: verificationCode, // Only for development
          warning: 'WhatsApp API not configured - using development mode'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in whatsapp-auth-send-code:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendWhatsAppMessage(phoneNumber: string, verificationCode: string) {
  const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!whatsappToken || !whatsappPhoneId) {
    throw new Error('WhatsApp credentials not configured - Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID');
  }

  const message = `Your Tavara verification code is: ${verificationCode}. This code expires in 10 minutes.`;
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${whatsappToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('WhatsApp API error:', errorData);
    throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`);
  }

  return await response.json();
}
