const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}


const NUACHA_URL = 'https://fjrxqeyexlusjwzzecal.supabase.co/functions/v1/payroll-api'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('NUACHA_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'NIS API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { action } = body

    if (!action || !['calculate-nis', 'get-nis-classes'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be calculate-nis or get-nis-classes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(NUACHA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('NIS proxy error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to calculate NIS', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
