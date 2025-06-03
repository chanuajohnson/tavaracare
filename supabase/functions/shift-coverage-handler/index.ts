
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppTemplate {
  name: string;
  language: { code: string };
  components: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text: string;
    }>;
  }>;
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
    );

    const { action, request_id, claim_id, phone_number, message_content } = await req.json();

    console.log('Shift Coverage Handler called with action:', action);

    switch (action) {
      case 'notify_family_request':
        await handleFamilyRequestNotification(supabase, request_id);
        break;
      
      case 'broadcast_available_shift':
        await handleShiftBroadcast(supabase, request_id);
        break;
      
      case 'notify_family_claim':
        await handleFamilyClaimNotification(supabase, claim_id);
        break;
      
      case 'process_whatsapp_message':
        await handleWhatsAppMessage(supabase, phone_number, message_content);
        break;
      
      case 'send_reminders':
        await handleShiftReminders(supabase);
        break;
      
      default:
        console.log('Unknown action:', action);
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in shift coverage handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleFamilyRequestNotification(supabase: any, requestId: string) {
  console.log('Handling family request notification for:', requestId);
  
  // Get request details with family and caregiver info
  const { data: request } = await supabase
    .from('shift_coverage_requests')
    .select(`
      *,
      shift:care_shifts!inner(
        title, start_time, end_time, family_id,
        family:profiles!family_id(full_name, phone_number)
      ),
      requesting_caregiver:profiles!requesting_caregiver_id(full_name)
    `)
    .eq('id', requestId)
    .single();

  if (!request) {
    console.error('Request not found:', requestId);
    return;
  }

  // Format the message
  const startTime = new Date(request.shift.start_time).toLocaleString();
  const endTime = new Date(request.shift.end_time).toLocaleTimeString();
  
  const message = `🏥 SHIFT COVERAGE REQUEST

${request.requesting_caregiver.full_name} has requested time off for:
📅 ${request.shift.title}
⏰ ${startTime} - ${endTime}
🏷️ Reason: ${request.reason}
${request.request_message ? `💬 Message: ${request.request_message}` : ''}

Reply:
✅ APPROVE to allow this request
❌ DENY to decline this request

Request expires in 24 hours.`;

  // Send WhatsApp message to family
  if (request.shift.family.phone_number) {
    await sendWhatsAppMessage(
      supabase,
      request.shift.family.phone_number,
      message,
      'time_off_request',
      request.shift.family_id
    );
  }

  // Log notification
  await supabase
    .from('shift_notifications')
    .insert({
      coverage_request_id: requestId,
      shift_id: request.shift_id,
      notification_type: 'time_off_request',
      sent_to: request.shift.family_id,
      message_content: message,
      delivery_status: 'sent'
    });
}

async function handleShiftBroadcast(supabase: any, requestId: string) {
  console.log('Handling shift broadcast for:', requestId);
  
  // Get request and care team details
  const { data: request } = await supabase
    .from('shift_coverage_requests')
    .select(`
      *,
      shift:care_shifts!inner(
        title, start_time, end_time, location, care_plan_id,
        care_plan:care_plans(title)
      ),
      requesting_caregiver:profiles!requesting_caregiver_id(full_name)
    `)
    .eq('id', requestId)
    .single();

  if (!request) {
    console.error('Request not found for broadcast:', requestId);
    return;
  }

  // Get care team members for this care plan
  const { data: teamMembers } = await supabase
    .from('care_team_members')
    .select(`
      caregiver_id,
      caregiver:profiles!caregiver_id(full_name, phone_number)
    `)
    .eq('care_plan_id', request.shift.care_plan_id)
    .neq('caregiver_id', request.requesting_caregiver_id);

  if (!teamMembers || teamMembers.length === 0) {
    console.log('No team members found for broadcast');
    return;
  }

  // Format broadcast message
  const startTime = new Date(request.shift.start_time).toLocaleString();
  const endTime = new Date(request.shift.end_time).toLocaleTimeString();
  
  const message = `🚨 SHIFT AVAILABLE

📅 ${request.shift.title}
⏰ ${startTime} - ${endTime}
👤 Originally: ${request.requesting_caregiver.full_name}
🏠 Client: ${request.shift.care_plan.title}
${request.shift.location ? `📍 Location: ${request.shift.location}` : ''}

Reply CLAIM to take this shift
⚡ First come, first served!`;

  // Send to all team members
  for (const member of teamMembers) {
    if (member.caregiver.phone_number) {
      await sendWhatsAppMessage(
        supabase,
        member.caregiver.phone_number,
        message,
        'coverage_available',
        member.caregiver_id
      );

      // Log notification
      await supabase
        .from('shift_notifications')
        .insert({
          coverage_request_id: requestId,
          shift_id: request.shift_id,
          notification_type: 'coverage_available',
          sent_to: member.caregiver_id,
          message_content: message,
          delivery_status: 'sent'
        });
    }
  }
}

async function handleFamilyClaimNotification(supabase: any, claimId: string) {
  console.log('Handling family claim notification for:', claimId);
  
  // Get claim details
  const { data: claim } = await supabase
    .from('shift_coverage_claims')
    .select(`
      *,
      coverage_request:shift_coverage_requests!inner(
        shift_id,
        shift:care_shifts!inner(
          title, start_time, end_time, family_id,
          family:profiles!family_id(full_name, phone_number)
        )
      ),
      claiming_caregiver:profiles!claiming_caregiver_id(full_name)
    `)
    .eq('id', claimId)
    .single();

  if (!claim) {
    console.error('Claim not found:', claimId);
    return;
  }

  const startTime = new Date(claim.coverage_request.shift.start_time).toLocaleString();
  const endTime = new Date(claim.coverage_request.shift.end_time).toLocaleTimeString();
  
  const message = `👋 SHIFT CLAIM

${claim.claiming_caregiver.full_name} wants to cover:
📅 ${claim.coverage_request.shift.title}
⏰ ${startTime} - ${endTime}

Reply:
✅ CONFIRM to assign this caregiver
❌ DECLINE to look for other options`;

  // Send to family
  if (claim.coverage_request.shift.family.phone_number) {
    await sendWhatsAppMessage(
      supabase,
      claim.coverage_request.shift.family.phone_number,
      message,
      'coverage_claimed',
      claim.coverage_request.shift.family_id
    );
  }

  // Log notification
  await supabase
    .from('shift_notifications')
    .insert({
      coverage_request_id: claim.coverage_request_id,
      shift_id: claim.coverage_request.shift_id,
      notification_type: 'coverage_claimed',
      sent_to: claim.coverage_request.shift.family_id,
      message_content: message,
      delivery_status: 'sent'
    });
}

async function handleWhatsAppMessage(supabase: any, phoneNumber: string, messageContent: string) {
  console.log('Processing WhatsApp message from:', phoneNumber);
  
  // Log the incoming message
  await supabase
    .from('whatsapp_message_log')
    .insert({
      phone_number: phoneNumber,
      direction: 'incoming',
      message_type: 'text',
      content: messageContent,
      processed: false
    });

  // Parse message content
  const content = messageContent.toUpperCase().trim();
  
  // Find user by phone number
  const { data: user } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('phone_number', phoneNumber)
    .single();

  if (!user) {
    console.log('User not found for phone number:', phoneNumber);
    return;
  }

  if (content === 'APPROVE' || content === 'DENY') {
    await handleApprovalResponse(supabase, user.id, content === 'APPROVE');
  } else if (content === 'CLAIM') {
    await handleClaimResponse(supabase, user.id);
  } else if (content === 'CONFIRM' || content === 'DECLINE') {
    await handleConfirmationResponse(supabase, user.id, content === 'CONFIRM');
  }
}

async function handleApprovalResponse(supabase: any, userId: string, approved: boolean) {
  // Find the most recent pending request for this family
  const { data: request } = await supabase
    .from('shift_coverage_requests')
    .select('id, shift:care_shifts!inner(family_id)')
    .eq('shift.family_id', userId)
    .eq('status', 'pending_family_approval')
    .order('requested_at', { ascending: false })
    .limit(1)
    .single();

  if (request) {
    await supabase
      .from('shift_coverage_requests')
      .update({
        status: approved ? 'approved' : 'denied',
        family_response_at: new Date().toISOString(),
        family_response_by: userId
      })
      .eq('id', request.id);

    if (approved) {
      // Trigger broadcast
      await handleShiftBroadcast(supabase, request.id);
    }
  }
}

async function handleClaimResponse(supabase: any, userId: string) {
  // Find the most recent available shift for this user
  const { data: availableShifts } = await supabase
    .from('shift_coverage_requests')
    .select(`
      id,
      shift:care_shifts!inner(care_plan_id)
    `)
    .eq('status', 'approved')
    .order('requested_at', { ascending: false });

  if (availableShifts && availableShifts.length > 0) {
    // Check if user is part of care team
    for (const shift of availableShifts) {
      const { data: teamMember } = await supabase
        .from('care_team_members')
        .select('id')
        .eq('care_plan_id', shift.shift.care_plan_id)
        .eq('caregiver_id', userId)
        .single();

      if (teamMember) {
        // Create the claim
        await supabase
          .from('shift_coverage_claims')
          .insert({
            coverage_request_id: shift.id,
            claiming_caregiver_id: userId
          });
        
        break;
      }
    }
  }
}

async function handleConfirmationResponse(supabase: any, userId: string, confirmed: boolean) {
  // Find the most recent pending claim for this family
  const { data: claim } = await supabase
    .from('shift_coverage_claims')
    .select(`
      id,
      coverage_request:shift_coverage_requests!inner(
        shift:care_shifts!inner(family_id)
      )
    `)
    .eq('coverage_request.shift.family_id', userId)
    .eq('status', 'pending_family_confirmation')
    .order('claimed_at', { ascending: false })
    .limit(1)
    .single();

  if (claim) {
    await supabase
      .from('shift_coverage_claims')
      .update({
        status: confirmed ? 'confirmed' : 'declined',
        family_confirmed_at: new Date().toISOString(),
        family_confirmed_by: userId
      })
      .eq('id', claim.id);
  }
}

async function handleShiftReminders(supabase: any) {
  console.log('Processing shift reminders...');
  
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
  const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  
  // 2-day reminders
  const { data: upcomingShifts } = await supabase
    .from('care_shifts')
    .select(`
      id, title, start_time, end_time, location, caregiver_id,
      caregiver:profiles!caregiver_id(full_name, phone_number)
    `)
    .gte('start_time', now.toISOString())
    .lte('start_time', twoDaysFromNow.toISOString())
    .not('caregiver_id', 'is', null);

  // Send 2-day reminders
  for (const shift of upcomingShifts || []) {
    // Check if reminder already sent
    const { data: existingReminder } = await supabase
      .from('shift_notifications')
      .select('id')
      .eq('shift_id', shift.id)
      .eq('notification_type', 'reminder_2_days')
      .single();

    if (!existingReminder && shift.caregiver.phone_number) {
      const startTime = new Date(shift.start_time).toLocaleString();
      const message = `📋 SHIFT REMINDER

You have a shift in 2 days:
📅 ${shift.title}
⏰ ${startTime}
${shift.location ? `📍 ${shift.location}` : ''}

See you there! 💪`;

      await sendWhatsAppMessage(
        supabase,
        shift.caregiver.phone_number,
        message,
        'reminder_2_days',
        shift.caregiver_id
      );

      await supabase
        .from('shift_notifications')
        .insert({
          shift_id: shift.id,
          notification_type: 'reminder_2_days',
          sent_to: shift.caregiver_id,
          message_content: message,
          delivery_status: 'sent'
        });
    }
  }
}

async function sendWhatsAppMessage(
  supabase: any, 
  phoneNumber: string, 
  message: string, 
  templateName: string,
  userId: string
) {
  // For now, we'll log the message. In production, this would integrate with WhatsApp Business API
  console.log(`Sending WhatsApp to ${phoneNumber}:`, message);
  
  // Log outgoing message
  await supabase
    .from('whatsapp_message_log')
    .insert({
      phone_number: phoneNumber,
      user_id: userId,
      direction: 'outgoing',
      message_type: 'template',
      content: message,
      template_name: templateName,
      processed: true,
      processed_at: new Date().toISOString()
    });

  // TODO: Implement actual WhatsApp Business API integration
  // const whatsappApiUrl = `https://graph.facebook.com/v17.0/${Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')}/messages`;
  // const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  
  return { success: true, message_id: `mock_${Date.now()}` };
}
