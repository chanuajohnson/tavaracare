
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { phone_number, country_code = '868', action } = await req.json();
    
    if (action === 'send_verification') {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Format the phone number using our database function
      const { data: formattedData, error: formatError } = await supabase
        .rpc('format_whatsapp_number', { 
          phone_input: phone_number, 
          country_code_input: country_code 
        });

      if (formatError || !formattedData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid phone number format' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Store verification code in database
      const { error: insertError } = await supabase
        .from('whatsapp_auth')
        .upsert({
          phone_number,
          country_code,
          formatted_number: formattedData,
          verification_code: verificationCode,
          code_expires_at: expiresAt.toISOString(),
          verification_attempts: 0,
          is_verified: false
        });

      if (insertError) {
        console.error('Database error:', insertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to store verification code' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Log the message for WhatsApp sending
      await supabase
        .from('whatsapp_message_log')
        .insert({
          phone_number: formattedData,
          message_type: 'verification',
          content: `Your Tavara verification code is: ${verificationCode}. It expires in 10 minutes.`,
          direction: 'outgoing',
          delivery_status: 'pending'
        });

      // In production, you would send this via WhatsApp Business API
      // For now, we'll return success with the code for testing
      console.log(`Verification code for ${formattedData}: ${verificationCode}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent',
          formatted_number: formattedData,
          // Remove this in production:
          debug_code: verificationCode
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'verify_code') {
      const { verification_code } = await req.json();

      // Check verification code
      const { data: authData, error: authError } = await supabase
        .from('whatsapp_auth')
        .select('*')
        .eq('phone_number', phone_number)
        .eq('verification_code', verification_code)
        .gt('code_expires_at', new Date().toISOString())
        .single();

      if (authError || !authData) {
        // Increment failed attempts
        await supabase
          .from('whatsapp_auth')
          .update({ 
            verification_attempts: supabase.sql`verification_attempts + 1`,
            last_verification_attempt: new Date().toISOString()
          })
          .eq('phone_number', phone_number);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired verification code' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Mark as verified and clear code
      const { error: updateError } = await supabase
        .from('whatsapp_auth')
        .update({
          is_verified: true,
          verification_code: null,
          code_expires_at: null
        })
        .eq('id', authData.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to verify phone number' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate session token
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { error: sessionError } = await supabase
        .from('whatsapp_sessions')
        .insert({
          phone_number: authData.formatted_number,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });

      if (sessionError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create session' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Phone number verified successfully',
          session_token: sessionToken,
          formatted_number: authData.formatted_number
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Invalid action' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in WhatsApp verification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
