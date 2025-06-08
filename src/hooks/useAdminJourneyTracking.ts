
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface JourneyStepData {
  id: number;
  title: string;
  category: 'foundation' | 'scheduling' | 'trial' | 'conversion';
  completed: boolean;
  completionRate: number;
  avgTimeToComplete?: number;
  dropOffRate?: number;
}

interface ConversionMetrics {
  foundationToScheduling: number;
  schedulingToTrial: number;
  trialToSubscription: number;
  directHireConversion: number;
  subscriptionConversion: number;
}

interface AdminJourneyData {
  overallCompletionRate: number;
  stepData: JourneyStepData[];
  conversionMetrics: ConversionMetrics;
  totalUsers: number;
  activeJourneyUsers: number;
  completedJourneyUsers: number;
  loading: boolean;
}

export const useAdminJourneyTracking = (): AdminJourneyData => {
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState<AdminJourneyData>({
    overallCompletionRate: 0,
    stepData: [],
    conversionMetrics: {
      foundationToScheduling: 0,
      schedulingToTrial: 0,
      trialToSubscription: 0,
      directHireConversion: 0,
      subscriptionConversion: 0
    },
    totalUsers: 0,
    activeJourneyUsers: 0,
    completedJourneyUsers: 0,
    loading: true
  });

  const calculateJourneyMetrics = async () => {
    try {
      setLoading(true);

      // Get all family users
      const { data: familyUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, visit_scheduling_status, visit_notes, created_at')
        .eq('role', 'family');

      if (usersError) throw usersError;

      const totalUsers = familyUsers?.length || 0;

      // Initialize step tracking
      const stepCompletionData = {
        1: 0, // Profile completion
        2: 0, // Care assessment
        3: 0, // Legacy story
        4: 0, // Caregiver matches
        5: 0, // Medication management
        6: 0, // Meal management
        7: 0, // Schedule visit
        8: 0, // Confirm visit
        9: 0, // Schedule trial
        10: 0, // Pay for trial
        11: 0, // Begin trial
        12: 0  // Choose path
      };

      let activeJourneyUsers = 0;
      let completedJourneyUsers = 0;
      let foundationCompleted = 0;
      let schedulingCompleted = 0;
      let trialCompleted = 0;
      let subscriptionConversions = 0;
      let directHireConversions = 0;

      // Process each user's journey progress
      for (const user of familyUsers || []) {
        let userStepCount = 0;

        // Check profile completion
        if (user.full_name) {
          stepCompletionData[1]++;
          userStepCount++;
        }

        // Check care assessment
        const { data: careAssessment } = await supabase
          .from('care_needs_family')
          .select('id')
          .eq('profile_id', user.id)
          .maybeSingle();
        
        if (careAssessment) {
          stepCompletionData[2]++;
          userStepCount++;
        }

        // Check care recipient profile
        const { data: careRecipient } = await supabase
          .from('care_recipient_profiles')
          .select('id, full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (careRecipient?.full_name) {
          stepCompletionData[3]++;
          userStepCount++;
        }

        if (careRecipient) {
          stepCompletionData[4]++;
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
            stepCompletionData[5]++;
            userStepCount++;
          }

          // Check meal plans
          const { data: mealPlans } = await supabase
            .from('meal_plans')
            .select('id')
            .in('care_plan_id', carePlans.map(cp => cp.id));

          if (mealPlans?.length) {
            stepCompletionData[6]++;
            userStepCount++;
          }
        }

        // Check visit scheduling
        if (user.visit_scheduling_status === 'scheduled' || user.visit_scheduling_status === 'completed') {
          stepCompletionData[7]++;
          userStepCount++;
        }

        if (user.visit_scheduling_status === 'completed') {
          stepCompletionData[8]++;
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
          stepCompletionData[9]++;
          stepCompletionData[10]++;
          stepCompletionData[11]++;
          userStepCount += 3;
        }

        // Check care model selection
        let visitNotes = null;
        try {
          visitNotes = user.visit_notes ? JSON.parse(user.visit_notes) : null;
        } catch (error) {
          console.error('Error parsing visit notes:', error);
        }

        if (visitNotes?.care_model) {
          stepCompletionData[12]++;
          userStepCount++;
          
          if (visitNotes.care_model === 'tavara_subscribed') {
            subscriptionConversions++;
          } else if (visitNotes.care_model === 'direct_hire') {
            directHireConversions++;
          }
        }

        // Calculate journey stage completion
        if (userStepCount >= 6) foundationCompleted++;
        if (userStepCount >= 8) schedulingCompleted++;
        if (userStepCount >= 11) trialCompleted++;

        // Track user journey status
        if (userStepCount > 0) activeJourneyUsers++;
        if (userStepCount >= 12) completedJourneyUsers++;
      }

      // Create step data array
      const stepTitles = [
        'Complete Profile',
        'Care Assessment',
        'Legacy Story',
        'View Matches',
        'Medication Setup',
        'Meal Planning',
        'Schedule Visit',
        'Confirm Visit',
        'Schedule Trial',
        'Pay for Trial',
        'Begin Trial',
        'Choose Path'
      ];

      const stepCategories: Array<'foundation' | 'scheduling' | 'trial' | 'conversion'> = [
        'foundation', 'foundation', 'foundation', 'foundation', 'foundation', 'foundation',
        'scheduling', 'scheduling',
        'trial', 'trial', 'trial',
        'conversion'
      ];

      const stepData: JourneyStepData[] = stepTitles.map((title, index) => ({
        id: index + 1,
        title,
        category: stepCategories[index],
        completed: stepCompletionData[index + 1] > 0,
        completionRate: totalUsers > 0 ? (stepCompletionData[index + 1] / totalUsers) * 100 : 0
      }));

      // Calculate conversion metrics
      const conversionMetrics: ConversionMetrics = {
        foundationToScheduling: foundationCompleted > 0 ? (schedulingCompleted / foundationCompleted) * 100 : 0,
        schedulingToTrial: schedulingCompleted > 0 ? (trialCompleted / schedulingCompleted) * 100 : 0,
        trialToSubscription: trialCompleted > 0 ? (subscriptionConversions / trialCompleted) * 100 : 0,
        directHireConversion: trialCompleted > 0 ? (directHireConversions / trialCompleted) * 100 : 0,
        subscriptionConversion: trialCompleted > 0 ? (subscriptionConversions / trialCompleted) * 100 : 0
      };

      // Calculate overall completion rate
      const overallCompletionRate = totalUsers > 0 ? (completedJourneyUsers / totalUsers) * 100 : 0;

      setJourneyData({
        overallCompletionRate,
        stepData,
        conversionMetrics,
        totalUsers,
        activeJourneyUsers,
        completedJourneyUsers,
        loading: false
      });

    } catch (error) {
      console.error('Error calculating journey metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateJourneyMetrics();
  }, []);

  return journeyData;
};
