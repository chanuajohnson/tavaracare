
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

    console.log('Running shift reminder scheduler...');

    // Call the shift coverage handler to process reminders
    const { data, error } = await supabase.functions.invoke('shift-coverage-handler', {
      body: { action: 'send_reminders' }
    });

    if (error) {
      console.error('Error sending reminders:', error);
      throw error;
    }

    // Also check for expired coverage requests
    await handleExpiredRequests(supabase);

    console.log('Shift reminder scheduler completed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Reminders processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shift reminder scheduler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleExpiredRequests(supabase: any) {
  console.log('Checking for expired coverage requests...');

  const now = new Date().toISOString();

  // Find expired requests that are still pending
  const { data: expiredRequests } = await supabase
    .from('shift_coverage_requests')
    .select(`
      id,
      shift:care_shifts!inner(
        title, start_time, family_id,
        family:profiles!family_id(full_name, phone_number)
      ),
      requesting_caregiver:profiles!requesting_caregiver_id(full_name, phone_number)
    `)
    .eq('status', 'pending_family_approval')
    .lte('expires_at', now);

  if (expiredRequests && expiredRequests.length > 0) {
    console.log(`Found ${expiredRequests.length} expired requests`);

    for (const request of expiredRequests) {
      // Mark as expired
      await supabase
        .from('shift_coverage_requests')
        .update({ status: 'expired' })
        .eq('id', request.id);

      // Notify family about expiration
      const startTime = new Date(request.shift.start_time).toLocaleString();
      const message = `⏰ TIME-OFF REQUEST EXPIRED

The time-off request from ${request.requesting_caregiver.full_name} for:
📅 ${request.shift.title}
⏰ ${startTime}

Has expired and was automatically denied. Please coordinate directly with your caregiver if needed.`;

      if (request.shift.family.phone_number) {
        // Log outgoing message
        await supabase
          .from('whatsapp_message_log')
          .insert({
            phone_number: request.shift.family.phone_number,
            user_id: request.shift.family_id,
            direction: 'outgoing',
            message_type: 'template',
            content: message,
            template_name: 'request_expired',
            processed: true,
            processed_at: new Date().toISOString()
          });
      }

      // Log notification
      await supabase
        .from('shift_notifications')
        .insert({
          coverage_request_id: request.id,
          shift_id: request.shift_id,
          notification_type: 'time_off_request',
          sent_to: request.shift.family_id,
          message_content: message,
          delivery_status: 'sent'
        });

      // Also notify the requesting caregiver
      if (request.requesting_caregiver.phone_number) {
        const caregiverMessage = `❌ TIME-OFF REQUEST EXPIRED

Your time-off request for:
📅 ${request.shift.title}
⏰ ${startTime}

Has expired and was automatically denied. Please coordinate directly with the family if you still need coverage.`;

        await supabase
          .from('whatsapp_message_log')
          .insert({
            phone_number: request.requesting_caregiver.phone_number,
            user_id: request.requesting_caregiver_id,
            direction: 'outgoing',
            message_type: 'template',
            content: caregiverMessage,
            template_name: 'request_expired_caregiver',
            processed: true,
            processed_at: new Date().toISOString()
          });
      }
    }
  }

  // Also handle unclaimed approved requests (mark as needing manual intervention)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data: unclaimedShifts } = await supabase
    .from('shift_coverage_requests')
    .select(`
      id,
      shift:care_shifts!inner(
        title, start_time, family_id,
        family:profiles!family_id(full_name, phone_number)
      )
    `)
    .eq('status', 'approved')
    .lte('family_response_at', oneDayAgo)
    .not('id', 'in', 
      supabase
        .from('shift_coverage_claims')
        .select('coverage_request_id')
        .eq('status', 'confirmed')
    );

  if (unclaimedShifts && unclaimedShifts.length > 0) {
    console.log(`Found ${unclaimedShifts.length} unclaimed shifts`);

    for (const shift of unclaimedShifts) {
      const startTime = new Date(shift.shift.start_time).toLocaleString();
      const message = `🚨 SHIFT STILL NEEDS COVERAGE

No one has claimed the shift:
📅 ${shift.shift.title}
⏰ ${startTime}

You may need to manually arrange coverage or contact caregivers directly.`;

      if (shift.shift.family.phone_number) {
        await supabase
          .from('whatsapp_message_log')
          .insert({
            phone_number: shift.shift.family.phone_number,
            user_id: shift.shift.family_id,
            direction: 'outgoing',
            message_type: 'template',
            content: message,
            template_name: 'unclaimed_shift_alert',
            processed: true,
            processed_at: new Date().toISOString()
          });
      }
    }
  }
}
