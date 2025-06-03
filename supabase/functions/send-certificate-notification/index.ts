
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CertificateNotificationRequest {
  to_email: string;
  message?: string;
  user_name: string;
  document_count: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to_email, message, user_name, document_count }: CertificateNotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Tavara <noreply@tavara.care>",
      to: [to_email],
      subject: `Professional Certificates Shared - ${user_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Professional Certificates Shared</h2>
          
          <p>Hello,</p>
          
          <p><strong>${user_name}</strong> has shared their professional certificates with you through Tavara.</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Number of documents:</strong> ${document_count}</p>
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
          </div>
          
          <p>You can review their credentials and contact them directly for any questions.</p>
          
          <p>Best regards,<br>
          The Tavara Team</p>
          
          <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280;">
            This email was sent through Tavara's professional certification sharing system.
          </p>
        </div>
      `,
    });

    console.log("Certificate notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-certificate-notification function:", error);
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
