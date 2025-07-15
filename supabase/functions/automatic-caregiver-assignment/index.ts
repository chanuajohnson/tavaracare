import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaregiverMatchData {
  id: string;
  full_name: string;
  specialties: string[];
  years_of_experience: number;
  hourly_rate: number;
  availability: string[];
  certifications: string[];
  languages: string[];
  bio: string;
  location: string;
  profile_complete: boolean;
  created_at: string;
}

interface FamilyUserData {
  id: string;
  full_name: string;
  care_recipient_name: string;
  relationship: string;
  care_types: string[];
  special_needs: string[];
  care_schedule: string;
  budget_preferences: string;
  caregiver_type: string;
  caregiver_preferences: string;
  address: string;
  created_at: string;
}

interface MatchResult {
  caregiver_id: string;
  match_score: number;
  shift_compatibility_score: number;
  explanation: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { family_user_id, trigger_type = 'manual' } = await req.json();

    console.log(`Starting automatic assignment process for family_user_id: ${family_user_id}, trigger: ${trigger_type}`);

    // Get family user data
    const { data: familyData, error: familyError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', family_user_id)
      .eq('role', 'family')
      .single();

    if (familyError || !familyData) {
      console.error('Family user not found:', familyError);
      return new Response(
        JSON.stringify({ error: 'Family user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all available professional caregivers
    const { data: caregivers, error: caregiversError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('role', 'professional')
      .eq('profile_complete', true);

    if (caregiversError) {
      console.error('Error fetching caregivers:', caregiversError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch caregivers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!caregivers || caregivers.length === 0) {
      console.log('No available caregivers found');
      return new Response(
        JSON.stringify({ message: 'No available caregivers found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate matches for all caregivers
    const matches: MatchResult[] = [];
    
    for (const caregiver of caregivers) {
      const matchResult = calculateMatch(familyData, caregiver);
      if (matchResult.match_score > 0.3) { // Only consider matches above 30%
        matches.push({
          caregiver_id: caregiver.id,
          match_score: matchResult.match_score,
          shift_compatibility_score: matchResult.shift_compatibility_score,
          explanation: matchResult.explanation
        });
      }
    }

    // Sort matches by score (highest first)
    matches.sort((a, b) => b.match_score - a.match_score);

    if (matches.length === 0) {
      console.log('No suitable matches found for family user');
      return new Response(
        JSON.stringify({ message: 'No suitable matches found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the best match
    const bestMatch = matches[0];

    // Create automatic assignment using the secure database function
    const { data: assignmentResult, error: assignmentError } = await supabaseClient
      .rpc('create_automatic_assignment', {
        target_family_user_id: family_user_id,
        target_caregiver_id: bestMatch.caregiver_id,
        calculated_match_score: bestMatch.match_score,
        calculated_shift_compatibility_score: bestMatch.shift_compatibility_score,
        assignment_explanation: bestMatch.explanation,
        algorithm_version_param: 'v2.0_automatic'
      });

    if (assignmentError) {
      console.error('Error creating automatic assignment:', assignmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create assignment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully created automatic assignment: ${assignmentResult}`);

    return new Response(
      JSON.stringify({
        success: true,
        assignment_id: assignmentResult,
        family_user_id,
        caregiver_id: bestMatch.caregiver_id,
        match_score: bestMatch.match_score,
        shift_compatibility_score: bestMatch.shift_compatibility_score,
        explanation: bestMatch.explanation,
        total_matches_evaluated: matches.length,
        trigger_type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in automatic-caregiver-assignment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Calculate match score between family user and caregiver
function calculateMatch(familyData: FamilyUserData, caregiver: CaregiverMatchData): MatchResult {
  let totalScore = 0;
  let maxScore = 0;
  const explanationParts: string[] = [];

  // 1. Care Type Matching (30% weight)
  const careTypeWeight = 0.3;
  const careTypeScore = calculateCareTypeMatch(familyData.care_types || [], caregiver.specialties || []);
  totalScore += careTypeScore * careTypeWeight;
  maxScore += careTypeWeight;
  explanationParts.push(`Care type match: ${Math.round(careTypeScore * 100)}%`);

  // 2. Experience Level (20% weight)
  const experienceWeight = 0.2;
  const experienceScore = calculateExperienceMatch(familyData.caregiver_type, caregiver.years_of_experience);
  totalScore += experienceScore * experienceWeight;
  maxScore += experienceWeight;
  explanationParts.push(`Experience match: ${Math.round(experienceScore * 100)}%`);

  // 3. Budget Compatibility (25% weight)
  const budgetWeight = 0.25;
  const budgetScore = calculateBudgetMatch(familyData.budget_preferences, caregiver.hourly_rate);
  totalScore += budgetScore * budgetWeight;
  maxScore += budgetWeight;
  explanationParts.push(`Budget compatibility: ${Math.round(budgetScore * 100)}%`);

  // 4. Schedule Compatibility (25% weight)
  const scheduleWeight = 0.25;
  const scheduleScore = calculateScheduleMatch(familyData.care_schedule, caregiver.availability || []);
  totalScore += scheduleScore * scheduleWeight;
  maxScore += scheduleWeight;
  explanationParts.push(`Schedule compatibility: ${Math.round(scheduleScore * 100)}%`);

  // Calculate final match score
  const matchScore = maxScore > 0 ? totalScore / maxScore : 0;
  
  // Shift compatibility is primarily based on schedule match
  const shiftCompatibilityScore = scheduleScore;

  return {
    caregiver_id: caregiver.id,
    match_score: Math.round(matchScore * 100) / 100, // Round to 2 decimal places
    shift_compatibility_score: Math.round(shiftCompatibilityScore * 100) / 100,
    explanation: explanationParts.join(', ')
  };
}

function calculateCareTypeMatch(familyCareTypes: string[], caregiverSpecialties: string[]): number {
  if (familyCareTypes.length === 0 || caregiverSpecialties.length === 0) {
    return 0.5; // Neutral score if no data
  }

  const matches = familyCareTypes.filter(type => 
    caregiverSpecialties.some(specialty => 
      specialty.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(specialty.toLowerCase())
    )
  );

  return matches.length / familyCareTypes.length;
}

function calculateExperienceMatch(preferredCaregiverType: string, yearsOfExperience: number): number {
  const experienceLevel = yearsOfExperience || 0;
  
  switch (preferredCaregiverType) {
    case 'professional':
      return experienceLevel >= 3 ? 1.0 : experienceLevel / 3;
    case 'nurse':
      return experienceLevel >= 5 ? 1.0 : experienceLevel / 5;
    case 'specialized':
      return experienceLevel >= 7 ? 1.0 : experienceLevel / 7;
    case 'companion':
      return experienceLevel >= 1 ? 1.0 : experienceLevel;
    default:
      return experienceLevel >= 2 ? 1.0 : experienceLevel / 2;
  }
}

function calculateBudgetMatch(budgetPreference: string, hourlyRate: number): number {
  const rate = hourlyRate || 0;
  
  switch (budgetPreference) {
    case 'under_15':
      return rate <= 15 ? 1.0 : Math.max(0, (20 - rate) / 5);
    case '15_20':
      return rate >= 15 && rate <= 20 ? 1.0 : Math.max(0, 1 - Math.abs(17.5 - rate) / 7.5);
    case '20_25':
      return rate >= 20 && rate <= 25 ? 1.0 : Math.max(0, 1 - Math.abs(22.5 - rate) / 7.5);
    case '25_30':
      return rate >= 25 && rate <= 30 ? 1.0 : Math.max(0, 1 - Math.abs(27.5 - rate) / 7.5);
    case '30_plus':
      return rate >= 30 ? 1.0 : Math.max(0, rate / 30);
    default:
      return 0.7; // Neutral score for "not_sure"
  }
}

function calculateScheduleMatch(careSchedule: string, caregiverAvailability: string[]): number {
  if (!careSchedule || caregiverAvailability.length === 0) {
    return 0.5; // Neutral score if no data
  }

  // Parse care schedule and check against caregiver availability
  const scheduleTypes = careSchedule.split(',').map(s => s.trim());
  let matchCount = 0;

  for (const schedule of scheduleTypes) {
    if (caregiverAvailability.some(avail => 
      avail.toLowerCase().includes(schedule.toLowerCase()) ||
      schedule.toLowerCase().includes(avail.toLowerCase())
    )) {
      matchCount++;
    }
  }

  return scheduleTypes.length > 0 ? matchCount / scheduleTypes.length : 0.5;
}