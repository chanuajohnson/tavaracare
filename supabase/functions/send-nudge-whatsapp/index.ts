
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NudgeWhatsAppRequest {
  userId: string;
  userPhone: string;
  userName: string;
  userRole: string;
  currentStep: number;
  stepType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userPhone, userName, userRole, currentStep, stepType }: NudgeWhatsAppRequest = await req.json();

    console.log('WhatsApp nudge request:', { userId, userPhone, userName, userRole, currentStep, stepType });

    // Check if phone number is provided
    if (!userPhone) {
      throw new Error("No phone number provided for WhatsApp nudge");
    }

    // Get step-specific message
    const getStepMessage = (role: string, step: number, type: string) => {
      const messages = {
        family: {
          1: "👋 Welcome to Tavara! Let's complete your family profile to connect you with the right caregivers. 💙",
          2: "📖 Help us understand your loved one's story so we can find the perfect caregiver match.",
          3: "📋 Complete your care needs assessment to get personalized caregiver recommendations.",
          4: "⚙️ Set your caregiver preferences to ensure the best possible matches.",
          5: "📅 Let us know your preferred care schedule and budget to finalize your profile.",
          6: "✅ Almost there! Review your profile to start connecting with caregivers.",
          7: "🎉 Your profile is complete! Start browsing available caregivers."
        },
        professional: {
          1: "👋 Welcome to Tavara! Complete your professional profile to start connecting with families. 💪",
          2: "📝 Add your professional experience and specialties to attract the right families.",
          3: "📄 Upload your certifications to build trust with families and stand out.",
          4: "✅ Complete your background verification to unlock more opportunities.",
          5: "🚀 Your profile is almost ready! Complete the final steps to start receiving job matches."
        },
        community: {
          1: "👋 Welcome to Tavara! Join our community of care supporters and volunteers. 🤝",
          2: "💡 Tell us about your interests so we can connect you with the right volunteer opportunities.",
          3: "✨ You're all set! Start exploring ways to support families in your community."
        }
      };

      if (type === 'welcome') {
        return messages[role as keyof typeof messages][1];
      }

      return messages[role as keyof typeof messages][step] || "Continue your journey with Tavara! 🌟";
    };

    const message = getStepMessage(userRole, currentStep, stepType);
    
    // Format phone number for WhatsApp (remove any non-digits and ensure it starts with country code)
    let formattedPhone = userPhone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone; // Add US country code if missing
    }

    // For now, we'll simulate the WhatsApp send since we don't have WhatsApp Business API configured
    // In a real implementation, you would integrate with WhatsApp Business API here
    console.log('WhatsApp message would be sent to:', formattedPhone);
    console.log('Message content:', message);

    // Simulate API response
    const whatsappResponse = {
      success: true,
      messageId: `wa_${Date.now()}`,
      to: formattedPhone,
      message: message,
      timestamp: new Date().toISOString()
    };

    // TODO: Replace this simulation with actual WhatsApp Business API integration
    // Example integration would look like:
    // const whatsappAPI = new WhatsAppBusinessAPI(Deno.env.get("WHATSAPP_ACCESS_TOKEN"));
    // const response = await whatsappAPI.sendMessage({
    //   to: formattedPhone,
    //   text: { body: message }
    // });

    console.log("WhatsApp nudge simulated successfully:", whatsappResponse);

    return new Response(JSON.stringify(whatsappResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-nudge-whatsapp function:", error);
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
