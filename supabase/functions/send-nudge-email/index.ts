
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NudgeEmailRequest {
  userId: string;
  userEmail: string;
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
    const { userId, userEmail, userName, userRole, currentStep, stepType }: NudgeEmailRequest = await req.json();

    // Get step-specific message
    const getStepMessage = (role: string, step: number, type: string) => {
      const messages = {
        family: {
          1: "Welcome to Tavara! Let's complete your family profile to connect you with the right caregivers.",
          2: "Help us understand your loved one's story so we can find the perfect caregiver match.",
          3: "Complete your care needs assessment to get personalized caregiver recommendations.",
          4: "Set your caregiver preferences to ensure the best possible matches.",
          5: "Let us know your preferred care schedule and budget to finalize your profile.",
          6: "Almost there! Review your profile to start connecting with caregivers.",
          7: "Your profile is complete! Start browsing available caregivers."
        },
        professional: {
          1: "Welcome to Tavara! Complete your professional profile to start connecting with families.",
          2: "Add your professional experience and specialties to attract the right families.",
          3: "Upload your certifications to build trust with families and stand out.",
          4: "Complete your background verification to unlock more opportunities.",
          5: "Your profile is almost ready! Complete the final steps to start receiving job matches."
        },
        community: {
          1: "Welcome to Tavara! Join our community of care supporters and volunteers.",
          2: "Tell us about your interests so we can connect you with the right volunteer opportunities.",
          3: "You're all set! Start exploring ways to support families in your community."
        }
      };

      if (type === 'welcome') {
        return messages[role as keyof typeof messages][1];
      }

      return messages[role as keyof typeof messages][step] || "Continue your journey with Tavara!";
    };

    const message = getStepMessage(userRole, currentStep, stepType);
    const subject = stepType === 'welcome' ? 'Welcome to Tavara!' : `Next Step: Continue Your Tavara Journey`;

    const emailResponse = await resend.emails.send({
      from: "Tavara Care <support@tavara.care>",
      to: [userEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Tavara Care</h1>
            <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your Care Coordination Hub</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              ${message}
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #666;">
                <strong>Current Step:</strong> ${currentStep} | <strong>Role:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://tavara.care/dashboard/${userRole}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Continue Your Journey
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Need help? Reply to this email or contact our support team.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">© 2024 Tavara Care. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Nudge email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
