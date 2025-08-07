import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version, x-client-env',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'family' | 'professional'
          available_for_matching: boolean
          full_name: string
          care_types: string[]
          care_schedule: string
          location: string
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
      match_recalculation_log: {
        Insert: {
          caregiver_id: string
          recalculation_type: string
          status: string
          assignments_created?: number
          assignments_removed?: number
          error_message?: string
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

    const requestBody = await req.json()
    const { caregiver_id, previous_status, new_status, caregiver_name } = requestBody
    
    console.log('Recalculating matches for caregiver availability change:', {
      caregiver_id,
      previous_status,
      new_status,
      caregiver_name
    })

    // Create log entry for this recalculation
    const { data: logEntry, error: logError } = await supabaseClient
      .from('match_recalculation_log')
      .insert({
        caregiver_id,
        recalculation_type: 'availability_change',
        status: 'processing'
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating log entry:', logError)
      throw logError
    }

    let assignmentsCreated = 0
    let assignmentsRemoved = 0
    let errorMessage = null

    try {
      if (new_status === true) {
        // Caregiver became available - create new assignments
        console.log('Caregiver became available, finding compatible families...')
        
        // First, get existing family IDs that already have this caregiver assigned
        const { data: existingAssignments, error: existingError } = await supabaseClient
          .from('caregiver_assignments')
          .select('family_user_id')
          .eq('caregiver_id', caregiver_id)
          .eq('is_active', true)

        if (existingError) {
          console.error('Error fetching existing assignments:', existingError)
          throw existingError
        }

        const excludedFamilyIds = existingAssignments?.map(a => a.family_user_id) || []
        console.log(`Found ${excludedFamilyIds.length} families already assigned to this caregiver`)

        // Get all family users who don't already have this caregiver assigned
        let familiesQuery = supabaseClient
          .from('profiles')
          .select('id, full_name, care_types, care_schedule, location')
          .eq('role', 'family')

        // Only apply the exclusion filter if there are existing assignments
        if (excludedFamilyIds.length > 0) {
          familiesQuery = familiesQuery.not('id', 'in', `(${excludedFamilyIds.map(id => `'${id}'`).join(',')})`)
        }

        const { data: potentialFamilies, error: familiesError } = await familiesQuery

        if (familiesError) {
          console.error('Error fetching potential families:', familiesError)
          throw familiesError
        }

        console.log(`Found ${potentialFamilies?.length || 0} potential families`)

        // For each family, calculate match score and create assignment if score is high enough
        for (const family of potentialFamilies || []) {
          try {
            // Calculate match score using existing RPC function
            const { data: matchData, error: matchError } = await supabaseClient
              .rpc('calculate_unified_match_score', {
                target_family_user_id: family.id,
                target_caregiver_id: caregiver_id
              })

            if (matchError) {
              console.error(`Error calculating match for family ${family.id}:`, matchError)
              continue
            }

            const overallScore = matchData?.overall_score || 0
            console.log(`Match score for family ${family.full_name}: ${overallScore}`)

            // Only create assignment if match score is above threshold (e.g., 60)
            if (overallScore >= 60) {
              const { data: newAssignment, error: assignmentError } = await supabaseClient
                .rpc('create_unified_assignment', {
                  target_family_user_id: family.id,
                  target_caregiver_id: caregiver_id,
                  assignment_type_param: 'automatic',
                  assignment_reason_param: `Automatic assignment created due to caregiver availability change (${caregiver_name} became available)`,
                  assignment_notes_param: `Match score: ${overallScore}. Created via availability change trigger.`
                })

              if (assignmentError) {
                console.error(`Error creating assignment for family ${family.id}:`, assignmentError)
                continue
              }

              assignmentsCreated++
              console.log(`✅ Created assignment for family ${family.full_name} with match score ${overallScore}`)

              // Create notification for family about new match
              await supabaseClient
                .from('admin_communications')
                .insert({
                  admin_id: null,
                  target_user_id: family.id,
                  message_type: 'new_match_available',
                  custom_message: `New caregiver match available: ${caregiver_name} (Match score: ${overallScore})`,
                  sent_at: new Date().toISOString()
                })
            }
          } catch (familyError) {
            console.error(`Error processing family ${family.id}:`, familyError)
            continue
          }
        }

      } else if (new_status === false) {
        // Caregiver became unavailable - deactivate existing assignments
        console.log('Caregiver became unavailable, deactivating assignments...')
        
        const { data: deactivatedAssignments, error: deactivateError } = await supabaseClient
          .from('caregiver_assignments')
          .update({ 
            is_active: false, 
            updated_at: new Date().toISOString(),
            notes: `Deactivated due to caregiver availability change (${caregiver_name} became unavailable)`
          })
          .eq('caregiver_id', caregiver_id)
          .eq('is_active', true)
          .select()

        if (deactivateError) {
          console.error('Error deactivating assignments:', deactivateError)
          throw deactivateError
        }

        assignmentsRemoved = deactivatedAssignments?.length || 0
        console.log(`✅ Deactivated ${assignmentsRemoved} assignments`)

        // Notify affected families
        for (const assignment of deactivatedAssignments || []) {
          await supabaseClient
            .from('admin_communications')
            .insert({
              admin_id: null,
              target_user_id: assignment.family_user_id,
              message_type: 'caregiver_unavailable',
              custom_message: `Caregiver ${caregiver_name} is no longer available. We're finding alternative matches for you.`,
              sent_at: new Date().toISOString()
            })
        }
      }

      // Update log entry with success
      await supabaseClient
        .from('match_recalculation_log')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          assignments_created: assignmentsCreated,
          assignments_removed: assignmentsRemoved
        })
        .eq('id', logEntry.id)

      console.log('✅ Match recalculation completed successfully:', {
        caregiver_id,
        caregiver_name,
        assignmentsCreated,
        assignmentsRemoved
      })

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Match recalculation completed for ${caregiver_name}`,
          assignmentsCreated,
          assignmentsRemoved,
          caregiver_id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (processingError) {
      errorMessage = processingError.message
      console.error('Error during match recalculation:', processingError)
      
      // Update log entry with error
      await supabaseClient
        .from('match_recalculation_log')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          assignments_created: assignmentsCreated,
          assignments_removed: assignmentsRemoved,
          error_message: errorMessage
        })
        .eq('id', logEntry.id)

      throw processingError
    }

  } catch (error) {
    console.error('Error in recalculate-matches-on-availability-change function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})