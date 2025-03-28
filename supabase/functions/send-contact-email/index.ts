
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  screenshot?: string; // Base64 encoded screenshot (optional)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contactData: ContactFormData = await req.json();
    const { name, email, message, screenshot } = contactData;

    console.log("Received contact form submission from:", name, email);

    // Validate required fields
    if (!name || !email || !message) {
      throw new Error("Missing required fields");
    }

    // Send email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "Tavara Support <support@tavara.care>",
      to: "chanuajohnson@gmail.com", // Updated to the requested email
      subject: `Support Request from ${name}`,
      html: `
        <h1>New Support Request</h1>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        ${screenshot ? `<p><strong>Screenshot:</strong></p><img src="${screenshot}" alt="User provided screenshot" style="max-width: 100%;" />` : ""}
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "Tavara Support <support@tavara.care>",
      to: email,
      subject: "We've received your support request",
      html: `
        <h1>Thank you for contacting us, ${name}!</h1>
        <p>We have received your support request and will get back to you as soon as possible.</p>
        <p>Your message:</p>
        <p><em>${message.replace(/\n/g, "<br>")}</em></p>
        <p>Best regards,<br>The Tavara Care Team</p>
      `,
    });

    console.log("Emails sent successfully:", {
      supportEmail: supportEmailResponse,
      userEmail: userEmailResponse,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Support request submitted successfully" 
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send support request" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        },
      }
    );
  }
});
