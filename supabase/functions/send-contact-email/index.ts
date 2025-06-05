
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-app-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  screenshot?: string;
  chatData?: {
    role?: string;
    sessionId?: string;
    transcript?: any[];
  };
}

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email validation function
const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.trim());
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
    const contactData: ContactFormData = await req.json();
    const { name, email, message, screenshot, chatData } = contactData;

    console.log("Received contact form submission:", { 
      name, 
      email: email?.substring(0, 5) + "...", 
      hasMessage: !!message,
      hasScreenshot: !!screenshot,
      hasChatData: !!chatData 
    });

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: name, email, and message are required" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
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

    // Validate name length
    if (name.trim().length < 2) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Name must be at least 2 characters long" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Store contact request in database
    const { data: storedContact, error: dbError } = await supabase
      .from('user_feedback')
      .insert({
        feedback_type: 'general',
        subject: 'Contact Support Request',
        message: message,
        contact_info: {
          name: name,
          email: email
        },
        metadata: {
          source: 'contact_form',
          screenshot: screenshot || null,
          chatData: chatData || null,
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || 'Unknown'
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
          error: "Failed to store contact request. Please try again later." 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Contact request stored successfully:", storedContact.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Support request submitted successfully. We'll review it and get back to you soon!",
        contact_id: storedContact.id 
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
