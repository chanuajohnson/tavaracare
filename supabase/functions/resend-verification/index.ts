
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendVerificationRequest {
  userId: string;
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

    const { userId }: ResendVerificationRequest = await req.json();

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get user email from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (authError) throw authError;

    if (!authUser.user?.email) {
      throw new Error('User email not found');
    }

    // Send verification reminder email
    const emailResponse = await resend.emails.send({
      from: "Tavara Care <support@tavara.care>",
      to: [authUser.user.email],
      subject: "Please Verify Your Email - Tavara Care",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Email Verification Reminder</h2>
          
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            Hello ${user.full_name || 'there'}!
          </p>
          
          <p style="font-size: 16px; line-height: 1.5; color: #374151;">
            We noticed you haven't verified your email address yet. Please check your inbox 
            for our verification email and click the confirmation link to activate your account.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Next Steps:</h3>
            <ol style="color: #92400e; margin-bottom: 0;">
              <li>Check your email inbox for our verification message</li>
              <li>Click the verification link in that email</li>
              <li>Return to your dashboard to continue your ${user.role} profile setup</li>
            </ol>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            Can't find the verification email? Check your spam folder or 
            <a href="${Deno.env.get("SITE_URL")}/auth" style="color: #2563eb;">request a new one</a>.
          </p>
          
          <p style="font-size: 14px; color: #6b7280;">
            Need assistance? Reply to this email and our team will help you.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Tavara Care - It takes a village to care<br>
            <a href="${Deno.env.get("SITE_URL")}" style="color: #2563eb;">Visit our website</a>
          </p>
        </div>
      `,
    });

    console.log(`Verification reminder sent to ${authUser.user.email}:`, emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in resend-verification function:", error);
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
