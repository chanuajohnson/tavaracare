
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
    console.log('WhatsApp auth verify-code function called');
    
    const { phoneNumber, verificationCode, role } = await req.json();
    console.log('Request data:', { phoneNumber: phoneNumber ? '[MASKED]' : 'missing', verificationCode: verificationCode ? '[MASKED]' : 'missing', role });

    if (!phoneNumber || !verificationCode || !role) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Phone number, verification code, and role are required' }),
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

    // Get the verification record
    const { data: authRecord, error: fetchError } = await supabase
      .from('whatsapp_auth')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (fetchError || !authRecord) {
      console.error('Auth record fetch error:', fetchError);
      return new Response(
        JSON.stringify({ error: 'No verification request found for this phone number' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Auth record found:', { id: authRecord.id, attempts: authRecord.verification_attempts });

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(authRecord.code_expires_at);
    if (now > expiresAt) {
      console.log('Verification code expired');
      return new Response(
        JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check verification attempts
    if (authRecord.verification_attempts >= 5) {
      console.log('Too many verification attempts');
      return new Response(
        JSON.stringify({ error: 'Too many verification attempts. Please request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the code
    if (authRecord.verification_code !== verificationCode) {
      console.log('Invalid verification code provided');
      
      // Increment verification attempts
      await supabase
        .from('whatsapp_auth')
        .update({
          verification_attempts: authRecord.verification_attempts + 1,
          last_verification_attempt: new Date().toISOString()
        })
        .eq('phone_number', phoneNumber);

      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verification code is valid');

    // Code is valid, create or get user
    const email = `${phoneNumber.replace(/[^0-9]/g, '')}@whatsapp.tavara.care`;
    
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    let user;
    if (existingUser.user) {
      user = existingUser.user;
      console.log('Existing user found');
    } else {
      console.log('Creating new user');
      
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        phone: authRecord.formatted_number,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          role: role,
          phone_number: authRecord.formatted_number,
          auth_method: 'whatsapp'
        }
      });

      if (createError) {
        console.error('User creation error:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user account', details: createError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      user = newUser.user;
      console.log('New user created successfully');
    }

    // Mark verification as complete
    await supabase
      .from('whatsapp_auth')
      .update({
        is_verified: true,
        verification_code: null,
        code_expires_at: null
      })
      .eq('phone_number', phoneNumber);

    console.log('Verification marked as complete');

    // Generate session for the user
    const redirectUrl = req.headers.get('origin') || 'http://localhost:3000';
    const dashboardRoute = `${redirectUrl}/dashboard/${role}`;
    
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: dashboardRoute
      }
    });

    if (sessionError) {
      console.error('Session generation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session', details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Session created successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Phone number verified successfully',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone
        },
        session_url: sessionData.properties?.action_link,
        redirect_to: dashboardRoute
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in whatsapp-auth-verify-code:', error);
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
