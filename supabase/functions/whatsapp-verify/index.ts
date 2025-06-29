
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-client-env',
};

// Your WhatsApp Business number
const BUSINESS_WHATSAPP_NUMBER = '+18687560967';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('WhatsApp verify request:', JSON.stringify(requestBody, null, 2));

    const { phone_number, country_code = '868', action } = requestBody;
    
    if (action === 'send_verification') {
      console.log(`Processing verification request for phone: ${phone_number}, country: ${country_code}`);
      
      if (!phone_number || phone_number.trim() === '') {
        console.error('Phone number is missing or empty');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Phone number is required',
            error_type: 'validation_error'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      console.log(`Generated verification code: ${verificationCode} for ${phone_number}`);

      // Format and validate phone number
      console.log('Testing format_whatsapp_number function...');
      const { data: formattedData, error: formatError } = await supabase
        .rpc('format_whatsapp_number', { 
          phone_input: phone_number, 
          country_code_input: country_code 
        });

      console.log('Format function result:', { formattedData, formatError });

      if (formatError) {
        console.error('Format function error:', formatError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to format phone number: ' + formatError.message,
            error_type: 'formatting_error',
            debug_info: {
              input_phone: phone_number,
              country_code: country_code,
              format_error: formatError
            }
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (!formattedData) {
        console.error('Format function returned null for:', { phone_number, country_code });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid phone number format. Please enter a valid Trinidad phone number (e.g., 756-0967 or 868-756-0967)',
            error_type: 'invalid_format',
            debug_info: {
              input_phone: phone_number,
              country_code: country_code,
              suggestion: 'Try formats like: 7560967, 868-756-0967, or +1-868-756-0967'
            }
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Phone number formatted successfully: ${phone_number} -> ${formattedData}`);

      // Store verification code in database with proper upsert conflict handling
      console.log('Storing verification code in database...');
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
        }, {
          onConflict: 'phone_number'
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to store verification code: ' + insertError.message,
            error_type: 'database_error',
            debug_info: {
              insert_error: insertError,
              formatted_number: formattedData
            }
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Verification code stored successfully in database');

      // Generate WhatsApp Web URL
      const whatsappMessage = `Hi! I'm verifying my phone number ${formattedData} for Tavara Care. My verification code is: ${verificationCode}`;
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER.replace(/[^\d]/g, '')}?text=${encodedMessage}`;

      // Log the message for tracking
      const { error: logError } = await supabase
        .from('whatsapp_message_log')
        .insert({
          phone_number: formattedData,
          message_type: 'verification',
          content: whatsappMessage,
          direction: 'outgoing',
          status: 'pending_user_send'
        });

      if (logError) {
        console.warn('Failed to log WhatsApp message:', logError);
        // Don't fail the request for logging issues
      }

      console.log(`SUCCESS: WhatsApp URL generated for ${formattedData}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Click the link below to send your verification code via WhatsApp`,
          formatted_number: formattedData,
          whatsapp_url: whatsappUrl,
          verification_code: verificationCode, // For manual entry fallback
          expires_at: expiresAt.toISOString(),
          instructions: 'Click the WhatsApp link to send your verification code to our business number, then enter the code below when ready to verify.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'verify_code') {
      const { verification_code } = requestBody;
      console.log(`Verifying code ${verification_code} for phone ${phone_number}`);

      if (!verification_code || verification_code.trim() === '') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Verification code is required',
            error_type: 'validation_error'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check verification code
      const { data: authData, error: authError } = await supabase
        .from('whatsapp_auth')
        .select('*')
        .eq('phone_number', phone_number)
        .eq('verification_code', verification_code)
        .gt('code_expires_at', new Date().toISOString())
        .single();

      console.log('Code verification result:', { authData: !!authData, authError });

      if (authError || !authData) {
        // Increment failed attempts using the new RPC function
        const { error: incrementError } = await supabase
          .rpc('increment_verification_attempts', { phone_input: phone_number });

        if (incrementError) {
          console.error('Failed to increment verification attempts:', incrementError);
        }

        console.log('Code verification failed for:', phone_number);

        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired verification code. Please request a new code.',
            error_type: 'verification_failed'
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
        console.error('Failed to update verification status:', updateError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to verify phone number: ' + updateError.message,
            error_type: 'database_error'
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
        console.error('Failed to create session:', sessionError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create session: ' + sessionError.message,
            error_type: 'session_error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`SUCCESS: Phone number ${authData.formatted_number} verified, session created`);

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
        error: 'Invalid action. Use "send_verification" or "verify_code"',
        error_type: 'invalid_action'
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in WhatsApp verification:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error: ' + error.message,
        error_type: 'server_error',
        debug_info: {
          error_stack: error.stack
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
