
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FeedbackData {
  feedback_type: string;
  category?: string;
  subject: string;
  message: string;
  rating?: number;
  contact_info: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata: any;
  screenshot?: string;
  user_id?: string;
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
};

const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const cleanedNumber = phone.replace(/[\s\-\(\)\.]/g, '');
  
  if (cleanedNumber.startsWith('+')) {
    return /^\+\d{8,15}$/.test(cleanedNumber);
  } else {
    return /^\d{7,15}$/.test(cleanedNumber);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  try {
    const feedbackData: FeedbackData = await req.json();
    
    console.log("Received feedback submission:", {
      type: feedbackData.feedback_type,
      subject: feedbackData.subject,
      hasUser: !!feedbackData.user_id,
      hasContactInfo: !!(feedbackData.contact_info?.email || feedbackData.contact_info?.name)
    });

    // Validate required fields
    if (!feedbackData.feedback_type || !feedbackData.subject || !feedbackData.message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: feedback_type, subject, and message are required" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate contact information if provided
    if (feedbackData.contact_info?.email && !validateEmail(feedbackData.contact_info.email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid email format" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (feedbackData.contact_info?.phone && !validatePhone(feedbackData.contact_info.phone)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid phone number format" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
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
        metadata: {
          ...feedbackData.metadata,
          screenshot: feedbackData.screenshot || null
        },
        status: 'new',
        priority: 'medium'
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to store feedback. Please try again later." 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Feedback stored successfully:", storedFeedback.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Feedback submitted successfully! Thank you for helping us improve.",
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
        error: "An unexpected error occurred. Please try again later." 
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
