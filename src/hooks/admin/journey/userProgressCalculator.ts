
import { supabase } from '@/lib/supabase';
import { UserProgress } from './types';

export const calculateUserProgress = async (user: any): Promise<UserProgress> => {
  const stepCompletionData: Record<number, boolean> = {};
  let userStepCount = 0;

  // Check profile completion
  if (user.full_name) {
    stepCompletionData[1] = true;
    userStepCount++;
  }

  // Check care assessment
  const { data: careAssessment } = await supabase
    .from('care_needs_family')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();
  
  if (careAssessment) {
    stepCompletionData[2] = true;
    userStepCount++;
  }

  // Check care recipient profile
  const { data: careRecipient } = await supabase
    .from('care_recipient_profiles')
    .select('id, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (careRecipient?.full_name) {
    stepCompletionData[3] = true;
    userStepCount++;
  }

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
    // Check medications
    const { data: medications } = await supabase
      .from('medications')
      .select('id')
      .in('care_plan_id', carePlans.map(cp => cp.id));

    if (medications?.length) {
      stepCompletionData[5] = true;
      userStepCount++;
    }

    // Check meal plans
    const { data: mealPlans } = await supabase
      .from('meal_plans')
      .select('id')
      .in('care_plan_id', carePlans.map(cp => cp.id));

    if (mealPlans?.length) {
      stepCompletionData[6] = true;
      userStepCount++;
    }
  }

  // Check visit scheduling
  if (user.visit_scheduling_status === 'scheduled' || user.visit_scheduling_status === 'completed') {
    stepCompletionData[7] = true;
    userStepCount++;
  }

  if (user.visit_scheduling_status === 'completed') {
    stepCompletionData[8] = true;
    userStepCount++;
  }

  // Check trial payments
  const { data: trialPayments } = await supabase
    .from('payment_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('transaction_type', 'trial_day')
    .eq('status', 'completed');

  if (trialPayments?.length) {
    stepCompletionData[9] = true;
    stepCompletionData[10] = true;
    stepCompletionData[11] = true;
    userStepCount += 3;
  }

  // Check care model selection
  let visitNotes = null;
  try {
    visitNotes = user.visit_notes ? JSON.parse(user.visit_notes) : null;
  } catch (error) {
    console.error('Error parsing visit notes:', error);
  }

  let subscriptionConversion = false;
  let directHireConversion = false;

  if (visitNotes?.care_model) {
    stepCompletionData[12] = true;
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
    trialCompleted: userStepCount >= 11,
    subscriptionConversion,
    directHireConversion
  };
};
