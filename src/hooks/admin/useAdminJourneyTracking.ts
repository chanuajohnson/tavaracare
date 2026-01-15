
import { useState, useEffect } from 'react';
import { AdminJourneyData } from './journey/types';
import { fetchFamilyUsers } from './journey/dataFetcher';
import { calculateUserProgress } from './journey/userProgressCalculator';
import { createStepData } from './journey/stepDefinitions';
import { calculateConversionMetrics, aggregateUserProgress } from './journey/metricsCalculator';

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
      const familyUsers = await fetchFamilyUsers();
      const totalUsers = familyUsers.length;

      // Initialize step tracking
      const stepCompletionData = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,
        7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
      };

      // Process each user's journey progress
      const userProgressList = [];
      for (const user of familyUsers) {
        const userProgress = await calculateUserProgress(user);
        userProgressList.push(userProgress);
        
        // Update step completion data
        for (let i = 1; i <= Math.min(userProgress.userStepCount, 12); i++) {
          stepCompletionData[i as keyof typeof stepCompletionData]++;
        }
      }

      // Aggregate user progress data
      const aggregatedProgress = aggregateUserProgress(userProgressList);

      // Create step data array
      const stepData = createStepData(stepCompletionData, totalUsers);

      // Calculate conversion metrics
      const conversionMetrics = calculateConversionMetrics(
        aggregatedProgress.foundationCompleted,
        aggregatedProgress.schedulingCompleted,
        aggregatedProgress.trialCompleted,
        aggregatedProgress.subscriptionConversions,
        aggregatedProgress.directHireConversions
      );

      // Calculate overall completion rate
      const overallCompletionRate = totalUsers > 0 ? (aggregatedProgress.completedJourneyUsers / totalUsers) * 100 : 0;

      setJourneyData({
        overallCompletionRate,
        stepData,
        conversionMetrics,
        totalUsers,
        activeJourneyUsers: aggregatedProgress.activeJourneyUsers,
        completedJourneyUsers: aggregatedProgress.completedJourneyUsers,
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
