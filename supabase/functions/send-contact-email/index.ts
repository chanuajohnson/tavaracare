
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`${req.method} ${req.url}`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { name, email, category, message, screenshot, chatData } = await req.json()

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare email content
    let emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Category:</strong> ${category || 'Not specified'}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
    `

    // Add chat data if available
    if (chatData) {
      emailHtml += `
        <h3>Additional Context from Chat:</h3>
        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <pre>${JSON.stringify(chatData, null, 2)}</pre>
        </div>
      `
    }

    // Add screenshot info if provided
    if (screenshot) {
      emailHtml += `<p><strong>Screenshot:</strong> Attached</p>`
    }

    emailHtml += `
      <hr>
      <p><small>Submitted from: ${req.headers.get('referer') || 'Direct'}</small></p>
      <p><small>User Agent: ${req.headers.get('user-agent') || 'Unknown'}</small></p>
      <p><small>Timestamp: ${new Date().toISOString()}</small></p>
    `

    // Prepare email payload
    const emailPayload = {
      from: 'Tavara.care Support <noreply@tavara.care>',
      to: ['support@tavara.care'],
      reply_to: email,
      subject: `Contact Form: ${category ? `[${category}] ` : ''}${name}`,
      html: emailHtml,
    }

    // Add screenshot as attachment if provided
    if (screenshot) {
      emailPayload.attachments = [{
        filename: `screenshot-${Date.now()}.png`,
        content: screenshot.split(',')[1], // Remove data:image/png;base64, prefix
        content_type: 'image/png'
      }]
    }

    console.log('Sending email with payload:', {
      ...emailPayload,
      html: '[HTML content]',
      attachments: screenshot ? '[Screenshot attached]' : 'None'
    })

    // Send email via Resend
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
      console.error('Resend API error:', errorText)
      
      // Try to parse error response
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email', 
          details: errorData.message || 'Unknown error from email service'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    // Send confirmation email to user
    try {
      const confirmationPayload = {
        from: 'Tavara.care Support <noreply@tavara.care>',
        to: [email],
        subject: 'Thank you for contacting Tavara.care',
        html: `
          <h2>Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p><strong>Your message:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p>If you need immediate assistance, you can reach us via WhatsApp at +1 (868) 786-5357.</p>
          <p>Best regards,<br>The Tavara.care Team</p>
        `,
      }

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmationPayload),
      })
    } catch (confirmationError) {
      console.error('Failed to send confirmation email:', confirmationError)
      // Don't fail the entire request if confirmation email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contact form submitted successfully',
        emailId: emailResult.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in send-contact-email function:', error)
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
