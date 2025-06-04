
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NudgeEmailRequest {
  userIds: string[];
  message: string;
  templateId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userIds, message, templateId }: NudgeEmailRequest = await req.json();

    // Get user details
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Get user emails from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const emailPromises = users?.map(async (user) => {
      const authUser = authUsers.users.find(au => au.id === user.id);
      if (!authUser?.email) return null;

      try {
        const emailResponse = await resend.emails.send({
          from: "Tavara Care <support@tavara.care>",
          to: [authUser.email],
          subject: `Your Care Journey Progress - Tavara`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Hello ${user.full_name || 'there'}!</h2>
              
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">
                ${message}
              </p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                <h3 style="color: #1f2937; margin-top: 0;">Continue Your Journey</h3>
                <p style="color: #6b7280; margin-bottom: 20px;">
                  Complete your ${user.role} profile to unlock all Tavara features.
                </p>
                <a href="${Deno.env.get("SITE_URL")}/dashboard/${user.role}" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Continue Setup
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">
                Need help? Reply to this email or contact our support team.
              </p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                Tavara Care - It takes a village to care<br>
                <a href="${Deno.env.get("SITE_URL")}" style="color: #2563eb;">Visit our website</a>
              </p>
            </div>
          `,
        });

        // Update communication log
        await supabase
          .from('admin_communications')
          .update({ delivery_status: 'sent' })
          .eq('target_user_id', user.id)
          .eq('delivery_status', 'pending');

        console.log(`Email sent to ${authUser.email}:`, emailResponse);
        return emailResponse;
      } catch (error) {
        console.error(`Failed to send email to ${authUser.email}:`, error);
        
        // Update communication log with failure
        await supabase
          .from('admin_communications')
          .update({ delivery_status: 'failed' })
          .eq('target_user_id', user.id)
          .eq('delivery_status', 'pending');
          
        return null;
      }
    }) || [];

    const results = await Promise.all(emailPromises);
    const successful = results.filter(r => r !== null).length;

    console.log(`Nudge emails: ${successful}/${userIds.length} sent successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        total: userIds.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-nudge-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
