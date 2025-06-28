
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

    const { session_token, action, user_metadata } = await req.json();

    if (action === 'create_or_link_user') {
      // Verify session token
      const { data: sessionData, error: sessionError } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('session_token', session_token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !sessionData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired session' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Check if user already exists with this WhatsApp number
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('whatsapp_phone', sessionData.phone_number)
        .maybeSingle();

      if (existingProfile) {
        // User exists, create auth session
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(existingProfile.id);
        
        if (authError || !authUser.user) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to authenticate existing user' 
            }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        // Update session with user_id
        await supabase
          .from('whatsapp_sessions')
          .update({ user_id: existingProfile.id })
          .eq('id', sessionData.id);

        // Generate auth token for frontend
        const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: authUser.user.email!,
        });

        if (tokenError) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to generate auth token' 
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
            user_exists: true,
            user: authUser.user,
            auth_url: tokenData.properties.action_link
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create new user
      const email = `whatsapp_${sessionData.phone_number.replace(/\+/g, '')}@tavara.temp`;
      const password = crypto.randomUUID();

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        phone: sessionData.phone_number,
        user_metadata: {
          whatsapp_phone: sessionData.phone_number,
          auth_method: 'whatsapp',
          ...user_metadata
        },
        email_confirm: true,
        phone_confirm: true
      });

      if (createError || !newUser.user) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create new user' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Update profile with WhatsApp info
      await supabase
        .from('profiles')
        .update({
          whatsapp_phone: sessionData.phone_number,
          whatsapp_verified: true,
          whatsapp_linked_at: new Date().toISOString()
        })
        .eq('id', newUser.user.id);

      // Update session with user_id
      await supabase
        .from('whatsapp_sessions')
        .update({ user_id: newUser.user.id })
        .eq('id', sessionData.id);

      // Generate auth token for frontend
      const { data: tokenData, error: tokenError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: newUser.user.email!,
      });

      if (tokenError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to generate auth token' 
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
          user_exists: false,
          user: newUser.user,
          auth_url: tokenData.properties.action_link
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else if (action === 'validate_session') {
      // Validate session token
      const { data: sessionData, error: sessionError } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('session_token', session_token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (sessionError || !sessionData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid or expired session' 
          }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          session: sessionData
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
    console.error('Error in WhatsApp auth:', error);
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
