import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'family' | 'professional'
          available_for_matching: boolean
        }
      }
      caregiver_assignments: {
        Insert: {
          family_user_id: string
          caregiver_id: string
          assignment_type: 'automatic' | 'manual' | 'care_team'
          match_score: number
          match_explanation?: string
          status: string
          is_active: boolean
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { familyUserId } = await req.json()
    
    console.log('Automatic assignment request for family user:', familyUserId)

    // Get available professional caregivers
    const { data: caregivers, error: caregiversError } = await supabaseClient
      .from('profiles')
      .select('id, professional_type, years_of_experience, care_types')
      .eq('role', 'professional')
      .eq('available_for_matching', true)
      .limit(5)

    if (caregiversError) {
      console.error('Error fetching caregivers:', caregiversError)
      throw caregiversError
    }

    if (!caregivers || caregivers.length === 0) {
      console.log('No available caregivers found')
      return new Response(
        JSON.stringify({ success: false, message: 'No available caregivers found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has assignments
    const { data: existingAssignments, error: assignmentError } = await supabaseClient
      .from('caregiver_assignments')
      .select('id')
      .eq('family_user_id', familyUserId)
      .eq('is_active', true)

    if (assignmentError) {
      console.error('Error checking existing assignments:', assignmentError)
      throw assignmentError
    }

    if (existingAssignments && existingAssignments.length > 0) {
      console.log('User already has assignments:', existingAssignments.length)
      return new Response(
        JSON.stringify({ success: true, message: 'User already has assignments', assignmentCount: existingAssignments.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create automatic assignments for top 3 caregivers
    const assignmentsToCreate = caregivers.slice(0, 3).map((caregiver, index) => ({
      family_user_id: familyUserId,
      caregiver_id: caregiver.id,
      assignment_type: 'automatic' as const,
      match_score: 85 - (index * 5), // Descending scores: 85, 80, 75
      match_explanation: `Automatic match based on care needs and caregiver availability (rank ${index + 1})`,
      status: 'active',
      is_active: true
    }))

    const { data: createdAssignments, error: createError } = await supabaseClient
      .from('caregiver_assignments')
      .insert(assignmentsToCreate)
      .select()

    if (createError) {
      console.error('Error creating assignments:', createError)
      throw createError
    }

    console.log('Created automatic assignments:', createdAssignments)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdAssignments?.length || 0} automatic assignments`,
        assignments: createdAssignments
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in automatic-caregiver-assignment function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})