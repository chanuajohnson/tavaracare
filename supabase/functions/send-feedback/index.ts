
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { 
      feedback_type, 
      subject, 
      message, 
      rating, 
      contact_info, 
      metadata 
    } = await req.json()

    // Validate required fields
    if (!feedback_type || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: feedback_type, subject, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current user if authenticated
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Determine priority based on feedback type
    let priority = 'medium'
    if (feedback_type === 'technical') priority = 'high'
    if (feedback_type === 'investor' || feedback_type === 'agency') priority = 'high'
    if (feedback_type === 'excitement') priority = 'low'

    // Store feedback in database
    const { data: feedbackData, error: dbError } = await supabaseClient
      .from('user_feedback')
      .insert({
        user_id: user?.id || null,
        feedback_type,
        subject,
        message,
        rating: rating || null,
        contact_info: contact_info || {},
        metadata: metadata || {},
        priority,
        status: 'new'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store feedback', details: dbError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email notification if RESEND_API_KEY is available
    if (RESEND_API_KEY) {
      try {
        const categoryLabels = {
          general: 'General Feedback',
          technical: 'Technical Issues',
          feature_request: 'Feature Request',
          excitement: 'Excitement & Testimonials',
          investor: 'Investment & Partnership',
          referral: 'Referrals',
          agency: 'Agency & Professional Services',
          coffee: 'Buy Us Coffee',
          user_experience: 'User Experience'
        }

        const categoryLabel = categoryLabels[feedback_type] || feedback_type

        let emailHtml = `
          <h2>New Feedback Received</h2>
          <p><strong>Type:</strong> ${categoryLabel}</p>
          <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          ${rating ? `<p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>` : ''}
          <p><strong>Message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        `

        // Add contact info if provided
        if (contact_info && (contact_info.name || contact_info.email || contact_info.phone)) {
          emailHtml += `
            <h3>Contact Information:</h3>
            <ul>
              ${contact_info.name ? `<li><strong>Name:</strong> ${contact_info.name}</li>` : ''}
              ${contact_info.email ? `<li><strong>Email:</strong> ${contact_info.email}</li>` : ''}
              ${contact_info.phone ? `<li><strong>Phone:</strong> ${contact_info.phone}</li>` : ''}
            </ul>
          `
        }

        // Add metadata
        if (metadata) {
          emailHtml += `
            <h3>Additional Context:</h3>
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 10px 0;">
              ${metadata.page ? `<p><strong>Page:</strong> ${metadata.page}</p>` : ''}
              <p><strong>Feedback ID:</strong> ${feedbackData.id}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          `
        }

        // Determine email recipient based on feedback type
        let toEmail = 'feedback@tavara.care'
        if (feedback_type === 'technical') toEmail = 'tech@tavara.care'
        if (feedback_type === 'investor' || feedback_type === 'agency') toEmail = 'business@tavara.care'

        const emailPayload = {
          from: 'Tavara.care Feedback <noreply@tavara.care>',
          to: [toEmail],
          reply_to: contact_info?.email || undefined,
          subject: `[${priority.toUpperCase()}] ${categoryLabel}: ${subject}`,
          html: emailHtml,
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        })

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          console.error('Failed to send notification email:', errorText)
        } else {
          console.log('Notification email sent successfully')
        }

        // Send thank you email if contact info provided
        if (contact_info?.email) {
          const thankYouPayload = {
            from: 'Tavara.care Team <noreply@tavara.care>',
            to: [contact_info.email],
            subject: 'Thank you for your feedback!',
            html: `
              <h2>Thank you for your feedback!</h2>
              <p>Hi ${contact_info.name || 'there'},</p>
              <p>We've received your ${categoryLabel.toLowerCase()} and truly appreciate you taking the time to share your thoughts with us.</p>
              <p><strong>Your feedback:</strong></p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <strong>${subject}</strong><br>
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p>We review all feedback carefully and use it to improve our platform. If your feedback requires a response, we'll get back to you within 48 hours.</p>
              <p>Thank you for helping us make Tavara.care better!</p>
              <p>Best regards,<br>The Tavara.care Team</p>
            `,
          }

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(thankYouPayload),
          })
        }

      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the entire request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Feedback submitted successfully',
        feedbackId: feedbackData.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-feedback function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
