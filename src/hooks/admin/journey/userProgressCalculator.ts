
import { supabase } from '@/lib/supabase';
import { UserProgress } from './types';

export const calculateUserProgress = async (user: any): Promise<UserProgress> => {
  const stepCompletionData: Record<number, boolean> = {};
  let userStepCount = 0;

  // Step 1: Profile completion
  if (user.full_name) {
    stepCompletionData[1] = true;
    userStepCount++;
  }

  // Step 2: Care assessment
  const { data: careAssessment } = await supabase
    .from('care_needs_family')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();
  
  if (careAssessment) {
    stepCompletionData[2] = true;
    userStepCount++;
  }

  // Step 3: Care recipient profile (Legacy Story)
  const { data: careRecipient } = await supabase
    .from('care_recipient_profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (careRecipient?.full_name) {
    stepCompletionData[3] = true;
    userStepCount++;
  }

  // Step 4: View Matches
  if (careRecipient) {
    stepCompletionData[4] = true;
    userStepCount++;
  }

  // Care plans (used by multiple steps)
  const { data: carePlans } = await supabase
    .from('care_plans')
    .select('id')
    .eq('family_id', user.id);

  if (carePlans?.length) {
    // Step 5: Medications
    const { data: medications } = await supabase
      .from('medications')
      .select('id')
      .in('care_plan_id', carePlans.map(cp => cp.id));

    if (medications?.length) {
      stepCompletionData[5] = true;
      userStepCount++;
    }

    // Step 6: Meal plans
    const { data: mealPlans } = await supabase
      .from('meal_plans')
      .select('id')
      .in('care_plan_id', carePlans.map(cp => cp.id));

    if (mealPlans?.length) {
      stepCompletionData[6] = true;
      userStepCount++;
    }
  }

  // Step 7: Visit scheduled
  if (user.visit_scheduling_status === 'scheduled' || user.visit_scheduling_status === 'completed') {
    stepCompletionData[7] = true;
    userStepCount++;
  }

  // Step 8: Visit confirmed
  if (user.visit_scheduling_status === 'completed') {
    stepCompletionData[8] = true;
    userStepCount++;
  }

  // Step 9: Care Team Confirmed
  const { data: assignments } = await supabase
    .from('caregiver_assignments')
    .select('id')
    .eq('family_user_id', user.id)
    .eq('is_active', true)
    .limit(1);

  const { data: manualAssignments } = await supabase
    .from('admin_match_interventions')
    .select('id')
    .eq('family_user_id', user.id)
    .eq('status', 'active')
    .limit(1);

  const hasCareTeam = (assignments?.length || 0) > 0 || (manualAssignments?.length || 0) > 0;
  if (hasCareTeam) {
    stepCompletionData[9] = true;
    userStepCount++;
  }

  // Steps 10-11: Onboarding checklist
  const { data: checklist } = await supabase
    .from('onboarding_checklists' as any)
    .select('checked_items')
    .eq('user_id', user.id)
    .eq('user_type', 'family')
    .maybeSingle();

  const checkedItems = (checklist as any)?.checked_items as Record<string, any> | null;

  // Step 10: Initial Family Meeting
  if (checkedItems?.introduction_date) {
    stepCompletionData[10] = true;
    userStepCount++;
  }

  // Step 11: Care Begins
  if (checkedItems?.care_start_date) {
    stepCompletionData[11] = true;
    userStepCount++;
  }

  // Step 12: Care Readiness Assessment — auto-completes when care has started
  // (mirrors useSharedFamilyJourneyData logic: care plan + assigned caregiver)
  if ((carePlans?.length || 0) > 0 && hasCareTeam) {
    stepCompletionData[12] = true;
    userStepCount++;
  }

  // Step 13: Home Environment Optimization — care_plan_service_selections w/ care_environment_support category
  if (carePlans?.length) {
    const { data: envSelections } = await supabase
      .from('care_plan_service_selections')
      .select('id, billable_service_items!inner(category)')
      .in('care_plan_id', carePlans.map(cp => cp.id))
      .eq('selected', true)
      .eq('billable_service_items.category', 'care_environment_support')
      .limit(1);

    if (envSelections?.length) {
      stepCompletionData[13] = true;
      userStepCount++;
    }
  }

  // Steps 14-16: Trial payments
  const { data: trialPayments } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('transaction_type', 'trial_day')
    .eq('status', 'completed');

  if (trialPayments?.length) {
    stepCompletionData[14] = true;
    stepCompletionData[15] = true;
    stepCompletionData[16] = true;
    userStepCount += 3;
  }

  // Step 17: Care model selection (Choose Path)
  let visitNotes = null;
  try {
    visitNotes = user.visit_notes ? JSON.parse(user.visit_notes) : null;
  } catch (error) {
    console.error('Error parsing visit notes:', error);
  }

  let subscriptionConversion = false;
  let directHireConversion = false;

  if (visitNotes?.care_model) {
    stepCompletionData[17] = true;
    userStepCount++;
    
    if (visitNotes.care_model === 'tavara_subscribed') {
      subscriptionConversion = true;
    } else if (visitNotes.care_model === 'direct_hire') {
      directHireConversion = true;
    }
  }

  return {
    userStepCount,
    foundationCompleted: userStepCount >= 6,
    schedulingCompleted: userStepCount >= 8,
    careCoordinationCompleted: userStepCount >= 11,
    careEnvironmentCompleted: !!(stepCompletionData[12] || stepCompletionData[13]),
    trialCompleted: userStepCount >= 16,
    subscriptionConversion,
    directHireConversion
  };
};
