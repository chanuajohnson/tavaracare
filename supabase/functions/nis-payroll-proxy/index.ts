const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-client-env, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const NUACHA_URL = 'https://fjrxqeyexlusjwzzecal.supabase.co/functions/v1/payroll-api'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('NUACHA_API_KEY')
    if (!apiKey) {
      console.error('NUACHA_API_KEY is not set in edge function secrets')
      return new Response(
        JSON.stringify({ error: 'NIS API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action } = body

    console.log(`NIS proxy request: action=${action}`, JSON.stringify(body))

    if (!action || !['calculate-nis', 'get-nis-classes'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be calculate-nis or get-nis-classes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Forwarding to Nuacha API: ${NUACHA_URL}`)

    const response = await fetch(NUACHA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify(body),
    })

    const responseText = await response.text()
    console.log(`Nuacha API response status: ${response.status}, body: ${responseText}`)

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('Failed to parse Nuacha response as JSON:', responseText)
      return new Response(
        JSON.stringify({ error: 'Invalid response from NIS API', raw: responseText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('NIS proxy error:', error.message, error.stack)
    return new Response(
      JSON.stringify({ error: 'Failed to calculate NIS', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
