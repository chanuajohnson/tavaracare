
import { supabase } from '@/lib/supabase';
import { UserProgress } from './types';

export const calculateUserProgress = async (user: any): Promise<UserProgress> => {
  const stepCompletionData: Record<number, boolean> = {};
  let userStepCount = 0;

  // Step 1: Check profile completion
  if (user.full_name) {
    stepCompletionData[1] = true;
    userStepCount++;
  }

  // Step 2: Check care assessment
  const { data: careAssessment } = await supabase
    .from('care_needs_family')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();
  
  if (careAssessment) {
    stepCompletionData[2] = true;
    userStepCount++;
  }

  // Step 3: Check care recipient profile
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

  // Check care plans and related data
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

  // Step 9: Care Team Confirmed (check caregiver_assignments or admin_match_interventions)
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

  // Steps 10-11: Check onboarding_checklists for introduction_date and care_start_date
  const { data: checklist } = await supabase
    .from('onboarding_checklists')
    .select('checked_items')
    .eq('user_id', user.id)
    .eq('user_type', 'family')
    .maybeSingle();

  const checkedItems = checklist?.checked_items as Record<string, any> | null;

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

  // Steps 12-14: Trial payments
  const { data: trialPayments } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('transaction_type', 'trial_day')
    .eq('status', 'completed');

  if (trialPayments?.length) {
    stepCompletionData[12] = true;
    stepCompletionData[13] = true;
    stepCompletionData[14] = true;
    userStepCount += 3;
  }

  // Step 15: Care model selection
  let visitNotes = null;
  try {
    visitNotes = user.visit_notes ? JSON.parse(user.visit_notes) : null;
  } catch (error) {
    console.error('Error parsing visit notes:', error);
  }

  let subscriptionConversion = false;
  let directHireConversion = false;

  if (visitNotes?.care_model) {
    stepCompletionData[15] = true;
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
    trialCompleted: userStepCount >= 14,
    subscriptionConversion,
    directHireConversion
  };
};
