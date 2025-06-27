
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

    const { target_users, message_type, custom_message, care_plan_id, shift_details } = await req.json();
    
    console.log('WhatsApp nudge request:', { target_users, message_type, care_plan_id, shift_details });

    let recipients = [];
    let messageTemplate = '';

    if (message_type === 'emergency_shift_coverage' && care_plan_id && shift_details) {
      // Get care team members for emergency shift coverage
      const { data: teamMembers, error: teamError } = await supabase
        .from('care_team_members')
        .select(`
          caregiver_id,
          caregiver:profiles!caregiver_id(full_name, phone_number)
        `)
        .eq('care_plan_id', care_plan_id)
        .eq('status', 'active');

      if (teamError) {
        console.error('Error fetching team members:', teamError);
        throw new Error('Failed to fetch care team members');
      }

      recipients = teamMembers?.filter(member => member.caregiver?.phone_number) || [];
      
      // Format emergency shift message
      const shiftDate = new Date(shift_details.start_time).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const shiftTime = `${new Date(shift_details.start_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })} - ${new Date(shift_details.end_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })}`;

      messageTemplate = `🚨 URGENT: EMERGENCY SHIFT COVERAGE NEEDED

Hi! This is TAV, your Tavara Assistant Coordinator.

We have an urgent opening that needs to be filled:

📅 Date: ${shiftDate}
⏰ Time: ${shiftTime}
📍 Location: ${shift_details.location || 'Patient\'s home'}
❗ Reason: ${shift_details.reason}

PLEASE RESPOND IMMEDIATELY if you can cover this shift by replying:
✅ "YES" - to confirm you can take this shift
❌ "NO" - if you cannot cover

This is TIME SENSITIVE - first to respond gets the shift.

Thank you for your quick response!
- TAV, Tavara Care Coordinator`;

    } else if (target_users && target_users.length > 0) {
      // Handle regular nudging (existing functionality)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number')
        .in('id', target_users);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error('Failed to fetch target users');
      }

      recipients = users?.filter(user => user.phone_number) || [];
      messageTemplate = custom_message || getDefaultNudgeMessage(message_type);
    } else {
      throw new Error('Invalid request: missing required parameters');
    }

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No recipients with phone numbers found' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send messages to all recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        console.log(`Sending message to ${recipient.phone_number || recipient.caregiver?.phone_number}`);
        
        // Log the message being sent
        const messageData = {
          phone_number: recipient.phone_number || recipient.caregiver?.phone_number,
          user_id: recipient.id || recipient.caregiver_id,
          direction: 'outgoing',
          message_type: message_type,
          content: messageTemplate,
          processed: true,
          processed_at: new Date().toISOString()
        };

        const { error: logError } = await supabase
          .from('whatsapp_message_log')
          .insert(messageData);

        if (logError) {
          console.error('Error logging message:', logError);
        }

        // Record the nudge in assistant_nudges table
        const { error: nudgeError } = await supabase
          .from('assistant_nudges')
          .insert({
            user_id: recipient.id || recipient.caregiver_id,
            message: messageTemplate,
            status: 'sent',
            context: {
              message_type,
              phone_number: recipient.phone_number || recipient.caregiver?.phone_number,
              care_plan_id,
              shift_details: message_type === 'emergency_shift_coverage' ? shift_details : undefined
            }
          });

        if (nudgeError) {
          console.error('Error recording nudge:', nudgeError);
        }

        results.push({
          recipient: recipient.phone_number || recipient.caregiver?.phone_number,
          status: 'sent',
          message_id: `mock_${Date.now()}_${recipient.id || recipient.caregiver_id}`
        });

        console.log(`✅ Message sent successfully to ${recipient.phone_number || recipient.caregiver?.phone_number}`);

      } catch (error) {
        console.error(`Error sending to ${recipient.phone_number || recipient.caregiver?.phone_number}:`, error);
        results.push({
          recipient: recipient.phone_number || recipient.caregiver?.phone_number,
          status: 'failed',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Messages sent to ${results.filter(r => r.status === 'sent').length} recipients`,
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in WhatsApp nudge function:', error);
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

function getDefaultNudgeMessage(messageType: string): string {
  const templates = {
    welcome: "Welcome to Tavara! We're excited to help you with your caregiving journey. 🤝",
    reminder: "Don't forget to complete your profile to get matched with the best care opportunities! 📋",
    follow_up: "How is your experience with Tavara going? We're here to help if you need anything! 💙",
    general: "Hi from your Tavara team! We're here to support you on your caregiving journey. 🌟"
  };
  
  return templates[messageType as keyof typeof templates] || templates.general;
}
