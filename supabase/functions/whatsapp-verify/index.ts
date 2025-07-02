
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, phone_number, first_name, last_name, role, verification_code } = await req.json()
    console.log('WhatsApp Verify - Action:', action)

    if (action === 'send_code') {
      // Format phone number
      const { data: formattedData, error: formatError } = await supabase
        .rpc('format_whatsapp_number', { phone_input: phone_number })

      if (formatError) {
        console.error('Phone formatting error:', formatError)
        throw new Error('Invalid phone number format')
      }

      const formatted_number = formattedData
      console.log('Formatted phone:', phone_number, '→', formatted_number)

      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expires_at = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Store verification data
      const { error: upsertError } = await supabase
        .from('whatsapp_auth')
        .upsert({
          phone_number: phone_number,
          formatted_number: formatted_number,
          verification_code: code,
          code_expires_at: expires_at.toISOString(),
          user_metadata: {
            first_name,
            last_name,
            role
          }
        })

      if (upsertError) {
        console.error('Database upsert error:', upsertError)
        throw new Error('Failed to store verification code')
      }

      // Simulate WhatsApp message sending (replace with actual WhatsApp Business API)
      const message = `Your Tavara verification code is: ${code}. This code expires in 10 minutes.`
      console.log(`📱 Simulated WhatsApp to ${formatted_number}: ${message}`)

      // Log the message (optional)
      try {
        await supabase
          .from('whatsapp_message_log')
          .insert({
            phone_number: formatted_number,
            content: message,
            direction: 'outbound',
            message_type: 'verification',
            status: 'sent'
          })
      } catch (logError) {
        console.warn('Message logging failed:', logError)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification code sent successfully',
          formatted_number 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify_code') {
      // Verify the code
      const { data: authData, error: authError } = await supabase
        .from('whatsapp_auth')
        .select('*')
        .eq('phone_number', phone_number)
        .eq('verification_code', verification_code)
        .gt('code_expires_at', new Date().toISOString())
        .single()

      if (authError || !authData) {
        console.error('Verification failed:', authError)
        return new Response(
          JSON.stringify({ error: 'Invalid or expired verification code' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      console.log('Code verified successfully for:', phone_number)

      // Create user account
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        phone: authData.formatted_number,
        user_metadata: {
          first_name: authData.user_metadata.first_name,
          last_name: authData.user_metadata.last_name,
          role: authData.user_metadata.role,
          full_name: `${authData.user_metadata.first_name} ${authData.user_metadata.last_name}`.trim(),
          auth_method: 'whatsapp'
        },
        phone_confirm: true
      })

      if (userError) {
        console.error('User creation error:', userError)
        throw new Error('Failed to create user account')
      }

      console.log('User created successfully:', userData.user.id)

      // Create a session for the user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: `${userData.user.id}@whatsapp.tavara.care`, // Temporary email for session
        options: {
          redirectTo: `${req.headers.get('origin') || 'http://localhost:3000'}/dashboard/${authData.user_metadata.role}`
        }
      })

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        throw new Error('Failed to create user session')
      }

      // Clear the verification code
      await supabase
        .from('whatsapp_auth')
        .update({ 
          verification_code: null, 
          code_expires_at: null,
          verified_at: new Date().toISOString()
        })
        .eq('phone_number', phone_number)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Verification successful',
          user_id: userData.user.id,
          access_token: sessionData.properties?.access_token,
          refresh_token: sessionData.properties?.refresh_token,
          redirect_url: sessionData.properties?.action_link
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('WhatsApp verify error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
