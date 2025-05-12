
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  screenshot?: string; // Base64 encoded screenshot (optional)
  chatData?: {
    role?: string;
    sessionId?: string;
    transcript?: ChatMessage[]; // Added transcript property
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const contactData: ContactFormData = await req.json();
    const { name, email, message, screenshot, chatData } = contactData;

    console.log("Received contact form submission from:", name, email);

    // Validate required fields
    if (!name || !email || !message) {
      throw new Error("Missing required fields");
    }

    // Format chat transcript if available
    let transcriptHtml = '';
    if (chatData?.transcript && chatData.transcript.length > 0) {
      transcriptHtml = `
        <div style="margin-top: 20px; padding: 10px; background-color: #f7f7f9; border-radius: 5px;">
          <h3>Chat Transcript:</h3>
          <div style="border: 1px solid #e1e1e8; border-radius: 5px; max-height: 300px; overflow-y: auto; padding: 10px;">
      `;
      
      chatData.transcript.forEach((msg: ChatMessage) => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const alignment = msg.isUser ? 'right' : 'left';
        const bgColor = msg.isUser ? '#e3f2fd' : '#f1f1f1';
        const textColor = msg.isUser ? '#0d47a1' : '#333333';
        
        transcriptHtml += `
          <div style="margin: 5px 0; text-align: ${alignment};">
            <div style="display: inline-block; background-color: ${bgColor}; color: ${textColor}; padding: 8px 12px; border-radius: 12px; max-width: 80%; text-align: left;">
              <div style="font-size: 12px; color: #666; margin-bottom: 3px;">${timestamp}</div>
              <div>${msg.content.replace(/\n/g, "<br>")}</div>
            </div>
          </div>
        `;
      });
      
      transcriptHtml += `
          </div>
        </div>
      `;
    }

    // Prepare chat data info if available
    const chatDataHtml = chatData ? `
      <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
        <h3>Chat Session Data:</h3>
        <p><strong>Role:</strong> ${chatData.role || "Not specified"}</p>
        <p><strong>Session ID:</strong> ${chatData.sessionId || "Not available"}</p>
        <p><em>This user requested to speak with a representative through the chat interface.</em></p>
      </div>
      ${transcriptHtml}
    ` : '';

    // Send email to support team
    const supportEmailResponse = await resend.emails.send({
      from: "Tavara Support <support@tavara.care>",
      to: "chanuajohnson@gmail.com", // Updated to the requested email
      subject: `Support Request from ${name}${chatData ? ' (via Chat)' : ''}`,
      html: `
        <h1>New Support Request</h1>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        ${chatDataHtml}
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
