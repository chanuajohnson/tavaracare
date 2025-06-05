
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { Resend } from "npm:resend@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FeedbackData {
  feedback_type: string;
  category?: string;
  subject: string;
  message: string;
  rating?: number;
  contact_info: any;
  metadata: any;
  screenshot?: string;
  user_id?: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const getEmailRecipientsByType = (feedbackType: string): string[] => {
  const emailMap: Record<string, string[]> = {
    general: ["chanuajohnson@gmail.com"],
    technical: ["chanuajohnson@gmail.com"],
    excitement: ["chanuajohnson@gmail.com"],
    investor: ["chanuajohnson@gmail.com"],
    referral: ["chanuajohnson@gmail.com"],
    agency: ["chanuajohnson@gmail.com"],
    coffee: ["chanuajohnson@gmail.com"],
    bug_report: ["chanuajohnson@gmail.com"],
    feature_request: ["chanuajohnson@gmail.com"],
    testimonial: ["chanuajohnson@gmail.com"],
    partnership: ["chanuajohnson@gmail.com"]
  };
  
  return emailMap[feedbackType] || ["chanuajohnson@gmail.com"];
};

const getEmailSubjectByType = (feedbackType: string, subject: string): string => {
  const prefixes: Record<string, string> = {
    general: "General Feedback",
    technical: "Technical Issue",
    excitement: "User Excitement",
    investor: "Investment Inquiry",
    referral: "Referral Submission",
    agency: "Agency Partnership",
    coffee: "Support Appreciation",
    bug_report: "Bug Report",
    feature_request: "Feature Request",
    testimonial: "User Testimonial",
    partnership: "Partnership Opportunity"
  };
  
  const prefix = prefixes[feedbackType] || "Feedback";
  return `[${prefix}] ${subject}`;
};

const getEmailTemplateByType = (feedbackType: string, data: FeedbackData): string => {
  const contact = data.contact_info;
  const isAnonymous = !data.user_id;
  
  const baseInfo = `
    <h2>New ${feedbackType.replace('_', ' ')} Feedback</h2>
    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Subject:</strong> ${data.subject}</p>
      ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
      ${data.rating ? `<p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)} (${data.rating}/5)</p>` : ''}
      <p><strong>Submitted:</strong> ${isAnonymous ? 'Anonymously' : 'By registered user'}</p>
      <p><strong>Page:</strong> ${data.metadata.page || 'Unknown'}</p>
    </div>
    
    <h3>Message:</h3>
    <div style="border-left: 4px solid #007bff; padding-left: 15px; margin: 15px 0;">
      <p style="white-space: pre-wrap;">${data.message}</p>
    </div>
  `;
  
  const contactInfo = !isAnonymous && (contact.name || contact.email || contact.phone) ? `
    <h3>Contact Information:</h3>
    <ul>
      ${contact.name ? `<li><strong>Name:</strong> ${contact.name}</li>` : ''}
      ${contact.email ? `<li><strong>Email:</strong> ${contact.email}</li>` : ''}
      ${contact.phone ? `<li><strong>Phone:</strong> ${contact.phone}</li>` : ''}
    </ul>
  ` : '';
  
  const metadata = data.metadata ? `
    <h3>Technical Details:</h3>
    <div style="font-family: monospace; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
      <p><strong>User Agent:</strong> ${data.metadata.userAgent || 'Unknown'}</p>
      <p><strong>Timestamp:</strong> ${data.metadata.timestamp || 'Unknown'}</p>
    </div>
  ` : '';
  
  return baseInfo + contactInfo + metadata;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const feedbackData: FeedbackData = await req.json();
    
    console.log("Received feedback submission:", {
      type: feedbackData.feedback_type,
      subject: feedbackData.subject,
      hasUser: !!feedbackData.user_id
    });

    // Validate required fields
    if (!feedbackData.feedback_type || !feedbackData.subject || !feedbackData.message) {
      throw new Error("Missing required fields: feedback_type, subject, or message");
    }

    // Store feedback in database
    const { data: storedFeedback, error: dbError } = await supabase
      .from('user_feedback')
      .insert({
        user_id: feedbackData.user_id || null,
        feedback_type: feedbackData.feedback_type,
        category: feedbackData.category || null,
        subject: feedbackData.subject,
        message: feedbackData.message,
        rating: feedbackData.rating || null,
        contact_info: feedbackData.contact_info || {},
        metadata: feedbackData.metadata || {},
        status: 'new',
        priority: 'medium'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to store feedback: ${dbError.message}`);
    }

    console.log("Feedback stored successfully:", storedFeedback.id);

    // Send email notification
    const recipients = getEmailRecipientsByType(feedbackData.feedback_type);
    const emailSubject = getEmailSubjectByType(feedbackData.feedback_type, feedbackData.subject);
    const emailBody = getEmailTemplateByType(feedbackData.feedback_type, feedbackData);
    
    const emailResponse = await resend.emails.send({
      from: "Tavara Feedback <support@tavara.care>",
      to: recipients,
      subject: emailSubject,
      html: emailBody + (feedbackData.screenshot ? 
        `<h3>Screenshot:</h3><img src="${feedbackData.screenshot}" alt="User provided screenshot" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" />` : 
        ''
      ),
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to user if contact info provided
    if (feedbackData.contact_info?.email && !feedbackData.user_id) {
      await resend.emails.send({
        from: "Tavara Support <support@tavara.care>",
        to: feedbackData.contact_info.email,
        subject: "Thank you for your feedback!",
        html: `
          <h1>Thank you for your feedback!</h1>
          <p>Hi ${feedbackData.contact_info.name || 'there'},</p>
          <p>We've received your ${feedbackData.feedback_type.replace('_', ' ')} feedback and truly appreciate you taking the time to share your thoughts with us.</p>
          <p><strong>Your feedback:</strong> ${feedbackData.subject}</p>
          <p>Our team will review your submission and get back to you if needed.</p>
          <p>Best regards,<br>The Tavara Care Team</p>
        `,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback submitted successfully",
        feedback_id: storedFeedback.id 
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
    console.error("Error in send-feedback function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to submit feedback" 
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
