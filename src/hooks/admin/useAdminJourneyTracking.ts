
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

      const familyUsers = await fetchFamilyUsers();
      const totalUsers = familyUsers.length;

      // Initialize step tracking for 15 steps
      const stepCompletionData: Record<number, number> = {};
      for (let i = 1; i <= 15; i++) {
        stepCompletionData[i] = 0;
      }

      const userProgressList = [];
      for (const user of familyUsers) {
        const userProgress = await calculateUserProgress(user);
        userProgressList.push(userProgress);
        
        for (let i = 1; i <= Math.min(userProgress.userStepCount, 15); i++) {
          stepCompletionData[i]++;
        }
      }

      const aggregatedProgress = aggregateUserProgress(userProgressList);
      const stepData = createStepData(stepCompletionData, totalUsers);

      const conversionMetrics = calculateConversionMetrics(
        aggregatedProgress.foundationCompleted,
        aggregatedProgress.schedulingCompleted,
        aggregatedProgress.trialCompleted,
        aggregatedProgress.subscriptionConversions,
        aggregatedProgress.directHireConversions
      );

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
