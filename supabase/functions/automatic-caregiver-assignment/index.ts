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
    console.log('=== AUTOMATIC CAREGIVER ASSIGNMENT FUNCTION STARTED ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', req.headers)
    
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Supabase client created successfully')
    
    let requestBody
    try {
      requestBody = await req.json()
      console.log('Request body parsed:', requestBody)
    } catch (e) {
      console.error('Failed to parse request body:', e)
      throw new Error('Invalid JSON in request body')
    }

    const { familyUserId } = requestBody
    
    if (!familyUserId) {
      console.error('No familyUserId provided in request')
      throw new Error('familyUserId is required')
    }
    
    console.log('=== Processing automatic assignment for family user:', familyUserId, '===')

    // Verify family user exists first
    console.log('Verifying family user exists...')
    const { data: familyUser, error: familyUserError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', familyUserId)
      .eq('role', 'family')
      .single()

    if (familyUserError || !familyUser) {
      console.error('Family user not found or error:', familyUserError)
      return new Response(
        JSON.stringify({ success: false, message: 'Family user not found or not valid family role' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Family user verified:', familyUser)

    // Get available professional caregivers
    console.log('Fetching available professional caregivers...')
    const { data: caregivers, error: caregiversError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, professional_type, years_of_experience, care_types, available_for_matching')
      .eq('role', 'professional')
      .eq('available_for_matching', true)
      .limit(5)

    console.log('Caregivers query result:', { count: caregivers?.length, error: caregiversError })
    console.log('Available caregivers:', caregivers)

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
    console.log('Checking for existing assignments...')
    const { data: existingAssignments, error: assignmentError } = await supabaseClient
      .from('caregiver_assignments')
      .select('id, assignment_type, caregiver_id, match_score')
      .eq('family_user_id', familyUserId)
      .eq('is_active', true)

    console.log('Existing assignments check result:', { 
      count: existingAssignments?.length, 
      assignments: existingAssignments,
      error: assignmentError 
    })

    if (assignmentError) {
      console.error('Error checking existing assignments:', assignmentError)
      throw assignmentError
    }

    if (existingAssignments && existingAssignments.length > 0) {
      console.log('User already has', existingAssignments.length, 'active assignments')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User already has assignments', 
          assignmentCount: existingAssignments.length,
          assignments: existingAssignments
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create automatic assignments for top 3 caregivers
    console.log('Creating assignments for top 3 caregivers...')
    const assignmentsToCreate = caregivers.slice(0, 3).map((caregiver, index) => {
      const assignment = {
        family_user_id: familyUserId,
        caregiver_id: caregiver.id,
        assignment_type: 'automatic' as const,
        match_score: 85 - (index * 5), // Descending scores: 85, 80, 75
        match_explanation: `Automatic match based on care needs and caregiver availability (rank ${index + 1})`,
        status: 'active',
        is_active: true
      }
      console.log(`Assignment ${index + 1}:`, assignment)
      return assignment
    })

    console.log('Assignments to create:', assignmentsToCreate)

    const { data: createdAssignments, error: createError } = await supabaseClient
      .from('caregiver_assignments')
      .insert(assignmentsToCreate)
      .select()

    console.log('Assignment creation result:', { createdAssignments, createError })

    if (createError) {
      console.error('Error creating assignments:', createError)
      throw createError
    }

    console.log('Successfully created', createdAssignments?.length || 0, 'automatic assignments')

    console.log('=== AUTOMATIC ASSIGNMENT FUNCTION COMPLETED SUCCESSFULLY ===')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdAssignments?.length || 0} automatic assignments`,
        assignments: createdAssignments,
        familyUserId: familyUserId,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== AUTOMATIC ASSIGNMENT FUNCTION ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        familyUserId: familyUserId || 'unknown'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})